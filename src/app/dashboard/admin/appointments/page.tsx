"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────
interface Prescription { _id: string; title: string; fileUrl: string; fileType: string; uploadedAt: string; uploadedBy: string; }
interface Vitals { bloodPressure?: string; temperature?: string; weight?: string; notes?: string; }
interface CompletionDetails { diagnosis?: string; treatment?: string; followUpDate?: string; followUpNotes?: string; closedAt?: string; closedBy?: string; }

interface Appointment {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    service: string;
    doctorPreference: string;
    preferredDate: string;
    preferredTime: string;
    status: "pending" | "confirmed" | "arrived" | "in_progress" | "cancelled" | "completed";
    isNewPatient: boolean;
    insuranceProvider?: string;
    notes?: string;
    queueNumber?: number;
    vitals?: Vitals;
    prescriptions: Prescription[];
    completionDetails?: CompletionDetails;
    createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    arrived: "bg-teal-100 text-teal-700",
    in_progress: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    arrived: "Arrived",
    in_progress: "In Consultation",
    completed: "Completed",
    cancelled: "Cancelled",
};

type ModalType = "view" | "edit" | "live" | "close" | null;

// ─── Main Page ────────────────────────────────────────────
export default function AdminAppointmentsPage() {
    const { accessToken } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const LIMIT = 15;

    const [modal, setModal] = useState<ModalType>(null);
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    // Edit modal state
    const [editStatus, setEditStatus] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [editDoctor, setEditDoctor] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");

    // Live (in-progress) modal state — vitals
    const [vitBP, setVitBP] = useState("");
    const [vitTemp, setVitTemp] = useState("");
    const [vitWeight, setVitWeight] = useState("");
    const [vitNotes, setVitNotes] = useState("");

    // Prescription upload state
    const [rxTitle, setRxTitle] = useState("");
    const [rxFile, setRxFile] = useState<string>("");        // base64 data URL
    const [rxFileType, setRxFileType] = useState("image/jpeg");
    const [rxFileName, setRxFileName] = useState("");
    const [rxUploading, setRxUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close modal state
    const [closeDiagnosis, setCloseDiagnosis] = useState("");
    const [closeTreatment, setCloseTreatment] = useState("");
    const [closeFollowUp, setCloseFollowUp] = useState("");
    const [closeFollowUpNotes, setCloseFollowUpNotes] = useState("");

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: debouncedSearch, status: statusFilter, date: dateFilter,
                page: String(page), limit: String(LIMIT),
            });
            const res = await fetch(`/api/admin/appointments?${params}`, { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) {
                setAppointments(json.data.appointments);
                setTotal(json.data.total);
                setPages(json.data.pages);
            }
        } finally { setLoading(false); }
    }, [headers, debouncedSearch, statusFilter, dateFilter, page]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    // Reload selected appointment from server
    const reloadSelected = useCallback(async (id: string) => {
        const res = await fetch(`/api/admin/appointments/${id}`, { headers: headers(), credentials: "include" });
        const json = await res.json();
        if (json.success) {
            setSelected(json.data.appointment);
            setAppointments((prev) => prev.map((a) => a._id === id ? json.data.appointment : a));
        }
    }, [headers]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const openEdit = (a: Appointment) => {
        setSelected(a); setEditStatus(a.status); setEditNotes(a.notes ?? "");
        setEditDoctor(a.doctorPreference); setEditDate(a.preferredDate); setEditTime(a.preferredTime);
        setModal("edit");
    };

    const openLive = (a: Appointment) => {
        setSelected(a);
        setVitBP(a.vitals?.bloodPressure ?? ""); setVitTemp(a.vitals?.temperature ?? "");
        setVitWeight(a.vitals?.weight ?? ""); setVitNotes(a.vitals?.notes ?? "");
        setRxTitle(""); setRxFile(""); setRxFileName(""); setRxFileType("image/jpeg");
        setModal("live");
    };

    const openClose = (a: Appointment) => {
        setSelected(a);
        setCloseDiagnosis(a.completionDetails?.diagnosis ?? "");
        setCloseTreatment(a.completionDetails?.treatment ?? "");
        setCloseFollowUp(a.completionDetails?.followUpDate ?? "");
        setCloseFollowUpNotes(a.completionDetails?.followUpNotes ?? "");
        setModal("close");
    };

    // ── API calls ─────────────────────────────────────────
    const handleSaveEdit = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/appointments/${selected._id}`, {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ action: "update", status: editStatus, notes: editNotes, doctorPreference: editDoctor, preferredDate: editDate, preferredTime: editTime }),
            });
            const json = await res.json();
            if (json.success) { flash("ok", "Appointment updated."); setModal(null); fetchAppointments(); }
            else flash("err", json.error ?? "Failed to update.");
        } finally { setSaving(false); }
    };

    const handleSaveVitals = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/appointments/${selected._id}`, {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ action: "vitals", bloodPressure: vitBP, temperature: vitTemp, weight: vitWeight, notes: vitNotes }),
            });
            const json = await res.json();
            if (json.success) { flash("ok", "Vitals saved."); await reloadSelected(selected._id); }
            else flash("err", json.error ?? "Failed.");
        } finally { setSaving(false); }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setRxFileName(file.name);
        setRxFileType(file.type);
        if (!rxTitle) setRxTitle(`Prescription — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) setRxFile(ev.target.result as string); };
        reader.readAsDataURL(file);
    };

    const handleUploadPrescription = async () => {
        if (!selected || !rxFile) return;
        setRxUploading(true);
        try {
            const res = await fetch(`/api/admin/appointments/${selected._id}`, {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ action: "prescription", title: rxTitle, fileUrl: rxFile, fileType: rxFileType }),
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", "Prescription uploaded.");
                setRxFile(""); setRxFileName(""); setRxTitle("");
                if (fileInputRef.current) fileInputRef.current.value = "";
                await reloadSelected(selected._id);
            } else flash("err", json.error ?? "Upload failed.");
        } finally { setRxUploading(false); }
    };

    const handleClose = async () => {
        if (!selected) return;
        if (!confirm("Close and complete this appointment? An email summary will be sent to the patient.")) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/appointments/${selected._id}`, {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ action: "close", diagnosis: closeDiagnosis, treatment: closeTreatment, followUpDate: closeFollowUp, followUpNotes: closeFollowUpNotes }),
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", "Appointment closed. Email sent to patient.");
                setModal(null);
                fetchAppointments();
            } else flash("err", json.error ?? "Failed to close.");
        } finally { setSaving(false); }
    };

    const quickStatus = async (a: Appointment, status: string) => {
        try {
            const res = await fetch(`/api/admin/appointments/${a._id}`, {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ action: "update", status }),
            });
            const json = await res.json();
            if (json.success) fetchAppointments();
            else flash("err", json.error ?? "Failed.");
        } catch { flash("err", "Network error."); }
    };

    const handleDelete = async (a: Appointment) => {
        if (!confirm(`Delete appointment for "${a.firstName} ${a.lastName}"?`)) return;
        try {
            const res = await fetch(`/api/admin/appointments/${a._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) { flash("ok", "Deleted."); fetchAppointments(); }
            else flash("err", json.error ?? "Failed.");
        } catch { flash("err", "Network error."); }
    };

    // Today's active queue (confirmed / arrived / in-progress)
    const todayStr = new Date().toISOString().split("T")[0];
    const todayActive = appointments.filter(
        (a) => a.preferredDate === todayStr && (a.status === "confirmed" || a.status === "arrived" || a.status === "in_progress")
    ).sort((a, b) => a.preferredTime.localeCompare(b.preferredTime));

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Appointments</h1>
                        <p className="text-navy/50 text-sm mt-1">Manage appointments, prescriptions &amp; patient flow.</p>
                    </div>
                    <div className="bg-navy/5 rounded-xl px-4 py-2 text-sm text-navy/60 self-start sm:self-auto">
                        <span className="font-semibold text-navy">{total}</span> total
                    </div>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* ── Today's live queue ──────────────────── */}
                {todayActive.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-navy/[0.03] border border-navy/10">
                        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse inline-block" />
                            Today&apos;s Live Queue
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {todayActive.map((a) => (
                                <div key={a._id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${a.status === "in_progress" ? "border-purple-300 bg-purple-50" : a.status === "arrived" ? "border-teal-300 bg-teal-50" : "border-blue-200 bg-blue-50"} cursor-pointer hover:shadow-sm transition-shadow`}
                                    onClick={() => openLive(a)}>
                                    {a.queueNumber && (
                                        <span className={`text-xl font-black ${a.status === "in_progress" ? "text-purple-600" : a.status === "arrived" ? "text-teal-600" : "text-blue-500"}`}>#{a.queueNumber}</span>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-navy">{a.firstName} {a.lastName}</p>
                                        <p className="text-xs text-navy/50">{a.preferredTime} · {a.service}</p>
                                    </div>
                                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[a.status]}`}>
                                        {STATUS_LABELS[a.status]}
                                    </span>
                                    {a.status === "confirmed" && (
                                        <button onClick={(e) => { e.stopPropagation(); quickStatus(a, "arrived"); }}
                                            className="ml-1 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors whitespace-nowrap">
                                            Mark Arrived
                                        </button>
                                    )}
                                    {a.status === "arrived" && (
                                        <button onClick={(e) => { e.stopPropagation(); openLive(a); }}
                                            className="ml-1 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap">
                                            Start Consultation
                                        </button>
                                    )}
                                    {a.status === "in_progress" && (
                                        <button onClick={(e) => { e.stopPropagation(); openClose(a); }}
                                            className="ml-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap">
                                            Close Visit
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4 flex flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                        <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" /></svg>
                        <input type="text" placeholder="Search patient…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30" />
                    </div>
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold transition-colors">
                        <option value="">All Statuses</option>
                        {["pending", "confirmed", "arrived", "in_progress", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                    <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="bg-white border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold transition-colors" />
                    {(statusFilter || dateFilter || search) && (
                        <button onClick={() => { setSearch(""); setStatusFilter(""); setDateFilter(""); setPage(1); }} className="text-xs text-navy/40 hover:text-navy transition-colors underline">Clear</button>
                    )}
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-navy/5">{Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="px-4 sm:px-5 py-4 flex gap-3 animate-pulse"><div className="flex-1 space-y-2"><div className="h-3 bg-navy/8 rounded w-1/3" /><div className="h-2.5 bg-navy/5 rounded w-1/2" /></div></div>
                        ))}</div>
                    ) : appointments.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center text-navy/40 text-sm">No appointments found.</div>
                    ) : (
                        <>
                            {/* Mobile cards (< md) */}
                            <div className="md:hidden divide-y divide-navy/5">
                                {appointments.map((a) => (
                                    <div key={a._id} className="px-4 py-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="font-semibold text-navy text-sm">{a.firstName} {a.lastName}</p>
                                                    {a.queueNumber && <span className="text-xs bg-gold/15 text-gold font-bold px-1.5 py-0.5 rounded-full border border-gold/30">#{a.queueNumber}</span>}
                                                </div>
                                                <p className="text-navy/40 text-xs mt-0.5">{a.phone}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_STYLES[a.status] ?? ""}`}>
                                                {STATUS_LABELS[a.status] ?? a.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-navy/50 flex flex-wrap gap-x-3 gap-y-0.5 mb-3">
                                            <span>{a.service}</span>
                                            <span>{a.preferredDate} · {a.preferredTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {/* Mark Arrived */}
                                            {a.status === "confirmed" && (
                                                <button onClick={() => quickStatus(a, "arrived")} title="Mark Arrived" className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                                </button>
                                            )}
                                            {/* Start Consultation / Live Visit */}
                                            {(a.status === "arrived" || a.status === "in_progress") && (
                                                <button onClick={() => openLive(a)} className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" /></svg>
                                                </button>
                                            )}
                                            {a.status === "in_progress" && (
                                                <button onClick={() => openClose(a)} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </button>
                                            )}
                                            {a.status === "completed" && (
                                                <button onClick={() => { setSelected(a); setModal("view"); }} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                </button>
                                            )}
                                            <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-gold/10 text-navy/50 hover:text-gold transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(a)} className="p-1.5 rounded-lg hover:bg-red-50 text-navy/50 hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Desktop table (>= md) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-navy/10">
                                            <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Patient</th>
                                            <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Service / Doctor</th>
                                            <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden lg:table-cell">Date &amp; Time</th>
                                            <th className="text-center px-5 py-3.5 text-navy/50 font-medium">Status</th>
                                            <th className="text-right px-5 py-3.5 text-navy/50 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {appointments.map((a) => (
                                        <tr key={a._id} className="border-b border-navy/5 hover:bg-navy/[0.02] transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-navy">{a.firstName} {a.lastName}</p>
                                                    {a.queueNumber && <span className="text-xs bg-gold/15 text-gold font-bold px-1.5 py-0.5 rounded-full border border-gold/30">#{a.queueNumber}</span>}
                                                </div>
                                                <p className="text-navy/40 text-xs mt-0.5">{a.phone}</p>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                <p className="text-navy/70">{a.service}</p>
                                                <p className="text-navy/40 text-xs">{a.doctorPreference}</p>
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell">
                                                <p className="text-navy/70">{a.preferredDate}</p>
                                                <p className="text-navy/40 text-xs">{a.preferredTime}</p>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status] ?? ""}`}>
                                                    {STATUS_LABELS[a.status] ?? a.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1 flex-wrap">
                                                    {/* Mark Arrived */}
                                                    {a.status === "confirmed" && (
                                                        <button onClick={() => quickStatus(a, "arrived")} title="Mark Arrived" className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                                        </button>
                                                    )}
                                                    {/* Start Consultation / Live Visit */}
                                                    {(a.status === "arrived" || a.status === "in_progress") && (
                                                        <button onClick={() => openLive(a)} title="Start Consultation" className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" /></svg>
                                                        </button>
                                                    )}
                                                    {/* Close visit */}
                                                    {a.status === "in_progress" && (
                                                        <button onClick={() => openClose(a)} title="Close Visit" className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        </button>
                                                    )}
                                                    {/* View completed */}
                                                    {a.status === "completed" && (
                                                        <button onClick={() => { setSelected(a); setModal("view"); }} title="View Summary" className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                        </button>
                                                    )}
                                                    <button onClick={() => openEdit(a)} title="Edit" className="p-1.5 rounded-lg hover:bg-gold/10 text-navy/50 hover:text-gold transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(a)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-navy/50 hover:text-red-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}
                </div>

                {pages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-navy/40">Page {page} of {pages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </main>

            {/* ── EDIT MODAL ── */}
            {modal === "edit" && selected && (
                <ModalOverlay title="Edit Appointment" subtitle={`${selected.firstName} ${selected.lastName} · ${selected.service}`} onClose={() => setModal(null)}>
                    <div className="space-y-4">
                        <Field label="Status">
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all">
                                {["pending", "confirmed", "arrived", "in_progress", "completed", "cancelled"].map((s) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Doctor">
                            <input type="text" value={editDoctor} onChange={(e) => setEditDoctor(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Date"><input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                            <Field label="Time"><input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                        </div>
                        <Field label="Notes">
                            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all resize-none" placeholder="Internal notes…" />
                        </Field>
                    </div>
                    <ModalFooter onCancel={() => setModal(null)} onSave={handleSaveEdit} saving={saving} saveLabel="Save Changes" />
                </ModalOverlay>
            )}

            {/* ── LIVE VISIT MODAL ── */}
            {modal === "live" && selected && (
                <ModalOverlay title={`Live Visit — ${selected.firstName} ${selected.lastName}`}
                    subtitle={`Queue #${selected.queueNumber ?? "—"} · ${selected.preferredTime} · ${selected.doctorPreference}`}
                    onClose={() => setModal(null)} wide>
                    <div className="space-y-6">
                        {/* Vitals */}
                        <div>
                            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Patient Vitals</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Blood Pressure"><input placeholder="120/80 mmHg" value={vitBP} onChange={(e) => setVitBP(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                                <Field label="Temperature"><input placeholder="98.6°F" value={vitTemp} onChange={(e) => setVitTemp(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                                <Field label="Weight"><input placeholder="70 kg" value={vitWeight} onChange={(e) => setVitWeight(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                                <Field label="Notes"><input placeholder="e.g. patient is anxious" value={vitNotes} onChange={(e) => setVitNotes(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                            </div>
                            <button onClick={handleSaveVitals} disabled={saving} className="mt-3 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60">
                                {saving ? "Saving…" : "Save Vitals"}
                            </button>
                        </div>

                        {/* Existing vitals display */}
                        {selected.vitals && (selected.vitals.bloodPressure || selected.vitals.temperature) && (
                            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800">
                                <p className="font-semibold mb-1">Saved Vitals</p>
                                {selected.vitals.bloodPressure && <p>BP: {selected.vitals.bloodPressure}</p>}
                                {selected.vitals.temperature && <p>Temp: {selected.vitals.temperature}</p>}
                                {selected.vitals.weight && <p>Weight: {selected.vitals.weight}</p>}
                            </div>
                        )}

                        {/* Upload Prescription */}
                        <div>
                            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Upload Prescription / Scan</p>
                            <div className="border-2 border-dashed border-navy/20 rounded-xl p-5 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/[0.02] transition-all" onClick={() => fileInputRef.current?.click()}>
                                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
                                {rxFile ? (
                                    <div className="flex items-center justify-center gap-2">
                                        {rxFileType.startsWith("image") ? (
                                            <img src={rxFile} alt="preview" className="max-h-24 rounded-lg object-contain" />
                                        ) : (
                                            <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-navy/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                            </div>
                                        )}
                                        <p className="text-navy text-sm font-medium">{rxFileName}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <svg className="w-8 h-8 text-navy/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                        <p className="text-navy/50 text-sm">Click to upload prescription image or PDF</p>
                                    </div>
                                )}
                            </div>
                            {rxFile && (
                                <div className="mt-3 flex gap-2">
                                    <input type="text" value={rxTitle} onChange={(e) => setRxTitle(e.target.value)} placeholder="Prescription title…" className="flex-1 px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" />
                                    <button onClick={handleUploadPrescription} disabled={rxUploading} className="px-4 py-2.5 bg-gold text-white rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60 whitespace-nowrap">
                                        {rxUploading ? "Uploading…" : "Save"}
                                    </button>
                                </div>
                            )}

                            {/* Uploaded prescriptions list */}
                            {selected.prescriptions.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider">Uploaded ({selected.prescriptions.length})</p>
                                    {selected.prescriptions.map((rx) => (
                                        <div key={rx._id} className="flex items-center gap-3 p-3 rounded-xl bg-cream border border-cream-dark">
                                            {rx.fileType.startsWith("image") ? (
                                                <img src={rx.fileUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-navy/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-navy text-sm font-medium truncate">{rx.title}</p>
                                                <p className="text-navy/40 text-xs">{rx.uploadedBy} · {new Date(rx.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                            <a href={rx.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline flex-shrink-0">View</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Arrived → Start Consultation */}
                        {selected.status === "arrived" && (
                            <div className="flex gap-3 pt-2 border-t border-navy/10">
                                <button onClick={async () => { await quickStatus(selected, "in_progress"); await reloadSelected(selected._id); }}
                                    className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
                                    Start Consultation
                                </button>
                                <button onClick={() => openClose(selected)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                                    Complete Visit
                                </button>
                            </div>
                        )}
                        {/* Confirmed → Mark Arrived or start directly */}
                        {selected.status === "confirmed" && (
                            <div className="flex gap-3 pt-2 border-t border-navy/10">
                                <button onClick={async () => { await quickStatus(selected, "arrived"); await reloadSelected(selected._id); }}
                                    className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
                                    Mark as Arrived
                                </button>
                                <button onClick={async () => { await quickStatus(selected, "in_progress"); await reloadSelected(selected._id); }}
                                    className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
                                    Start Consultation
                                </button>
                            </div>
                        )}
                        {selected.status === "in_progress" && (
                            <div className="pt-2 border-t border-navy/10">
                                <button onClick={() => openClose(selected)} className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Close Visit &amp; Complete Appointment
                                </button>
                            </div>
                        )}
                    </div>
                </ModalOverlay>
            )}

            {/* ── CLOSE / COMPLETE MODAL ── */}
            {modal === "close" && selected && (
                <ModalOverlay title="Complete Appointment" subtitle={`${selected.firstName} ${selected.lastName} — this will notify the patient by email.`} onClose={() => setModal(null)}>
                    <div className="space-y-4">
                        <Field label="Diagnosis">
                            <textarea value={closeDiagnosis} onChange={(e) => setCloseDiagnosis(e.target.value)} rows={2} placeholder="e.g. Tooth decay — cavity on #14" className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all resize-none" />
                        </Field>
                        <Field label="Treatment Done">
                            <textarea value={closeTreatment} onChange={(e) => setCloseTreatment(e.target.value)} rows={2} placeholder="e.g. Filled cavity with composite resin" className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all resize-none" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Follow-up Date (optional)">
                                <input type="date" value={closeFollowUp} onChange={(e) => setCloseFollowUp(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all" />
                            </Field>
                            <Field label="Follow-up Notes">
                                <input placeholder="e.g. Return for checkup" value={closeFollowUpNotes} onChange={(e) => setCloseFollowUpNotes(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all" />
                            </Field>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            <p>An email with the full visit summary and prescriptions link will be sent to <strong>{selected.email}</strong></p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleClose} disabled={saving} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Completing…</> : "Complete & Notify Patient"}
                        </button>
                        <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Cancel</button>
                    </div>
                </ModalOverlay>
            )}

            {/* ── VIEW SUMMARY (completed) ── */}
            {modal === "view" && selected && selected.status === "completed" && (
                <ModalOverlay title="Visit Summary" subtitle={`${selected.firstName} ${selected.lastName} · Completed`} onClose={() => setModal(null)} wide>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <InfoRow label="Date" value={selected.preferredDate} />
                            <InfoRow label="Time" value={selected.preferredTime} />
                            <InfoRow label="Doctor" value={selected.doctorPreference} />
                            <InfoRow label="Service" value={selected.service} />
                            {selected.completionDetails?.diagnosis && <InfoRow label="Diagnosis" value={selected.completionDetails.diagnosis} />}
                            {selected.completionDetails?.treatment && <InfoRow label="Treatment" value={selected.completionDetails.treatment} />}
                            {selected.completionDetails?.followUpDate && <InfoRow label="Follow-up" value={selected.completionDetails.followUpDate} />}
                            {selected.completionDetails?.closedBy && <InfoRow label="Closed by" value={selected.completionDetails.closedBy} />}
                        </div>
                        {selected.vitals && (selected.vitals.bloodPressure || selected.vitals.temperature) && (
                            <div>
                                <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Vitals</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {selected.vitals.bloodPressure && <div className="bg-blue-50 rounded-xl p-2 text-center"><p className="text-xs text-blue-500">Blood Pressure</p><p className="font-semibold text-blue-800 text-sm">{selected.vitals.bloodPressure}</p></div>}
                                    {selected.vitals.temperature && <div className="bg-orange-50 rounded-xl p-2 text-center"><p className="text-xs text-orange-500">Temperature</p><p className="font-semibold text-orange-800 text-sm">{selected.vitals.temperature}</p></div>}
                                    {selected.vitals.weight && <div className="bg-green-50 rounded-xl p-2 text-center"><p className="text-xs text-green-500">Weight</p><p className="font-semibold text-green-800 text-sm">{selected.vitals.weight}</p></div>}
                                </div>
                            </div>
                        )}
                        {selected.prescriptions.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Prescriptions ({selected.prescriptions.length})</p>
                                <div className="space-y-2">
                                    {selected.prescriptions.map((rx) => (
                                        <div key={rx._id} className="flex items-center gap-3 p-3 rounded-xl bg-cream">
                                            {rx.fileType.startsWith("image") ? <img src={rx.fileUrl} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center"><svg className="w-5 h-5 text-navy/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg></div>}
                                            <div className="flex-1 min-w-0"><p className="text-navy text-sm font-medium truncate">{rx.title}</p><p className="text-navy/40 text-xs">{rx.uploadedBy}</p></div>
                                            <a href={rx.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline">View</a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setModal(null)} className="w-full mt-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors">Close</button>
                </ModalOverlay>
            )}
        </div>
    );
}

// ─── Shared helpers ───────────────────────────────────────
function ModalOverlay({ children, title, subtitle, onClose, wide }: { children: React.ReactNode; title: string; subtitle?: string; onClose: () => void; wide?: boolean; }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <div className={`bg-white rounded-2xl shadow-2xl w-full relative max-h-[90vh] overflow-y-auto ${wide ? "max-w-2xl" : "max-w-md"} p-6`}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="font-fraunces text-xl font-bold text-navy mb-0.5 pr-8">{title}</h2>
                {subtitle && <p className="text-navy/40 text-xs mb-5">{subtitle}</p>}
                {children}
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="py-2 border-b border-navy/5">
            <p className="text-xs text-navy/40">{label}</p>
            <p className="text-navy font-medium text-sm mt-0.5">{value}</p>
        </div>
    );
}

function ModalFooter({ onCancel, onSave, saving, saveLabel = "Save" }: { onCancel: () => void; onSave: () => void; saving: boolean; saveLabel?: string; }) {
    return (
        <div className="flex gap-3 mt-6">
            <button onClick={onSave} disabled={saving} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</> : saveLabel}
            </button>
            <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Cancel</button>
        </div>
    );
}
