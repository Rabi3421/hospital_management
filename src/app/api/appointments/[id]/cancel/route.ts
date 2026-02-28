import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { verifyAccessToken, ACCESS_COOKIE } from "@/lib/jwt";

function apiError(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status });
}
function apiSuccess<T>(data: T) {
    return NextResponse.json({ success: true, data });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // 1. Auth
    const token =
        req.cookies.get(ACCESS_COOKIE)?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return apiError("Authentication required.", 401);
    const payload = await verifyAccessToken(token);
    if (!payload) return apiError("Invalid or expired token.", 401);

    // 2. Validate id
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return apiError("Invalid appointment ID.", 400);

    await connectDB();

    // 3. Find and verify ownership
    const appointment = await Appointment.findById(id);
    if (!appointment) return apiError("Appointment not found.", 404);
    if (appointment.userId?.toString() !== payload.userId) {
        return apiError("Not authorised to cancel this appointment.", 403);
    }

    // 4. Only cancel if pending or confirmed
    if (!["pending", "confirmed"].includes(appointment.status)) {
        return apiError(`Cannot cancel an appointment with status "${appointment.status}".`, 400);
    }

    appointment.status = "cancelled";
    await appointment.save();

    return apiSuccess({ appointmentId: id, status: "cancelled" });
}
