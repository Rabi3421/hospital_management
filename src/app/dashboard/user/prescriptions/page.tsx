"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const navItems = [
    {
        label: "Overview",
        href: "/dashboard/user",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        label: "My Appointments",
        href: "/dashboard/user/appointments",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
    },
    {
        label: "Medical Records",
        href: "/dashboard/user/records",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
    },
    {
        label: "Prescriptions",
        href: "/dashboard/user/prescriptions",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
        ),
    },
    {
        label: "Profile",
        href: "/dashboard/user/profile",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
];

const prescriptions = [
    {
        id: 1,
        medication: "Amoxicillin 500mg",
        dosage: "1 capsule",
        frequency: "3 times daily",
        duration: "7 days",
        prescribedBy: "Dr. James Wilson",
        date: "Jan 15, 2026",
        status: "active",
        refillsLeft: 0,
        notes: "Take with food. Complete the full course even if feeling better.",
        condition: "Post-extraction infection prevention",
    },
    {
        id: 2,
        medication: "Ibuprofen 400mg",
        dosage: "1 tablet",
        frequency: "Every 6 hours as needed",
        duration: "5 days",
        prescribedBy: "Dr. Sarah Johnson",
        date: "Feb 10, 2026",
        status: "active",
        refillsLeft: 1,
        notes: "Take with food or milk. Do not exceed 4 tablets per day.",
        condition: "Post-treatment pain management",
    },
    {
        id: 3,
        medication: "Chlorhexidine Mouthwash 0.12%",
        dosage: "15 ml rinse",
        frequency: "Twice daily",
        duration: "14 days",
        prescribedBy: "Dr. Emily Chen",
        date: "Dec 20, 2025",
        status: "completed",
        refillsLeft: 0,
        notes: "Rinse for 30 seconds. Do not swallow.",
        condition: "Gum inflammation",
    },
    {
        id: 4,
        medication: "Fluoride Gel 1.1%",
        dosage: "Thin layer on teeth",
        frequency: "Once daily at bedtime",
        duration: "Ongoing",
        prescribedBy: "Dr. Robert Kim",
        date: "Nov 5, 2025",
        status: "active",
        refillsLeft: 2,
        notes: "Apply with toothbrush. Do not eat or drink for 30 minutes after.",
        condition: "Cavity prevention",
    },
    {
        id: 5,
        medication: "Metronidazole 250mg",
        dosage: "1 tablet",
        frequency: "Twice daily",
        duration: "5 days",
        prescribedBy: "Dr. James Wilson",
        date: "Sep 18, 2025",
        status: "completed",
        refillsLeft: 0,
        notes: "Avoid alcohol during treatment.",
        condition: "Periodontal infection",
    },
];

const STATUS_STYLES: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    completed: "bg-navy/10 text-navy/50",
    paused: "bg-gold/15 text-gold",
};

export default function PrescriptionsPage() {
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const filtered = prescriptions.filter(
        (p) => activeFilter === "all" || p.status === activeFilter
    );

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={navItems} title="DentalCare" subtitle="Patient Portal" />

            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Prescriptions</h1>
                    <p className="text-navy/50 mt-1">Your current and past medication prescriptions.</p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total", value: prescriptions.length, color: "text-navy" },
                        { label: "Active", value: prescriptions.filter((p) => p.status === "active").length, color: "text-green-600" },
                        { label: "Completed", value: prescriptions.filter((p) => p.status === "completed").length, color: "text-navy/50" },
                    ].map((card) => (
                        <div key={card.label} className="glass-card p-5 rounded-2xl text-center">
                            <p className={`font-fraunces text-3xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-navy/50 text-sm mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter + List */}
                <div className="glass-card rounded-2xl p-6">
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 bg-navy/5 rounded-xl p-1 mb-6 w-fit">
                        {(["all", "active", "completed"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeFilter === f ? "bg-navy text-white" : "text-navy/50 hover:text-navy"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Prescription cards */}
                    <div className="space-y-3">
                        {filtered.map((rx) => (
                            <div key={rx.id} className="border border-navy/8 rounded-xl overflow-hidden">
                                {/* Main row */}
                                <button
                                    onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-navy/5 transition-colors text-left"
                                >
                                    {/* Icon */}
                                    <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />
                                        </svg>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-navy font-semibold text-sm">{rx.medication}</p>
                                        <p className="text-navy/50 text-xs mt-0.5">{rx.dosage} — {rx.frequency}</p>
                                    </div>

                                    {/* Meta */}
                                    <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[rx.status]}`}>
                                            {rx.status}
                                        </span>
                                        <p className="text-navy/30 text-xs">{rx.date}</p>
                                    </div>

                                    {/* Chevron */}
                                    <svg
                                        className={`w-4 h-4 text-navy/30 flex-shrink-0 transition-transform ${expandedId === rx.id ? "rotate-180" : ""}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>

                                {/* Expanded details */}
                                {expandedId === rx.id && (
                                    <div className="px-4 pb-4 border-t border-navy/8 pt-4 bg-navy/[0.02]">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                                            {[
                                                { label: "Prescribed by", value: rx.prescribedBy },
                                                { label: "Duration", value: rx.duration },
                                                { label: "Condition", value: rx.condition },
                                                { label: "Refills left", value: String(rx.refillsLeft) },
                                            ].map((item) => (
                                                <div key={item.label}>
                                                    <p className="text-navy/40 text-xs mb-0.5">{item.label}</p>
                                                    <p className="text-navy font-medium">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {rx.notes && (
                                            <div className="bg-gold/8 rounded-xl p-3">
                                                <p className="text-navy/50 text-xs mb-1 font-medium">Doctor&apos;s Notes</p>
                                                <p className="text-navy/70 text-sm">{rx.notes}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-4">
                                            <button className="btn-gold text-xs px-4 py-2">
                                                Download PDF
                                            </button>
                                            {rx.refillsLeft > 0 && (
                                                <button className="text-xs px-4 py-2 rounded-xl bg-navy/5 text-navy hover:bg-navy/10 transition-colors">
                                                    Request Refill
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
