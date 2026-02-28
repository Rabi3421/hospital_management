"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
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

type FilterTab = "all" | "upcoming" | "completed" | "cancelled";

const STATUS_STYLES: Record<string, string> = {
    upcoming: "bg-blue-50 text-blue-600",
    confirmed: "bg-blue-50 text-blue-600",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-50 text-red-500",
    pending: "bg-gold/15 text-gold",
};

interface Appointment {
    _id: string;
    firstName: string;
    lastName: string;
    service: string;
    doctorPreference: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
    queueNumber?: number;
    createdAt: string;
}

function getInitials(doctorPreference: string): string {
    const name = doctorPreference.replace(/Dr\.\s*/i, "").split(" —")[0].trim();
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "DC";
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AppointmentsPage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/appointments", {
                credentials: "include",
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });
            if (res.ok) {
                const json = await res.json();
                setAppointments(json.data?.appointments ?? []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (!authLoading) fetchAppointments();
    }, [authLoading, fetchAppointments]);

    async function handleCancel(id: string) {
        if (!confirm("Cancel this appointment?")) return;
        setCancellingId(id);
        try {
            const res = await fetch(`/api/appointments/${id}/cancel`, {
                method: "PATCH",
                credentials: "include",
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });
            if (res.ok) {
                setAppointments((prev) =>
                    prev.map((a) => a._id === id ? { ...a, status: "cancelled" } : a)
                );
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCancellingId(null);
        }
    }

    // Map status to filterable tab key
    function tabKey(status: string): FilterTab {
        if (status === "pending" || status === "confirmed") return "upcoming";
        if (status === "completed") return "completed";
        if (status === "cancelled") return "cancelled";
        return "upcoming";
    }

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: "all", label: "All", count: appointments.length },
        { key: "upcoming", label: "Upcoming", count: appointments.filter((a) => tabKey(a.status) === "upcoming").length },
        { key: "completed", label: "Completed", count: appointments.filter((a) => a.status === "completed").length },
        { key: "cancelled", label: "Cancelled", count: appointments.filter((a) => a.status === "cancelled").length },
    ];

    const filtered = appointments.filter((a) => {
        const matchesTab = activeTab === "all" || tabKey(a.status) === activeTab;
        const matchesSearch =
            searchQuery === "" ||
            a.doctorPreference.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.service.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={navItems} title="DentalCare" subtitle="Patient Portal" />

            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">My Appointments</h1>
                        <p className="text-navy/50 mt-1">Manage and track all your dental appointments.</p>
                    </div>
                    <a
                        href="/appointments"
                        className="btn-gold inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Book Appointment
                    </a>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total", value: fetching ? "—" : appointments.length, color: "text-navy" },
                        { label: "Upcoming", value: fetching ? "—" : appointments.filter((a) => tabKey(a.status) === "upcoming").length, color: "text-blue-600" },
                        { label: "Completed", value: fetching ? "—" : appointments.filter((a) => a.status === "completed").length, color: "text-green-700" },
                        { label: "Cancelled", value: fetching ? "—" : appointments.filter((a) => a.status === "cancelled").length, color: "text-red-500" },
                    ].map((card) => (
                        <div key={card.label} className="glass-card p-4 rounded-2xl text-center">
                            <p className={`font-fraunces text-3xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-navy/50 text-sm mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Search + Tabs */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by doctor or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input pl-10 py-2.5 text-sm"
                            />
                        </div>
                        {/* Tabs */}
                        <div className="flex items-center gap-1 bg-navy/5 rounded-xl p-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                                            ? "bg-navy text-white shadow-sm"
                                            : "text-navy/50 hover:text-navy"
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-navy/10"}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Appointment cards */}
                    {fetching ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="animate-pulse flex gap-4 p-4 rounded-xl border border-navy/8">
                                    <div className="w-11 h-11 rounded-full bg-navy/10 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-navy/10 rounded w-1/3" />
                                        <div className="h-3 bg-navy/10 rounded w-1/2" />
                                    </div>
                                    <div className="h-3 bg-navy/10 rounded w-20 self-center" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-navy/30">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <p className="font-medium">No appointments found</p>
                            <a href="/appointments" className="mt-4 inline-block text-sm text-gold hover:underline">Book your first appointment →</a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((apt) => (
                                <div
                                    key={apt._id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-navy/8 hover:bg-navy/5 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-semibold">{getInitials(apt.doctorPreference)}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-navy font-semibold text-sm">
                                                {apt.doctorPreference === "No Preference" ? "Any Available Doctor" : apt.doctorPreference.split(" —")[0]}
                                            </p>
                                            {apt.queueNumber && (
                                                <span className="inline-flex items-center gap-1 bg-gold/15 text-gold text-xs font-bold px-2 py-0.5 rounded-full border border-gold/30">
                                                    #{apt.queueNumber}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-navy/50 text-xs">{apt.service}</p>
                                    </div>

                                    {/* Date/Time */}
                                    <div className="text-sm text-navy/60 flex-shrink-0">
                                        <p className="font-medium text-navy">{formatDate(apt.preferredDate)}</p>
                                        <p className="text-xs">{apt.preferredTime}</p>
                                    </div>

                                    {/* Status badge */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex-shrink-0 ${STATUS_STYLES[apt.status] ?? "bg-navy/10 text-navy"}`}>
                                        {apt.status === "pending" ? "Pending Confirmation" : apt.status}
                                    </span>

                                    {/* Cancel action */}
                                    {(apt.status === "pending" || apt.status === "confirmed") && (
                                        <button
                                            onClick={() => handleCancel(apt._id)}
                                            disabled={cancellingId === apt._id}
                                            className="text-xs text-navy/40 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40"
                                        >
                                            {cancellingId === apt._id ? "Cancelling…" : "Cancel"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
