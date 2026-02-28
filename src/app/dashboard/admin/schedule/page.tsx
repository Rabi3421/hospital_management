"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Constants ────────────────────────────────────────────
const SLOT_DURATIONS = [15, 20, 30, 45, 60];
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SPECIALTIES = [
    "General Dentistry", "Orthodontics", "Oral Surgery", "Pediatric Dentistry",
    "Cosmetic Dentistry", "Periodontics", "Endodontics", "Implantology",
    "Prosthodontics", "Oral Medicine",
];
const AVATAR_OPTIONS = ["👨‍⚕️", "👩‍⚕️", "🧑‍⚕️", "👨‍🔬", "👩‍🔬", "🩺"];

// ─── Types ────────────────────────────────────────────────
interface Doctor {
    _id: string;
    name: string;
    specialty: string;
    department: string;
    qualification: string;
    experience: number;
    avatar: string;
    isActive: boolean;
    availableDays: string[];
    email: string;
    phone: string;
    bio: string;
}

interface Break { start: string; end: string }

interface Schedule {
    _id: string;
    doctor: string;
    date: string;
    isOpen: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
    capacityPerSlot: number;
    breaks: Break[];
    note: string;
}

interface Slot {
    _id: string;
    displayTime: string;
    startTime: string;
    capacity: number;
    bookedCount: number;
    status: "open" | "full" | "blocked";
}

interface ScheduleForm {
    doctor: string;
    date: string;
    isOpen: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
    capacityPerSlot: number;
    breaks: Break[];
    note: string;
}

const EMPTY_DOCTOR = {
    name: "", specialty: "General Dentistry", department: "", qualification: "",
    experience: 0, avatar: "👨‍⚕️", availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    email: "", phone: "", bio: "",
};

// ─── Helpers ─────────────────────────────────────────────
function todayStr(): string { return new Date().toISOString().split("T")[0]; }
function addDays(base: string, n: number): string {
    const d = new Date(base + "T00:00:00"); d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
}
function formatDate(s: string): string {
    if (!s) return "";
    return new Date(s + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    full: "bg-amber-100 text-amber-700",
    blocked: "bg-red-100 text-red-600",
};

// ─── Component ────────────────────────────────────────────
export default function AdminSchedulePage() {
    const { accessToken } = useAuth();

    // Doctors
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    // View state
    const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
    const [viewWeekStart, setViewWeekStart] = useState(todayStr());

    // Schedule data
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Modals
    const [modal, setModal] = useState<"schedule" | "addDoctor" | "editDoctor" | null>(null);
    const [form, setForm] = useState<ScheduleForm>({ doctor: "", date: "", isOpen: true, startTime: "08:00", endTime: "17:00", slotDuration: 30, capacityPerSlot: 1, breaks: [], note: "" });
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    // Doctor form
    const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [savingDoctor, setSavingDoctor] = useState(false);
    const [doctorFeedback, setDoctorFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(viewWeekStart, i));

    // ─── Fetch doctors ────────────────────────────────────
    const fetchDoctors = useCallback(async () => {
        setLoadingDoctors(true);
        try {
            const res = await fetch("/api/admin/doctors", { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success && json.data.length > 0) {
                setDoctors(json.data);
                setViewDoctor((prev) => prev ?? json.data[0]);
            }
        } finally { setLoadingDoctors(false); }
    }, [headers]);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    // ─── Fetch schedules ──────────────────────────────────
    const fetchSchedules = useCallback(async () => {
        if (!viewDoctor) return;
        setLoadingSchedules(true);
        try {
            const from = viewWeekStart;
            const to = addDays(viewWeekStart, 6);
            const res = await fetch(
                `/api/admin/schedules?doctor=${encodeURIComponent(viewDoctor.name + " — " + viewDoctor.specialty)}&from=${from}&to=${to}`,
                { headers: headers(), credentials: "include" }
            );
            const json = await res.json();
            if (json.success) setSchedules(json.data.schedules);
        } finally { setLoadingSchedules(false); }
    }, [viewDoctor, viewWeekStart, headers]);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

    // ─── Fetch slots ──────────────────────────────────────
    const fetchSlots = useCallback(async (date: string) => {
        if (!viewDoctor) return;
        setLoadingSlots(true); setSlots([]);
        try {
            const res = await fetch(
                `/api/admin/slots?doctor=${encodeURIComponent(viewDoctor.name + " — " + viewDoctor.specialty)}&date=${date}`,
                { headers: headers(), credentials: "include" }
            );
            const json = await res.json();
            if (json.success) setSlots(json.data.slots);
        } finally { setLoadingSlots(false); }
    }, [viewDoctor, headers]);

    useEffect(() => { if (selectedDate) fetchSlots(selectedDate); }, [selectedDate, fetchSlots]);

    function getScheduleForDate(date: string): Schedule | undefined {
        return schedules.find((s) => s.date === date);
    }

    function openScheduleModal(date: string) {
        if (!viewDoctor) return;
        const doctorKey = viewDoctor.name + " — " + viewDoctor.specialty;
        const existing = getScheduleForDate(date);
        if (existing) {
            setForm({ doctor: existing.doctor, date: existing.date, isOpen: existing.isOpen, startTime: existing.startTime, endTime: existing.endTime, slotDuration: existing.slotDuration, capacityPerSlot: existing.capacityPerSlot, breaks: existing.breaks, note: existing.note });
        } else {
            setForm({ doctor: doctorKey, date, isOpen: true, startTime: "08:00", endTime: "17:00", slotDuration: 30, capacityPerSlot: 1, breaks: [], note: "" });
        }
        setModal("schedule");
    }

    async function saveSchedule() {
        if (!form.date) return;
        setSaving(true); setFeedback(null);
        try {
            const res = await fetch("/api/admin/schedules", { method: "POST", headers: headers(), credentials: "include", body: JSON.stringify(form) });
            const json = await res.json();
            if (json.success) {
                setFeedback({ type: "ok", msg: `Schedule saved. ${json.data.slotsCreated} slots generated.` });
                await fetchSchedules();
                if (selectedDate === form.date) fetchSlots(form.date);
                setTimeout(() => { setModal(null); setFeedback(null); }, 1800);
            } else { setFeedback({ type: "err", msg: json.error ?? "Failed to save" }); }
        } finally { setSaving(false); }
    }

    async function toggleSlot(slot: Slot) {
        const newStatus = slot.status === "blocked" ? "open" : "blocked";
        try {
            const res = await fetch(`/api/admin/slots/${slot._id}`, { method: "PATCH", headers: headers(), credentials: "include", body: JSON.stringify({ status: newStatus }) });
            const json = await res.json();
            if (json.success) setSlots((prev) => prev.map((s) => s._id === slot._id ? { ...s, status: newStatus } : s));
        } catch { /* silent */ }
    }

    function addBreak() { setForm((f) => ({ ...f, breaks: [...f.breaks, { start: "12:00", end: "13:00" }] })); }
    function removeBreak(i: number) { setForm((f) => ({ ...f, breaks: f.breaks.filter((_, idx) => idx !== i) })); }
    function updateBreak(i: number, field: "start" | "end", value: string) {
        setForm((f) => ({ ...f, breaks: f.breaks.map((b, idx) => idx === i ? { ...b, [field]: value } : b) }));
    }

    // ─── Doctor CRUD ──────────────────────────────────────
    function openAddDoctor() { setDoctorForm(EMPTY_DOCTOR); setEditingDoctor(null); setDoctorFeedback(null); setModal("addDoctor"); }
    function openEditDoctor(d: Doctor) {
        setEditingDoctor(d);
        setDoctorForm({ name: d.name, specialty: d.specialty, department: d.department, qualification: d.qualification, experience: d.experience, avatar: d.avatar, availableDays: d.availableDays, email: d.email, phone: d.phone, bio: d.bio });
        setDoctorFeedback(null);
        setModal("editDoctor");
    }

    async function saveDoctor() {
        if (!doctorForm.name.trim()) { setDoctorFeedback({ type: "err", msg: "Doctor name is required." }); return; }
        setSavingDoctor(true);
        try {
            const url = modal === "addDoctor" ? "/api/admin/doctors" : `/api/admin/doctors/${editingDoctor?._id}`;
            const method = modal === "addDoctor" ? "POST" : "PATCH";
            const res = await fetch(url, { method, headers: headers(), credentials: "include", body: JSON.stringify(doctorForm) });
            const json = await res.json();
            if (json.success) {
                setDoctorFeedback({ type: "ok", msg: modal === "addDoctor" ? "Doctor added." : "Doctor updated." });
                await fetchDoctors();
                if (modal === "addDoctor") setViewDoctor(json.data);
                setTimeout(() => { setModal(null); setDoctorFeedback(null); }, 1400);
            } else { setDoctorFeedback({ type: "err", msg: json.error ?? "Failed." }); }
        } finally { setSavingDoctor(false); }
    }

    async function deleteDoctor(d: Doctor) {
        if (!confirm(`Remove Dr. ${d.name} from the schedule system?`)) return;
        try {
            const res = await fetch(`/api/admin/doctors/${d._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) {
                await fetchDoctors();
                if (viewDoctor?._id === d._id) setViewDoctor(doctors.find((doc) => doc._id !== d._id) ?? null);
            }
        } catch { /* silent */ }
    }

    async function toggleDoctorActive(d: Doctor) {
        try {
            await fetch(`/api/admin/doctors/${d._id}`, { method: "PATCH", headers: headers(), credentials: "include", body: JSON.stringify({ isActive: !d.isActive }) });
            await fetchDoctors();
        } catch { /* silent */ }
    }

    function toggleAvailDay(day: string) {
        setDoctorForm((f) => ({
            ...f,
            availableDays: f.availableDays.includes(day) ? f.availableDays.filter((d) => d !== day) : [...f.availableDays, day],
        }));
    }

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Doctor Schedule</h1>
                        <p className="text-navy/50 text-sm mt-1">Manage availability, time slots, and booking capacity per doctor per day.</p>
                    </div>
                    <button onClick={openAddDoctor} className="btn-primary text-sm px-4 sm:px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Doctor
                    </button>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Controls row */}
                <div className="glass-card rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1 min-w-0 w-full">
                        <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1">Doctor</label>
                        {loadingDoctors ? (
                            <div className="h-10 bg-navy/5 rounded-lg animate-pulse" />
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    value={viewDoctor?._id ?? ""}
                                    onChange={(e) => {
                                        const d = doctors.find((doc) => doc._id === e.target.value);
                                        if (d) { setViewDoctor(d); setSelectedDate(null); }
                                    }}
                                    className="form-input flex-1 px-3 py-2 rounded-lg border border-navy/10 bg-white text-navy text-sm"
                                >
                                    {doctors.length === 0 && <option value="">No doctors added yet</option>}
                                    {doctors.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d.avatar} {d.name} — {d.specialty}{!d.isActive ? " (Inactive)" : ""}
                                        </option>
                                    ))}
                                </select>
                                {viewDoctor && (
                                    <>
                                        <button onClick={() => openEditDoctor(viewDoctor)} title="Edit doctor" className="px-3 py-2 rounded-lg border border-navy/10 text-navy/50 hover:bg-navy/5 text-sm">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => deleteDoctor(viewDoctor)} title="Remove doctor" className="px-3 py-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 text-sm">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                        <div className="flex-1 sm:flex-none">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1">Week of</label>
                            <input type="date" value={viewWeekStart} onChange={(e) => { setViewWeekStart(e.target.value); setSelectedDate(null); }}
                                className="form-input w-full px-3 py-2 rounded-lg border border-navy/10 bg-white text-navy text-sm" />
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 self-end">
                            <button onClick={() => setViewWeekStart(addDays(viewWeekStart, -7))} className="px-2.5 sm:px-3 py-2 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm">←</button>
                            <button onClick={() => setViewWeekStart(todayStr())} className="px-2.5 sm:px-3 py-2 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm">Today</button>
                            <button onClick={() => setViewWeekStart(addDays(viewWeekStart, 7))} className="px-2.5 sm:px-3 py-2 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm">→</button>
                        </div>
                    </div>
                    </div>

                    {/* Doctor card preview */}
                    {viewDoctor && (
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy/[0.03] border border-navy/8">
                            <span className="text-2xl flex-shrink-0">{viewDoctor.avatar}</span>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-navy truncate">{viewDoctor.name}</p>
                                <p className="text-xs text-navy/40 truncate">{viewDoctor.department || viewDoctor.specialty}</p>
                                <p className="text-xs text-navy/30 truncate">{viewDoctor.experience}y exp · {viewDoctor.availableDays.join(", ")}</p>
                            </div>
                            <button onClick={() => toggleDoctorActive(viewDoctor)}
                                className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${viewDoctor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {viewDoctor.isActive ? "Active" : "Inactive"}
                            </button>
                        </div>
                    )}
                </div>

                {/* No doctors empty state */}
                {!loadingDoctors && doctors.length === 0 && (
                    <div className="glass-card rounded-2xl p-14 text-center mb-6">
                        <div className="text-5xl mb-4">🩺</div>
                        <h3 className="font-fraunces text-lg font-semibold text-navy mb-2">No Doctors Yet</h3>
                        <p className="text-navy/50 text-sm mb-5">Add doctors to start managing their schedules and availability.</p>
                        <button onClick={openAddDoctor} className="btn-primary text-sm px-6 py-2.5 mx-auto flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add First Doctor
                        </button>
                    </div>
                )}

                {/* Week grid + slot panel */}
                {viewDoctor && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                        <div className="xl:col-span-2">
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-navy/8 flex items-center justify-between">
                                    <h2 className="font-fraunces font-semibold text-navy">
                                        {formatDate(viewWeekStart)} — {formatDate(addDays(viewWeekStart, 6))}
                                    </h2>
                                    {loadingSchedules && <span className="text-xs text-navy/40 animate-pulse">Loading...</span>}
                                </div>
                                <div className="divide-y divide-navy/5">
                                    {weekDays.map((date) => {
                                        const sched = getScheduleForDate(date);
                                        const isToday = date === todayStr();
                                        const isPast = date < todayStr();
                                        const isSelected = date === selectedDate;
                                        const dayName = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
                                        const isDoctorAvail = viewDoctor.availableDays.includes(dayName);

                                        return (
                                            <div key={date} className={`px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 transition-colors ${isSelected ? "bg-gold/8" : "hover:bg-navy/2"} ${isPast ? "opacity-50" : ""}`}>
                                                <div className="w-20 sm:w-28 flex-shrink-0">
                                                    <p className={`font-semibold text-xs sm:text-sm ${isToday ? "text-gold" : "text-navy"}`}>
                                                        {dayName}{isToday && <span className="ml-1 text-xs">(Today)</span>}
                                                    </p>
                                                    <p className="text-navy/40 text-xs">{new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                                    {!isDoctorAvail && <span className="text-xs text-navy/25 italic">Off day</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {sched ? (
                                                        sched.isOpen ? (
                                                            <div>
                                                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Open</span>
                                                                    <span className="text-xs sm:text-sm text-navy font-medium">{sched.startTime} – {sched.endTime}</span>
                                                                    <span className="text-xs text-navy/40 hidden sm:inline">{sched.slotDuration}min · {sched.capacityPerSlot}/slot</span>
                                                                </div>
                                                                {sched.note && <p className="text-xs text-amber-600 mt-0.5 truncate">📌 {sched.note}</p>}
                                                            </div>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Closed</span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs sm:text-sm text-navy/30 italic">No schedule</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1.5 flex-shrink-0">
                                                    <button onClick={() => openScheduleModal(date)} disabled={isPast}
                                                        className="px-2 sm:px-3 py-1.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy/70 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                                        {sched ? "Edit" : "Set"}
                                                    </button>
                                                    <button onClick={() => setSelectedDate(date)}
                                                        className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected ? "bg-gold text-white" : "bg-navy/5 hover:bg-navy/10 text-navy/70"}`}>
                                                        Slots
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-xs text-navy/50">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400" />Open day</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Closed day</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-navy/20" />No schedule</span>
                            </div>
                        </div>

                        {/* Slot panel */}
                        <div className="glass-card rounded-2xl overflow-hidden self-start">
                            <div className="px-5 py-4 border-b border-navy/8">
                                <h2 className="font-fraunces font-semibold text-navy text-sm">
                                    {selectedDate ? `Slots — ${formatDate(selectedDate)}` : "Select a day to view slots"}
                                </h2>
                                {selectedDate && <p className="text-xs text-navy/40 mt-0.5">{viewDoctor.name}</p>}
                            </div>
                            {!selectedDate ? (
                                <div className="px-5 py-10 text-center text-navy/30 text-sm">
                                    <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Click "Slots" on any day
                                </div>
                            ) : loadingSlots ? (
                                <div className="p-5 space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-navy/5 rounded-lg animate-pulse" />)}</div>
                            ) : slots.length === 0 ? (
                                <div className="px-5 py-10 text-center text-navy/30 text-sm">No slots generated.<br /><span className="text-xs">Set a schedule first.</span></div>
                            ) : (
                                <div className="divide-y divide-navy/5 max-h-[500px] overflow-y-auto">
                                    {slots.map((slot) => (
                                        <div key={slot._id} className="px-4 py-3 flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-navy">{slot.displayTime}</p>
                                                <p className="text-xs text-navy/40">{slot.bookedCount}/{slot.capacity} booked</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[slot.status]}`}>{slot.status}</span>
                                            <button onClick={() => toggleSlot(slot)} disabled={slot.status === "full"}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${slot.status === "blocked" ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                                                {slot.status === "blocked" ? "Unblock" : "Block"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* ── Schedule Modal ── */}
            {modal === "schedule" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-navy/8">
                            <h2 className="font-fraunces text-xl font-bold text-navy">{form.isOpen ? "Set Schedule" : "Close Day"}</h2>
                            <p className="text-navy/50 text-sm mt-1">{viewDoctor?.name} · {formatDate(form.date)}</p>
                        </div>
                        <div className="p-6 space-y-5">
                            {feedback && (
                                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{feedback.msg}</div>
                            )}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-navy/3 border border-navy/8">
                                <div>
                                    <p className="font-semibold text-navy text-sm">Day Status</p>
                                    <p className="text-navy/50 text-xs mt-0.5">Toggle to close entire day for bookings</p>
                                </div>
                                <button onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${form.isOpen ? "bg-green-500" : "bg-red-400"}`}>
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.isOpen ? "left-7" : "left-1"}`} />
                                </button>
                            </div>
                            {form.isOpen ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Start Time</label>
                                            <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">End Time</label>
                                            <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Slot Duration</label>
                                            <select value={form.slotDuration} onChange={(e) => setForm((f) => ({ ...f, slotDuration: Number(e.target.value) }))} className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm">
                                                {SLOT_DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Patients / Slot</label>
                                            <input type="number" min={1} max={10} value={form.capacityPerSlot} onChange={(e) => setForm((f) => ({ ...f, capacityPerSlot: Number(e.target.value) }))} className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-semibold text-navy/60 uppercase tracking-wider">Breaks</label>
                                            <button onClick={addBreak} className="text-xs text-gold hover:underline font-medium">+ Add Break</button>
                                        </div>
                                        {form.breaks.length === 0 ? (
                                            <p className="text-xs text-navy/30 italic">No breaks configured</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {form.breaks.map((b, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input type="time" value={b.start} onChange={(e) => updateBreak(i, "start", e.target.value)} className="form-input flex-1 px-2 py-1.5 rounded-lg border border-navy/10 text-navy text-sm" />
                                                        <span className="text-navy/40 text-xs">to</span>
                                                        <input type="time" value={b.end} onChange={(e) => updateBreak(i, "end", e.target.value)} className="form-input flex-1 px-2 py-1.5 rounded-lg border border-navy/10 text-navy text-sm" />
                                                        <button onClick={() => removeBreak(i)} className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                                    This day will be marked as <strong>closed</strong>. All existing open slots will be blocked and no new bookings will be allowed.
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Admin Note (optional)</label>
                                <input type="text" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder={form.isOpen ? "e.g. Half-day schedule" : "e.g. Doctor on leave"} className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                            </div>
                            {form.isOpen && form.startTime && form.endTime && form.startTime < form.endTime && (
                                <div className="p-3 rounded-xl bg-gold/8 border border-gold/20 text-xs text-navy/60">
                                    {(() => {
                                        const [sh, sm] = form.startTime.split(":").map(Number);
                                        const [eh, em] = form.endTime.split(":").map(Number);
                                        const startMins = sh * 60 + sm, endMins = eh * 60 + em;
                                        const breakMins = form.breaks.reduce((acc, b) => {
                                            const [bsh, bsm] = b.start.split(":").map(Number);
                                            const [beh, bem] = b.end.split(":").map(Number);
                                            return acc + Math.max(0, (beh * 60 + bem) - (bsh * 60 + bsm));
                                        }, 0);
                                        const slots = Math.floor((endMins - startMins - breakMins) / form.slotDuration);
                                        return <span>~<strong>{slots}</strong> slots · <strong>{slots * form.capacityPerSlot}</strong> max bookings</span>;
                                    })()}
                                </div>
                            )}
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={() => { setModal(null); setFeedback(null); }} className="flex-1 py-3 rounded-xl border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm font-medium">Cancel</button>
                            <button onClick={saveSchedule} disabled={saving} className="flex-1 py-3 rounded-xl btn-gold text-sm font-semibold disabled:opacity-60">
                                {saving ? "Saving..." : form.isOpen ? "Save Schedule" : "Close This Day"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Doctor Modal ── */}
            {(modal === "addDoctor" || modal === "editDoctor") && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-navy/8 flex items-center justify-between">
                            <div>
                                <h2 className="font-fraunces text-xl font-bold text-navy">{modal === "addDoctor" ? "Add Doctor" : "Edit Doctor"}</h2>
                                <p className="text-navy/50 text-sm mt-0.5">{modal === "addDoctor" ? "Register a new doctor in the system." : `Editing ${editingDoctor?.name}`}</p>
                            </div>
                            <button onClick={() => { setModal(null); setDoctorFeedback(null); }} className="p-2 hover:bg-navy/5 rounded-xl text-navy/40">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {doctorFeedback && (
                                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${doctorFeedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{doctorFeedback.msg}</div>
                            )}

                            {/* Avatar picker */}
                            <div>
                                <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-2">Avatar</label>
                                <div className="flex gap-2">
                                    {AVATAR_OPTIONS.map((av) => (
                                        <button key={av} onClick={() => setDoctorForm((f) => ({ ...f, avatar: av }))}
                                            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${doctorForm.avatar === av ? "bg-navy text-white shadow-md scale-110" : "bg-navy/5 hover:bg-navy/10"}`}>
                                            {av}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Full Name *</label>
                                    <input type="text" value={doctorForm.name} onChange={(e) => setDoctorForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dr. First Last" className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Specialty</label>
                                    <select value={doctorForm.specialty} onChange={(e) => setDoctorForm((f) => ({ ...f, specialty: e.target.value }))} className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm">
                                        {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Department</label>
                                    <input type="text" value={doctorForm.department} onChange={(e) => setDoctorForm((f) => ({ ...f, department: e.target.value }))} placeholder="e.g. Orthodontics" className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Qualification</label>
                                    <input type="text" value={doctorForm.qualification} onChange={(e) => setDoctorForm((f) => ({ ...f, qualification: e.target.value }))} placeholder="BDS, MDS (Orthodontics)" className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Experience (years)</label>
                                    <input type="number" min={0} value={doctorForm.experience} onChange={(e) => setDoctorForm((f) => ({ ...f, experience: Number(e.target.value) }))} className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Email</label>
                                    <input type="email" value={doctorForm.email} onChange={(e) => setDoctorForm((f) => ({ ...f, email: e.target.value }))} placeholder="doctor@clinic.com" className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Phone</label>
                                    <input type="tel" value={doctorForm.phone} onChange={(e) => setDoctorForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Short Bio</label>
                                    <textarea rows={2} value={doctorForm.bio} onChange={(e) => setDoctorForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Brief professional summary…" className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm resize-none" />
                                </div>
                            </div>

                            {/* Available days */}
                            <div>
                                <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-2">Available Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <button key={day} onClick={() => toggleAvailDay(day)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${doctorForm.availableDays.includes(day) ? "bg-navy text-white" : "bg-navy/5 text-navy/50 hover:bg-navy/10"}`}>
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={() => { setModal(null); setDoctorFeedback(null); }} className="flex-1 py-3 rounded-xl border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm font-medium">Cancel</button>
                            <button onClick={saveDoctor} disabled={savingDoctor} className="flex-1 py-3 rounded-xl btn-gold text-sm font-semibold disabled:opacity-60">
                                {savingDoctor ? "Saving..." : modal === "addDoctor" ? "Add Doctor" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
