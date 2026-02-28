"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Constants ────────────────────────────────────────────
const DOCTORS = [
    "Dr. Margaret Chen — Implantology",
    "Dr. Arjun Patel — Orthodontics",
    "Dr. Sofia Rodriguez — Cosmetic",
    "Dr. James Kim — Endodontics",
    "Dr. Amara Okonkwo — Pediatric",
    "Dr. Kenji Nakamura — Periodontics",
    "Dr. Layla Hassan — General",
    "Dr. Marcus Thompson — Oral Surgery",
];

const SLOT_DURATIONS = [15, 20, 30, 45, 60];

// ─── Types ────────────────────────────────────────────────
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

const defaultForm: ScheduleForm = {
    doctor: DOCTORS[0],
    date: "",
    isOpen: true,
    startTime: "08:00",
    endTime: "17:00",
    slotDuration: 30,
    capacityPerSlot: 1,
    breaks: [],
    note: "",
};

// ─── Helpers ─────────────────────────────────────────────
function todayStr(): string {
    return new Date().toISOString().split("T")[0];
}
function addDays(base: string, n: number): string {
    const d = new Date(base + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
}
function formatDate(s: string): string {
    if (!s) return "";
    const d = new Date(s + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    full: "bg-amber-100 text-amber-700",
    blocked: "bg-red-100 text-red-600",
};

// ─── Component ────────────────────────────────────────────
export default function AdminSchedulePage() {
    const { accessToken } = useAuth();

    // View state
    const [viewDoctor, setViewDoctor] = useState(DOCTORS[0]);
    const [viewWeekStart, setViewWeekStart] = useState(todayStr());

    // Data
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Modal
    const [modal, setModal] = useState<"schedule" | null>(null);
    const [form, setForm] = useState<ScheduleForm>(defaultForm);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    // Build 7-day week range
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(viewWeekStart, i));

    // ─── Fetch schedules for current week ─────────────────
    const fetchSchedules = useCallback(async () => {
        setLoadingSchedules(true);
        try {
            const from = viewWeekStart;
            const to = addDays(viewWeekStart, 6);
            const res = await fetch(
                `/api/admin/schedules?doctor=${encodeURIComponent(viewDoctor)}&from=${from}&to=${to}`,
                { headers: headers(), credentials: "include" }
            );
            const json = await res.json();
            if (json.success) setSchedules(json.data.schedules);
        } finally {
            setLoadingSchedules(false);
        }
    }, [viewDoctor, viewWeekStart, headers]);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

    // ─── Fetch slots for selected date ─────────────────────
    const fetchSlots = useCallback(async (date: string) => {
        setLoadingSlots(true);
        setSlots([]);
        try {
            const res = await fetch(
                `/api/admin/slots?doctor=${encodeURIComponent(viewDoctor)}&date=${date}`,
                { headers: headers(), credentials: "include" }
            );
            const json = await res.json();
            if (json.success) setSlots(json.data.slots);
        } finally {
            setLoadingSlots(false);
        }
    }, [viewDoctor, headers]);

    useEffect(() => {
        if (selectedDate) fetchSlots(selectedDate);
    }, [selectedDate, fetchSlots]);

    // ─── Get schedule for a date ──────────────────────────
    function getScheduleForDate(date: string): Schedule | undefined {
        return schedules.find((s) => s.date === date);
    }

    // ─── Open modal for a day ────────────────────────────
    function openScheduleModal(date: string) {
        const existing = getScheduleForDate(date);
        if (existing) {
            setForm({
                doctor: existing.doctor,
                date: existing.date,
                isOpen: existing.isOpen,
                startTime: existing.startTime,
                endTime: existing.endTime,
                slotDuration: existing.slotDuration,
                capacityPerSlot: existing.capacityPerSlot,
                breaks: existing.breaks,
                note: existing.note,
            });
        } else {
            setForm({ ...defaultForm, doctor: viewDoctor, date });
        }
        setModal("schedule");
    }

    // ─── Save schedule ────────────────────────────────────
    async function saveSchedule() {
        if (!form.date) return;
        setSaving(true);
        setFeedback(null);
        try {
            const res = await fetch("/api/admin/schedules", {
                method: "POST",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (json.success) {
                setFeedback({ type: "ok", msg: `Schedule saved. ${json.data.slotsCreated} slots generated.` });
                await fetchSchedules();
                if (selectedDate === form.date) fetchSlots(form.date);
                setTimeout(() => { setModal(null); setFeedback(null); }, 1800);
            } else {
                setFeedback({ type: "err", msg: json.error ?? "Failed to save" });
            }
        } finally {
            setSaving(false);
        }
    }

    // ─── Toggle single slot block/open ───────────────────
    async function toggleSlot(slot: Slot) {
        const newStatus = slot.status === "blocked" ? "open" : "blocked";
        try {
            const res = await fetch(`/api/admin/slots/${slot._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (json.success) {
                setSlots((prev) => prev.map((s) => s._id === slot._id ? { ...s, status: newStatus } : s));
            }
        } catch { /* silent */ }
    }

    // ─── Add/remove breaks ────────────────────────────────
    function addBreak() {
        setForm((f) => ({ ...f, breaks: [...f.breaks, { start: "12:00", end: "13:00" }] }));
    }
    function removeBreak(i: number) {
        setForm((f) => ({ ...f, breaks: f.breaks.filter((_, idx) => idx !== i) }));
    }
    function updateBreak(i: number, field: "start" | "end", value: string) {
        setForm((f) => ({
            ...f,
            breaks: f.breaks.map((b, idx) => idx === i ? { ...b, [field]: value } : b),
        }));
    }

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Doctor Schedule</h1>
                        <p className="text-navy/50 mt-1">Manage availability, time slots, and booking capacity per doctor per day.</p>
                    </div>
                </div>

                {/* Feedback toast */}
                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Controls row */}
                <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1">Doctor</label>
                        <select
                            value={viewDoctor}
                            onChange={(e) => { setViewDoctor(e.target.value); setSelectedDate(null); }}
                            className="form-input w-full px-3 py-2 rounded-lg border border-navy/10 bg-white text-navy text-sm"
                        >
                            {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1">Week of</label>
                        <input
                            type="date"
                            value={viewWeekStart}
                            onChange={(e) => { setViewWeekStart(e.target.value); setSelectedDate(null); }}
                            className="form-input px-3 py-2 rounded-lg border border-navy/10 bg-white text-navy text-sm"
                        />
                    </div>
                    <div className="flex gap-2 pt-5">
                        <button onClick={() => setViewWeekStart(addDays(viewWeekStart, -7))} className="px-3 py-2 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm">← Prev</button>
                        <button onClick={() => setViewWeekStart(todayStr())} className="px-3 py-2 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm">Today</button>
                        <button onClick={() => setViewWeekStart(addDays(viewWeekStart, 7))} className="px-3 py-2 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm">Next →</button>
                    </div>
                </div>

                {/* Week grid + Slot panel side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* 7-day week grid */}
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

                                    return (
                                        <div
                                            key={date}
                                            className={`px-5 py-4 flex items-center justify-between gap-4 transition-colors ${isSelected ? "bg-gold/8" : "hover:bg-navy/2"} ${isPast ? "opacity-50" : ""}`}
                                        >
                                            {/* Date label */}
                                            <div className="w-28 flex-shrink-0">
                                                <p className={`font-semibold text-sm ${isToday ? "text-gold" : "text-navy"}`}>
                                                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                                                    {isToday && <span className="ml-1 text-xs">(Today)</span>}
                                                </p>
                                                <p className="text-navy/40 text-xs">{new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                            </div>

                                            {/* Schedule status */}
                                            <div className="flex-1 min-w-0">
                                                {sched ? (
                                                    sched.isOpen ? (
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Open</span>
                                                                <span className="text-sm text-navy font-medium">{sched.startTime} – {sched.endTime}</span>
                                                                <span className="text-xs text-navy/40">{sched.slotDuration}min slots · {sched.capacityPerSlot} per slot</span>
                                                            </div>
                                                            {sched.breaks.length > 0 && (
                                                                <p className="text-xs text-navy/40 mt-0.5">
                                                                    Break: {sched.breaks.map((b) => `${b.start}–${b.end}`).join(", ")}
                                                                </p>
                                                            )}
                                                            {sched.note && <p className="text-xs text-amber-600 mt-0.5">📌 {sched.note}</p>}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Closed</span>
                                                            {sched.note && <span className="text-xs text-navy/40">{sched.note}</span>}
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-sm text-navy/30 italic">No schedule set</span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => openScheduleModal(date)}
                                                    disabled={isPast}
                                                    className="px-3 py-1.5 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy/70 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {sched ? "Edit" : "Set"}
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedDate(date); }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected ? "bg-gold text-white" : "bg-navy/5 hover:bg-navy/10 text-navy/70"}`}
                                                >
                                                    Slots
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
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
                            {selectedDate && (
                                <p className="text-xs text-navy/40 mt-0.5">{viewDoctor.split(" —")[0]}</p>
                            )}
                        </div>

                        {!selectedDate ? (
                            <div className="px-5 py-10 text-center text-navy/30 text-sm">
                                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Click "Slots" on any day
                            </div>
                        ) : loadingSlots ? (
                            <div className="p-5 space-y-2">
                                {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-navy/5 rounded-lg animate-pulse" />)}
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="px-5 py-10 text-center text-navy/30 text-sm">
                                No slots generated for this day.
                                <br />
                                <span className="text-xs">Set a schedule first.</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-navy/5 max-h-[500px] overflow-y-auto">
                                {slots.map((slot) => (
                                    <div key={slot._id} className="px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-navy">{slot.displayTime}</p>
                                            <p className="text-xs text-navy/40">
                                                {slot.bookedCount}/{slot.capacity} booked
                                                {slot.bookedCount > 0 && <span className="ml-1 text-navy/50">· #{slot.bookedCount} in queue</span>}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[slot.status]}`}>
                                            {slot.status}
                                        </span>
                                        <button
                                            onClick={() => toggleSlot(slot)}
                                            disabled={slot.status === "full"}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                                ${slot.status === "blocked"
                                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                                                    : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                        >
                                            {slot.status === "blocked" ? "Unblock" : "Block"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Schedule Modal ── */}
            {modal === "schedule" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-navy/8">
                            <h2 className="font-fraunces text-xl font-bold text-navy">
                                {form.isOpen ? "Set Schedule" : "Close Day"}
                            </h2>
                            <p className="text-navy/50 text-sm mt-1">
                                {form.doctor.split(" —")[0]} · {formatDate(form.date)}
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Feedback */}
                            {feedback && (
                                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {feedback.msg}
                                </div>
                            )}

                            {/* Open/Closed toggle */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-navy/3 border border-navy/8">
                                <div>
                                    <p className="font-semibold text-navy text-sm">Day Status</p>
                                    <p className="text-navy/50 text-xs mt-0.5">Toggle to close entire day for bookings</p>
                                </div>
                                <button
                                    onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${form.isOpen ? "bg-green-500" : "bg-red-400"}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.isOpen ? "left-7" : "left-1"}`} />
                                </button>
                            </div>

                            {form.isOpen ? (
                                <>
                                    {/* Hours */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Start Time</label>
                                            <input
                                                type="time"
                                                value={form.startTime}
                                                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                                                className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">End Time</label>
                                            <input
                                                type="time"
                                                value={form.endTime}
                                                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                                                className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Slot duration + capacity */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Slot Duration</label>
                                            <select
                                                value={form.slotDuration}
                                                onChange={(e) => setForm((f) => ({ ...f, slotDuration: Number(e.target.value) }))}
                                                className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm"
                                            >
                                                {SLOT_DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Patients / Slot</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={form.capacityPerSlot}
                                                onChange={(e) => setForm((f) => ({ ...f, capacityPerSlot: Number(e.target.value) }))}
                                                className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Breaks */}
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
                                                        <input
                                                            type="time"
                                                            value={b.start}
                                                            onChange={(e) => updateBreak(i, "start", e.target.value)}
                                                            className="form-input flex-1 px-2 py-1.5 rounded-lg border border-navy/10 text-navy text-sm"
                                                        />
                                                        <span className="text-navy/40 text-xs">to</span>
                                                        <input
                                                            type="time"
                                                            value={b.end}
                                                            onChange={(e) => updateBreak(i, "end", e.target.value)}
                                                            className="form-input flex-1 px-2 py-1.5 rounded-lg border border-navy/10 text-navy text-sm"
                                                        />
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

                            {/* Note */}
                            <div>
                                <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Admin Note (optional)</label>
                                <input
                                    type="text"
                                    value={form.note}
                                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                                    placeholder={form.isOpen ? "e.g. Half-day schedule" : "e.g. Doctor on leave"}
                                    className="form-input w-full px-3 py-2 rounded-xl border border-navy/10 text-navy text-sm"
                                />
                            </div>

                            {/* Preview slot count */}
                            {form.isOpen && form.startTime && form.endTime && form.startTime < form.endTime && (
                                <div className="p-3 rounded-xl bg-gold/8 border border-gold/20 text-xs text-navy/60">
                                    {(() => {
                                        const start = parseInt(form.startTime.replace(":", ""));
                                        const end = parseInt(form.endTime.replace(":", ""));
                                        const startMins = Math.floor(start / 100) * 60 + (start % 100);
                                        const endMins = Math.floor(end / 100) * 60 + (end % 100);
                                        const totalMins = endMins - startMins;
                                        const breakMins = form.breaks.reduce((acc, b) => {
                                            const bs = parseInt(b.start.replace(":", ""));
                                            const be = parseInt(b.end.replace(":", ""));
                                            const bsm = Math.floor(bs / 100) * 60 + (bs % 100);
                                            const bem = Math.floor(be / 100) * 60 + (be % 100);
                                            return acc + Math.max(0, bem - bsm);
                                        }, 0);
                                        const netMins = totalMins - breakMins;
                                        const slots = Math.floor(netMins / form.slotDuration);
                                        return <span>~<strong>{slots}</strong> slots · <strong>{slots * form.capacityPerSlot}</strong> max bookings</span>;
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => { setModal(null); setFeedback(null); }}
                                className="flex-1 py-3 rounded-xl border border-navy/15 text-navy/60 hover:bg-navy/5 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveSchedule}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl btn-gold text-sm font-semibold disabled:opacity-60"
                            >
                                {saving ? "Saving..." : form.isOpen ? "Save Schedule" : "Close This Day"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
