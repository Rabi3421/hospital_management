"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { adminNavItems } from "./navItems";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";

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
        <div className="glass-card p-3 sm:p-5 rounded-2xl">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-navy/5 flex items-center justify-center">{icon}</div>
            </div>
            <p className="font-fraunces text-2xl sm:text-3xl font-bold text-navy">{value}</p>
            <p className="text-navy/50 text-xs sm:text-sm mt-1">{label}</p>
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
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
                            Admin Dashboard
                        </h1>
                        <p className="text-navy/50 text-sm mt-1">Hello, {user?.name ?? "Admin"} — here&apos;s today&apos;s overview.</p>
                    </div>
                    <div className="text-xs sm:text-sm text-navy/40">
                        {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    </div>
                </div>

                {statsLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card p-4 rounded-2xl animate-pulse h-24 sm:h-28" />
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
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

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                            {/* Weekly appointments bar chart */}
                            <div className="xl:col-span-2 glass-card rounded-2xl p-4 sm:p-6">
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
                            <div className="glass-card rounded-2xl p-4 sm:p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-4">Department Load</h2>
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
                        <div className="glass-card rounded-2xl p-4 sm:p-6">
                            <h2 className="font-fraunces text-lg font-semibold text-navy mb-4 sm:mb-5">Today&apos;s Appointments</h2>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <table className="w-full text-sm min-w-[480px] sm:min-w-0">
                                    <thead>
                                        <tr className="text-navy/40 text-left border-b border-navy/10">
                                            <th className="pb-3 font-medium px-4 sm:px-0 sm:pr-6">Patient</th>
                                            <th className="pb-3 font-medium pr-6 hidden sm:table-cell">Doctor</th>
                                            <th className="pb-3 font-medium pr-6">Time</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentAppointments.map((apt) => (
                                            <tr key={apt.id} className="border-b border-navy/5 hover:bg-navy/5 transition-colors">
                                                <td className="py-3 px-4 sm:px-0 sm:pr-6 text-navy font-medium">{apt.patient}</td>
                                                <td className="py-3 pr-6 text-navy/70 hidden sm:table-cell">{apt.doctor}</td>
                                                <td className="py-3 pr-6 text-navy/60">{apt.time}</td>
                                                <td className="py-3 pr-4 sm:pr-0">
                                                    <span className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[apt.status] ?? "bg-navy/10 text-navy"}`}>
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
