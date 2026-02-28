import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { verifyAccessToken, ACCESS_COOKIE } from "@/lib/jwt";

const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;

// ─── Helpers ─────────────────────────────────────────────
function apiError(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status });
}

function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

// ─── POST /api/appointments ───────────────────────────────
// Open to guests (no auth required) — protected by x-api-key only.
// If the request also carries a valid JWT the appointment is immediately
// linked to that user so no claim step is needed later.
export async function POST(req: NextRequest) {
    // 1. Validate public API key
    const providedKey = req.headers.get("x-api-key");
    if (!PUBLIC_API_KEY || providedKey !== PUBLIC_API_KEY) {
        return apiError("Invalid or missing API key.", 401);
    }

    // 2. Parse body
    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return apiError("Invalid JSON body.", 400);
    }

    // 3. Parse fields with proper types
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").toLowerCase().trim();
    const service = String(body.service ?? "").trim();
    const doctorPreference = String(body.doctorPreference ?? "No Preference").trim();
    const preferredDate = String(body.preferredDate ?? "").trim();
    const preferredTime = String(body.preferredTime ?? "").trim();
    const isNewPatient = body.isNewPatient !== false;
    const insuranceProvider = String(body.insuranceProvider ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    // 4. Basic validation
    if (!firstName || !lastName || !phone || !email || !service || !preferredDate || !preferredTime) {
        return apiError("Missing required fields.", 422);
    }

    // 4. Try to get logged-in user from JWT (optional)
    let userId: string | null = null;
    const token =
        req.cookies.get(ACCESS_COOKIE)?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
        const payload = await verifyAccessToken(token);
        if (payload) userId = payload.userId;
    }

    // 5. Generate a guest token (used later for claiming)
    const guestToken = crypto.randomBytes(32).toString("hex");

    // 6. Save appointment
    try {
        await connectDB();
    } catch {
        return apiError("Database connection failed. Please try again shortly.", 503);
    }
    const doc = await Appointment.create({
        firstName,
        lastName,
        phone,
        email,
        service,
        doctorPreference,
        preferredDate,
        preferredTime,
        isNewPatient,
        insuranceProvider,
        notes,
        userId: userId ? new (await import("mongoose")).default.Types.ObjectId(userId) : undefined,
        guestToken,
        claimed: !!userId,
    });

    return apiSuccess(
        {
            appointmentId: String(doc._id),
            guestToken,
            linked: !!userId,
        },
        201
    );
}

// ─── GET /api/appointments ────────────────────────────────
// Returns appointments for the currently authenticated user.
export async function GET(req: NextRequest) {
    const token =
        req.cookies.get(ACCESS_COOKIE)?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) return apiError("Authentication required.", 401);

    const payload = await verifyAccessToken(token);
    if (!payload) return apiError("Invalid or expired token.", 401);

    await connectDB();
    const appointments = await Appointment.find({ userId: payload.userId }).sort({ createdAt: -1 });

    return apiSuccess({ appointments });
}
