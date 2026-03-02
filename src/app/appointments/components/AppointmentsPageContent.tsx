"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import { useAuth } from "@/context/AuthContext";

// ─── Constants ─────────────────────────────────────────────
const services = [
    "General & Preventive Dentistry",
    "Cosmetic Dentistry",
    "Dental Implants",
    "Teeth Whitening",
    "Orthodontics & Invisalign",
    "Emergency Dental Care",
    "Pediatric Dentistry",
    "Periodontics & Gum Care",
    "Oral Surgery",
    "Endodontics (Root Canal)",
    "Other / Not Sure",
];

const doctors = [
    "No Preference",
    "Dr. Margaret Chen — Implantology",
    "Dr. Arjun Patel — Orthodontics",
    "Dr. Sofia Rodriguez — Cosmetic",
    "Dr. James Kim — Endodontics",
    "Dr. Amara Okonkwo — Pediatric",
    "Dr. Kenji Nakamura — Periodontics",
    "Dr. Layla Hassan — General",
    "Dr. Marcus Thompson — Oral Surgery",
];

const whyBook = [
    { icon: "ClockIcon", text: "Same-day appointments available" },
    { icon: "GiftIcon", text: "Free first consultation" },
    { icon: "CreditCardIcon", text: "0% financing options" },
    { icon: "ShieldCheckIcon", text: "Major insurance accepted" },
    { icon: "StarIcon", text: "4.9 ★ rated by 2,400+ patients" },
    { icon: "BoltIcon", text: "Emergency slots available 24/7" },
];

// ─── Types ────────────────────────────────────────────────
interface SlotInfo {
    _id: string;
    displayTime: string;
    startTime: string;
    capacity: number;
    bookedCount: number;
    remaining: number;
    isFull: boolean;
}

interface FormState {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    service: string;
    doctorPreference: string;
    isNewPatient: string;
    insuranceProvider: string;
    notes: string;
    consent: boolean;
}

const defaultForm: FormState = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    service: "",
    doctorPreference: "No Preference",
    isNewPatient: "yes",
    insuranceProvider: "",
    notes: "",
    consent: false,
};

// ─── localStorage helpers ────────────────────────────────
const GUEST_TOKENS_KEY = "dc_guest_appointment_tokens";
export function getStoredGuestTokens(): string[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(GUEST_TOKENS_KEY) ?? "[]"); }
    catch { return []; }
}
function storeGuestToken(token: string) {
    if (typeof window === "undefined") return;
    const existing = getStoredGuestTokens();
    localStorage.setItem(GUEST_TOKENS_KEY, JSON.stringify([...existing, token]));
}
export function clearStoredGuestTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(GUEST_TOKENS_KEY);
}

// ─── Main Component ───────────────────────────────────────
export default function AppointmentsPageContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user, accessToken } = useAuth();

    const [form, setForm] = useState<FormState>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState | "slot", string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{
        appointmentId: string;
        linked: boolean;
        confirmed: boolean;
        queueNumber: number | null;
        slotTime: string;
        date: string;
    } | null>(null);

    // Slot picking state
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
    const [slots, setSlots] = useState<SlotInfo[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotError, setSlotError] = useState<string | null>(null);
    const [dayUnavailable, setDayUnavailable] = useState(false);
    const [dayUnavailableReason, setDayUnavailableReason] = useState("");

    // Pre-fill if logged in
    useEffect(() => {
        if (user) {
            const [first, ...rest] = (user.name ?? "").split(" ");
            setForm((prev) => ({
                ...prev,
                firstName: first ?? "",
                lastName: rest.join(" "),
                email: user.email ?? "",
            }));
        }
    }, [user]);

    // Hero animation
    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        setTimeout(() => {
            el.style.transition = "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, 100);
    }, []);

    const apiHeaders = useCallback(() => {
        const h: Record<string, string> = { "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "" };
        if (accessToken) h["Authorization"] = `Bearer ${accessToken}`;
        return h;
    }, [accessToken]);

    // ─── Fetch available slots when date or doctor changes ─
    const fetchSlots = useCallback(async (date: string, doctor: string) => {
        if (!date) return;
        setSlotsLoading(true);
        setSlots([]);
        setSelectedSlot(null);
        setSlotError(null);
        setDayUnavailable(false);
        setDayUnavailableReason("");
        try {
            const params = new URLSearchParams({ date });
            if (doctor && doctor !== "No Preference") params.set("doctor", doctor);
            const res = await fetch(`/api/slots/available?${params}`, { headers: apiHeaders() });
            const json = await res.json();
            if (json.success) {
                if (!json.data.available && json.data.slots.length === 0) {
                    setDayUnavailable(true);
                    setDayUnavailableReason(json.data.reason ?? "No slots available for this day");
                } else {
                    setSlots(json.data.slots);
                    if (json.data.slots.length === 0) {
                        setSlotError("No time slots configured for this date. Please choose another date.");
                    }
                }
            }
        } catch {
            setSlotError("Failed to load slots. Please try again.");
        } finally {
            setSlotsLoading(false);
        }
    }, [apiHeaders]);

    useEffect(() => {
        if (selectedDate) fetchSlots(selectedDate, form.doctorPreference);
    }, [selectedDate, form.doctorPreference, fetchSlots]);

    // ─── Field change handler ─────────────────────────────
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const date = e.target.value;
        setSelectedDate(date);
        setSelectedSlot(null);
        setErrors((prev) => ({ ...prev, slot: undefined }));
    }

    function handleDoctorChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setForm((prev) => ({ ...prev, doctorPreference: e.target.value }));
        setSelectedSlot(null);
        if (selectedDate) setSlots([]);
    }

    // ─── Validation ───────────────────────────────────────
    function validate(): boolean {
        const errs: Partial<Record<keyof FormState | "slot", string>> = {};
        if (!form.firstName.trim()) errs.firstName = "First name is required.";
        if (!form.lastName.trim()) errs.lastName = "Last name is required.";
        if (!form.phone.trim()) errs.phone = "Phone number is required.";
        if (!form.email.trim()) errs.email = "Email address is required.";
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email.";
        if (!form.service) errs.service = "Please select a service.";
        if (!selectedDate) errs.slot = "Please choose a date.";
        else if (!selectedSlot) errs.slot = "Please select a time slot.";
        if (!form.consent) errs.consent = "You must agree to the terms.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // ─── Submit ───────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...apiHeaders() },
                credentials: "include",
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    email: form.email,
                    service: form.service,
                    doctorPreference: form.doctorPreference,
                    preferredDate: selectedDate,
                    preferredTime: selectedSlot!.displayTime,
                    slotId: selectedSlot!._id,
                    isNewPatient: form.isNewPatient === "yes",
                    insuranceProvider: form.insuranceProvider,
                    notes: form.notes,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setSlotError("This slot was just taken. Please choose another time.");
                    setSelectedSlot(null);
                    fetchSlots(selectedDate, form.doctorPreference);
                } else {
                    setSubmitError(json.error ?? "Something went wrong. Please try again.");
                }
                return;
            }

            const { appointmentId, guestToken, linked, confirmed, queueNumber, slotTime, date } = json.data;
            if (!linked && guestToken) storeGuestToken(guestToken);

            setSuccessData({ appointmentId, linked: !!linked, confirmed, queueNumber, slotTime, date });
            setForm(defaultForm);
            setSelectedDate("");
            setSelectedSlot(null);
            setSlots([]);
        } catch {
            setSubmitError("Network error. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const today = new Date().toISOString().split("T")[0];

    return (
        <>
            {/* ── Success Modal ── */}
            {successData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-5">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <h2 className="font-display text-2xl font-semibold text-navy mb-2">
                            {successData.confirmed ? "Appointment Confirmed!" : "Appointment Requested!"}
                        </h2>

                        {successData.confirmed && successData.queueNumber && (
                            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-2xl px-5 py-3 mb-4">
                                <div className="text-center">
                                    <p className="text-xs text-navy/50 uppercase tracking-wider font-semibold">Your Queue Number</p>
                                    <p className="font-fraunces text-4xl font-bold text-gold">#{successData.queueNumber}</p>
                                    <p className="text-xs text-navy/40 mt-0.5">
                                        {successData.slotTime} &middot; {new Date(successData.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className="text-navy/55 text-sm leading-relaxed mb-5">
                            {successData.confirmed
                                ? successData.linked
                                    ? "Your appointment is confirmed and saved to your account."
                                    : "Your appointment is confirmed! Show your queue number on arrival."
                                : "We'll confirm your booking within 2 hours via phone or email."}
                        </p>

                        <div className="bg-cream rounded-xl px-4 py-3 mb-5 text-left">
                            <p className="text-xs text-navy/40 uppercase tracking-wider font-semibold mb-1">Reference ID</p>
                            <p className="text-navy font-mono text-sm font-semibold break-all">{successData.appointmentId}</p>
                        </div>

                        {!successData.linked && (
                            <div className="bg-gold/8 border border-gold/20 rounded-2xl p-4 mb-5 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gold/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon name="UserCircleIcon" size={16} className="text-gold" variant="solid" />
                                    </div>
                                    <div>
                                        <p className="text-navy font-semibold text-sm mb-1">Want to track this appointment?</p>
                                        <p className="text-navy/55 text-xs leading-relaxed">
                                            Create a free account and your appointment will be automatically linked.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Link href="/auth/register?next=/dashboard/user/appointments" className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold text-center">Create Account</Link>
                                    <Link href="/auth/login?next=/dashboard/user/appointments" className="flex-1 border border-navy/20 text-navy py-2.5 rounded-xl text-sm font-semibold text-center hover:bg-navy/5 transition-colors">Log In</Link>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {successData.linked && (
                                <button onClick={() => router.push("/dashboard/user/appointments")} className="flex-1 btn-primary py-3 rounded-xl text-sm font-semibold">
                                    View in Dashboard
                                </button>
                            )}
                            <button onClick={() => setSuccessData(null)} className={`${successData.linked ? "flex-1 border border-navy/20 text-navy hover:bg-navy/5" : "w-full btn-primary"} py-3 rounded-xl text-sm font-semibold transition-colors`}>
                                {successData.linked ? "Close" : "Done"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero */}
            <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden bg-navy">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
                <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-gold text-xs font-semibold tracking-widest uppercase">Instant Slot Booking — Auto Confirmed</span>
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-5">
                        Book Your <span className="text-gold-gradient italic">Appointment</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                        Pick an available slot, get an instant queue number, and walk in with confidence.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        {[
                            { icon: "CheckCircleIcon", text: "Instant confirmation" },
                            { icon: "CheckCircleIcon", text: "Queue number assigned" },
                            { icon: "CheckCircleIcon", text: "Cancel anytime" },
                        ].map((item) => (
                            <div key={item.text} className="flex items-center gap-1.5 text-white/60">
                                <Icon name={item.icon} size={16} className="text-gold" variant="solid" />
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cream">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl border border-cream-dark shadow-card p-8 md:p-10">
                                <h2 className="font-display text-2xl font-semibold text-navy mb-2">Book an Appointment</h2>
                                <p className="text-navy/50 text-sm mb-1">
                                    Choose a time slot and fill in your details. Your booking is <strong className="text-green-600">instantly confirmed</strong>.
                                </p>
                                {!user && (
                                    <p className="text-navy/40 text-xs mb-6">
                                        No account needed — book as a guest and{" "}
                                        <Link href="/auth/login" className="text-gold hover:underline">log in</Link>{" "}
                                        afterwards to track it.
                                    </p>
                                )}
                                {user && <p className="mb-6" />}

                                {submitError && (
                                    <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                                        <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 flex-shrink-0 mt-0.5" variant="solid" />
                                        <p className="text-red-700 text-sm">{submitError}</p>
                                    </div>
                                )}

                                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                                    {/* Name */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">First Name <span className="text-gold">*</span></label>
                                            <input name="firstName" type="text" placeholder="Jane" value={form.firstName} onChange={handleChange}
                                                className={`form-input w-full px-4 py-3 rounded-xl border ${errors.firstName ? "border-red-400 bg-red-50" : "border-cream-dark bg-cream"} text-navy placeholder:text-navy/30 text-sm`} />
                                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Last Name <span className="text-gold">*</span></label>
                                            <input name="lastName" type="text" placeholder="Smith" value={form.lastName} onChange={handleChange}
                                                className={`form-input w-full px-4 py-3 rounded-xl border ${errors.lastName ? "border-red-400 bg-red-50" : "border-cream-dark bg-cream"} text-navy placeholder:text-navy/30 text-sm`} />
                                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Phone <span className="text-gold">*</span></label>
                                            <input name="phone" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={handleChange}
                                                className={`form-input w-full px-4 py-3 rounded-xl border ${errors.phone ? "border-red-400 bg-red-50" : "border-cream-dark bg-cream"} text-navy placeholder:text-navy/30 text-sm`} />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Email <span className="text-gold">*</span></label>
                                            <input name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange}
                                                className={`form-input w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-400 bg-red-50" : "border-cream-dark bg-cream"} text-navy placeholder:text-navy/30 text-sm`} />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Service */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Service Needed <span className="text-gold">*</span></label>
                                        <select name="service" value={form.service} onChange={handleChange}
                                            className={`form-input w-full px-4 py-3 rounded-xl border ${errors.service ? "border-red-400 bg-red-50" : "border-cream-dark bg-cream"} text-navy text-sm appearance-none cursor-pointer`}>
                                            <option value="" disabled>Select a service...</option>
                                            {services.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
                                    </div>

                                    {/* Doctor */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Preferred Doctor</label>
                                        <select name="doctorPreference" value={form.doctorPreference} onChange={handleDoctorChange}
                                            className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy text-sm appearance-none cursor-pointer">
                                            {doctors.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Date <span className="text-gold">*</span></label>
                                        <input type="date" value={selectedDate} min={today} onChange={handleDateChange}
                                            className={`form-input w-full px-4 py-3 rounded-xl border ${errors.slot && !selectedDate ? "border-red-400 bg-red-50" : "border-cream-dark bg-cream"} text-navy text-sm cursor-pointer`} />
                                    </div>

                                    {/* Slot Grid */}
                                    {selectedDate && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
                                                    Available Time Slots <span className="text-gold">*</span>
                                                </label>
                                                {slotsLoading && <span className="text-xs text-navy/40 animate-pulse">Loading slots...</span>}
                                            </div>

                                            {dayUnavailable ? (
                                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
                                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-semibold">Doctor unavailable on this date</p>
                                                        <p className="text-red-600/70 text-xs mt-0.5">{dayUnavailableReason}</p>
                                                    </div>
                                                </div>
                                            ) : slotError ? (
                                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-700">{slotError}</div>
                                            ) : slotsLoading ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                    {[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-navy/5 animate-pulse" />)}
                                                </div>
                                            ) : slots.length > 0 ? (
                                                <>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                        {slots.map((slot) => {
                                                            const isSelected = selectedSlot?._id === slot._id;
                                                            const isFull = slot.isFull;
                                                            return (
                                                                <button key={slot._id} type="button" disabled={isFull}
                                                                    onClick={() => { setSelectedSlot(slot); setErrors((prev) => ({ ...prev, slot: undefined })); }}
                                                                    className={`relative px-3 py-3 rounded-xl border text-center transition-all text-sm font-medium
                                                                        ${isFull
                                                                            ? "border-navy/10 bg-navy/3 text-navy/25 cursor-not-allowed"
                                                                            : isSelected
                                                                                ? "border-gold bg-gold/10 text-gold ring-2 ring-gold/30"
                                                                                : "border-cream-dark bg-cream text-navy hover:border-gold/50 hover:bg-gold/5 cursor-pointer"
                                                                        }`}>
                                                                    <span className="block">{slot.displayTime}</span>
                                                                    <span className={`text-xs mt-0.5 block ${isFull ? "text-navy/25" : isSelected ? "text-gold/70" : "text-navy/40"}`}>
                                                                        {isFull ? "Full" : `${slot.remaining} left`}
                                                                    </span>
                                                                    {isSelected && (
                                                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
                                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors.slot && <p className="text-red-500 text-xs mt-2">{errors.slot}</p>}
                                                    {selectedSlot && (
                                                        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>Selected: <strong>{selectedSlot.displayTime}</strong> — will be auto-confirmed instantly</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : !slotsLoading && (
                                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-700">
                                                    No slots have been set up for this date yet. Please choose another date or contact us directly.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors.slot && !selectedDate && <p className="text-red-500 text-xs">{errors.slot}</p>}

                                    {/* New Patient */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-3 uppercase tracking-wider">Are you a new patient? <span className="text-gold">*</span></label>
                                        <div className="flex gap-4">
                                            {[{ value: "yes", label: "Yes, first visit" }, { value: "no", label: "No, returning patient" }].map((opt) => (
                                                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                                                    <input type="radio" name="isNewPatient" value={opt.value} checked={form.isNewPatient === opt.value} onChange={handleChange} className="w-4 h-4 accent-gold cursor-pointer" />
                                                    <span className="text-sm text-navy/70">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Insurance */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Insurance Provider (optional)</label>
                                        <input name="insuranceProvider" type="text" placeholder="e.g. Delta Dental, Cigna, Self-Pay..." value={form.insuranceProvider} onChange={handleChange}
                                            className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm" />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">Additional Notes</label>
                                        <textarea name="notes" rows={3} placeholder="Describe your concern, allergies, or anything we should know..." value={form.notes} onChange={handleChange}
                                            className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm resize-none" />
                                    </div>

                                    {/* Consent */}
                                    <div>
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" id="consent" name="consent" checked={form.consent} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-gold cursor-pointer flex-shrink-0" />
                                            <label htmlFor="consent" className="text-xs text-navy/50 leading-relaxed cursor-pointer">
                                                I agree to be contacted by DentalCare regarding my appointment. I understand my information will be handled in accordance with the{" "}
                                                <Link href="#" className="text-gold hover:underline">Privacy Policy</Link>{" "}
                                                and <Link href="#" className="text-gold hover:underline">HIPAA Notice</Link>.
                                            </label>
                                        </div>
                                        {errors.consent && <p className="text-red-500 text-xs mt-1 ml-7">{errors.consent}</p>}
                                    </div>

                                    <button type="submit" disabled={submitting}
                                        className="w-full btn-gold py-4 rounded-full font-semibold text-sm shadow-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                <span>Booking...</span>
                                            </>
                                        ) : (
                                            <span>{selectedSlot ? `Book ${selectedSlot.displayTime} Slot` : "Confirm Booking"}</span>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-navy rounded-3xl p-6 text-white">
                                <h3 className="font-display text-lg font-semibold mb-4">How It Works</h3>
                                <ol className="space-y-3">
                                    {[
                                        { n: "01", text: "Pick a date & available slot" },
                                        { n: "02", text: "Fill in your details" },
                                        { n: "03", text: "Get instant queue number" },
                                        { n: "04", text: "Walk in at your time!" },
                                    ].map((step) => (
                                        <li key={step.n} className="flex items-start gap-3">
                                            <span className="w-7 h-7 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                                            <span className="text-white/70 text-sm">{step.text}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="bg-white rounded-3xl border border-cream-dark shadow-card p-6">
                                <h3 className="font-semibold text-navy mb-4">Why Book With Us?</h3>
                                <ul className="space-y-3">
                                    {whyBook.map((item) => (
                                        <li key={item.text} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                                <Icon name={item.icon} size={14} className="text-gold" variant="solid" />
                                            </div>
                                            <span className="text-navy/70 text-sm">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon name="ExclamationTriangleIcon" size={18} className="text-red-500" variant="solid" />
                                    <h3 className="font-semibold text-red-800 text-sm">Dental Emergency?</h3>
                                </div>
                                <p className="text-red-700/70 text-sm leading-relaxed mb-4">
                                    Don&apos;t wait — call our 24/7 emergency line if you&apos;re experiencing severe pain or facial swelling.
                                </p>
                                <a href="tel:+12125550191" className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                                    <Icon name="PhoneIcon" size={14} variant="solid" />
                                    +91 7008355987 — Emergency
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
