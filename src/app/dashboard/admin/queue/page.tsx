"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────
interface Vitals { bloodPressure?: string; temperature?: string; weight?: string; notes?: string; }
interface Prescription { _id: string; title: string; fileUrl: string; fileType: string; uploadedAt: string; uploadedBy: string; }
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
    arrivedAt?: string;
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

const STATUS_ORDER = ["arrived", "confirmed", "in_progress", "pending", "completed", "cancelled"];

type ModalType = "consult" | "close" | "view" | null;

// ─── Main Page ────────────────────────────────────────────
export default function TodaysQueuePage() {
    const { accessToken } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const [modal, setModal] = useState<ModalType>(null);
    const [selected, setSelected] = useState<Appointment | null>(null);

    // Consultation modal state
    const [vitBP, setVitBP] = useState("");
    const [vitTemp, setVitTemp] = useState("");
    const [vitWeight, setVitWeight] = useState("");
    const [vitNotes, setVitNotes] = useState("");
    const [rxTitle, setRxTitle] = useState("");
    const [rxFile, setRxFile] = useState<string>("");
    const [rxFileType, setRxFileType] = useState("image/jpeg");
    const [rxFileName, setRxFileName] = useState("");
    const [rxUploading, setRxUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close modal state
    const [closeDiagnosis, setCloseDiagnosis] = useState("");
    const [closeTreatment, setCloseTreatment] = useState("");
    const [closeFollowUp, setCloseFollowUp] = useState("");
    const [closeFollowUpNotes, setCloseFollowUpNotes] = useState("");

    const todayStr = new Date().toISOString().split("T")[0];
    const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ date: todayStr, limit: "100", page: "1" });
            const res = await fetch(`/api/admin/appointments?${params}`, { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) setAppointments(json.data.appointments);
        } finally { setLoading(false); }
    }, [headers, todayStr]);

    useEffect(() => { fetchQueue(); }, [fetchQueue]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const id = setInterval(() => fetchQueue(), 30_000);
        return () => clearInterval(id);
    }, [fetchQueue]);

    const reloadSelected = useCallback(async (id: string) => {
        const res = await fetch(`/api/admin/appointments/${id}`, { headers: headers(), credentials: "include" });
        const json = await res.json();
        if (json.success) {
            setSelected(json.data.appointment);
            setAppointments((prev) => prev.map((a) => a._id === id ? json.data.appointment : a));
        }
    }, [headers]);

    const patchAppt = useCallback(async (id: string, body: Record<string, unknown>) => {
        const res = await fetch(`/api/admin/appointments/${id}`, {
            method: "PATCH", headers: headers(), credentials: "include",
            body: JSON.stringify(body),
        });
        return res.json();
    }, [headers]);

    // ── Actions ───────────────────────────────────────────
    const markArrived = async (a: Appointment) => {
        const json = await patchAppt(a._id, { action: "arrive" });
        if (json.success) { flash("ok", `${a.firstName} ${a.lastName} marked as arrived.`); fetchQueue(); }
        else flash("err", json.error ?? "Failed.");
    };

    const startConsultation = async (a: Appointment) => {
        const json = await patchAppt(a._id, { action: "update", status: "in_progress" });
        if (json.success) {
            flash("ok", "Consultation started.");
            await reloadSelected(a._id);
            fetchQueue();
        } else flash("err", json.error ?? "Failed.");
    };

    const openConsult = (a: Appointment) => {
        setSelected(a);
        setVitBP(a.vitals?.bloodPressure ?? ""); setVitTemp(a.vitals?.temperature ?? "");
        setVitWeight(a.vitals?.weight ?? ""); setVitNotes(a.vitals?.notes ?? "");
        setRxTitle(""); setRxFile(""); setRxFileName(""); setRxFileType("image/jpeg");
        setModal("consult");
    };

    const openClose = (a: Appointment) => {
        setSelected(a);
        setCloseDiagnosis(a.completionDetails?.diagnosis ?? "");
        setCloseTreatment(a.completionDetails?.treatment ?? "");
        setCloseFollowUp(a.completionDetails?.followUpDate ?? "");
        setCloseFollowUpNotes(a.completionDetails?.followUpNotes ?? "");
        setModal("close");
    };

    const handleSaveVitals = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const json = await patchAppt(selected._id, { action: "vitals", bloodPressure: vitBP, temperature: vitTemp, weight: vitWeight, notes: vitNotes });
            if (json.success) { flash("ok", "Vitals saved."); await reloadSelected(selected._id); fetchQueue(); }
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
            const json = await patchAppt(selected._id, { action: "prescription", title: rxTitle, fileUrl: rxFile, fileType: rxFileType });
            if (json.success) {
                flash("ok", "Prescription uploaded.");
                setRxFile(""); setRxFileName(""); setRxTitle("");
                if (fileInputRef.current) fileInputRef.current.value = "";
                await reloadSelected(selected._id);
            } else flash("err", json.error ?? "Upload failed.");
        } finally { setRxUploading(false); }
    };

    const handleCompleteVisit = async () => {
        if (!selected) return;
        if (!confirm("Complete this visit? A summary email will be sent to the patient.")) return;
        setSaving(true);
        try {
            const json = await patchAppt(selected._id, { action: "close", diagnosis: closeDiagnosis, treatment: closeTreatment, followUpDate: closeFollowUp, followUpNotes: closeFollowUpNotes });
            if (json.success) { flash("ok", "Visit completed. Email sent to patient."); setModal(null); fetchQueue(); }
            else flash("err", json.error ?? "Failed.");
        } finally { setSaving(false); }
    };

    // ── Filtering & sorting ───────────────────────────────
    const filtered = appointments
        .filter((a) => {
            const matchStatus = !statusFilter || a.status === statusFilter;
            const q = search.trim().toLowerCase();
            const matchSearch = !q || `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) || a.phone.includes(q) || a.email.toLowerCase().includes(q);
            return matchStatus && matchSearch;
        })
        .sort((a, b) => {
            const oi = STATUS_ORDER.indexOf(a.status);
            const oj = STATUS_ORDER.indexOf(b.status);
            if (oi !== oj) return oi - oj;
            return a.preferredTime.localeCompare(b.preferredTime);
        });

    const counts = {
        confirmed: appointments.filter((a) => a.status === "confirmed").length,
        arrived: appointments.filter((a) => a.status === "arrived").length,
        in_progress: appointments.filter((a) => a.status === "in_progress").length,
        completed: appointments.filter((a) => a.status === "completed").length,
    };

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Today&apos;s Queue</h1>
                        <p className="text-navy/50 text-sm mt-0.5">{todayLabel} · Auto-refreshes every 30 seconds</p>
                    </div>
                    <button onClick={fetchQueue} className="flex items-center gap-2 text-sm text-navy/50 hover:text-navy transition-colors self-start sm:self-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                        Refresh
                    </button>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <StatCard label="Confirmed" value={counts.confirmed} color="blue" />
                    <StatCard label="Arrived" value={counts.arrived} color="teal" />
                    <StatCard label="In Consultation" value={counts.in_progress} color="purple" />
                    <StatCard label="Completed Today" value={counts.completed} color="green" />
                </div>

                {/* Search + filter */}
                <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4 flex flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                        <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" /></svg>
                        <input type="text" placeholder="Search by name, phone or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold transition-colors">
                        <option value="">All Statuses</option>
                        {["confirmed", "arrived", "in_progress", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                    {(search || statusFilter) && (
                        <button onClick={() => { setSearch(""); setStatusFilter(""); }} className="text-xs text-navy/40 hover:text-navy transition-colors underline">Clear</button>
                    )}
                </div>

                {/* Queue list */}
                {loading ? (
                    <div className="glass-card rounded-2xl divide-y divide-navy/5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-navy/8 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-navy/8 rounded w-1/4" />
                                    <div className="h-2.5 bg-navy/5 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <svg className="w-12 h-12 text-navy/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        <p className="text-navy/40 text-sm">No appointments today{search ? " matching your search" : ""}.</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl divide-y divide-navy/5">
                        {filtered.map((a) => (
                            <QueueRow
                                key={a._id}
                                appt={a}
                                onMarkArrived={() => markArrived(a)}
                                onStartConsult={() => { startConsultation(a); }}
                                onOpenConsult={() => openConsult(a)}
                                onOpenClose={() => openClose(a)}
                                onViewSummary={() => { setSelected(a); setModal("view"); }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── CONSULTATION MODAL ── */}
            {modal === "consult" && selected && (
                <ModalOverlay title={`Consultation — ${selected.firstName} ${selected.lastName}`}
                    subtitle={`${selected.preferredTime} · ${selected.service} · ${selected.doctorPreference}`}
                    onClose={() => setModal(null)} wide>
                    <div className="space-y-6">
                        {/* Patient info strip */}
                        <div className="grid grid-cols-2 gap-2 bg-navy/[0.03] rounded-xl p-3 text-sm">
                            <div><p className="text-xs text-navy/40">Phone</p><p className="text-navy font-medium">{selected.phone}</p></div>
                            <div><p className="text-xs text-navy/40">Status</p><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status]}`}>{STATUS_LABELS[selected.status]}</span></div>
                            {selected.isNewPatient !== undefined && <div><p className="text-xs text-navy/40">Patient Type</p><p className="text-navy font-medium">{selected.isNewPatient ? "New Patient" : "Returning Patient"}</p></div>}
                            {selected.notes && <div className="col-span-2"><p className="text-xs text-navy/40">Patient Notes</p><p className="text-navy text-xs mt-0.5">{selected.notes}</p></div>}
                        </div>

                        {/* Vitals */}
                        <div>
                            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Patient Vitals</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Blood Pressure"><input placeholder="120/80 mmHg" value={vitBP} onChange={(e) => setVitBP(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                                <Field label="Temperature"><input placeholder="98.6°F" value={vitTemp} onChange={(e) => setVitTemp(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                                <Field label="Weight"><input placeholder="70 kg" value={vitWeight} onChange={(e) => setVitWeight(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                                <Field label="Clinical Notes"><input placeholder="e.g. patient is anxious" value={vitNotes} onChange={(e) => setVitNotes(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all" /></Field>
                            </div>
                            <button onClick={handleSaveVitals} disabled={saving} className="mt-3 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60">
                                {saving ? "Saving…" : "Save Vitals"}
                            </button>
                            {selected.vitals && (selected.vitals.bloodPressure || selected.vitals.temperature) && (
                                <div className="mt-3 bg-blue-50 rounded-xl p-3 text-xs text-blue-800">
                                    <p className="font-semibold mb-1">Last Saved Vitals</p>
                                    {selected.vitals.bloodPressure && <p>BP: {selected.vitals.bloodPressure}</p>}
                                    {selected.vitals.temperature && <p>Temp: {selected.vitals.temperature}</p>}
                                    {selected.vitals.weight && <p>Weight: {selected.vitals.weight}</p>}
                                </div>
                            )}
                        </div>

                        {/* Upload Prescription */}
                        <div>
                            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Prescriptions / Scans</p>
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

                        {/* Bottom actions */}
                        <div className="pt-2 border-t border-navy/10">
                            {(selected.status === "arrived" || selected.status === "confirmed") && (
                                <div className="mb-3">
                                    <button onClick={async () => { await startConsultation(selected); }} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
                                        Start Consultation
                                    </button>
                                </div>
                            )}
                            {selected.status === "in_progress" && (
                                <button onClick={() => { setModal("close"); setCloseDiagnosis(selected.completionDetails?.diagnosis ?? ""); setCloseTreatment(selected.completionDetails?.treatment ?? ""); setCloseFollowUp(selected.completionDetails?.followUpDate ?? ""); setCloseFollowUpNotes(selected.completionDetails?.followUpNotes ?? ""); }}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Complete Visit &amp; Notify Patient
                                </button>
                            )}
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── COMPLETE VISIT MODAL ── */}
            {modal === "close" && selected && (
                <ModalOverlay title="Complete Visit" subtitle={`${selected.firstName} ${selected.lastName} — email summary will be sent.`} onClose={() => setModal(null)}>
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
                            <p>Visit summary email will be sent to <strong>{selected?.email}</strong></p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleCompleteVisit} disabled={saving} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Completing…</> : "Complete & Notify Patient"}
                        </button>
                        <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Cancel</button>
                    </div>
                </ModalOverlay>
            )}

            {/* ── VIEW SUMMARY ── */}
            {modal === "view" && selected && (
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

// ─── Queue Row ────────────────────────────────────────────
function QueueRow({ appt, onMarkArrived, onStartConsult, onOpenConsult, onOpenClose, onViewSummary }: {
    appt: Appointment;
    onMarkArrived: () => void;
    onStartConsult: () => void;
    onOpenConsult: () => void;
    onOpenClose: () => void;
    onViewSummary: () => void;
}) {
    const initials = `${appt.firstName[0] ?? ""}${appt.lastName[0] ?? ""}`.toUpperCase();
    const avatarColor =
        appt.status === "in_progress" ? "bg-purple-100 text-purple-700" :
        appt.status === "arrived" ? "bg-teal-100 text-teal-700" :
        appt.status === "completed" ? "bg-green-100 text-green-700" :
        "bg-blue-100 text-blue-700";

    return (
        <div className={`px-4 sm:px-5 py-4 flex items-center gap-4 ${appt.status === "in_progress" ? "bg-purple-50/50" : appt.status === "arrived" ? "bg-teal-50/50" : ""}`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor}`}>
                {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy text-sm">{appt.firstName} {appt.lastName}</p>
                    {appt.isNewPatient && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">New</span>}
                    {appt.queueNumber && <span className="text-xs bg-gold/15 text-gold font-bold px-1.5 py-0.5 rounded-full border border-gold/30">#{appt.queueNumber}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[appt.status]}`}>{STATUS_LABELS[appt.status]}</span>
                </div>
                <div className="text-xs text-navy/50 mt-0.5 flex flex-wrap gap-x-3">
                    <span>{appt.phone}</span>
                    <span>{appt.preferredTime}</span>
                    <span>{appt.service}</span>
                    <span className="text-navy/30">{appt.doctorPreference}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                {appt.status === "confirmed" && (
                    <button onClick={onMarkArrived} className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap">
                        Mark Arrived
                    </button>
                )}
                {appt.status === "arrived" && (
                    <button onClick={onStartConsult} className="px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
                        Start Consultation
                    </button>
                )}
                {(appt.status === "arrived" || appt.status === "in_progress") && (
                    <button onClick={onOpenConsult} className="p-1.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy/60 hover:text-navy transition-colors" title="Open consultation panel">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" /></svg>
                    </button>
                )}
                {appt.status === "in_progress" && (
                    <button onClick={onOpenClose} className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                        Complete Visit
                    </button>
                )}
                {appt.status === "completed" && (
                    <button onClick={onViewSummary} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors" title="View summary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: "blue" | "teal" | "purple" | "green" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        teal: "bg-teal-50 text-teal-700 border-teal-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        green: "bg-green-50 text-green-700 border-green-100",
    };
    return (
        <div className={`rounded-2xl border px-4 py-3 ${colors[color]}`}>
            <p className="text-2xl font-black font-fraunces">{value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
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
