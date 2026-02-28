"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { userNavItems } from "../navItems";


// ── Types ───────────────────────────────────────────────────
interface Prescription {
    _id: string; title: string; fileUrl: string; fileType: string;
    uploadedAt: string; uploadedBy: string;
}
interface Vitals {
    bloodPressure?: string; temperature?: string; weight?: string; notes?: string;
}
interface CompletionDetails {
    diagnosis?: string; treatment?: string; followUpDate?: string;
    followUpNotes?: string; closedAt?: string; closedBy?: string;
}
interface Appointment {
    _id: string; firstName: string; lastName: string; email: string; phone: string;
    service: string; doctorPreference: string; preferredDate: string;
    preferredTime: string;
    status: "pending" | "confirmed" | "in_progress" | "cancelled" | "completed";
    isNewPatient: boolean; insuranceProvider?: string; notes?: string;
    queueNumber?: number; vitals?: Vitals; prescriptions: Prescription[];
    completionDetails?: CompletionDetails; createdAt: string;
}
interface Notification {
    _id: string; type: string; title: string; message: string;
    read: boolean; createdAt: string; appointmentId?: string;
}

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-purple-50 text-purple-700 border-purple-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
    pending: "Pending Review",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

export default function UserAppointmentsPage() {
    const { accessToken } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState<string | null>(null);

    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/appointments", { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) setAppointments(json.data.appointments ?? json.data ?? []);
        } finally { setLoading(false); }
    }, [headers]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications?limit=20", { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) { setNotifications(json.data.notifications); setUnreadCount(json.data.unreadCount); }
        } catch { /* silent */ }
    }, [headers]);

    useEffect(() => { fetchAppointments(); fetchNotifications(); }, [fetchAppointments, fetchNotifications]);

    // Auto-refresh every 30s for in-progress / upcoming appointments
    useEffect(() => {
        const hasActive = appointments.some((a) => a.status === "in_progress" || a.status === "confirmed");
        if (!hasActive) return;
        const id = setInterval(() => { fetchAppointments(); fetchNotifications(); }, 30000);
        return () => clearInterval(id);
    }, [appointments, fetchAppointments, fetchNotifications]);

    const markNotificationsRead = async (ids?: string[]) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify(ids ? { ids } : {}),
            });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    const openNotifications = () => {
        setNotifOpen(true);
        if (unreadCount > 0) markNotificationsRead();
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Cancel this appointment?")) return;
        setCancelling(id);
        try {
            const res = await fetch(`/api/appointments/${id}/cancel`, { method: "POST", headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) { flash("ok", "Appointment cancelled."); fetchAppointments(); }
            else flash("err", json.error ?? "Could not cancel.");
        } finally { setCancelling(null); }
    };

    const sorted = [...appointments].sort((a, b) => {
        const order = { in_progress: 0, confirmed: 1, pending: 2, completed: 3, cancelled: 4 };
        const diff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
        if (diff !== 0) return diff;
        return new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime();
    });

    const inProgress = sorted.filter((a) => a.status === "in_progress");

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={userNavItems} title="DentalCare" subtitle="Patient Portal" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">My Appointments</h1>
                        <p className="text-navy/50 text-sm mt-1">View your appointment history, prescriptions &amp; visit summaries.</p>
                    </div>
                    {/* Notification bell */}
                    <div className="relative">
                        <button onClick={openNotifications} className="relative p-2.5 rounded-xl border border-navy/15 bg-white hover:bg-navy/5 transition-colors">
                            <svg className="w-5 h-5 text-navy/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification dropdown */}
                        {notifOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                                <div className="fixed sm:absolute right-0 sm:right-0 left-0 sm:left-auto top-auto sm:top-12 z-40 mx-4 sm:mx-0 w-auto sm:w-80 bg-white rounded-2xl shadow-2xl border border-navy/10 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-navy/10 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-navy">Notifications</p>
                                        <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg hover:bg-navy/10 text-navy/50 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="divide-y divide-navy/5 max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-navy/40 text-sm">No notifications yet.</div>
                                        ) : notifications.map((n) => (
                                            <div key={n._id} className={`px-4 py-3 ${!n.read ? "bg-blue-50" : ""}`}>
                                                <div className="flex items-start gap-2">
                                                    <span className={`mt-0.5 text-lg ${n.type === "slot_starting" ? "🔔" : n.type === "appointment_done" ? "✅" : "📅"}`}>
                                                        {n.type === "slot_starting" ? "🔔" : n.type === "appointment_done" ? "✅" : "📅"}
                                                    </span>
                                                    <div>
                                                        <p className="text-navy font-semibold text-xs">{n.title}</p>
                                                        <p className="text-navy/60 text-xs mt-0.5">{n.message}</p>
                                                        <p className="text-navy/30 text-[10px] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                    </div>
                                                    {!n.read && <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* In-progress banner */}
                {inProgress.map((a) => (
                    <div key={a._id} className="mb-4 p-3 sm:p-4 rounded-2xl bg-purple-50 border-2 border-purple-300 flex items-center gap-3 sm:gap-4">
                        <span className="text-2xl sm:text-3xl animate-pulse">🏥</span>
                        <div className="flex-1">
                            <p className="font-semibold text-purple-800 text-sm">You&apos;re being seen now!</p>
                            <p className="text-purple-600 text-xs mt-0.5">Queue #{a.queueNumber} · {a.service} · {a.doctorPreference}</p>
                        </div>
                        <button onClick={() => setExpanded(a._id === expanded ? null : a._id)} className="text-purple-700 text-xs font-semibold underline">View</button>
                    </div>
                ))}

                {/* Appointments list */}
                {loading ? (
                    <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-card rounded-2xl p-5 animate-pulse"><div className="h-4 bg-navy/10 rounded w-1/3 mb-2" /><div className="h-3 bg-navy/5 rounded w-1/2" /></div>
                    ))}</div>
                ) : sorted.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                        <div className="text-5xl mb-3">📅</div>
                        <p className="text-navy font-semibold mb-1">No appointments yet</p>
                        <p className="text-navy/40 text-sm">Book your first appointment from the homepage.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sorted.map((a) => {
                            const isExpanded = expanded === a._id;
                            const isCompleted = a.status === "completed";
                            return (
                                <div key={a._id} className="glass-card rounded-2xl overflow-hidden">
                                    {/* Summary row */}
                                    <div className="p-5 flex flex-wrap items-start gap-4">
                                        {/* Queue badge */}
                                        {a.queueNumber && (
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                                                <span className="text-sm font-black text-gold">#{a.queueNumber}</span>
                                            </div>
                                        )}

                                        {/* Main info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <p className="font-semibold text-navy">{a.service}</p>
                                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${STATUS_STYLES[a.status] ?? ""}`}>
                                                    {a.status === "in_progress" && <span className="mr-1 w-1.5 h-1.5 rounded-full bg-purple-500 inline-block animate-pulse" />}
                                                    {STATUS_LABELS[a.status] ?? a.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-xs text-navy/50">
                                                <span>📅 {a.preferredDate}</span>
                                                <span>🕐 {a.preferredTime}</span>
                                                <span>👨‍⚕️ {a.doctorPreference}</span>
                                            </div>
                                            {isCompleted && a.completionDetails?.diagnosis && (
                                                <p className="text-xs text-green-600 mt-1.5">✓ Diagnosis: {a.completionDetails.diagnosis}</p>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {(isCompleted || a.prescriptions.length > 0) && (
                                                <button onClick={() => setExpanded(isExpanded ? null : a._id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-navy/15 text-navy/60 hover:text-navy hover:bg-navy/5 text-xs font-medium transition-colors">
                                                    {isExpanded ? "Hide" : "Details"}
                                                    <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                            )}
                                            {(a.status === "pending" || a.status === "confirmed") && (
                                                <button onClick={() => handleCancel(a._id)} disabled={cancelling === a._id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-medium border border-red-200 transition-colors disabled:opacity-50">
                                                    {cancelling === a._id ? "…" : "Cancel"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded detail panel */}
                                    {isExpanded && (
                                        <div className="border-t border-navy/8 px-5 pb-5 pt-4 space-y-5 bg-navy/[0.015]">

                                            {/* Visit summary */}
                                            {isCompleted && a.completionDetails && (
                                                <div>
                                                    <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Visit Summary</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {a.completionDetails.diagnosis && (
                                                            <div className="bg-white rounded-xl p-3 border border-green-100">
                                                                <p className="text-[11px] text-green-500 font-semibold uppercase">Diagnosis</p>
                                                                <p className="text-navy text-sm mt-1">{a.completionDetails.diagnosis}</p>
                                                            </div>
                                                        )}
                                                        {a.completionDetails.treatment && (
                                                            <div className="bg-white rounded-xl p-3 border border-blue-100">
                                                                <p className="text-[11px] text-blue-500 font-semibold uppercase">Treatment Done</p>
                                                                <p className="text-navy text-sm mt-1">{a.completionDetails.treatment}</p>
                                                            </div>
                                                        )}
                                                        {a.completionDetails.followUpDate && (
                                                            <div className="bg-white rounded-xl p-3 border border-amber-100">
                                                                <p className="text-[11px] text-amber-500 font-semibold uppercase">Follow-up Date</p>
                                                                <p className="text-navy text-sm mt-1">{a.completionDetails.followUpDate}</p>
                                                                {a.completionDetails.followUpNotes && <p className="text-navy/50 text-xs mt-1">{a.completionDetails.followUpNotes}</p>}
                                                            </div>
                                                        )}
                                                        {a.completionDetails.closedAt && (
                                                            <div className="bg-white rounded-xl p-3 border border-navy/10">
                                                                <p className="text-[11px] text-navy/40 font-semibold uppercase">Closed</p>
                                                                <p className="text-navy text-sm mt-1">{new Date(a.completionDetails.closedAt).toLocaleString()}</p>
                                                                {a.completionDetails.closedBy && <p className="text-navy/40 text-xs mt-0.5">by {a.completionDetails.closedBy}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Vitals */}
                                            {a.vitals && (a.vitals.bloodPressure || a.vitals.temperature || a.vitals.weight) && (
                                                <div>
                                                    <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Vitals Recorded</p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {a.vitals.bloodPressure && (
                                                            <div className="flex-1 min-w-[100px] bg-blue-50 rounded-xl p-3 text-center">
                                                                <p className="text-[11px] text-blue-400">Blood Pressure</p>
                                                                <p className="text-blue-800 font-bold mt-0.5">{a.vitals.bloodPressure}</p>
                                                            </div>
                                                        )}
                                                        {a.vitals.temperature && (
                                                            <div className="flex-1 min-w-[100px] bg-orange-50 rounded-xl p-3 text-center">
                                                                <p className="text-[11px] text-orange-400">Temperature</p>
                                                                <p className="text-orange-800 font-bold mt-0.5">{a.vitals.temperature}</p>
                                                            </div>
                                                        )}
                                                        {a.vitals.weight && (
                                                            <div className="flex-1 min-w-[100px] bg-green-50 rounded-xl p-3 text-center">
                                                                <p className="text-[11px] text-green-400">Weight</p>
                                                                <p className="text-green-800 font-bold mt-0.5">{a.vitals.weight}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {a.vitals.notes && <p className="text-navy/50 text-xs mt-2 italic">{a.vitals.notes}</p>}
                                                </div>
                                            )}

                                            {/* Prescriptions */}
                                            {a.prescriptions.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Prescriptions & Documents ({a.prescriptions.length})</p>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {a.prescriptions.map((rx) => (
                                                            <a key={rx._id} href={rx.fileUrl} target="_blank" rel="noreferrer"
                                                                className="group relative bg-white rounded-xl border border-navy/10 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                                                {rx.fileType.startsWith("image") ? (
                                                                    <img src={rx.fileUrl} alt={rx.title} className="w-full h-28 object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-28 bg-navy/5 flex items-center justify-center">
                                                                        <svg className="w-10 h-10 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                                    </div>
                                                                )}
                                                                <div className="p-2">
                                                                    <p className="text-navy text-xs font-medium truncate">{rx.title}</p>
                                                                    <p className="text-navy/40 text-[10px]">{new Date(rx.uploadedAt).toLocaleDateString()}</p>
                                                                </div>
                                                                <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <span className="bg-white text-navy text-xs font-semibold px-3 py-1.5 rounded-lg shadow">Open</span>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
