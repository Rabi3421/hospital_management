import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";
import {
    signAccessToken,
    signRefreshToken,
    accessCookieOptions,
    refreshCookieOptions,
    ACCESS_COOKIE,
    REFRESH_COOKIE,
} from "@/lib/jwt";
import type { Role } from "@/types/auth";

interface GoogleTokenResponse {
    access_token: string;
    id_token: string;
    error?: string;
}

interface GoogleUserInfo {
    sub: string;          // Google user ID
    name: string;
    email: string;
    picture: string;
    email_verified: boolean;
}

export async function GET(request: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:4028";
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state") ?? "";   // ?next= param
    const oauthError = searchParams.get("error");

    if (oauthError || !code) {
        return NextResponse.redirect(`${baseUrl}/auth/login?error=google_denied`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    try {
        // ── 1. Exchange code for tokens ──────────────────────────────────────
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokens: GoogleTokenResponse = await tokenRes.json();
        if (tokens.error || !tokens.access_token) {
            console.error("[google/callback] token exchange failed:", tokens);
            return NextResponse.redirect(`${baseUrl}/auth/login?error=google_token`);
        }

        // ── 2. Fetch Google user profile ─────────────────────────────────────
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser: GoogleUserInfo = await userInfoRes.json();

        if (!googleUser.email || !googleUser.email_verified) {
            return NextResponse.redirect(`${baseUrl}/auth/login?error=google_email`);
        }

        // ── 3. Upsert user in DB ─────────────────────────────────────────────
        await connectDB();

        let user = await User.findOne({
            $or: [{ googleId: googleUser.sub }, { email: googleUser.email }],
        });

        if (!user) {
            // New user — create with Google info
            user = await User.create({
                name: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.sub,
                avatar: googleUser.picture,
                role: "user" as Role,
                isActive: true,
            });
        } else {
            // Existing user — link Google account if not yet linked
            if (!user.googleId) user.googleId = googleUser.sub;
            if (!user.avatar) user.avatar = googleUser.picture;
            await user.save();
        }

        if (!user.isActive) {
            return NextResponse.redirect(`${baseUrl}/auth/login?error=account_deactivated`);
        }

        // ── 4. Issue our own JWT tokens ──────────────────────────────────────
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role as Role,
            name: user.name,
        };
        const accessToken = await signAccessToken(payload);
        const refreshToken = await signRefreshToken(payload);

        await RefreshToken.deleteMany({ userId: user._id });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt });

        // ── 5. Redirect to dashboard with cookies set ────────────────────────
        const dashboardMap: Record<Role, string> = {
            user: "/dashboard/user",
            admin: "/dashboard/admin",
            super_admin: "/dashboard/super-admin",
        };
        const destination = state || dashboardMap[user.role as Role];

        const response = NextResponse.redirect(`${baseUrl}${destination}`);
        response.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions());
        response.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
        return response;

    } catch (err) {
        console.error("[google/callback]", err);
        return NextResponse.redirect(`${baseUrl}/auth/login?error=google_server`);
    }
}
