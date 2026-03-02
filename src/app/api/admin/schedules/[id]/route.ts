/**
 * GET    /api/admin/schedules/[id]   — get single schedule
 * PATCH  /api/admin/schedules/[id]   — update schedule + regenerate slots
 * DELETE /api/admin/schedules/[id]   — delete schedule (also blocks/removes open slots)
 */

import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import DoctorSchedule from "@/models/DoctorSchedule";
import AppointmentSlot from "@/models/AppointmentSlot";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import type { JWTPayload } from "@/types/auth";
import { generateSlotsForSchedule } from "@/lib/slotGenerator";
import mongoose from "mongoose";

export const GET = withAuth(
    async (_req: NextRequest, ctx: { user: JWTPayload; params: Record<string, string> }) => {
        await connectDB();
        const { id } = ctx.params;
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);

        const schedule = await DoctorSchedule.findById(id);
        if (!schedule) return apiError("Schedule not found", 404);
        return apiSuccess({ schedule });
    },
    { roles: ["admin", "super_admin"] }
);

export const PATCH = withAuth(
    async (req: NextRequest, ctx: { user: JWTPayload; params: Record<string, string> }) => {
        await connectDB();
        const { id } = ctx.params;
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);

        const body = await req.json();
        const schedule = await DoctorSchedule.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!schedule) return apiError("Schedule not found", 404);

        // Re-generate slots after update
        const slotsCreated = await generateSlotsForSchedule(schedule);
        return apiSuccess({ schedule, slotsCreated });
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (_req: NextRequest, ctx: { user: JWTPayload; params: Record<string, string> }) => {
        await connectDB();
        const { id } = ctx.params;
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);

        const schedule = await DoctorSchedule.findByIdAndDelete(id);
        if (!schedule) return apiError("Schedule not found", 404);

        // Block all open (unboooked) slots for this doctor+date
        await AppointmentSlot.updateMany(
            { doctor: schedule.doctor, date: schedule.date, status: "open", bookedCount: 0 },
            { status: "blocked" }
        );

        return apiSuccess({ deleted: true });
    },
    { roles: ["admin", "super_admin"] }
);
