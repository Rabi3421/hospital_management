/**
 * GET  /api/admin/slots   — list slots for a doctor+date
 *                            ?doctor=&date=YYYY-MM-DD
 */

import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import AppointmentSlot from "@/models/AppointmentSlot";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import type { JWTPayload } from "@/types/auth";

export const GET = withAuth(
    async (req: NextRequest, _ctx: { user: JWTPayload }) => {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const doctor = searchParams.get("doctor") ?? "";
        const date = searchParams.get("date") ?? "";

        if (!date) return apiError("date query param required (YYYY-MM-DD)", 400);

        const query: Record<string, unknown> = { date };
        if (doctor) query.doctor = doctor;

        const slots = await AppointmentSlot.find(query).sort({ startTime: 1 });
        return apiSuccess({ slots });
    },
    { roles: ["admin", "super_admin"] }
);
