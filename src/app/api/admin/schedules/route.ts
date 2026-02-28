/**
 * GET  /api/admin/schedules          — list schedules (filter by ?doctor=, ?from=, ?to=)
 * POST /api/admin/schedules          — create/update schedule + regenerate slots
 */

import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import DoctorSchedule from "@/models/DoctorSchedule";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import type { JWTPayload } from "@/types/auth";
import { generateSlotsForSchedule } from "@/lib/slotGenerator";

export const GET = withAuth(
    async (req: NextRequest, _ctx: { user: JWTPayload }) => {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const doctor = searchParams.get("doctor") ?? "";
        const from = searchParams.get("from") ?? "";
        const to = searchParams.get("to") ?? "";

        const query: Record<string, unknown> = {};
        if (doctor) query.doctor = doctor;
        if (from || to) {
            query.date = {};
            if (from) (query.date as Record<string, string>)["$gte"] = from;
            if (to) (query.date as Record<string, string>)["$lte"] = to;
        }

        const schedules = await DoctorSchedule.find(query).sort({ date: 1, doctor: 1 });
        return apiSuccess({ schedules });
    },
    { roles: ["admin", "super_admin"] }
);

export const POST = withAuth(
    async (req: NextRequest, ctx: { user: JWTPayload }) => {
        await connectDB();

        const body = await req.json();
        const {
            doctor,
            date,
            isOpen,
            startTime,
            endTime,
            slotDuration,
            capacityPerSlot,
            breaks,
            note,
        } = body as {
            doctor?: string;
            date?: string;
            isOpen?: boolean;
            startTime?: string;
            endTime?: string;
            slotDuration?: number;
            capacityPerSlot?: number;
            breaks?: { start: string; end: string }[];
            note?: string;
        };

        if (!doctor?.trim()) return apiError("Doctor name is required", 400);
        if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) return apiError("Date must be YYYY-MM-DD", 400);

        const open = isOpen !== false; // default true

        if (open) {
            if (!startTime || !endTime) return apiError("startTime and endTime are required for open days", 400);
            if (startTime >= endTime) return apiError("startTime must be before endTime", 400);
        }

        const schedule = await DoctorSchedule.findOneAndUpdate(
            { doctor: doctor.trim(), date },
            {
                isOpen: open,
                startTime: startTime ?? "08:00",
                endTime: endTime ?? "17:00",
                slotDuration: slotDuration ?? 30,
                capacityPerSlot: capacityPerSlot ?? 1,
                breaks: breaks ?? [],
                note: note ?? "",
                createdBy: ctx.user.userId,
            },
            { upsert: true, new: true }
        );

        // Regenerate slots
        const slotsCreated = await generateSlotsForSchedule(schedule);

        return apiSuccess({ schedule, slotsCreated }, 201);
    },
    { roles: ["admin", "super_admin"] }
);
