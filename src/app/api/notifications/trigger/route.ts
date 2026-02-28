/**
 * POST /api/notifications/trigger
 *
 * Internal cron endpoint that:
 *  1. Finds "confirmed" appointments whose slot starts within the next 30 min
 *     and marks them "in_progress" + sends "slot_starting" notifications.
 *  2. Finds "confirmed" appointments the day before and sends "slot_reminder".
 *
 * Call this every minute via Vercel Cron / external cron (e.g. cron-job.org):
 *   GET https://yourdomain.com/api/notifications/trigger
 *   Header: x-cron-secret: <CRON_SECRET>
 *
 * Env vars required:
 *   CRON_SECRET  — secret to protect this endpoint
 *   NEXT_PUBLIC_SITE_URL — full origin, e.g. https://dentalcare.com
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import { sendEmail, buildReminderEmail, buildSlotStartingEmail } from "@/lib/emailNotifier";

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4028";

function todayStr(): string {
    return new Date().toISOString().split("T")[0];
}

function tomorrowStr(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

/** Returns "HH:MM" for the current time (local TZ of the server — use UTC) */
function nowHHMM(): string {
    const d = new Date();
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/** Add minutes to "HH:MM" string, returns "HH:MM" */
function addMinutes(hhmm: string, mins: number): string {
    const [h, m] = hhmm.split(":").map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-cron-secret");
    if (CRON_SECRET && secret !== CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = nowHHMM();
    const in30 = addMinutes(now, 30);
    const today = todayStr();
    const tomorrow = tomorrowStr();

    let slotStartingCount = 0;
    let reminderCount = 0;

    // ── 1. Slot-starting notifications (in next 30 min today, not yet notified)
    const startingSoon = await Appointment.find({
        status: "confirmed",
        preferredDate: today,
        preferredTime: { $gte: now, $lte: in30 },
        notifiedAt: null,
    }).lean();

    for (const apt of startingSoon) {
        // Mark in_progress + set notifiedAt
        await Appointment.findByIdAndUpdate(apt._id, {
            status: "in_progress",
            notifiedAt: new Date(),
        });

        // Create in-app notification
        const notif = new Notification({
            userId: apt.userId ?? null,
            email: apt.email,
            phone: apt.phone,
            appointmentId: apt._id,
            type: "slot_starting",
            title: "Your appointment is starting now \uD83E\uDDB7",
            message: `Your ${apt.preferredTime} slot with ${apt.doctorPreference} is starting. Please check in at reception.`,
            read: false,
            emailSent: false,
        });
        await notif.save();

        // Send email
        const template = buildSlotStartingEmail({
            name: `${apt.firstName} ${apt.lastName}`,
            time: apt.preferredTime,
            doctor: apt.doctorPreference,
            queueNumber: apt.queueNumber,
        });
        const sent = await sendEmail({ to: apt.email, ...template });
        if (sent) {
            await Notification.findByIdAndUpdate(notif._id, { emailSent: true, emailSentAt: new Date() });
        }

        slotStartingCount++;
    }

    // ── 2. Day-before reminders (tomorrow's appointments not yet reminded)
    const tomorrowApts = await Appointment.find({
        status: "confirmed",
        preferredDate: tomorrow,
        reminderSentAt: null,
    }).lean();

    for (const apt of tomorrowApts) {
        await Appointment.findByIdAndUpdate(apt._id, { reminderSentAt: new Date() });

        const notif = new Notification({
            userId: apt.userId ?? null,
            email: apt.email,
            phone: apt.phone,
            appointmentId: apt._id,
            type: "slot_reminder",
            title: "Appointment reminder \u2014 tomorrow",
            message: `Your appointment is tomorrow (${apt.preferredDate}) at ${apt.preferredTime} with ${apt.doctorPreference}.`,
            read: false,
            emailSent: false,
        });
        await notif.save();

        const dateLabel = new Date(apt.preferredDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
        });
        const template = buildReminderEmail({
            name: `${apt.firstName} ${apt.lastName}`,
            date: dateLabel,
            time: apt.preferredTime,
            doctor: apt.doctorPreference,
            service: apt.service,
            queueNumber: apt.queueNumber,
        });
        const sent = await sendEmail({ to: apt.email, ...template });
        if (sent) {
            await Notification.findByIdAndUpdate(notif._id, { emailSent: true, emailSentAt: new Date() });
        }

        reminderCount++;
    }

    return NextResponse.json({
        success: true,
        data: { slotStartingCount, reminderCount, checkedAt: new Date().toISOString() },
    });
}

// Also accept GET for easy cron-job.org pings
export async function GET(req: NextRequest) {
    return POST(req);
}
