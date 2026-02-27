"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { superAdminNavItems } from "../navItems";

type ActionType = "all" | "auth" | "user" | "admin" | "system";

interface LogEntry {
    id: number;
    action: string;
    category: Exclude<ActionType, "all">;
    by: string;
    byRole: "super_admin" | "admin" | "user" | "system";
    target: string;
    ip: string;
    time: string;
    status: "success" | "failed" | "warning";
}

const LOGS: LogEntry[] = [
    { id: 1, action: "Super Admin Login", category: "auth", by: "superadmin@dentalcare.com", byRole: "super_admin", target: "Session", ip: "192.168.1.1", time: "2026-02-28 10:42 AM", status: "success" },
    { id: 2, action: "Admin Account Created", category: "admin", by: "superadmin@dentalcare.com", byRole: "super_admin", target: "dr.johnson@dentalcare.com", ip: "192.168.1.1", time: "2026-02-28 10:30 AM", status: "success" },
    { id: 3, action: "User Account Deactivated", category: "user", by: "admin@dentalcare.com", byRole: "admin", target: "patient.alex@gmail.com", ip: "192.168.1.42", time: "2026-02-28 09:18 AM", status: "success" },
    { id: 4, action: "Failed Login Attempt", category: "auth", by: "unknown@gmail.com", byRole: "user", target: "Auth", ip: "203.0.113.55", time: "2026-02-28 08:55 AM", status: "failed" },
    { id: 5, action: "Password Reset", category: "admin", by: "superadmin@dentalcare.com", byRole: "super_admin", target: "dr.chen@dentalcare.com", ip: "192.168.1.1", time: "2026-02-27 05:30 PM", status: "success" },
    { id: 6, action: "System Settings Updated", category: "system", by: "superadmin@dentalcare.com", byRole: "super_admin", target: "Session Timeout → 30min", ip: "192.168.1.1", time: "2026-02-27 03:15 PM", status: "success" },
    { id: 7, action: "User Deleted", category: "user", by: "superadmin@dentalcare.com", byRole: "super_admin", target: "oldpatient@gmail.com", ip: "192.168.1.1", time: "2026-02-27 02:00 PM", status: "success" },
    { id: 8, action: "Bulk Export Triggered", category: "system", by: "admin@dentalcare.com", byRole: "admin", target: "Patient Records CSV", ip: "192.168.1.42", time: "2026-02-27 11:45 AM", status: "warning" },
    { id: 9, action: "New User Registration", category: "auth", by: "newpatient@gmail.com", byRole: "user", target: "Self-registration", ip: "172.16.0.5", time: "2026-02-27 10:22 AM", status: "success" },
    { id: 10, action: "Admin Role Changed", category: "admin", by: "superadmin@dentalcare.com", byRole: "super_admin", target: "dr.lee@dentalcare.com → admin", ip: "192.168.1.1", time: "2026-02-26 04:10 PM", status: "success" },
    { id: 11, action: "Failed Login Attempt", category: "auth", by: "hacker@spam.com", byRole: "user", target: "Auth", ip: "45.33.32.156", time: "2026-02-26 02:35 PM", status: "failed" },
    { id: 12, action: "Database Backup Completed", category: "system", by: "System", byRole: "system", target: "MongoDB Atlas", ip: "Internal", time: "2026-02-26 12:00 AM", status: "success" },
];

const CATEGORY_LABELS: Record<ActionType, string> = {
    all: "All",
    auth: "Auth",
    user: "Users",
    admin: "Admins",
    system: "System",
};

const STATUS_STYLES = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-600",
    warning: "bg-yellow-100 text-yellow-700",
};

const ROLE_STYLES: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    user: "bg-navy/10 text-navy/60",
    system: "bg-gray-100 text-gray-600",
};

export default function AuditLogsPage() {
    const [category, setCategory] = useState<ActionType>("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed" | "warning">("all");

    const filtered = LOGS.filter((log) => {
        const matchCat = category === "all" || log.category === category;
        const matchStatus = statusFilter === "all" || log.status === statusFilter;
        const matchSearch =
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.by.toLowerCase().includes(search.toLowerCase()) ||
            log.target.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchStatus && matchSearch;
    });

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={superAdminNavItems} title="DentalCare" subtitle="Super Admin" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Audit Logs</h1>
                        <p className="text-navy/50 mt-1">System-wide activity trail for security and compliance.</p>
                    </div>
                    <button className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Events", value: LOGS.length },
                        { label: "Successful", value: LOGS.filter((l) => l.status === "success").length },
                        { label: "Failed", value: LOGS.filter((l) => l.status === "failed").length },
                        { label: "Warnings", value: LOGS.filter((l) => l.status === "warning").length },
                    ].map(({ label, value }) => (
                        <div key={label} className="glass-card rounded-2xl p-4 text-center">
                            <p className="text-2xl font-fraunces font-bold text-navy">{value}</p>
                            <p className="text-navy/50 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="glass-card rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                    {/* Category tabs */}
                    <div className="flex gap-1 flex-wrap">
                        {(Object.keys(CATEGORY_LABELS) as ActionType[]).map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? "bg-navy text-white" : "text-navy/50 hover:text-navy hover:bg-navy/5"}`}
                            >
                                {CATEGORY_LABELS[c]}
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-5 bg-navy/10 hidden sm:block" />
                    {/* Status filter */}
                    <div className="flex gap-1 flex-wrap">
                        {(["all", "success", "failed", "warning"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-gold/20 text-navy" : "text-navy/40 hover:text-navy hover:bg-navy/5"}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    {/* Search */}
                    <div className="flex-1 flex items-center gap-2 sm:ml-2 min-w-0">
                        <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search logs…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30 min-w-0"
                        />
                    </div>
                </div>

                {/* Log table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="p-10 text-center text-navy/40 text-sm">No logs match your filters.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-navy/10">
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Action</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden md:table-cell">Performed By</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden lg:table-cell">Target</th>
                                        <th className="text-center px-5 py-3.5 text-navy/50 font-medium">Status</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden xl:table-cell">IP</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((log) => (
                                        <tr key={log.id} className="border-b border-navy/5 hover:bg-navy/2 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="font-medium text-navy">{log.action}</span>
                                            </td>
                                            <td className="px-5 py-3.5 hidden md:table-cell">
                                                <div>
                                                    <p className="text-navy/70 truncate max-w-[180px]">{log.by}</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_STYLES[log.byRole]}`}>{log.byRole.replace("_", " ")}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-navy/50 hidden lg:table-cell">
                                                <span className="truncate max-w-[160px] block">{log.target}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[log.status]}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-navy/40 font-mono text-xs hidden xl:table-cell">{log.ip}</td>
                                            <td className="px-5 py-3.5 text-navy/50 text-xs">{log.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
