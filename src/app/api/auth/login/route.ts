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
import { apiError } from "@/lib/api-auth";
import type { Role } from "@/types/auth";

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password } = body as { email?: string; password?: string };

        if (!email || !password) {
            return apiError("Email and password are required", 400);
        }

        // Fetch user with password (select: false by default)
        const user = await User.findOne({ email: email.toLowerCase() }).select(
            "+password"
        );

        if (!user) {
            return apiError("Invalid email or password", 401);
        }

        if (!user.isActive) {
            return apiError("Your account has been deactivated", 403);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return apiError("Invalid email or password", 401);
        }

        // --- Generate tokens ---
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role as Role,
            name: user.name,
        };
        const accessToken = await signAccessToken(payload);
        const refreshToken = await signRefreshToken(payload);

        // Persist refresh token (delete old ones for this user first)
        await RefreshToken.deleteMany({ userId: user._id });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt,
        });

        // --- Build response ---
        const response = NextResponse.json({
            success: true,
            message: "Logged in successfully",
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });

        response.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions());
        response.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

        return response;
    } catch (err) {
        console.error("[login]", err);
        return apiError("Internal server error", 500);
    }
}
