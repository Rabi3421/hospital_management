"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const navItems = [
    {
        label: "Overview", href: "/dashboard/user",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    },
    {
        label: "My Appointments", href: "/dashboard/user/appointments",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    },
    {
        label: "Medical Records", href: "/dashboard/user/records",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    },
    {
        label: "Prescriptions", href: "/dashboard/user/prescriptions",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>,
    },
    {
        label: "Profile", href: "/dashboard/user/profile",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    },
];

interface UserStats {
    upcomingAppointments: number;
    completedAppointments: number;
    prescriptions: number;
    medicalRecords: number;
    nextAppointment: { date: string; time: string; doctor: string; type: string };
    recentActivity: { id: number; type: string; message: string; date: string }[];
    monthlyVisits: { month: string; visits: number }[];
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
    return (
        <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-navy/50 text-sm mb-1">{label}</p>
                    <p className="font-fraunces text-3xl font-bold text-navy">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function UserDashboard() {
    const { user, isLoading, accessToken } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/user/stats", {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
                    credentials: "include",
                });
                if (res.ok) {
                    const json = await res.json();
                    setStats(json.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, [isLoading, accessToken]);

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={navItems} title="DentalCare" subtitle="Patient Portal" />

            {/* Main content */}
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">
                        Welcome back, {user?.name?.split(" ")[0] ?? "Patient"} 👋
                    </h1>
                    <p className="text-navy/50 mt-1">Here&apos;s your health overview for today.</p>
                </div>

                {statsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass-card p-5 rounded-2xl animate-pulse">
                                <div className="h-4 bg-navy/10 rounded mb-3 w-24" />
                                <div className="h-8 bg-navy/10 rounded w-16" />
                            </div>
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                            <StatCard
                                label="Upcoming Appointments"
                                value={stats.upcomingAppointments}
                                color="bg-blue-50"
                                icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
                            />
                            <StatCard
                                label="Completed Visits"
                                value={stats.completedAppointments}
                                color="bg-green-50"
                                icon={<svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                            <StatCard
                                label="Prescriptions"
                                value={stats.prescriptions}
                                color="bg-gold/10"
                                icon={<svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
                            />
                            <StatCard
                                label="Medical Records"
                                value={stats.medicalRecords}
                                color="bg-purple-50"
                                icon={<svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                            />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Monthly visits chart */}
                            <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Monthly Visits</h2>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={stats.monthlyVisits} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A0D" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #C9A96E30", fontSize: 13 }} />
                                        <Line type="monotone" dataKey="visits" stroke="#C9A96E" strokeWidth={2.5} dot={{ r: 4, fill: "#C9A96E" }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Next appointment */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Next Appointment</h2>
                                <div className="bg-navy rounded-xl p-5 text-center mb-4">
                                    <p className="text-white/60 text-sm mb-1">Scheduled for</p>
                                    <p className="font-fraunces text-gold text-xl font-bold">
                                        {new Date(stats.nextAppointment.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                                    </p>
                                    <p className="text-white/80 text-sm mt-1">{stats.nextAppointment.time}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-navy/50">Doctor</span>
                                        <span className="text-navy font-medium">{stats.nextAppointment.doctor}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-navy/50">Type</span>
                                        <span className="text-navy font-medium">{stats.nextAppointment.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent activity */}
                        <div className="mt-6 glass-card rounded-2xl p-6">
                            <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Recent Activity</h2>
                            <div className="space-y-3">
                                {stats.recentActivity.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-navy/5 transition-colors">
                                        <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-navy text-sm">{item.message}</p>
                                            <p className="text-navy/40 text-xs mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
            </main>
        </div>
    );
}
