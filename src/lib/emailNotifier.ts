/**
 * src/lib/emailNotifier.ts
 *
 * Lightweight email sender using Nodemailer with SMTP (Gmail / any provider).
 * Falls back to console.log in development when SMTP_USER is not configured.
 *
 * Required env vars:
 *   SMTP_HOST   (default: smtp.gmail.com)
 *   SMTP_PORT   (default: 587)
 *   SMTP_USER   — Gmail address / SMTP username
 *   SMTP_PASS   — App password (Gmail) or SMTP password
 *   EMAIL_FROM  (default: SMTP_USER)
 */

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? SMTP_USER;

let _transport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
    if (_transport) return _transport;
    if (!SMTP_USER || !SMTP_PASS) return null; // dev mode — log only
    _transport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return _transport;
}

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
    const transport = getTransport();
    if (!transport) {
        console.log(`[DEV EMAIL] To: ${payload.to}\nSubject: ${payload.subject}`);
        return true; // Treat as sent in dev
    }
    try {
        await transport.sendMail({ from: EMAIL_FROM, ...payload });
        return true;
    } catch (err) {
        console.error("[EMAIL ERROR]", err);
        return false;
    }
}

// ─── Email templates ──────────────────────────────────────

export function buildReminderEmail(data: {
    name: string;
    date: string;
    time: string;
    doctor: string;
    service: string;
    queueNumber?: number | null;
}) {
    return {
        subject: `Reminder: Your appointment is tomorrow — ${data.time}`,
        html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8f6f2;border-radius:16px">
  <div style="background:#0f2040;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
    <h1 style="color:#d4a843;margin:0;font-size:22px">DentalCare</h1>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px">Your Appointment Reminder</p>
  </div>
  <h2 style="color:#0f2040;margin-bottom:8px">Hi ${data.name} 👋</h2>
  <p style="color:#555;line-height:1.6">
    Just a friendly reminder that your appointment is <strong>tomorrow</strong>.
    Please arrive 10 minutes early.
  </p>
  <div style="background:#fff;border:1px solid #e8e2d9;border-radius:12px;padding:20px;margin:20px 0">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="color:#888;font-size:13px;padding:6px 0">Date</td><td style="font-weight:600;color:#0f2040">${data.date}</td></tr>
      <tr><td style="color:#888;font-size:13px;padding:6px 0">Time</td><td style="font-weight:600;color:#0f2040">${data.time}</td></tr>
      <tr><td style="color:#888;font-size:13px;padding:6px 0">Doctor</td><td style="font-weight:600;color:#0f2040">${data.doctor}</td></tr>
      <tr><td style="color:#888;font-size:13px;padding:6px 0">Service</td><td style="font-weight:600;color:#0f2040">${data.service}</td></tr>
      ${data.queueNumber ? `<tr><td style="color:#888;font-size:13px;padding:6px 0">Queue #</td><td style="font-weight:700;color:#d4a843;font-size:18px">#${data.queueNumber}</td></tr>` : ""}
    </table>
  </div>
  <p style="color:#888;font-size:12px;text-align:center">Questions? Call us at (212) 555-0191</p>
</div>`,
    };
}

export function buildSlotStartingEmail(data: {
    name: string;
    time: string;
    doctor: string;
    queueNumber?: number | null;
}) {
    return {
        subject: `🦷 Your appointment starts now — Queue #${data.queueNumber ?? "—"}`,
        html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8f6f2;border-radius:16px">
  <div style="background:#0f2040;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
    <h1 style="color:#d4a843;margin:0;font-size:22px">DentalCare</h1>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px">Slot Starting Now</p>
  </div>
  <h2 style="color:#0f2040;margin-bottom:8px">Hi ${data.name}! Your time is now 🕗</h2>
  <p style="color:#555;line-height:1.6">
    Your appointment slot (<strong>${data.time}</strong> with <strong>${data.doctor}</strong>) has started.
    Please check in at the front desk and show your queue number.
  </p>
  ${data.queueNumber ? `
  <div style="text-align:center;background:#fff8e8;border:2px solid #d4a843;border-radius:16px;padding:24px;margin:20px 0">
    <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Your Queue Number</p>
    <p style="margin:4px 0;font-size:52px;font-weight:900;color:#d4a843">#${data.queueNumber}</p>
    <p style="margin:0;color:#0f2040;font-weight:600">${data.time}</p>
  </div>` : ""}
  <p style="color:#888;font-size:12px;text-align:center">Walk-in to Room 1. Our team is ready for you.</p>
</div>`,
    };
}

export function buildAppointmentDoneEmail(data: {
    name: string;
    date: string;
    time: string;
    doctor: string;
    service: string;
    diagnosis?: string;
    treatment?: string;
    followUpDate?: string;
    prescriptionCount: number;
    dashboardUrl: string;
}) {
    return {
        subject: `✅ Appointment completed — Your visit summary is ready`,
        html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8f6f2;border-radius:16px">
  <div style="background:#0f2040;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
    <h1 style="color:#d4a843;margin:0;font-size:22px">DentalCare</h1>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px">Visit Summary</p>
  </div>
  <h2 style="color:#0f2040;margin-bottom:8px">Thank you, ${data.name}! 🎉</h2>
  <p style="color:#555;line-height:1.6">
    Your appointment on <strong>${data.date}</strong> at <strong>${data.time}</strong> has been completed.
    Your full visit summary and ${data.prescriptionCount} prescription(s) are now available in your dashboard.
  </p>
  <div style="background:#fff;border:1px solid #e8e2d9;border-radius:12px;padding:20px;margin:20px 0">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="color:#888;font-size:13px;padding:6px 0">Doctor</td><td style="font-weight:600;color:#0f2040">${data.doctor}</td></tr>
      <tr><td style="color:#888;font-size:13px;padding:6px 0">Service</td><td style="font-weight:600;color:#0f2040">${data.service}</td></tr>
      ${data.diagnosis ? `<tr><td style="color:#888;font-size:13px;padding:6px 0">Diagnosis</td><td style="font-weight:600;color:#0f2040">${data.diagnosis}</td></tr>` : ""}
      ${data.treatment ? `<tr><td style="color:#888;font-size:13px;padding:6px 0">Treatment</td><td style="font-weight:600;color:#0f2040">${data.treatment}</td></tr>` : ""}
      ${data.followUpDate ? `<tr><td style="color:#888;font-size:13px;padding:6px 0">Follow-up</td><td style="font-weight:600;color:#d4a843">${data.followUpDate}</td></tr>` : ""}
    </table>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="${data.dashboardUrl}" style="background:#d4a843;color:#fff;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:700;font-size:14px">
      View Full Summary & Prescriptions →
    </a>
  </div>
  <p style="color:#888;font-size:12px;text-align:center">Questions? Call us at (212) 555-0191</p>
</div>`,
    };
}
