import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import mongoose from "mongoose";

/**
 * PATCH /api/admin/appointments/[id]  — update status, notes, doctor, time
 * DELETE /api/admin/appointments/[id] — hard delete
 */
export const PATCH = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid appointment ID", 400);

        const appt = await Appointment.findById(id);
        if (!appt) return apiError("Appointment not found", 404);

        const body = await req.json();
        const { status, notes, doctorPreference, preferredDate, preferredTime } = body;

        if (status !== undefined) appt.status = status;
        if (notes !== undefined) appt.notes = notes;
        if (doctorPreference !== undefined) appt.doctorPreference = doctorPreference;
        if (preferredDate !== undefined) appt.preferredDate = preferredDate;
        if (preferredTime !== undefined) appt.preferredTime = preferredTime;

        await appt.save();
        return apiSuccess(appt.toObject());
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid appointment ID", 400);

        const appt = await Appointment.findByIdAndDelete(id);
        if (!appt) return apiError("Appointment not found", 404);
        return apiSuccess({ message: "Appointment deleted" });
    },
    { roles: ["admin", "super_admin"] }
);
