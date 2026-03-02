/**
 * PATCH /api/admin/slots/[id]   — block or unblock a specific slot
 *   body: { status: "blocked" | "open" }
 */

import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import AppointmentSlot from "@/models/AppointmentSlot";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import type { JWTPayload } from "@/types/auth";
import mongoose from "mongoose";

export const PATCH = withAuth(
    async (req: NextRequest, ctx: { user: JWTPayload; params: Record<string, string> }) => {
        await connectDB();
        const { id } = ctx.params;
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);

        const { status } = (await req.json()) as { status?: string };
        if (!status || !["open", "blocked"].includes(status)) {
            return apiError("status must be 'open' or 'blocked'", 400);
        }

        const slot = await AppointmentSlot.findById(id);
        if (!slot) return apiError("Slot not found", 404);

        if (status === "open" && slot.bookedCount >= slot.capacity) {
            return apiError("Cannot reopen a full slot", 400);
        }

        slot.status = status === "open" ? "open" : "blocked";
        await slot.save();

        return apiSuccess({ slot });
    },
    { roles: ["admin", "super_admin"] }
);
