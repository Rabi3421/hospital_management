import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RefreshToken from "@/models/RefreshToken";
import User from "@/models/User";
import {
    verifyRefreshToken,
    signAccessToken,
    accessCookieOptions,
    ACCESS_COOKIE,
    REFRESH_COOKIE,
} from "@/lib/jwt";
import { apiError } from "@/lib/api-auth";
import type { Role } from "@/types/auth";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(REFRESH_COOKIE)?.value;
        if (!token) {
            return apiError("No refresh token provided", 401);
        }

        // Verify JWT signature + expiry
        const payload = await verifyRefreshToken(token);
        if (!payload) {
            return apiError("Invalid or expired refresh token", 401);
        }

        await connectDB();

        // Check token exists in DB (ensures logout invalidates it)
        const stored = await RefreshToken.findOne({ token });
        if (!stored) {
            return apiError("Refresh token has been revoked", 401);
        }

        // Check user still active
        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) {
            return apiError("User account not found or deactivated", 401);
        }

        // Issue new access token
        const newPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role as Role,
            name: user.name,
        };
        const newAccessToken = await signAccessToken(newPayload);

        const response = NextResponse.json({
            success: true,
            message: "Access token refreshed",
            data: { accessToken: newAccessToken },
        });

        response.cookies.set(ACCESS_COOKIE, newAccessToken, accessCookieOptions());

        return response;
    } catch (err) {
        console.error("[refresh]", err);
        return apiError("Internal server error", 500);
    }
}
