import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import { sendEmail, buildAppointmentDoneEmail } from "@/lib/emailNotifier";
import mongoose from "mongoose";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4028";

/**
 * GET    /api/admin/appointments/[id]   — full appointment detail
 * PATCH  /api/admin/appointments/[id]   — update status/notes/vitals/prescriptions/completion
 * DELETE /api/admin/appointments/[id]   — hard delete
 *
 * PATCH actions (pass action field in body):
 *   action: "update"      → update status, notes, doctor, date, time
 *   action: "vitals"      → save vitals (bp, temp, weight, notes)
 *   action: "prescription"→ add prescription (title, fileUrl, fileType, uploadedBy)
 *   action: "close"       → mark completed, save diagnosis/treatment/followUp, send email
 */

export const GET = withAuth(
    async (req: NextRequest, { params }) => {
        await connectDB();
        const { id } = params;
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid appointment ID", 400);
        const appt = await Appointment.findById(id).lean();
        if (!appt) return apiError("Appointment not found", 404);
        return apiSuccess({ appointment: appt });
    },
    { roles: ["admin", "super_admin"] }
);

export const PATCH = withAuth(
    async (req: NextRequest, { params, user }) => {
        await connectDB();
        const { id } = params;
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid appointment ID", 400);

        const appt = await Appointment.findById(id);
        if (!appt) return apiError("Appointment not found", 404);

        const body = await req.json();
        const { action } = body as { action?: string };

        // ── General update ────────────────────────────────
        if (!action || action === "update") {
            const { status, notes, doctorPreference, preferredDate, preferredTime } = body;
            if (status !== undefined) appt.status = status;
            if (notes !== undefined) appt.notes = notes;
            if (doctorPreference !== undefined) appt.doctorPreference = doctorPreference;
            if (preferredDate !== undefined) appt.preferredDate = preferredDate;
            if (preferredTime !== undefined) appt.preferredTime = preferredTime;
            await appt.save();
            return apiSuccess({ appointment: appt.toObject() });
        }

        // ── Mark patient as arrived ───────────────────────
        if (action === "arrive") {
            if (appt.status !== "confirmed") return apiError("Appointment must be confirmed before marking arrived", 400);
            appt.status = "arrived";
            (appt as any).arrivedAt = new Date();
            await appt.save();
            return apiSuccess({ appointment: appt.toObject() });
        }

        // ── Save vitals ───────────────────────────────────
        if (action === "vitals") {
            const { bloodPressure, temperature, weight, notes: vNotes } = body;
            appt.vitals = {
                bloodPressure: bloodPressure ?? appt.vitals?.bloodPressure ?? "",
                temperature: temperature ?? appt.vitals?.temperature ?? "",
                weight: weight ?? appt.vitals?.weight ?? "",
                notes: vNotes ?? appt.vitals?.notes ?? "",
            };
            if (appt.status === "confirmed" || appt.status === "arrived") appt.status = "in_progress";
            await appt.save();
            return apiSuccess({ appointment: appt.toObject() });
        }

        // ── Add prescription ──────────────────────────────
        if (action === "prescription") {
            const { title, fileUrl, fileType, uploadedBy } = body;
            if (!fileUrl) return apiError("fileUrl is required", 422);
            appt.prescriptions.push({
                title: title ?? `Prescription — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                fileUrl,
                fileType: fileType ?? "image/jpeg",
                uploadedAt: new Date(),
                uploadedBy: uploadedBy ?? user?.name ?? "Admin",
            });
            await appt.save();
            return apiSuccess({ appointment: appt.toObject(), addedPrescription: appt.prescriptions[appt.prescriptions.length - 1] });
        }

        // ── Close / Complete appointment ──────────────────
        if (action === "close") {
            const { diagnosis, treatment, followUpDate, followUpNotes } = body;
            appt.status = "completed";
            appt.completionDetails = {
                diagnosis: diagnosis ?? "",
                treatment: treatment ?? "",
                followUpDate: followUpDate ?? "",
                followUpNotes: followUpNotes ?? "",
                closedAt: new Date(),
                closedBy: user?.name ?? "Admin",
            };
            await appt.save();

            // Create in-app notification
            const notif = new Notification({
                userId: appt.userId ?? null,
                email: appt.email,
                phone: appt.phone,
                appointmentId: appt._id,
                type: "appointment_done",
                title: "Your visit summary is ready \u2705",
                message: `Your appointment on ${appt.preferredDate} has been completed. View your prescriptions and diagnosis in your dashboard.`,
                read: false,
                emailSent: false,
            });
            await notif.save();

            // Send completion email
            const dateLabel = new Date(appt.preferredDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
            });
            const template = buildAppointmentDoneEmail({
                name: `${appt.firstName} ${appt.lastName}`,
                date: dateLabel,
                time: appt.preferredTime,
                doctor: appt.doctorPreference,
                service: appt.service,
                diagnosis: appt.completionDetails.diagnosis,
                treatment: appt.completionDetails.treatment,
                followUpDate: appt.completionDetails.followUpDate,
                prescriptionCount: appt.prescriptions.length,
                dashboardUrl: `${SITE_URL}/dashboard/user/appointments`,
            });
            const sent = await sendEmail({ to: appt.email, ...template });
            if (sent) {
                await Notification.findByIdAndUpdate(notif._id, { emailSent: true, emailSentAt: new Date() });
            }

            return apiSuccess({ appointment: appt.toObject(), emailSent: sent });
        }

        return apiError(`Unknown action: ${action}`, 400);
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest, { params }) => {
        await connectDB();
        const { id } = params;
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid appointment ID", 400);
        const appt = await Appointment.findByIdAndDelete(id);
        if (!appt) return apiError("Appointment not found", 404);
        return apiSuccess({ message: "Appointment deleted" });
    },
    { roles: ["admin", "super_admin"] }
);
