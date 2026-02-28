"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { superAdminNavItems } from "../navItems";

interface UserAccount {
    _id: string;
    name: string;
    email: string;
    role: "user";
    isActive: boolean;
    createdAt: string;
}

type FilterTab = "all" | "active" | "inactive";

export default function UserManagementPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<FilterTab>("all");
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    // Edit modal
    const [editModal, setEditModal] = useState(false);
    const [selected, setSelected] = useState<UserAccount | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [saving, setSaving] = useState(false);

    const headers = useCallback(
        () => ({
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }),
        [accessToken]
    );

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/super-admin/users?role=user", {
                headers: headers(),
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) setUsers(json.data);
        } finally {
            setLoading(false);
        }
    }, [headers]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3000);
    };

    const toggleActive = async (user: UserAccount) => {
        try {
            const res = await fetch(`/api/super-admin/users/${user._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ isActive: !user.isActive }),
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", `User ${!user.isActive ? "activated" : "deactivated"}.`);
                fetchUsers();
            }
        } catch { flash("err", "Network error."); }
    };

    const handleDelete = async (user: UserAccount) => {
        if (!confirm(`Delete account for "${user.name}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/super-admin/users/${user._id}`, {
                method: "DELETE",
                headers: headers(),
                credentials: "include",
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", "User account deleted.");
                fetchUsers();
            } else {
                flash("err", json.error ?? "Failed to delete.");
            }
        } catch { flash("err", "Network error."); }
    };

    const openEdit = (user: UserAccount) => {
        setSelected(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditModal(true);
    };

    const handleEdit = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/users/${selected._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ name: editName, email: editEmail }),
            });
            const json = await res.json();
            if (json.success) {
                flash("ok", "User updated.");
                setEditModal(false);
                fetchUsers();
            } else {
                flash("err", json.error ?? "Failed to update.");
            }
        } finally {
            setSaving(false);
        }
    };

    const filtered = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesTab =
            tab === "all" || (tab === "active" && u.isActive) || (tab === "inactive" && !u.isActive);
        return matchesSearch && matchesTab;
    });

    const tabCounts = {
        all: users.length,
        active: users.filter((u) => u.isActive).length,
        inactive: users.filter((u) => !u.isActive).length,
    };

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={superAdminNavItems} title="DentalCare" subtitle="Super Admin" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">User Management</h1>
                    <p className="text-navy/50 mt-1">View and manage patient accounts.</p>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Patients", value: users.length },
                        { label: "Active", value: tabCounts.active },
                        { label: "Inactive", value: tabCounts.inactive },
                        { label: "Joined This Month", value: users.filter((u) => new Date(u.createdAt).getMonth() === new Date().getMonth()).length },
                    ].map(({ label, value }) => (
                        <div key={label} className="glass-card rounded-2xl p-4 text-center">
                            <p className="text-xl sm:text-2xl font-fraunces font-bold text-navy">{value}</p>
                            <p className="text-navy/50 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs + Search bar */}
                <div className="glass-card rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex gap-1 flex-wrap">
                        {(["all", "active", "inactive"] as FilterTab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${tab === t ? "bg-navy text-white" : "text-navy/50 hover:text-navy hover:bg-navy/5"}`}
                            >
                                {t} ({tabCounts[t]})
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 flex items-center gap-2 sm:ml-4">
                        <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-navy/40 text-sm">Loading users…</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-navy/40 text-sm">No users found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-navy/10">
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Patient</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden md:table-cell">Email</th>
                                        <th className="text-center px-5 py-3.5 text-navy/50 font-medium">Status</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden lg:table-cell">Registered</th>
                                        <th className="text-right px-5 py-3.5 text-navy/50 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((user) => {
                                        const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                                        return (
                                            <tr key={user._id} className="border-b border-navy/5 hover:bg-navy/2 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                                            <span className="font-fraunces text-xs font-bold text-gold">{initials}</span>
                                                        </div>
                                                        <span className="font-medium text-navy">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-navy/60 hidden md:table-cell">{user.email}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                        {user.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-navy/50 hidden lg:table-cell">
                                                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                                                        <button onClick={() => openEdit(user)} title="Edit" className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => toggleActive(user)}
                                                            title={user.isActive ? "Deactivate" : "Activate"}
                                                            className={`p-1.5 rounded-lg transition-colors ${user.isActive ? "hover:bg-yellow-50 text-navy/50 hover:text-yellow-600" : "hover:bg-green-50 text-navy/50 hover:text-green-600"}`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={user.isActive ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(user)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-navy/50 hover:text-red-500 transition-colors">
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

            {/* Edit modal */}
            {editModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-6 w-full max-w-md relative">
                        <button onClick={() => setEditModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="font-fraunces text-xl font-bold text-navy mb-6">Edit User</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-navy/50 mb-1.5">Full Name</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="form-input py-2.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-navy/50 mb-1.5">Email</label>
                                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="form-input py-2.5 text-sm" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleEdit} disabled={saving} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                            <button onClick={() => setEditModal(false)} className="btn-gold text-sm px-5 py-2.5">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
