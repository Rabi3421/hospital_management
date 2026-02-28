"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

interface Department {
    _id: string;
    name: string;
    description: string;
    head: string;
    doctorCount: number;
    isActive: boolean;
    icon: string;
    createdAt: string;
}

const EMPTY_FORM = { name: "", description: "", head: "", doctorCount: 0, icon: "🦷", isActive: true };
const ICON_OPTIONS = ["🦷", "😁", "🔬", "👶", "✨", "🩺", "🏥", "💊", "🫀", "🧬"];

interface DoctorOption { _id: string; name: string; specialty: string; avatar: string; }

export default function AdminDepartmentsPage() {
    const { accessToken } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [doctors, setDoctors] = useState<DoctorOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [modal, setModal] = useState<"create" | "edit" | null>(null);
    const [selected, setSelected] = useState<Department | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    const fetchDepts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/departments", { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) setDepartments(json.data);
        } finally { setLoading(false); }
    }, [headers]);

    const fetchDoctors = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/doctors?active=true", { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) setDoctors(json.data);
        } catch { /* silent */ }
    }, [headers]);

    useEffect(() => { fetchDepts(); fetchDoctors(); }, [fetchDepts, fetchDoctors]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal("create"); };
    const openEdit = (d: Department) => {
        setSelected(d);
        setForm({ name: d.name, description: d.description, head: d.head, doctorCount: d.doctorCount, icon: d.icon, isActive: d.isActive });
        setModal("edit");
    };

    const handleSave = async () => {
        if (!form.name.trim()) { flash("err", "Department name is required."); return; }
        setSaving(true);
        try {
            const url = modal === "create" ? "/api/admin/departments" : `/api/admin/departments/${selected?._id}`;
            const method = modal === "create" ? "POST" : "PATCH";
            const res = await fetch(url, { method, headers: headers(), credentials: "include", body: JSON.stringify(form) });
            const json = await res.json();
            if (json.success) {
                flash("ok", modal === "create" ? "Department created." : "Department updated.");
                setModal(null);
                fetchDepts();
            } else { flash("err", json.error ?? "Failed."); }
        } finally { setSaving(false); }
    };

    const handleDelete = async (d: Department) => {
        if (!confirm(`Delete department "${d.name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/departments/${d._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) { flash("ok", "Department deleted."); fetchDepts(); }
            else flash("err", json.error ?? "Failed.");
        } catch { flash("err", "Network error."); }
    };

    const toggleActive = async (d: Department) => {
        try {
            const res = await fetch(`/api/admin/departments/${d._id}`, {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ isActive: !d.isActive }),
            });
            const json = await res.json();
            if (json.success) fetchDepts();
        } catch { }
    };

    const filtered = departments.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.head.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
                    <div>
                        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Departments</h1>
                        <p className="text-navy/50 text-sm mt-1">Manage clinic departments and their staff.</p>
                    </div>
                    <button onClick={openCreate} className="btn-gold text-sm px-4 sm:px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add Department
                    </button>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                    {[
                        { label: "Total", value: departments.length },
                        { label: "Active", value: departments.filter((d) => d.isActive).length },
                        { label: "Doctors", value: departments.reduce((s, d) => s + d.doctorCount, 0) },
                    ].map(({ label, value }) => (
                        <div key={label} className="glass-card rounded-2xl p-3 sm:p-4 text-center">
                            <p className="text-xl sm:text-2xl font-fraunces font-bold text-navy">{value}</p>
                            <p className="text-navy/50 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3">
                    <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" /></svg>
                    <input type="text" placeholder="Search departments or head doctors…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30" />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                                <div className="w-12 h-12 rounded-xl bg-navy/8 mb-4" />
                                <div className="h-4 bg-navy/8 rounded w-2/3 mb-2" />
                                <div className="h-3 bg-navy/5 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 sm:p-12 text-center text-navy/40 text-sm">
                        {search ? "No departments match your search." : "No departments yet."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((d) => (
                            <div key={d._id} className={`glass-card rounded-2xl p-5 transition-all ${!d.isActive ? "opacity-60" : ""}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl">{d.icon}</div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => toggleActive(d)}
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${d.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                                        >
                                            {d.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-fraunces font-bold text-navy text-lg">{d.name}</h3>
                                <p className="text-navy/50 text-xs mt-1 leading-relaxed line-clamp-2">{d.description || "No description"}</p>
                                <div className="mt-4 pt-4 border-t border-navy/8 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-xs text-navy/40">Head Doctor</p>
                                        <p className="text-sm font-medium text-navy">{d.head || "—"}</p>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <p className="text-xs text-navy/40">Doctors</p>
                                        <p className="text-sm font-bold text-navy">{d.doctorCount}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button onClick={() => openEdit(d)} className="flex-1 py-2 rounded-xl border border-navy/15 text-navy text-xs font-medium hover:bg-navy/5 transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(d)} className="px-3 py-2 rounded-xl hover:bg-red-50 text-navy/40 hover:text-red-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create / Edit Modal */}
            {(modal === "create" || modal === "edit") && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setModal(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="font-fraunces text-xl font-bold text-navy mb-5">{modal === "create" ? "Add Department" : "Edit Department"}</h2>

                        {/* Icon picker */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {ICON_OPTIONS.map((icon) => (
                                    <button key={icon} type="button" onClick={() => setForm((p) => ({ ...p, icon }))} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === icon ? "bg-gold/20 border-2 border-gold" : "bg-navy/5 border-2 border-transparent hover:bg-navy/10"}`}>{icon}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <FormField label="Department Name" required>
                                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all" placeholder="e.g. Orthodontics" />
                            </FormField>
                            <FormField label="Description">
                                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all resize-none" placeholder="Brief description…" />
                            </FormField>
                            <FormField label="Head Doctor">
                                <select value={form.head} onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all appearance-none">
                                    <option value="">— Select a doctor —</option>
                                    {doctors.map((d) => (
                                        <option key={d._id} value={d.name}>
                                            {d.avatar} {d.name} — {d.specialty}
                                        </option>
                                    ))}
                                </select>
                                {doctors.length === 0 && (
                                    <p className="text-xs text-navy/40 mt-1">No doctors added yet. <a href="/dashboard/admin/schedule" className="text-gold hover:underline">Add doctors in Schedule →</a></p>
                                )}
                            </FormField>
                            <FormField label="Number of Doctors">
                                <input type="number" min={0} value={form.doctorCount} onChange={(e) => setForm((p) => ({ ...p, doctorCount: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all" />
                            </FormField>
                            <div className="flex items-center justify-between py-1">
                                <div>
                                    <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider">Status</p>
                                    <p className="text-xs text-navy/35 mt-0.5">{form.isActive ? "Visible & active" : "Hidden from listings"}</p>
                                </div>
                                <button type="button" onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.isActive ? "bg-gold" : "bg-navy/20"}`}>
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-[22px]" : "left-0.5"}`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} disabled={saving} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</> : modal === "create" ? "Create Department" : "Save Changes"}
                            </button>
                            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
