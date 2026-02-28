import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { verifyAccessToken, ACCESS_COOKIE } from "@/lib/jwt";

function apiError(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status });
}

function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

/**
 * POST /api/appointments/claim
 *
 * Links all unclaimed appointments that share the authenticated user's email
 * (or a specific guestToken) to the user's account.
 *
 * Called automatically after a user logs in / registers if they have pending
 * guest appointments stored in localStorage.
 *
 * Body (optional):
 *   { guestTokens: string[] }   — specific tokens to claim
 *   If omitted, claims ALL unclaimed appointments matching the user's email.
 */
export async function POST(req: NextRequest) {
    // 1. Require auth
    const token =
        req.cookies.get(ACCESS_COOKIE)?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) return apiError("Authentication required.", 401);

    const payload = await verifyAccessToken(token);
    if (!payload) return apiError("Invalid or expired token.", 401);

    // 2. Parse optional body
    let guestTokens: string[] | undefined;
    try {
        const body = await req.json().catch(() => ({}));
        if (Array.isArray(body?.guestTokens) && body.guestTokens.length) {
            guestTokens = body.guestTokens as string[];
        }
    } catch {
        // body parsing failure is non-fatal
    }

    await connectDB();

    // 3. Always do an email-based sweep first (catches cases where localStorage was cleared)
    await Appointment.updateMany(
        { email: payload.email, claimed: false },
        { $set: { userId: payload.userId, claimed: true } }
    );

    // 4. Also sweep by specific guest tokens if provided
    let tokenClaimed = 0;
    if (guestTokens?.length) {
        const r = await Appointment.updateMany(
            { guestToken: { $in: guestTokens }, claimed: false },
            { $set: { userId: payload.userId, claimed: true } }
        );
        tokenClaimed = r.modifiedCount;
    }

    // Re-count total linked for this user
    const total = await Appointment.countDocuments({ userId: payload.userId });

    return apiSuccess({
        claimed: tokenClaimed,
        total,
        message: `Your appointments have been linked to your account.`,
    });
}
