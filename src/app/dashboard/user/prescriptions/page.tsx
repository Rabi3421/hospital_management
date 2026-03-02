"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { userNavItems } from "../navItems";
import { useAuth } from "@/context/AuthContext";

interface PrescriptionItem {
    _id: string;
    title: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
    appointmentId: string;
    appointmentDate: string;
    service: string;
    doctorPreference: string;
}

type Filter = "all" | "image" | "pdf";

export default function PrescriptionsPage() {
    const { accessToken } = useAuth();
    const [items, setItems] = useState<PrescriptionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [preview, setPreview] = useState<PrescriptionItem | null>(null);

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
                    const flat: PrescriptionItem[] = [];
                    for (const appt of json.data.appointments) {
                        if (appt.prescriptions?.length) {
                            for (const rx of appt.prescriptions) {
                                flat.push({
                                    _id: rx._id ?? `${appt._id}-${rx.title}`,
                                    title: rx.title,
                                    fileUrl: rx.fileUrl,
                                    fileType: rx.fileType ?? "application/pdf",
                                    uploadedAt: rx.uploadedAt,
                                    appointmentId: appt._id,
                                    appointmentDate: appt.preferredDate,
                                    service: appt.service,
                                    doctorPreference: appt.doctorPreference ?? "Your Doctor",
                                });
                            }
                        }
                    }
                    flat.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
                    setItems(flat);
                }
            } finally { setLoading(false); }
        };
        load();
    }, [headers]);

    const filtered = items.filter((item) => {
        if (filter === "image") return item.fileType.startsWith("image/");
        if (filter === "pdf") return item.fileType === "application/pdf";
        return true;
    });

    const imgCount = items.filter((i) => i.fileType.startsWith("image/")).length;
    const pdfCount = items.filter((i) => i.fileType === "application/pdf").length;

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={userNavItems} title="DentalCare" subtitle="Patient Portal" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                <div className="mb-5 sm:mb-8">
                    <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Prescriptions</h1>
                    <p className="text-navy/50 text-sm mt-1">All prescriptions issued during your visits.</p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                    {[
                        { label: "Total", count: items.length, color: "bg-navy/8 text-navy" },
                        { label: "Images", count: imgCount, color: "bg-gold/10 text-gold" },
                        { label: "PDFs", count: pdfCount, color: "bg-blue-50 text-blue-600" },
                    ].map(({ label, count, color }) => (
                        <div key={label} className="glass-card rounded-2xl p-3 sm:p-4 text-center">
                            <div className={`text-xl sm:text-2xl font-fraunces font-bold ${color.split(" ")[1]}`}>{count}</div>
                            <div className="text-navy/50 text-xs mt-1">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-4 sm:mb-5 flex-wrap">
                    {(["all", "image", "pdf"] as Filter[]).map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === f ? "bg-navy text-white" : "bg-navy/8 text-navy/60 hover:text-navy"}`}>
                            {f === "all" ? "All" : f === "image" ? "Images" : "PDFs"}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                                <div className="h-32 bg-navy/8 rounded-xl mb-3" />
                                <div className="h-4 bg-navy/8 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-navy/8 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                        <div className="text-5xl mb-4">💊</div>
                        <h3 className="font-fraunces text-lg font-semibold text-navy mb-2">No Prescriptions Yet</h3>
                        <p className="text-navy/50 text-sm">Prescriptions from completed visits will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((item) => {
                            const isImage = item.fileType.startsWith("image/");
                            const date = item.uploadedAt
                                ? new Date(item.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                : item.appointmentDate;
                            return (
                                <div key={item._id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow">
                                    {/* Thumbnail */}
                                    <div className="h-36 bg-navy/5 flex items-center justify-center relative">
                                        {isImage ? (
                                            <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-12 h-12 text-navy/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-xs text-navy/40 uppercase font-medium">PDF Document</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button onClick={() => setPreview(item)} className="bg-white text-navy text-xs font-medium px-3 py-1.5 rounded-lg shadow">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-medium text-navy text-sm truncate">{item.title}</h4>
                                        <p className="text-navy/40 text-xs mt-0.5 truncate">{item.service}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-navy/40 text-xs">{date}</span>
                                            <a href={item.fileUrl} download target="_blank" rel="noopener noreferrer"
                                                className="text-gold text-xs font-medium hover:underline flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Preview modal */}
                {preview && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-5 border-b border-navy/10">
                                <div>
                                    <h3 className="font-fraunces font-semibold text-navy">{preview.title}</h3>
                                    <p className="text-navy/40 text-xs mt-0.5">{preview.service} · {preview.doctorPreference}</p>
                                </div>
                                <button onClick={() => setPreview(null)} className="p-2 hover:bg-navy/5 rounded-xl text-navy/40">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-5">
                                {preview.fileType.startsWith("image/") ? (
                                    <img src={preview.fileUrl} alt={preview.title} className="w-full rounded-xl" />
                                ) : (
                                    <iframe src={preview.fileUrl} className="w-full h-96 rounded-xl border border-navy/10" title={preview.title} />
                                )}
                                <div className="mt-4 flex justify-end">
                                    <a href={preview.fileUrl} download target="_blank" rel="noopener noreferrer"
                                        className="btn-primary text-sm px-5 py-2">Download File</a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
