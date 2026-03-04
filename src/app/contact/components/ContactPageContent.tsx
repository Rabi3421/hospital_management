"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/AppIcon";
import { useClinicSettings } from "@/context/useClinicSettings";

// ─── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm() {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [consent, setConsent] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!fullName.trim()) return setError("Full name is required.");
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
        if (!subject) return setError("Please select a subject.");
        if (!message.trim()) return setError("Message cannot be empty.");
        if (!consent) return setError("You must agree to our privacy policy before sending.");

        setSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, phone, email, subject, message, consent }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json.error ?? "Something went wrong. Please try again.");
            } else {
                setSuccess(true);
                // Reset form
                setFullName(""); setPhone(""); setEmail("");
                setSubject(""); setMessage(""); setConsent(false);
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-display text-xl font-semibold text-navy mb-2">Message Sent!</h3>
                    <p className="text-navy/55 text-sm max-w-xs leading-relaxed">
                        Thank you for reaching out. Our team will get back to you within 2 hours during business hours.
                    </p>
                </div>
                <button
                    onClick={() => setSuccess(false)}
                    className="text-sm text-gold hover:underline font-medium"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                        Full Name <span className="text-gold">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Jane Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                    Email Address <span className="text-gold">*</span>
                </label>
                <input
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                    Subject <span className="text-gold">*</span>
                </label>
                <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy text-sm appearance-none cursor-pointer"
                >
                    <option value="" disabled>What&apos;s this about?</option>
                    {[
                        "General Inquiry",
                        "Appointment Request",
                        "Insurance & Billing",
                        "Dental Records Request",
                        "Feedback / Complaint",
                        "Partnership / Referral",
                        "Other",
                    ].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                    Message <span className="text-gold">*</span>
                </label>
                <textarea
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-input w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-navy placeholder:text-navy/30 text-sm resize-none"
                />
            </div>

            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    id="contact-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-gold cursor-pointer flex-shrink-0"
                />
                <label htmlFor="contact-consent" className="text-xs text-navy/50 leading-relaxed cursor-pointer">
                    I agree to receive communications from DentalCare. My information will be handled per our{" "}
                    <Link href="#" className="text-gold hover:underline">Privacy Policy</Link>.
                </label>
            </div>

            {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gold py-4 rounded-full font-semibold text-sm shadow-gold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {submitting ? (
                    <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending…
                    </>
                ) : (
                    <span>Send Message</span>
                )}
            </button>
        </form>
    );
}

function buildContactCards(clinic: { address: string; city: string; phone: string; emergencyPhone: string; email: string; workDays: string; openTime: string; closeTime: string }) {
    return [
        {
            icon: "MapPinIcon",
            title: "Visit Our Clinic",
            lines: [clinic.address, clinic.city],
            action: { label: "Get Directions", href: `https://maps.google.com?q=${encodeURIComponent(clinic.address + " " + clinic.city)}` },
            bg: "bg-navy",
            iconBg: "bg-gold/20",
            iconColor: "text-gold",
            textColor: "text-white/60",
            titleColor: "text-white",
            actionColor: "text-gold hover:text-gold-light",
        },
        {
            icon: "PhoneIcon",
            title: "Call or Text Us",
            lines: [`Main: ${clinic.phone}`, `Emergency: ${clinic.emergencyPhone}`],
            action: { label: "Call Now", href: `tel:${clinic.phone}` },
            bg: "bg-white",
            iconBg: "bg-gold/10",
            iconColor: "text-gold",
            textColor: "text-navy/60",
            titleColor: "text-navy",
            actionColor: "text-gold hover:text-gold-dark",
            border: true,
        },
        {
            icon: "EnvelopeIcon",
            title: "Email Us",
            lines: [`General: ${clinic.email}`],
            action: { label: "Send Email", href: `mailto:${clinic.email}` },
            bg: "bg-white",
            iconBg: "bg-navy/5",
            iconColor: "text-navy",
            textColor: "text-navy/60",
            titleColor: "text-navy",
            actionColor: "text-gold hover:text-gold-dark",
            border: true,
        },
        {
            icon: "ClockIcon",
            title: "Office Hours",
            lines: [`${clinic.workDays}`, `${clinic.openTime} – ${clinic.closeTime}`],
            action: { label: "Book Appointment", href: "/appointments" },
            bg: "bg-gold",
            iconBg: "bg-navy/15",
            iconColor: "text-navy",
            textColor: "text-navy/70",
            titleColor: "text-navy",
            actionColor: "text-navy hover:text-navy-light font-semibold",
        },
    ];
}

const faqs = [
    {
        q: "Do you accept walk-ins?",
        a: "We encourage appointments for the best experience, but we do our best to accommodate walk-in patients based on availability. Call ahead for the shortest wait.",
    },
    {
        q: "How quickly can I get an appointment?",
        a: "New patients can usually be seen within 24–48 hours. For dental emergencies, we offer same-day appointments — call our emergency line immediately.",
    },
    {
        q: "Do you accept my insurance?",
        a: "We accept most major dental insurance plans including Delta Dental, Cigna, Aetna, MetLife, and more. Call us or fill out our contact form to verify your coverage.",
    },
    {
        q: "Is parking available?",
        a: "We're located on Madison Avenue near Grand Central. Multiple parking garages are within a 2-block radius. The clinic is also easily accessible by subway (4/5/6 and S trains).",
    },
    {
        q: "Can I request my dental records?",
        a: "Absolutely. Email records@dentalcare.com with your name, date of birth, and the address to send them to. We process all records requests within 3 business days.",
    },
];

function RevealItem({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.classList.add("reveal-hidden");
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => el.classList.add("revealed"), delay);
                    obs.disconnect();
                }
            },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [delay]);
    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

export default function ContactPageContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { clinic } = useClinicSettings();
    const contactCards = buildContactCards(clinic);

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
            <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden bg-navy">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
                <div
                    ref={heroRef}
                    className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                >
                    <span className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                            We're Here to Help
                        </span>
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-5">
                        Get in{" "}
                        <span className="text-gold-gradient italic">Touch With Us</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                        Have questions about our services, insurance, or need to reach our
                        team? We'd love to hear from you — expect a response within 2 hours
                        during business hours.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cream">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
                        {contactCards.map((card, i) => (
                            <RevealItem key={card.title} delay={i * 80} className="reveal-scale">
                                <div
                                    className={`h-full rounded-3xl p-7 ${card.bg} ${card.border ? "border border-cream-dark shadow-card" : ""
                                        }`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center mb-5`}
                                    >
                                        <Icon
                                            name={card.icon}
                                            size={22}
                                            className={card.iconColor}
                                            variant="solid"
                                        />
                                    </div>
                                    <h3
                                        className={`font-display text-lg font-semibold mb-3 ${card.titleColor}`}
                                    >
                                        {card.title}
                                    </h3>
                                    <ul className="space-y-1.5 mb-5">
                                        {card.lines.map((line) => (
                                            <li key={line} className={`text-sm ${card.textColor}`}>
                                                {line}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href={card.action.href}
                                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${card.actionColor}`}
                                    >
                                        {card.action.label}
                                        <Icon name="ArrowRightIcon" size={12} />
                                    </a>
                                </div>
                            </RevealItem>
                        ))}
                    </div>

                    {/* Contact Form + Map */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Form */}
                        <RevealItem className="lg:col-span-3 reveal-hidden-left">
                            <div className="bg-white rounded-3xl border border-cream-dark shadow-card p-8 md:p-10">
                                <h2 className="font-display text-2xl font-semibold text-navy mb-2">
                                    Send Us a Message
                                </h2>
                                <p className="text-navy/50 text-sm mb-8">
                                    Questions, feedback, or just want to say hi — our patient
                                    care team responds within 2 hours during office hours.
                                </p>

                                <ContactForm />
                            </div>
                        </RevealItem>

                        {/* Aside */}
                        <RevealItem className="lg:col-span-2 reveal-hidden-right space-y-6">
                            {/* Map Placeholder */}
                            <div className="bg-white rounded-3xl border border-cream-dark shadow-card overflow-hidden">
                                <div className="bg-cream h-52 flex flex-col items-center justify-center gap-2">
                                    <Icon name="MapIcon" size={40} className="text-navy/15" />
                                    <p className="text-navy/40 text-sm font-medium">
                                        {clinic.address}
                                    </p>
                                    <p className="text-navy/30 text-xs">
                                        {clinic.city}
                                    </p>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Icon name="MapPinIcon" size={16} className="text-gold mt-0.5" variant="solid" />
                                        <div>
                                            <p className="text-navy text-sm font-medium">
                                                {clinic.address}
                                            </p>
                                            <p className="text-navy/50 text-sm">{clinic.city}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://maps.google.com?q=${encodeURIComponent(clinic.address + " " + clinic.city)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-navy text-white rounded-xl py-3 text-sm font-semibold hover:bg-navy-light transition-colors"
                                    >
                                        <Icon name="MapIcon" size={14} />
                                        Open in Google Maps
                                    </a>
                                </div>
                            </div>

                            {/* Transit */}
                            <div className="bg-white rounded-3xl border border-cream-dark shadow-card p-6">
                                <h3 className="font-semibold text-navy mb-4">
                                    Getting Here
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        {
                                            icon: "Square2StackIcon",
                                            label: "Subway",
                                            val: "4, 5, 6, S trains — Grand Central",
                                        },
                                        {
                                            icon: "TruckIcon",
                                            label: "Bus",
                                            val: "M1, M2, M3, M4 along Madison Ave",
                                        },
                                        {
                                            icon: "CreditCardIcon",
                                            label: "Parking",
                                            val: "Icon Parking — 395 Madison Ave",
                                        },
                                        {
                                            icon: "GlobeAltIcon",
                                            label: "Rideshare",
                                            val: "Ample pickup/dropoff on E 48th St",
                                        },
                                    ].map((item) => (
                                        <li key={item.label} className="flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                                <Icon name={item.icon} size={13} className="text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-navy text-xs font-semibold">{item.label}</p>
                                                <p className="text-navy/50 text-xs">{item.val}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Emergency */}
                            <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon name="BoltIcon" size={16} className="text-red-500" variant="solid" />
                                    <h3 className="font-semibold text-red-800 text-sm">
                                        24/7 Emergency Line
                                    </h3>
                                </div>
                                <p className="text-red-700/65 text-xs leading-relaxed mb-3">
                                    For dental emergencies outside office hours — call our direct
                                    emergency line anytime.
                                </p>
                                <a
                                    href={`tel:${clinic.emergencyPhone}`}
                                    className="flex items-center gap-2 text-red-700 text-sm font-bold"
                                >
                                    <Icon name="PhoneIcon" size={14} variant="solid" className="text-red-500" />
                                    {clinic.emergencyPhone}
                                </a>
                            </div>
                        </RevealItem>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3">
                            Frequently Asked Questions
                        </h2>
                        <div className="section-divider mx-auto mb-4" />
                        <p className="text-navy/55 text-sm leading-relaxed">
                            Can't find what you're looking for? Send us a message above.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <RevealItem key={faq.q} delay={i * 80} className="reveal-hidden">
                                <div className="bg-cream rounded-2xl p-6 border border-cream-dark">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Icon name="QuestionMarkCircleIcon" size={16} className="text-gold" variant="solid" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-navy mb-2 text-sm">{faq.q}</h3>
                                            <p className="text-navy/55 text-sm leading-relaxed">{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            </RevealItem>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-navy">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-3xl font-semibold text-white mb-4">
                        Have an Urgent Dental Question?
                    </h2>
                    <p className="text-white/55 text-base max-w-xl mx-auto leading-relaxed mb-8">
                        Our patient care team is available Mon–Fri 8 AM – 7 PM. Don't
                        suffer through dental pain — we'll get you seen today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/appointments"
                            className="btn-gold px-7 py-3.5 rounded-full font-semibold text-sm shadow-gold"
                        >
                            <span>Book Your Visit</span>
                        </Link>
                        <a
                            href={`tel:${clinic.phone}`}
                            className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                        >
                            <Icon name="PhoneIcon" size={14} className="text-gold" variant="solid" />
                            {clinic.phone}
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
