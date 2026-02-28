"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

interface Patient {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const LIMIT = 15;

    // Modal
    const [modal, setModal] = useState<"view" | "reset" | null>(null);
    const [selected, setSelected] = useState<Patient | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ role: "user", search: debouncedSearch, page: String(page), limit: String(LIMIT) });
            const res = await fetch(`/api/admin/users?${params}`, { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) {
                setUsers(json.data.users);
                setTotal(json.data.total);
                setPages(json.data.pages);
            }
        } finally {
            setLoading(false);
        }
    }, [headers, debouncedSearch, page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const toggleActive = async (u: Patient) => {
        try {
            const res = await fetch(`/api/admin/users/${u._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ isActive: !u.isActive }),
            });
            const json = await res.json();
            if (json.success) fetchUsers();
            else flash("err", json.error ?? "Failed to update.");
        } catch { flash("err", "Network error."); }
    };

    const handleDelete = async (u: Patient) => {
        if (!confirm(`Permanently delete "${u.name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/users/${u._id}`, {
                method: "DELETE",
                headers: headers(),
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) { flash("ok", "User deleted."); fetchUsers(); }
            else flash("err", json.error ?? "Failed to delete.");
        } catch { flash("err", "Network error."); }
    };

    const handleResetPassword = async () => {
        if (!selected || !newPassword || newPassword.length < 6) {
            flash("err", "Password must be at least 6 characters."); return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${selected._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ newPassword }),
            });
            const json = await res.json();
            if (json.success) { flash("ok", "Password reset successfully."); setModal(null); }
            else flash("err", json.error ?? "Failed.");
        } finally { setSaving(false); }
    };

    const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-8">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">User Management</h1>
                        <p className="text-navy/50 text-sm mt-1">View and manage all registered patients.</p>
                    </div>
                    <div className="bg-navy/5 rounded-xl px-4 py-2 text-sm text-navy/60 self-start sm:self-auto">
                        <span className="font-semibold text-navy">{total}</span> total patients
                    </div>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Search */}
                <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4 flex items-center gap-3">
                    <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="text-navy/30 hover:text-navy transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-navy/5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="px-4 sm:px-5 py-4 flex items-center gap-3 animate-pulse">
                                    <div className="w-9 h-9 rounded-xl bg-navy/8 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-navy/8 rounded w-1/3" />
                                        <div className="h-2.5 bg-navy/5 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center text-navy/40 text-sm">
                            {debouncedSearch ? "No patients match your search." : "No patients registered yet."}
                        </div>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="md:hidden divide-y divide-navy/5">
                                {users.map((u) => (
                                    <div key={u._id} className="px-4 py-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                                    <span className="font-fraunces text-xs font-bold text-gold">{initials(u.name)}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-navy text-sm truncate">{u.name}</p>
                                                    <p className="text-navy/40 text-xs truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleActive(u)}
                                                className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                {u.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-3">
                                            <button onClick={() => { setSelected(u); setModal("view"); }} className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </button>
                                            <button onClick={() => { setSelected(u); setNewPassword(""); setShowPw(false); setModal("reset"); }} className="p-1.5 rounded-lg hover:bg-gold/10 text-navy/50 hover:text-gold transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-navy/50 hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-navy/10">
                                            <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Patient</th>
                                            <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Email</th>
                                            <th className="text-center px-5 py-3.5 text-navy/50 font-medium">Status</th>
                                            <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden lg:table-cell">Joined</th>
                                            <th className="text-right px-5 py-3.5 text-navy/50 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id} className="border-b border-navy/5 hover:bg-navy/[0.02] transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                                            <span className="font-fraunces text-xs font-bold text-gold">{initials(u.name)}</span>
                                                        </div>
                                                        <span className="font-medium text-navy">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-navy/60">{u.email}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleActive(u)}
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${u.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                                                    >
                                                        {u.isActive ? "Active" : "Inactive"}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 text-navy/50 hidden lg:table-cell">
                                                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => { setSelected(u); setModal("view"); }}
                                                            title="View details"
                                                            className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelected(u); setNewPassword(""); setShowPw(false); setModal("reset"); }}
                                                            title="Reset password"
                                                            className="p-1.5 rounded-lg hover:bg-gold/10 text-navy/50 hover:text-gold transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(u)}
                                                            title="Delete"
                                                            className="p-1.5 rounded-lg hover:bg-red-50 text-navy/50 hover:text-red-500 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-navy/40">Page {page} of {pages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 rounded-lg border border-navy/15 text-navy/60 hover:bg-navy/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </main>

            {/* View Modal */}
            {modal === "view" && selected && (
                <ModalOverlay onClose={() => setModal(null)}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                            <span className="font-fraunces text-xl font-bold text-gold">{initials(selected.name)}</span>
                        </div>
                        <div>
                            <h2 className="font-fraunces text-xl font-bold text-navy">{selected.name}</h2>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{selected.isActive ? "Active" : "Inactive"}</span>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm">
                        <InfoRow label="Email" value={selected.email} />
                        <InfoRow label="Role" value="Patient / User" />
                        <InfoRow label="Joined" value={new Date(selected.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                        <InfoRow label="User ID" value={selected._id} mono />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => toggleActive(selected)} className="flex-1 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">
                            {selected.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors">Close</button>
                    </div>
                </ModalOverlay>
            )}

            {/* Reset Password Modal */}
            {modal === "reset" && selected && (
                <ModalOverlay onClose={() => setModal(null)}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                        </div>
                        <div>
                            <h2 className="font-fraunces text-lg font-bold text-navy">Reset Password</h2>
                            <p className="text-navy/40 text-xs">For <span className="font-semibold text-navy">{selected.name}</span></p>
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">New Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            </span>
                            <input
                                type={showPw ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-11 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                placeholder="Min. 6 characters"
                            />
                            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/30 hover:text-gold transition-colors">
                                {showPw
                                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleResetPassword} disabled={saving || !newPassword} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</> : "Reset Password"}
                        </button>
                        <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Cancel</button>
                    </div>
                </ModalOverlay>
            )}
        </div>
    );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {children}
            </div>
        </div>
    );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-navy/5 last:border-0">
            <span className="text-navy/40 flex-shrink-0 w-20">{label}</span>
            <span className={`text-navy text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
        </div>
    );
}
