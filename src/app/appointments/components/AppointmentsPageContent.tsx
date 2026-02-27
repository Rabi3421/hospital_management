"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/ui/AppIcon";

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

const times = [
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
];

const steps = [
    {
        num: "01",
        icon: "ClipboardDocumentListIcon",
        title: "Submit Your Request",
        desc: "Fill in the form with your details, preferred date, time, and the service you need. It takes less than 2 minutes.",
    },
    {
        num: "02",
        icon: "PhoneIcon",
        title: "We Confirm Within 2 Hours",
        desc: "Our patient care team will call or text you to confirm your appointment and answer any questions you may have.",
    },
    {
        num: "03",
        icon: "CalendarDaysIcon",
        title: "Come In & Get Treated",
        desc: "Arrive at our Madison Avenue clinic on the day of your appointment. Your dedicated dental team will be ready for you.",
    },
];

const whyBook = [
    { icon: "ClockIcon", text: "Same-day appointments available" },
    { icon: "GiftIcon", text: "Free first consultation" },
    { icon: "CreditCardIcon", text: "0% financing options" },
    { icon: "ShieldCheckIcon", text: "Major insurance accepted" },
    { icon: "StarIcon", text: "4.9 ★ rated by 2,400+ patients" },
    { icon: "BoltIcon", text: "Emergency slots available 24/7" },
];

export default function AppointmentsPageContent() {
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        setTimeout(() => {
            el.style.transition =
                "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, 100);
    }, []);

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-navy">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
                <div
                    ref={heroRef}
                    className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center"
                >
                    <span className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                            Same-Day Appointments Available
                        </span>
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-5">
                        Book Your{" "}
                        <span className="text-gold-gradient italic">Appointment</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                        Schedule a visit with Manhattan's top dental specialists in minutes.
                        Your first consultation is completely free.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-white/60">
                            <Icon name="CheckCircleIcon" size={16} className="text-gold" variant="solid" />
                            No waiting list
                        </div>
                        <div className="flex items-center gap-1.5 text-white/60">
                            <Icon name="CheckCircleIcon" size={16} className="text-gold" variant="solid" />
                            Free first consultation
                        </div>
                        <div className="flex items-center gap-1.5 text-white/60">
                            <Icon name="CheckCircleIcon" size={16} className="text-gold" variant="solid" />
                            Cancel anytime
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 px-6 lg:px-8 bg-cream">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Form — 2 cols */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl border border-cream-dark shadow-card p-8 md:p-10">
                                <h2 className="font-display text-2xl font-semibold text-navy mb-2">
                                    Request an Appointment
                                </h2>
                                <p className="text-navy/50 text-sm mb-8">
                                    Fill in the details below and our team will confirm your
                                    booking within 2 hours.
                                </p>

                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    {/* Name row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                                First Name <span className="text-gold">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Jane"
                                                className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                                Last Name <span className="text-gold">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Smith"
                                                className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Contact row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                                Phone Number <span className="text-gold">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="(555) 000-0000"
                                                className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                                Email Address <span className="text-gold">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="jane@example.com"
                                                className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Service */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                            Service Needed <span className="text-gold">*</span>
                                        </label>
                                        <select className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy text-sm appearance-none cursor-pointer">
                                            <option value="" disabled selected>
                                                Select a service...
                                            </option>
                                            {services.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Doctor preference */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                            Preferred Doctor
                                        </label>
                                        <select className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy text-sm appearance-none cursor-pointer">
                                            {doctors.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                                Preferred Date <span className="text-gold">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy text-sm cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                                Preferred Time <span className="text-gold">*</span>
                                            </label>
                                            <select className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy text-sm appearance-none cursor-pointer">
                                                <option value="" disabled selected>
                                                    Select a time...
                                                </option>
                                                {times.map((t) => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* New Patient */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-3 uppercase tracking-wider">
                                            Are you a new patient? <span className="text-gold">*</span>
                                        </label>
                                        <div className="flex gap-4">
                                            {["Yes, first visit", "No, returning patient"].map((opt) => (
                                                <label
                                                    key={opt}
                                                    className="flex items-center gap-2.5 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="patient_type"
                                                        value={opt}
                                                        className="w-4 h-4 accent-gold cursor-pointer"
                                                    />
                                                    <span className="text-sm text-navy/70">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Insurance */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                            Insurance Provider (optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Delta Dental, Cigna, Self-Pay..."
                                            className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                                            Additional Notes
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Describe your concern, any allergies, or anything we should know before your visit..."
                                            className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm resize-none"
                                        />
                                    </div>

                                    {/* Consent */}
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="consent"
                                            className="w-4 h-4 mt-0.5 accent-gold cursor-pointer flex-shrink-0"
                                        />
                                        <label
                                            htmlFor="consent"
                                            className="text-xs text-navy/50 leading-relaxed cursor-pointer"
                                        >
                                            I agree to be contacted by DentalCare regarding my
                                            appointment request. I understand my information will be
                                            handled in accordance with the{" "}
                                            <Link href="#" className="text-gold hover:underline">
                                                Privacy Policy
                                            </Link>{" "}
                                            and{" "}
                                            <Link href="#" className="text-gold hover:underline">
                                                HIPAA Notice
                                            </Link>
                                            .
                                        </label>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="w-full btn-gold py-4 rounded-full font-semibold text-sm shadow-gold"
                                    >
                                        <span>Request Appointment</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Why Book */}
                            <div className="bg-navy rounded-3xl p-6 text-white">
                                <h3 className="font-display text-lg font-semibold mb-5">
                                    Why Book With Us?
                                </h3>
                                <ul className="space-y-3">
                                    {whyBook.map((item) => (
                                        <li key={item.text} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0">
                                                <Icon
                                                    name={item.icon}
                                                    size={14}
                                                    className="text-gold"
                                                    variant="solid"
                                                />
                                            </div>
                                            <span className="text-white/70 text-sm">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Urgent */}
                            <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon name="ExclamationTriangleIcon" size={18} className="text-red-500" variant="solid" />
                                    <h3 className="font-semibold text-red-800 text-sm">
                                        Dental Emergency?
                                    </h3>
                                </div>
                                <p className="text-red-700/70 text-sm leading-relaxed mb-4">
                                    Don't wait — call our 24/7 emergency line immediately if you're
                                    experiencing severe pain, a broken tooth, or facial swelling.
                                </p>
                                <a
                                    href="tel:+12125550191"
                                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                                >
                                    <Icon name="PhoneIcon" size={14} variant="solid" />
                                    (212) 555-0191 — Emergency
                                </a>
                            </div>

                            {/* Office Hours */}
                            <div className="bg-white rounded-3xl p-6 border border-cream-dark shadow-card">
                                <h3 className="font-semibold text-navy mb-4">Office Hours</h3>
                                <ul className="space-y-2.5">
                                    {[
                                        { day: "Monday – Tuesday", hrs: "8:00 AM – 7:00 PM" },
                                        { day: "Wednesday – Thursday", hrs: "8:00 AM – 6:00 PM" },
                                        { day: "Friday", hrs: "8:00 AM – 5:00 PM" },
                                        { day: "Saturday", hrs: "9:00 AM – 4:00 PM" },
                                        { day: "Sunday", hrs: "10:00 AM – 2:00 PM" },
                                    ].map((row) => (
                                        <li
                                            key={row.day}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-navy/60">{row.day}</span>
                                            <span className="text-navy font-medium">{row.hrs}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-3xl p-6 border border-cream-dark shadow-card">
                                <h3 className="font-semibold text-navy mb-4">Our Location</h3>
                                <div className="flex items-start gap-3">
                                    <Icon name="MapPinIcon" size={16} className="text-gold mt-0.5" variant="solid" />
                                    <div>
                                        <p className="text-navy text-sm font-medium">425 Madison Avenue</p>
                                        <p className="text-navy/50 text-sm">Suite 1200</p>
                                        <p className="text-navy/50 text-sm">New York, NY 10017</p>
                                    </div>
                                </div>
                                <div className="mt-4 bg-cream rounded-xl h-36 flex items-center justify-center border border-cream-dark">
                                    <div className="text-center">
                                        <Icon name="MapIcon" size={28} className="text-navy/20 mx-auto mb-2" />
                                        <p className="text-navy/40 text-xs">Midtown Manhattan</p>
                                        <p className="text-navy/30 text-xs">Near Grand Central Station</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Book — Steps */}
            <section className="py-20 px-6 lg:px-8 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3">
                            How It Works
                        </h2>
                        <div className="section-divider mx-auto mb-4" />
                        <p className="text-navy/55 text-sm max-w-lg mx-auto leading-relaxed">
                            Booking your appointment is simple, fast, and completely hassle-free.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={step.num} className="relative text-center">
                                {/* Connector */}
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] right-0 h-0.5 bg-cream-dark" />
                                )}
                                <div className="w-24 h-24 rounded-3xl bg-navy flex items-center justify-center mx-auto mb-5 relative">
                                    <Icon name={step.icon} size={32} className="text-gold" />
                                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold text-navy text-xs font-bold flex items-center justify-center">
                                        {step.num}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-navy mb-2">{step.title}</h3>
                                <p className="text-navy/55 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What to Bring */}
            <section className="py-16 px-6 lg:px-8 bg-cream">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl border border-cream-dark shadow-card p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-navy mb-6">
                                What to Bring
                            </h2>
                            <ul className="space-y-3">
                                {[
                                    "Valid government-issued photo ID",
                                    "Dental insurance card (if applicable)",
                                    "Completed new patient forms (emailed before visit)",
                                    "List of current medications",
                                    "Previous dental X-rays (if available)",
                                    "Payment method for any copay",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-navy/70">
                                        <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                                            <svg width="9" height="8" viewBox="0 0 10 8" fill="none">
                                                <path
                                                    d="M1 4L3.5 6.5L9 1"
                                                    stroke="#C9A96E"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-navy mb-6">
                                Preparing for Your Visit
                            </h2>
                            <ul className="space-y-3">
                                {[
                                    "Arrive 10–15 minutes early to complete any paperwork",
                                    "Brush and floss before your appointment",
                                    "Avoid eating 2 hours before anesthesia or sedation",
                                    "Arrange transportation if sedation is planned",
                                    "Write down any questions or concerns beforehand",
                                    "Dress comfortably — procedures can take 30–90 minutes",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-navy/70">
                                        <div className="w-5 h-5 rounded-full bg-navy/8 flex items-center justify-center flex-shrink-0">
                                            <Icon name="InformationCircleIcon" size={12} className="text-navy/40" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
