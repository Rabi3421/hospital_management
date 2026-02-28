"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const PIE_COLORS = ["#C9A96E", "#4B9CD3", "#5BBF8E", "#EF4444", "#A78BFA"];
const RANGE_OPTIONS = [
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
];

interface ReportsData {
    summary: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        newPatients: number;
        totalPatients: number;
    };
    daily: { date: string; count: number }[];
    services: { name: string; count: number }[];
    statusDist: { name: string; value: number; color: string }[];
}

export default function AdminReportsPage() {
    const { accessToken } = useAuth();
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("30");

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reports?range=${range}`, { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) setData(json.data);
        } finally { setLoading(false); }
    }, [headers, range]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const completionRate = data ? Math.round((data.summary.completed / Math.max(data.summary.total, 1)) * 100) : 0;
    const cancellationRate = data ? Math.round((data.summary.cancelled / Math.max(data.summary.total, 1)) * 100) : 0;

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Reports &amp; Analytics</h1>
                        <p className="text-navy/50 text-sm mt-1">Appointment trends and clinic performance.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {RANGE_OPTIONS.map((o) => (
                            <button key={o.value} onClick={() => setRange(o.value)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${range === o.value ? "bg-navy text-white" : "bg-navy/5 text-navy/60 hover:bg-navy/10"}`}>
                                {o.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6 animate-pulse">
                        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass-card rounded-2xl p-4 sm:p-5 h-20 sm:h-24" />)}
                    </div>
                ) : data ? (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
                            {[
                                { label: "Total Appointments", value: data.summary.total, color: "text-navy" },
                                { label: "Completed", value: data.summary.completed, color: "text-green-600" },
                                { label: "Pending", value: data.summary.pending, color: "text-amber-600" },
                                { label: "Cancelled", value: data.summary.cancelled, color: "text-red-500" },
                                { label: "Confirmed", value: data.summary.confirmed, color: "text-blue-600" },
                                { label: "New Patients", value: data.summary.newPatients, color: "text-purple-600" },
                                { label: "Completion Rate", value: `${completionRate}%`, color: "text-green-600" },
                                { label: "Cancellation Rate", value: `${cancellationRate}%`, color: "text-red-500" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="glass-card rounded-2xl p-3 sm:p-5">
                                    <p className={`font-fraunces text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
                                    <p className="text-navy/50 text-xs mt-1">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                            {/* Daily trend */}
                            <div className="glass-card rounded-2xl p-5 lg:col-span-2">
                                <h3 className="font-fraunces font-semibold text-navy mb-4">Daily Appointments</h3>
                                {data.daily.length === 0 ? (
                                    <div className="h-48 flex items-center justify-center text-navy/30 text-sm">No data for this period</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={data.daily}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A10" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#0B1F3A60" }} tickFormatter={(v) => v.slice(5)} />
                                            <YAxis tick={{ fontSize: 10, fill: "#0B1F3A60" }} allowDecimals={false} />
                                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #0B1F3A10" }} />
                                            <Line type="monotone" dataKey="count" stroke="#C9A96E" strokeWidth={2} dot={false} name="Appointments" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Status distribution */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="font-fraunces font-semibold text-navy mb-4">Status Distribution</h3>
                                {data.statusDist.every((s) => s.value === 0) ? (
                                    <div className="h-48 flex items-center justify-center text-navy/30 text-sm">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={data.statusDist.filter((s) => s.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                                {data.statusDist.filter((s) => s.value > 0).map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Services bar chart */}
                        <div className="glass-card rounded-2xl p-5">
                            <h3 className="font-fraunces font-semibold text-navy mb-4">Appointments by Service</h3>
                            {data.services.length === 0 ? (
                                <div className="h-48 flex items-center justify-center text-navy/30 text-sm">No data for this period</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.services} margin={{ bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A10" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#0B1F3A60" }} angle={-20} textAnchor="end" interval={0} />
                                        <YAxis tick={{ fontSize: 10, fill: "#0B1F3A60" }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                        <Bar dataKey="count" fill="#C9A96E" radius={[6, 6, 0, 0]} name="Appointments" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="glass-card rounded-2xl p-12 text-center text-navy/40">Failed to load report data.</div>
                )}
            </main>
        </div>
    );
}
