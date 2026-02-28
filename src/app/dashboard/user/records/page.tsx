"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { userNavItems } from "../navItems";
import { useAuth } from "@/context/AuthContext";

interface RecordItem {
    id: string;
    title: string;
    type: "visit" | "prescription";
    date: string;
    doctor: string;
    service: string;
    diagnosis?: string;
    treatment?: string;
    fileUrl?: string;
    fileType?: string;
}

type ViewMode = "grid" | "list";
type Filter = "all" | "visit" | "prescription";

export default function RecordsPage() {
    const { accessToken } = useAuth();
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>("list");
    const [filter, setFilter] = useState<Filter>("all");
    const [expanded, setExpanded] = useState<string | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/appointments", { headers: headers(), credentials: "include" });
                const json = await res.json();
                if (json.success) {
                    const recs: RecordItem[] = [];
                    for (const appt of json.data.appointments) {
                        // Every completed appointment → Visit Summary record
                        if (appt.status === "completed" || appt.completionDetails?.diagnosis) {
                            recs.push({
                                id: `visit-${appt._id}`,
                                title: `Visit Summary — ${appt.service}`,
                                type: "visit",
                                date: appt.preferredDate,
                                doctor: appt.doctorPreference ?? "Your Doctor",
                                service: appt.service,
                                diagnosis: appt.completionDetails?.diagnosis,
                                treatment: appt.completionDetails?.treatment,
                            });
                        }
                        // Each prescription file → document record
                        if (appt.prescriptions?.length) {
                            for (const rx of appt.prescriptions) {
                                recs.push({
                                    id: `rx-${rx._id ?? appt._id + rx.title}`,
                                    title: rx.title,
                                    type: "prescription",
                                    date: rx.uploadedAt ?? appt.preferredDate,
                                    doctor: appt.doctorPreference ?? "Your Doctor",
                                    service: appt.service,
                                    fileUrl: rx.fileUrl,
                                    fileType: rx.fileType,
                                });
                            }
                        }
                    }
                    recs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setRecords(recs);
                }
            } finally { setLoading(false); }
        };
        load();
    }, [headers]);

    const filtered = records.filter((r) => filter === "all" || r.type === filter);
    const visitCount = records.filter((r) => r.type === "visit").length;
    const rxCount = records.filter((r) => r.type === "prescription").length;

    const fmtDate = (d: string) => {
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={userNavItems} title="DentalCare" subtitle="Patient Portal" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Medical Records</h1>
                        <p className="text-navy/50 text-sm mt-1">Your visit summaries and prescription documents.</p>
                    </div>
                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-navy/5 rounded-xl p-1 self-start sm:self-auto">
                        {(["list", "grid"] as ViewMode[]).map((v) => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${view === v ? "bg-white text-navy shadow-sm" : "text-navy/50 hover:text-navy"}`}>
                                {v === "list" ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                    {[
                        { label: "Total Records", count: records.length, color: "text-navy" },
                        { label: "Visit Summaries", count: visitCount, color: "text-gold" },
                        { label: "Prescriptions", count: rxCount, color: "text-blue-600" },
                    ].map(({ label, count, color }) => (
                        <div key={label} className="glass-card rounded-2xl p-3 sm:p-4 text-center">
                            <div className={`text-xl sm:text-2xl font-fraunces font-bold ${color}`}>{count}</div>
                            <div className="text-navy/50 text-xs mt-1">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-4 sm:mb-5 flex-wrap">
                    {([
                        { key: "all", label: "All" },
                        { key: "visit", label: "Visit Summaries" },
                        { key: "prescription", label: "Prescriptions" },
                    ] as { key: Filter; label: string }[]).map(({ key, label }) => (
                        <button key={key} onClick={() => setFilter(key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === key ? "bg-navy text-white" : "bg-navy/8 text-navy/60 hover:text-navy"}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse flex gap-4">
                                <div className="w-12 h-12 bg-navy/8 rounded-xl flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-navy/8 rounded w-2/3" />
                                    <div className="h-3 bg-navy/8 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="font-fraunces text-lg font-semibold text-navy mb-2">No Records Found</h3>
                        <p className="text-navy/50 text-sm">Your medical records will appear here after completed visits.</p>
                    </div>
                ) : view === "list" ? (
                    <div className="space-y-3">
                        {filtered.map((rec) => {
                            const isVisit = rec.type === "visit";
                            const isOpen = expanded === rec.id;
                            return (
                                <div key={rec.id} className="glass-card rounded-2xl overflow-hidden">
                                    <button className="w-full flex items-center gap-4 p-5 text-left hover:bg-navy/3 transition-colors"
                                        onClick={() => setExpanded(isOpen ? null : rec.id)}>
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isVisit ? "bg-gold/15" : "bg-blue-50"}`}>
                                            {isVisit ? (
                                                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-navy text-sm truncate">{rec.title}</h4>
                                            <p className="text-navy/40 text-xs mt-0.5">{rec.doctor} · {fmtDate(rec.date)}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${isVisit ? "bg-gold/10 text-gold" : "bg-blue-50 text-blue-600"}`}>
                                            {isVisit ? "Visit" : "Prescription"}
                                        </span>
                                        <svg className={`w-4 h-4 text-navy/30 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 border-t border-navy/5 pt-4">
                                            {isVisit ? (
                                                <div className="space-y-3">
                                                    {rec.diagnosis && (
                                                        <div>
                                                            <span className="text-xs font-medium text-navy/40 uppercase tracking-wide">Diagnosis</span>
                                                            <p className="text-navy text-sm mt-1">{rec.diagnosis}</p>
                                                        </div>
                                                    )}
                                                    {rec.treatment && (
                                                        <div>
                                                            <span className="text-xs font-medium text-navy/40 uppercase tracking-wide">Treatment</span>
                                                            <p className="text-navy text-sm mt-1">{rec.treatment}</p>
                                                        </div>
                                                    )}
                                                    {!rec.diagnosis && !rec.treatment && (
                                                        <p className="text-navy/40 text-sm">No additional details recorded.</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-navy/60 text-sm">{rec.fileType?.startsWith("image/") ? "Image file" : "PDF document"}</span>
                                                    {rec.fileUrl && (
                                                        <a href={rec.fileUrl} download target="_blank" rel="noopener noreferrer"
                                                            className="text-gold text-sm font-medium hover:underline flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((rec) => {
                            const isVisit = rec.type === "visit";
                            return (
                                <div key={rec.id} className="glass-card rounded-2xl p-5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isVisit ? "bg-gold/15" : "bg-blue-50"}`}>
                                        {isVisit ? (
                                            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-navy text-sm leading-snug line-clamp-2">{rec.title}</h4>
                                    <p className="text-navy/40 text-xs mt-1">{fmtDate(rec.date)}</p>
                                    <p className="text-navy/40 text-xs truncate">{rec.doctor}</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isVisit ? "bg-gold/10 text-gold" : "bg-blue-50 text-blue-600"}`}>
                                            {isVisit ? "Visit" : "Prescription"}
                                        </span>
                                        {!isVisit && rec.fileUrl && (
                                            <a href={rec.fileUrl} download target="_blank" rel="noopener noreferrer"
                                                className="text-gold text-xs font-medium hover:underline">Download</a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
