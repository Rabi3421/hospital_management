import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import AppointmentSlot from "@/models/AppointmentSlot";
import { verifyAccessToken, ACCESS_COOKIE } from "@/lib/jwt";
import mongoose from "mongoose";

const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;

// ─── Helpers ─────────────────────────────────────────────
function apiError(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status });
}

function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

// ─── POST /api/appointments ───────────────────────────────
// Slot-based auto-confirmed booking.
// If slotId is provided: atomically increments bookedCount and assigns queueNumber.
// If no slotId: falls back to legacy pending flow (for emergency/walk-in).
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

    // 3. Parse fields
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
    const slotId = body.slotId ? String(body.slotId) : null;

    // 4. Basic validation
    if (!firstName || !lastName || !phone || !email || !service || !preferredDate || !preferredTime) {
        return apiError("Missing required fields.", 422);
    }

    // 5. Try to get logged-in user from JWT (optional)
    let userId: string | null = null;
    const token =
        req.cookies.get(ACCESS_COOKIE)?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
        const payload = await verifyAccessToken(token);
        if (payload) userId = payload.userId;
    }

    // 6. Generate a guest token
    const guestToken = crypto.randomBytes(32).toString("hex");

    // 7. Save appointment with atomic slot booking
    try {
        await connectDB();
    } catch {
        return apiError("Database connection failed. Please try again shortly.", 503);
    }

    let queueNumber: number | null = null;
    let resolvedSlotId: mongoose.Types.ObjectId | null = null;

    if (slotId && mongoose.isValidObjectId(slotId)) {
        // Atomic slot booking: increment bookedCount only if still open and not full
        const slot = await AppointmentSlot.findOneAndUpdate(
            {
                _id: slotId,
                status: "open",
                $expr: { $lt: ["$bookedCount", "$capacity"] },
            },
            {
                $inc: { bookedCount: 1, nextQueueNumber: 1 },
            },
            { new: false } // return doc BEFORE increment to get current nextQueueNumber
        );

        if (!slot) {
            return apiError("This time slot is no longer available. Please choose another.", 409);
        }

        queueNumber = slot.nextQueueNumber; // value BEFORE increment = assigned number
        resolvedSlotId = slot._id;

        // If now full, update status
        if (slot.bookedCount + 1 >= slot.capacity) {
            await AppointmentSlot.findByIdAndUpdate(slotId, { status: "full" });
        }
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
        ...(resolvedSlotId ? { slotId: resolvedSlotId } : {}),
        ...(queueNumber !== null ? { queueNumber } : {}),
        // Auto-confirm if slot was booked; otherwise pending (legacy/walk-in)
        status: resolvedSlotId ? "confirmed" : "pending",
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        guestToken,
        claimed: !!userId,
    });

    return apiSuccess(
        {
            appointmentId: String(doc._id),
            guestToken,
            linked: !!userId,
            confirmed: !!resolvedSlotId,
            queueNumber,
            slotTime: preferredTime,
            date: preferredDate,
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
