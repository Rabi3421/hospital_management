import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RefreshToken from "@/models/RefreshToken";
import {
    clearCookieOptions,
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    verifyRefreshToken,
} from "@/lib/jwt";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(REFRESH_COOKIE)?.value;

        if (token) {
            // Attempt to delete from DB — best effort, don't error if it fails
            try {
                const payload = await verifyRefreshToken(token);
                if (payload) {
                    await connectDB();
                    await RefreshToken.deleteOne({ token });
                }
            } catch {
                // ignore — still clear cookies
            }
        }

        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully",
        });

        response.cookies.set(ACCESS_COOKIE, "", clearCookieOptions());
        response.cookies.set(REFRESH_COOKIE, "", clearCookieOptions());

        return response;
    } catch (err) {
        console.error("[logout]", err);
        // Even on error, clear cookies
        const response = NextResponse.json(
            { success: false, message: "Logout failed" },
            { status: 500 }
        );
        response.cookies.set(ACCESS_COOKIE, "", clearCookieOptions());
        response.cookies.set(REFRESH_COOKIE, "", clearCookieOptions());
        return response;
    }
}
