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

type RecordCategory = "all" | "lab" | "xray" | "report" | "note";

const records = [
    {
        id: 1,
        title: "Full Mouth X-Ray",
        category: "xray",
        date: "Jan 28, 2026",
        doctor: "Dr. Sarah Johnson",
        size: "2.4 MB",
        format: "DICOM",
        color: "bg-blue-50 text-blue-600",
        icon: "🦷",
    },
    {
        id: 2,
        title: "Blood Test Results",
        category: "lab",
        date: "Jan 15, 2026",
        doctor: "Dr. James Wilson",
        size: "156 KB",
        format: "PDF",
        color: "bg-green-50 text-green-600",
        icon: "🧪",
    },
    {
        id: 3,
        title: "Treatment Summary — Braces",
        category: "report",
        date: "Dec 20, 2025",
        doctor: "Dr. Emily Chen",
        size: "340 KB",
        format: "PDF",
        color: "bg-gold/10 text-gold",
        icon: "📋",
    },
    {
        id: 4,
        title: "Cavity Diagnosis Note",
        category: "note",
        date: "Nov 10, 2025",
        doctor: "Dr. Sarah Johnson",
        size: "48 KB",
        format: "PDF",
        color: "bg-purple-50 text-purple-600",
        icon: "📝",
    },
    {
        id: 5,
        title: "Periapical X-Ray — Upper Left",
        category: "xray",
        date: "Oct 5, 2025",
        doctor: "Dr. Robert Kim",
        size: "1.1 MB",
        format: "DICOM",
        color: "bg-blue-50 text-blue-600",
        icon: "🦷",
    },
    {
        id: 6,
        title: "Post-Op Report — Extraction",
        category: "report",
        date: "Sep 18, 2025",
        doctor: "Dr. James Wilson",
        size: "220 KB",
        format: "PDF",
        color: "bg-gold/10 text-gold",
        icon: "📋",
    },
];

const CATEGORY_LABELS: Record<RecordCategory, string> = {
    all: "All Records",
    lab: "Lab Results",
    xray: "X-Rays",
    report: "Reports",
    note: "Doctor Notes",
};

export default function MedicalRecordsPage() {
    const [activeCategory, setActiveCategory] = useState<RecordCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filtered = records.filter((r) => {
        const matchesCategory = activeCategory === "all" || r.category === activeCategory;
        const matchesSearch =
            searchQuery === "" ||
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.doctor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={navItems} title="DentalCare" subtitle="Patient Portal" />

            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Medical Records</h1>
                    <p className="text-navy/50 mt-1">View and download your dental health records.</p>
                </div>

                {/* Summary strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {(["all", "xray", "lab", "report"] as RecordCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`glass-card p-4 rounded-2xl text-center transition-all ${activeCategory === cat ? "ring-2 ring-gold" : ""
                                }`}
                        >
                            <p className="font-fraunces text-3xl font-bold text-navy">
                                {cat === "all" ? records.length : records.filter((r) => r.category === cat).length}
                            </p>
                            <p className="text-navy/50 text-xs mt-1">{CATEGORY_LABELS[cat]}</p>
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input pl-10 py-2.5 text-sm"
                            />
                        </div>
                        {/* Category pills */}
                        <div className="flex items-center gap-1 bg-navy/5 rounded-xl p-1 flex-wrap">
                            {(Object.keys(CATEGORY_LABELS) as RecordCategory[]).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeCategory === cat ? "bg-navy text-white" : "text-navy/50 hover:text-navy"
                                        }`}
                                >
                                    {CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                        {/* View toggle */}
                        <div className="flex items-center gap-1 bg-navy/5 rounded-xl p-1">
                            {(["grid", "list"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`p-2 rounded-lg transition-all ${viewMode === mode ? "bg-navy text-white" : "text-navy/40 hover:text-navy"}`}
                                >
                                    {mode === "grid" ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-navy/30">
                            <p className="font-medium">No records found</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map((record) => (
                                <div key={record.id} className="border border-navy/8 rounded-xl p-5 hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-11 h-11 rounded-xl ${record.color} flex items-center justify-center text-xl`}>
                                            {record.icon}
                                        </div>
                                        <span className="text-xs text-navy/30 bg-navy/5 px-2 py-1 rounded-lg">{record.format}</span>
                                    </div>
                                    <h3 className="font-semibold text-navy text-sm mb-1 group-hover:text-gold transition-colors">{record.title}</h3>
                                    <p className="text-navy/40 text-xs mb-3">{record.doctor} • {record.date}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-navy/30 text-xs">{record.size}</span>
                                        <button className="text-xs text-gold font-medium flex items-center gap-1 hover:underline">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((record) => (
                                <div key={record.id} className="flex items-center gap-4 p-4 rounded-xl border border-navy/8 hover:bg-navy/5 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl ${record.color} flex items-center justify-center text-lg flex-shrink-0`}>
                                        {record.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-navy font-medium text-sm truncate">{record.title}</p>
                                        <p className="text-navy/40 text-xs">{record.doctor} • {record.date}</p>
                                    </div>
                                    <span className="text-navy/30 text-xs hidden sm:block">{record.size}</span>
                                    <span className="text-xs text-navy/30 bg-navy/5 px-2 py-1 rounded-lg hidden sm:block">{record.format}</span>
                                    <button className="text-xs text-gold font-medium flex items-center gap-1 flex-shrink-0 hover:underline">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
