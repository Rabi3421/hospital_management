"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { superAdminNavItems } from "../navItems";

interface AdminAccount {
    _id: string;
    name: string;
    email: string;
    role: "admin";
    isActive: boolean;
    createdAt: string;
}

const EMPTY_FORM = { name: "", email: "", password: "", isActive: true };

export default function AdminManagementPage() {
    const { accessToken } = useAuth();
    const [admins, setAdmins] = useState<AdminAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [modal, setModal] = useState<"create" | "edit" | "reset" | null>(null);
    const [selected, setSelected] = useState<AdminAccount | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [showCreatePw, setShowCreatePw] = useState(false);
    const [showResetPw, setShowResetPw] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
    const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; password: string } | null>(null);

    const headers = useCallback(
        () => ({
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }),
        [accessToken]
    );

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/users?role=admin", {
                headers: headers(),
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) setAdmins(json.data);
        } finally {
            setLoading(false);
        }
    }, [headers]);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3000);
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setSelected(null);
        setShowCreatePw(false);
        setCreatedCredentials(null);
        setModal("create");
    };

    const openEdit = (admin: AdminAccount) => {
        setSelected(admin);
        setForm({ name: admin.name, email: admin.email, password: "", isActive: admin.isActive });
        setModal("edit");
    };

    const openReset = (admin: AdminAccount) => {
        setSelected(admin);
        setNewPassword("");
        setModal("reset");
    };

    const closeModal = () => { setModal(null); setSelected(null); };

    const handleCreate = async () => {
        if (!form.name || !form.email || !form.password) {
            flash("err", "Name, email and password are required.");
            return;
        }
        if (form.password.length < 6) {
            flash("err", "Password must be at least 6 characters.");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/super-admin/users", {
                method: "POST",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ ...form, role: "admin" }),
            });
            const json = await res.json();
            if (json.success) {
                setCreatedCredentials({ name: form.name, email: form.email, password: form.password });
                setModal(null);
                fetchAdmins();
            } else {
                flash("err", json.error ?? "Failed to create admin.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/users/${selected._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ name: form.name, email: form.email, isActive: form.isActive }),
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", "Admin updated.");
                closeModal();
                fetchAdmins();
            } else {
                flash("err", json.error ?? "Failed to update.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selected || !newPassword) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/users/${selected._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ newPassword }),
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", "Password reset successfully.");
                closeModal();
            } else {
                flash("err", json.error ?? "Failed to reset password.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (admin: AdminAccount) => {
        if (!confirm(`Delete admin "${admin.name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/super-admin/users/${admin._id}`, {
                method: "DELETE",
                headers: headers(),
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", "Admin deleted.");
                fetchAdmins();
            } else {
                flash("err", json.error ?? "Failed to delete.");
            }
        } catch {
            flash("err", "Network error.");
        }
    };

    const toggleActive = async (admin: AdminAccount) => {
        try {
            const res = await fetch(`/api/super-admin/users/${admin._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ isActive: !admin.isActive }),
            });
            const json = await res.json();
            if (json.success) fetchAdmins();
        } catch { }
    };

    const filtered = admins.filter(
        (a) =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={superAdminNavItems} title="DentalCare" subtitle="Super Admin" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Admin Management</h1>
                        <p className="text-navy/50 mt-1">Create and manage clinic administrator accounts.</p>
                    </div>
                    <button onClick={openCreate} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Admin
                    </button>
                </div>

                {/* Feedback toast */}
                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Admins", value: admins.length },
                        { label: "Active", value: admins.filter((a) => a.isActive).length },
                        { label: "Inactive", value: admins.filter((a) => !a.isActive).length },
                        { label: "This Month", value: admins.filter((a) => new Date(a.createdAt).getMonth() === new Date().getMonth()).length },
                    ].map(({ label, value }) => (
                        <div key={label} className="glass-card rounded-2xl p-4 text-center">
                            <p className="text-2xl font-fraunces font-bold text-navy">{value}</p>
                            <p className="text-navy/50 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3">
                    <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search admins by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30"
                    />
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-navy/40 text-sm">Loading admins…</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-navy/40 text-sm">
                            {search ? "No admins match your search." : "No admin accounts yet. Click 'Add Admin' to create one."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-navy/10">
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Admin</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden md:table-cell">Email</th>
                                        <th className="text-center px-5 py-3.5 text-navy/50 font-medium">Status</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden lg:table-cell">Created</th>
                                        <th className="text-right px-5 py-3.5 text-navy/50 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((admin) => {
                                        const initials = admin.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                                        return (
                                            <tr key={admin._id} className="border-b border-navy/5 hover:bg-navy/2 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="font-fraunces text-xs font-bold text-navy">{initials}</span>
                                                        </div>
                                                        <span className="font-medium text-navy">{admin.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-navy/60 hidden md:table-cell">{admin.email}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleActive(admin)}
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${admin.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                                                    >
                                                        {admin.isActive ? "Active" : "Inactive"}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 text-navy/50 hidden lg:table-cell">
                                                    {new Date(admin.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openEdit(admin)} title="Edit" className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => openReset(admin)} title="Reset Password" className="p-1.5 rounded-lg hover:bg-gold/10 text-navy/50 hover:text-gold transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(admin)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-navy/50 hover:text-red-500 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* ─── Modals ─── */}
            {/* ── Credentials success card ── */}
            {createdCredentials && (
                <ModalOverlay onClose={() => setCreatedCredentials(null)}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-fraunces text-lg font-bold text-navy">Admin Account Created</h2>
                            <p className="text-navy/50 text-xs">Share these credentials securely with the admin</p>
                        </div>
                    </div>
                    <div className="bg-navy/4 border border-navy/10 rounded-xl p-4 space-y-3 mb-5">
                        <CredRow label="Name" value={createdCredentials.name} />
                        <CredRow label="Email" value={createdCredentials.email} copyable />
                        <CredRow label="Password" value={createdCredentials.password} copyable masked />
                    </div>
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
                        ⚠️ This password will not be shown again. Copy it before closing.
                    </p>
                    <button onClick={() => setCreatedCredentials(null)} className="w-full bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors">
                        Done
                    </button>
                </ModalOverlay>
            )}

            {(modal === "create" || modal === "edit") && (
                <ModalOverlay onClose={closeModal}>
                    <h2 className="font-fraunces text-xl font-bold text-navy mb-1">
                        {modal === "create" ? "Create Admin Account" : "Edit Admin"}
                    </h2>
                    <p className="text-navy/40 text-xs mb-5">
                        {modal === "create" ? "Credentials will be shown once after creation." : "Update this admin's details."}
                    </p>
                    <div className="space-y-4">
                        {/* Name */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                    placeholder="Dr. John Smith"
                                />
                            </div>
                        </div>
                        {/* Email */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                    placeholder="admin@dentalcare.com"
                                />
                            </div>
                        </div>
                        {/* Password — create only */}
                        {modal === "create" && (
                            <div className="group">
                                <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </span>
                                    <input
                                        type={showCreatePw ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                        placeholder="Min. 6 characters"
                                    />
                                    <button type="button" onClick={() => setShowCreatePw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/30 hover:text-gold transition-colors">
                                        {showCreatePw ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-navy/35 mt-1.5 pl-1">You'll be shown these credentials once after creation.</p>
                            </div>
                        )}
                        {/* Status toggle */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider">Account Status</p>
                                <p className="text-xs text-navy/35 mt-0.5">{form.isActive ? "Admin can log in" : "Login blocked"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.isActive ? "bg-gold" : "bg-navy/20"}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-[22px]" : "left-0.5"}`} />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={modal === "create" ? handleCreate : handleEdit}
                            disabled={saving}
                            className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>
                            ) : modal === "create" ? "Create Admin" : "Save Changes"}
                        </button>
                        <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Cancel</button>
                    </div>
                </ModalOverlay>
            )}

            {modal === "reset" && selected && (
                <ModalOverlay onClose={closeModal}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                            </svg>
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
                                <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </span>
                            <input
                                type={showResetPw ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-11 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                placeholder="Min. 6 characters"
                            />
                            <button type="button" onClick={() => setShowResetPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/30 hover:text-gold transition-colors">
                                {showResetPw ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleResetPassword}
                            disabled={saving || !newPassword}
                            className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>
                            ) : "Reset Password"}
                        </button>
                        <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Cancel</button>
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function CredRow({ label, value, copyable, masked }: { label: string; value: string; copyable?: boolean; masked?: boolean }) {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const display = masked && !revealed ? "•".repeat(Math.min(value.length, 12)) : value;
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-navy/40 w-16 flex-shrink-0">{label}</span>
            <span className="flex-1 text-sm text-navy font-medium font-mono truncate">{display}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
                {masked && (
                    <button onClick={() => setRevealed((v) => !v)} className="p-1 rounded hover:bg-navy/10 text-navy/40 hover:text-navy transition-colors">
                        {revealed ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                    </button>
                )}
                {copyable && (
                    <button onClick={copy} className="p-1 rounded hover:bg-navy/10 text-navy/40 hover:text-gold transition-colors">
                        {copied ? (
                            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
