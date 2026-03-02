/**
 * GET /api/slots/available
 *  ?doctor=Dr. Arjun Patel — Orthodontics
 *  &date=2026-03-01
 *
 * Returns open slots with remaining capacity for the given doctor+date.
 * Public endpoint — no auth required (protected by x-api-key).
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AppointmentSlot from "@/models/AppointmentSlot";
import DoctorSchedule from "@/models/DoctorSchedule";

const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;

function apiError(msg: string, status: number) {
    return NextResponse.json({ success: false, error: msg }, { status });
}

export async function GET(req: NextRequest) {
    const key = req.headers.get("x-api-key");
    if (!PUBLIC_API_KEY || key !== PUBLIC_API_KEY) {
        return apiError("Invalid or missing API key", 401);
    }

    const { searchParams } = new URL(req.url);
    const doctor = searchParams.get("doctor") ?? "";
    const date = searchParams.get("date") ?? "";

    if (!date) return apiError("date is required (YYYY-MM-DD)", 400);
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return apiError("date must be YYYY-MM-DD", 400);

    try {
        await connectDB();
    } catch {
        return apiError("Database connection failed", 503);
    }

    // Check if day is blocked for this doctor
    if (doctor) {
        const schedule = await DoctorSchedule.findOne({ doctor, date });
        if (schedule && !schedule.isOpen) {
            return NextResponse.json({
                success: true,
                data: {
                    available: false,
                    reason: schedule.note || "Doctor is not available on this date",
                    slots: [],
                },
            });
        }
    }

    // Query available slots
    const query: Record<string, unknown> = { date, status: "open" };
    if (doctor) query.doctor = doctor;

    const allSlots = await AppointmentSlot.find(query).sort({ startTime: 1 });

    const slots = allSlots.map((s) => ({
        _id: s._id.toString(),
        displayTime: s.displayTime,
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        bookedCount: s.bookedCount,
        remaining: s.capacity - s.bookedCount,
        isFull: s.bookedCount >= s.capacity,
    }));

    return NextResponse.json({
        success: true,
        data: {
            available: slots.some((s) => !s.isFull),
            slots,
        },
    });
}
