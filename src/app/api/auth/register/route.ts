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
        const { name, email, password, role } = body as {
            name?: string;
            email?: string;
            password?: string;
            role?: Role;
        };

        // --- Validate input ---
        if (!name || !email || !password) {
            return apiError("Name, email, and password are required", 400);
        }
        if (name.trim().length < 2) {
            return apiError("Name must be at least 2 characters", 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return apiError("Invalid email address", 400);
        }
        if (password.length < 8) {
            return apiError("Password must be at least 8 characters", 400);
        }

        // super_admin role cannot be self-registered
        const allowedRoles: Role[] = ["user", "admin"];
        const assignedRole: Role =
            role && allowedRoles.includes(role) ? role : "user";

        // --- Check duplicate ---
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return apiError("An account with this email already exists", 409);
        }

        // --- Create user (password hashed via pre-save hook) ---
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: assignedRole,
        });

        // --- Generate tokens ---
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role as Role,
            name: user.name,
        };
        const accessToken = await signAccessToken(payload);
        const refreshToken = await signRefreshToken(payload);

        // --- Persist refresh token ---
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt,
        });

        // --- Build response ---
        const response = NextResponse.json(
            {
                success: true,
                message: "Account created successfully",
                data: {
                    user: {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    accessToken,
                },
            },
            { status: 201 }
        );

        response.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions());
        response.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

        return response;
    } catch (err) {
        console.error("[register]", err);
        return apiError("Internal server error", 500);
    }
}
