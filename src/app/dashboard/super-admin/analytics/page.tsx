"use client";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { superAdminNavItems } from "../navItems";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const monthlyData = [
    { month: "Aug", patients: 68, appointments: 91, revenue: 14200 },
    { month: "Sep", patients: 75, appointments: 108, revenue: 16800 },
    { month: "Oct", patients: 82, appointments: 117, revenue: 18400 },
    { month: "Nov", patients: 71, appointments: 99, revenue: 15600 },
    { month: "Dec", patients: 64, appointments: 88, revenue: 13900 },
    { month: "Jan", patients: 90, appointments: 131, revenue: 20500 },
    { month: "Feb", patients: 105, appointments: 148, revenue: 23800 },
];

const departmentRevenue = [
    { dept: "General", revenue: 42000 },
    { dept: "Ortho", revenue: 31000 },
    { dept: "Surgery", revenue: 18000 },
    { dept: "Perio", revenue: 15000 },
    { dept: "Endo", revenue: 12000 },
    { dept: "Pediatric", revenue: 22000 },
];

const roleSplit = [
    { name: "Patients", value: 580 },
    { name: "Admins", value: 12 },
];

const COLORS = ["#C9A96E", "#0B1F3A", "#4B9CD3"];

const kpis = [
    { label: "Total Revenue (YTD)", value: "$123,200", change: "+18%", up: true },
    { label: "Total Patients", value: "580", change: "+24%", up: true },
    { label: "Avg. Visit Value", value: "$212", change: "+6%", up: true },
    { label: "Cancellation Rate", value: "4.2%", change: "-1.1%", up: true },
];

export default function AnalyticsPage() {
    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={superAdminNavItems} title="DentalCare" subtitle="Super Admin" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Analytics</h1>
                    <p className="text-navy/50 mt-1">Clinic-wide performance metrics and trends.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {kpis.map(({ label, value, change, up }) => (
                        <div key={label} className="glass-card rounded-2xl p-5">
                            <p className="text-navy/40 text-xs mb-2">{label}</p>
                            <p className="font-fraunces text-2xl font-bold text-navy">{value}</p>
                            <span className={`text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>
                                {change} vs last year
                            </span>
                        </div>
                    ))}
                </div>

                {/* Monthly Trends */}
                <div className="glass-card rounded-2xl p-5 mb-6">
                    <h3 className="font-fraunces text-base font-semibold text-navy mb-4">Monthly Trends (last 7 months)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gPat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gAppt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0B1F3A" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#0B1F3A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A10" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: "#F7F5F0", border: "none", borderRadius: "12px", fontSize: "12px" }}
                            />
                            <Area type="monotone" dataKey="patients" stroke="#C9A96E" strokeWidth={2} fill="url(#gPat)" name="New Patients" />
                            <Area type="monotone" dataKey="appointments" stroke="#0B1F3A" strokeWidth={2} fill="url(#gAppt)" name="Appointments" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue by Department */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="font-fraunces text-base font-semibold text-navy mb-4">Revenue by Department</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={departmentRevenue} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A10" />
                                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#0B1F3A80" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: "#F7F5F0", border: "none", borderRadius: "12px", fontSize: "12px" }}
                                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                                />
                                <Bar dataKey="revenue" fill="#C9A96E" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* User role split */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="font-fraunces text-base font-semibold text-navy mb-4">Account Distribution</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={roleSplit} cx="50%" cy="45%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {roleSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}
