"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

interface Appointment {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    service: string;
    doctorPreference: string;
    preferredDate: string;
    preferredTime: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    isNewPatient: boolean;
    insuranceProvider?: string;
    notes?: string;
    createdAt: string;
}

const STATUS_OPTIONS = ["", "pending", "confirmed", "completed", "cancelled"];
const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
};

export default function AdminAppointmentsPage() {
    const { accessToken } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const LIMIT = 15;

    // Modal
    const [modal, setModal] = useState<"view" | "edit" | null>(null);
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [editStatus, setEditStatus] = useState<string>("");
    const [editNotes, setEditNotes] = useState("");
    const [editDoctor, setEditDoctor] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: debouncedSearch, status: statusFilter, date: dateFilter,
                page: String(page), limit: String(LIMIT),
            });
            const res = await fetch(`/api/admin/appointments?${params}`, { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) {
                setAppointments(json.data.appointments);
                setTotal(json.data.total);
                setPages(json.data.pages);
            }
        } finally { setLoading(false); }
    }, [headers, debouncedSearch, statusFilter, dateFilter, page]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const openEdit = (a: Appointment) => {
        setSelected(a);
        setEditStatus(a.status);
        setEditNotes(a.notes ?? "");
        setEditDoctor(a.doctorPreference);
        setEditDate(a.preferredDate);
        setEditTime(a.preferredTime);
        setModal("edit");
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/appointments/${selected._id}`, {
                method: "PATCH",
                headers: headers(),
                credentials: "include",
                body: JSON.stringify({ status: editStatus, notes: editNotes, doctorPreference: editDoctor, preferredDate: editDate, preferredTime: editTime }),
            });
            const json = await res.json();
            if (json.success) { flash("ok", "Appointment updated."); setModal(null); fetchAppointments(); }
            else flash("err", json.error ?? "Failed to update.");
        } finally { setSaving(false); }
    };

    const handleDelete = async (a: Appointment) => {
        if (!confirm(`Delete appointment for "${a.firstName} ${a.lastName}"?`)) return;
        try {
            const res = await fetch(`/api/admin/appointments/${a._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) { flash("ok", "Appointment deleted."); fetchAppointments(); }
            else flash("err", json.error ?? "Failed.");
        } catch { flash("err", "Network error."); }
    };

    const quickStatus = async (a: Appointment, status: string) => {
        try {
            const res = await fetch(`/api/admin/appointments/${a._id}`, {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ status }),
            });
            const json = await res.json();
            if (json.success) fetchAppointments();
            else flash("err", json.error ?? "Failed.");
        } catch { flash("err", "Network error."); }
    };

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Appointments</h1>
                        <p className="text-navy/50 mt-1">Manage all clinic appointments.</p>
                    </div>
                    <div className="bg-navy/5 rounded-xl px-4 py-2 text-sm text-navy/60">
                        <span className="font-semibold text-navy">{total}</span> total appointments
                    </div>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Filters */}
                <div className="glass-card rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                        <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" /></svg>
                        <input type="text" placeholder="Search patient, doctor…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30" />
                    </div>
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold transition-colors">
                        <option value="">All Statuses</option>
                        {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="bg-white border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold transition-colors" />
                    {(statusFilter || dateFilter || search) && (
                        <button onClick={() => { setSearch(""); setStatusFilter(""); setDateFilter(""); setPage(1); }} className="text-xs text-navy/40 hover:text-navy transition-colors underline">Clear filters</button>
                    )}
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-navy/5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="px-5 py-4 flex gap-3 animate-pulse">
                                    <div className="flex-1 space-y-2"><div className="h-3 bg-navy/8 rounded w-1/3" /><div className="h-2.5 bg-navy/5 rounded w-1/2" /></div>
                                </div>
                            ))}
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="p-12 text-center text-navy/40 text-sm">No appointments found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-navy/10">
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium">Patient</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden md:table-cell">Service</th>
                                        <th className="text-left px-5 py-3.5 text-navy/50 font-medium hidden lg:table-cell">Date & Time</th>
                                        <th className="text-center px-5 py-3.5 text-navy/50 font-medium">Status</th>
                                        <th className="text-right px-5 py-3.5 text-navy/50 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((a) => (
                                        <tr key={a._id} className="border-b border-navy/5 hover:bg-navy/[0.02] transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-navy">{a.firstName} {a.lastName}</p>
                                                <p className="text-navy/40 text-xs mt-0.5">{a.email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-navy/60 hidden md:table-cell">{a.service}</td>
                                            <td className="px-5 py-4 hidden lg:table-cell">
                                                <p className="text-navy/70">{a.preferredDate}</p>
                                                <p className="text-navy/40 text-xs">{a.preferredTime}</p>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <select
                                                    value={a.status}
                                                    onChange={(e) => quickStatus(a, e.target.value)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${STATUS_STYLES[a.status] ?? ""}`}
                                                >
                                                    {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => { setSelected(a); setModal("view"); }} title="View" className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    </button>
                                                    <button onClick={() => openEdit(a)} title="Edit" className="p-1.5 rounded-lg hover:bg-gold/10 text-navy/50 hover:text-gold transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(a)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-navy/50 hover:text-red-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

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
                    <h2 className="font-fraunces text-xl font-bold text-navy mb-1">{selected.firstName} {selected.lastName}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                    <div className="mt-5 space-y-2 text-sm">
                        <InfoRow label="Email" value={selected.email} />
                        <InfoRow label="Phone" value={selected.phone} />
                        <InfoRow label="Service" value={selected.service} />
                        <InfoRow label="Doctor" value={selected.doctorPreference} />
                        <InfoRow label="Date" value={selected.preferredDate} />
                        <InfoRow label="Time" value={selected.preferredTime} />
                        <InfoRow label="New Patient" value={selected.isNewPatient ? "Yes" : "No"} />
                        {selected.insuranceProvider && <InfoRow label="Insurance" value={selected.insuranceProvider} />}
                        {selected.notes && <InfoRow label="Notes" value={selected.notes} />}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => openEdit(selected)} className="flex-1 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Edit</button>
                        <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors">Close</button>
                    </div>
                </ModalOverlay>
            )}

            {/* Edit Modal */}
            {modal === "edit" && selected && (
                <ModalOverlay onClose={() => setModal(null)}>
                    <h2 className="font-fraunces text-xl font-bold text-navy mb-1">Edit Appointment</h2>
                    <p className="text-navy/40 text-xs mb-5">{selected.firstName} {selected.lastName} · {selected.service}</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Status</label>
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all">
                                {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Doctor / Preference</label>
                            <input type="text" value={editDoctor} onChange={(e) => setEditDoctor(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Date</label>
                                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Time</label>
                                <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Notes</label>
                            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all resize-none" placeholder="Add internal notes…" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleSave} disabled={saving} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</> : "Save Changes"}
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
            <div className="glass-card rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {children}
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-navy/5 last:border-0">
            <span className="text-navy/40 flex-shrink-0 w-20">{label}</span>
            <span className="text-navy text-right break-all">{value}</span>
        </div>
    );
}
