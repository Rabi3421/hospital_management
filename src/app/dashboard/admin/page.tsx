"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";

const navItems = [
    {
        label: "Overview", href: "/dashboard/admin",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    },
    {
        label: "User Management", href: "/dashboard/admin/users",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
        label: "Appointments", href: "/dashboard/admin/appointments",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    },
    {
        label: "Departments", href: "/dashboard/admin/departments",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
    },
    {
        label: "Reports", href: "/dashboard/admin/reports",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v10.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V9.75zM8.25 14.25c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v5.625c0 .621-.504 1.125-1.125 1.125H9.375a1.125 1.125 0 01-1.125-1.125v-5.625z" /></svg>,
    },
    {
        label: "Settings", href: "/dashboard/admin/settings",
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
];

const PIE_COLORS = ["#C9A96E", "#0B1F3A", "#4B9CD3", "#5BBF8E", "#F4A261"];

interface AdminStats {
    totalUsers: number;
    totalAdmins: number;
    totalAppointmentsToday: number;
    pendingAppointments: number;
    totalDoctors: number;
    activeDepartments: number;
    appointmentsTrend: { day: string; appointments: number }[];
    departmentLoad: { name: string; value: number }[];
    recentAppointments: { id: number; patient: string; doctor: string; time: string; status: string }[];
}

function StatCard({ label, value, icon, sub }: { label: string; value: number | string; icon: React.ReactNode; sub?: string }) {
    return (
        <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center">{icon}</div>
            </div>
            <p className="font-fraunces text-3xl font-bold text-navy">{value}</p>
            <p className="text-navy/50 text-sm mt-1">{label}</p>
            {sub && <p className="text-xs text-navy/30 mt-0.5">{sub}</p>}
        </div>
    );
}

const STATUS_STYLES: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    "in-progress": "bg-blue-100 text-blue-700",
    pending: "bg-gold/15 text-gold",
};

export default function AdminDashboard() {
    const { user, isLoading, accessToken } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/admin/stats", {
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
            <DashboardSidebar navItems={navItems} title="DentalCare" subtitle="Admin Panel" />

            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">
                            Admin Dashboard
                        </h1>
                        <p className="text-navy/50 mt-1">Hello, {user?.name ?? "Admin"} — here&apos;s today&apos;s overview.</p>
                    </div>
                    <div className="text-sm text-navy/40">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                </div>

                {statsLoading ? (
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card p-5 rounded-2xl animate-pulse h-28" />
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                            <StatCard label="Total Patients" value={stats.totalUsers}
                                icon={<svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
                            />
                            <StatCard label="Today's Appointments" value={stats.totalAppointmentsToday}
                                icon={<svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
                            />
                            <StatCard label="Pending" value={stats.pendingAppointments} sub="Needs attention"
                                icon={<svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                            <StatCard label="Doctors" value={stats.totalDoctors}
                                icon={<svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>}
                            />
                            <StatCard label="Admin Staff" value={stats.totalAdmins}
                                icon={<svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
                            />
                            <StatCard label="Departments" value={stats.activeDepartments}
                                icon={<svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>}
                            />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                            {/* Weekly appointments bar chart */}
                            <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Weekly Appointments</h2>
                                <ResponsiveContainer width="100%" height={230}>
                                    <BarChart data={stats.appointmentsTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A0D" />
                                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #C9A96E30", fontSize: 13 }} />
                                        <Bar dataKey="appointments" fill="#C9A96E" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Department load pie */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Department Load</h2>
                                <ResponsiveContainer width="100%" height={230}>
                                    <PieChart>
                                        <Pie data={stats.departmentLoad} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {stats.departmentLoad.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 13 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent appointments table */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Today&apos;s Appointments</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-navy/40 text-left border-b border-navy/10">
                                            <th className="pb-3 font-medium pr-6">Patient</th>
                                            <th className="pb-3 font-medium pr-6">Doctor</th>
                                            <th className="pb-3 font-medium pr-6">Time</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentAppointments.map((apt) => (
                                            <tr key={apt.id} className="border-b border-navy/5 hover:bg-navy/5 transition-colors">
                                                <td className="py-3 pr-6 text-navy font-medium">{apt.patient}</td>
                                                <td className="py-3 pr-6 text-navy/70">{apt.doctor}</td>
                                                <td className="py-3 pr-6 text-navy/60">{apt.time}</td>
                                                <td className="py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[apt.status] ?? "bg-navy/10 text-navy"}`}>
                                                        {apt.status.replace("-", " ")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : null}
            </main>
        </div>
    );
}
