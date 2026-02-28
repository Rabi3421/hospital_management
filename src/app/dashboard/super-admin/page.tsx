"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { superAdminNavItems } from "./navItems";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["#C9A96E", "#4B9CD3", "#5BBF8E"];

interface SuperAdminStats {
    systemOverview: { totalUsers: number; totalAdmins: number; totalSuperAdmins: number; inactiveUsers: number; totalAccounts: number };
    systemHealth: { uptime: string; avgResponseTime: string; errorRate: string; activeConnections: number };
    monthlyGrowth: { month: string; users: number; appointments: number }[];
    revenueData: { month: string; revenue: number }[];
    auditLogs: { id: number; action: string; by: string; target: string; time: string }[];
    roleSplit: { name: string; value: number }[];
}

function HealthBadge({ label, value, good }: { label: string; value: string; good: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-navy/5">
            <span className="text-navy/60 text-sm">{label}</span>
            <span className={`font-semibold text-sm ${good ? "text-green-600" : "text-red-500"}`}>{value}</span>
        </div>
    );
}

export default function SuperAdminDashboard() {
    const { user, isLoading, accessToken } = useAuth();
    const [stats, setStats] = useState<SuperAdminStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/super-admin/stats", {
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
            <DashboardSidebar navItems={superAdminNavItems} title="DentalCare" subtitle="Super Admin" />

            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Super Admin Console</h1>
                            <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-semibold">SYSTEM</span>
                        </div>
                        <p className="text-navy/50">Welcome, {user?.name ?? "Super Admin"} — full system overview.</p>
                    </div>
                    <div className="text-sm text-navy/40">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                </div>

                {statsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="glass-card p-5 rounded-2xl animate-pulse h-24" />
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        {/* System overview cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                            {[
                                { label: "Total Accounts", value: stats.systemOverview.totalAccounts, color: "text-navy" },
                                { label: "Patients", value: stats.systemOverview.totalUsers, color: "text-blue-600" },
                                { label: "Admins", value: stats.systemOverview.totalAdmins, color: "text-gold" },
                                { label: "Super Admins", value: stats.systemOverview.totalSuperAdmins, color: "text-purple-600" },
                                { label: "Inactive", value: stats.systemOverview.inactiveUsers, color: "text-red-500" },
                            ].map((card) => (
                                <div key={card.label} className="glass-card p-4 rounded-2xl text-center">
                                    <p className={`font-fraunces text-3xl font-bold ${card.color}`}>{card.value}</p>
                                    <p className="text-navy/50 text-xs mt-1">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                            {/* Growth area chart */}
                            <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Monthly Growth</h2>
                                <ResponsiveContainer width="100%" height={230}>
                                    <AreaChart data={stats.monthlyGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradApts" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4B9CD3" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#4B9CD3" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A0D" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #C9A96E30", fontSize: 13 }} />
                                        <Area type="monotone" dataKey="users" stroke="#C9A96E" fill="url(#gradUsers)" strokeWidth={2} name="Users" />
                                        <Area type="monotone" dataKey="appointments" stroke="#4B9CD3" fill="url(#gradApts)" strokeWidth={2} name="Appointments" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Role breakdown pie */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Account Roles</h2>
                                <ResponsiveContainer width="100%" height={230}>
                                    <PieChart>
                                        <Pie data={stats.roleSplit} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                            {stats.roleSplit.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 13 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                            {/* Revenue chart */}
                            <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Revenue Trend</h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={stats.revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A0D" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: "12px", fontSize: 13 }} />
                                        <Line type="monotone" dataKey="revenue" stroke="#0B1F3A" strokeWidth={2.5} dot={{ r: 4, fill: "#0B1F3A" }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* System health */}
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">System Health</h2>
                                <div className="space-y-2">
                                    <HealthBadge label="Uptime" value={stats.systemHealth.uptime} good={true} />
                                    <HealthBadge label="Avg Response" value={stats.systemHealth.avgResponseTime} good={true} />
                                    <HealthBadge label="Error Rate" value={stats.systemHealth.errorRate} good={true} />
                                    <HealthBadge label="Active Connections" value={String(stats.systemHealth.activeConnections)} good={true} />
                                </div>
                            </div>
                        </div>

                        {/* Audit logs */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="font-fraunces text-lg font-semibold text-navy mb-5">Recent Audit Logs</h2>
                            <div className="space-y-3">
                                {stats.auditLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-navy/5 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-navy/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-navy text-sm font-medium truncate">{log.action}</p>
                                            <p className="text-navy/40 text-xs mt-0.5 truncate">
                                                By <span className="text-gold">{log.by}</span> → {log.target}
                                            </p>
                                        </div>
                                        <span className="text-navy/30 text-xs flex-shrink-0 ml-2">{log.time}</span>
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
