"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────
interface ContactMessage {
    _id: string;
    fullName: string;
    phone?: string;
    email: string;
    subject: string;
    message: string;
    consent: boolean;
    status: "new" | "in_review" | "resolved" | "closed";
    adminNote?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
    new: "bg-amber-100 text-amber-700",
    in_review: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-navy/10 text-navy/50",
};

const STATUS_LABELS: Record<string, string> = {
    new: "New",
    in_review: "In Review",
    resolved: "Resolved",
    closed: "Closed",
};

const SUBJECT_COLORS: Record<string, string> = {
    "General Inquiry": "bg-sky-50 text-sky-700",
    "Appointment Request": "bg-purple-50 text-purple-700",
    "Insurance & Billing": "bg-amber-50 text-amber-700",
    "Dental Records Request": "bg-teal-50 text-teal-700",
    "Feedback / Complaint": "bg-red-50 text-red-700",
    "Partnership / Referral": "bg-indigo-50 text-indigo-700",
    "Other": "bg-navy/5 text-navy/60",
};

// ─── Main Page ────────────────────────────────────────────
export default function AdminContactsPage() {
    const { accessToken } = useAuth();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const LIMIT = 20;

    const [selected, setSelected] = useState<ContactMessage | null>(null);
    const [saving, setSaving] = useState(false);
    const [editNote, setEditNote] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: debouncedSearch, status: statusFilter,
                page: String(page), limit: String(LIMIT),
            });
            const res = await fetch(`/api/admin/contacts?${params}`, { headers: headers(), credentials: "include" });
            const json = await res.json();
            if (json.success) {
                setMessages(json.data.messages);
                setTotal(json.data.total);
                setPages(json.data.pages);
            }
        } finally { setLoading(false); }
    }, [headers, debouncedSearch, statusFilter, page]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    const flash = (type: "ok" | "err", msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const openMessage = (m: ContactMessage) => {
        setSelected(m);
        setEditNote(m.adminNote ?? "");
        setEditStatus(m.status);
        // Auto-move from "new" → "in_review" when opened
        if (m.status === "new") {
            patchMessage(m._id, { status: "in_review" }).then((json) => {
                if (json.success) {
                    setSelected(json.data.message);
                    setEditStatus("in_review");
                    setMessages((prev) => prev.map((x) => x._id === m._id ? json.data.message : x));
                }
            });
        }
    };

    const patchMessage = async (id: string, body: Record<string, unknown>) => {
        const res = await fetch(`/api/admin/contacts/${id}`, {
            method: "PATCH", headers: headers(), credentials: "include",
            body: JSON.stringify(body),
        });
        return res.json();
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const json = await patchMessage(selected._id, { status: editStatus, adminNote: editNote });
            if (json.success) {
                flash("ok", "Message updated.");
                setSelected(json.data.message);
                setMessages((prev) => prev.map((x) => x._id === selected._id ? json.data.message : x));
            } else flash("err", json.error ?? "Failed.");
        } finally { setSaving(false); }
    };

    const quickStatus = async (m: ContactMessage, status: string) => {
        const json = await patchMessage(m._id, { status });
        if (json.success) {
            setMessages((prev) => prev.map((x) => x._id === m._id ? json.data.message : x));
            if (selected?._id === m._id) { setSelected(json.data.message); setEditStatus(status); }
        } else flash("err", json.error ?? "Failed.");
    };

    const handleDelete = async (m: ContactMessage) => {
        if (!confirm(`Delete message from "${m.fullName}"?`)) return;
        const res = await fetch(`/api/admin/contacts/${m._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
        const json = await res.json();
        if (json.success) {
            flash("ok", "Deleted.");
            if (selected?._id === m._id) setSelected(null);
            fetchMessages();
        } else flash("err", json.error ?? "Failed.");
    };

    const newCount = messages.filter((m) => m.status === "new").length;

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Contact Messages</h1>
                            {newCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                    {newCount} new
                                </span>
                            )}
                        </div>
                        <p className="text-navy/50 text-sm mt-1">Messages submitted via the public contact form.</p>
                    </div>
                    <div className="bg-navy/5 rounded-xl px-4 py-2 text-sm text-navy/60 self-start sm:self-auto">
                        <span className="font-semibold text-navy">{total}</span> total
                    </div>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                <div className={`flex gap-5 ${selected ? "flex-col lg:flex-row" : ""}`}>
                    {/* List panel */}
                    <div className={`${selected ? "lg:w-[45%] flex-shrink-0" : "w-full"}`}>
                        {/* Filters */}
                        <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4 flex flex-wrap gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                                <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" /></svg>
                                <input type="text" placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30" />
                            </div>
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold transition-colors">
                                <option value="">All Statuses</option>
                                {["new", "in_review", "resolved", "closed"].map((s) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                            {(statusFilter || search) && (
                                <button onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }} className="text-xs text-navy/40 hover:text-navy transition-colors underline">Clear</button>
                            )}
                        </div>

                        {/* Message list */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            {loading ? (
                                <div className="divide-y divide-navy/5">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="px-5 py-4 flex gap-3 animate-pulse">
                                            <div className="flex-1 space-y-2"><div className="h-3 bg-navy/8 rounded w-1/3" /><div className="h-2.5 bg-navy/5 rounded w-1/2" /></div>
                                        </div>
                                    ))}
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="p-10 text-center text-navy/40 text-sm">No messages found.</div>
                            ) : (
                                <div className="divide-y divide-navy/5">
                                    {messages.map((m) => (
                                        <div
                                            key={m._id}
                                            onClick={() => openMessage(m)}
                                            className={`px-4 sm:px-5 py-4 cursor-pointer hover:bg-navy/[0.02] transition-colors ${selected?._id === m._id ? "bg-gold/[0.04] border-l-2 border-gold" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                    <p className={`font-semibold text-navy text-sm truncate ${m.status === "new" ? "font-bold" : ""}`}>{m.fullName}</p>
                                                    {m.status === "new" && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_STYLES[m.status]}`}>{STATUS_LABELS[m.status]}</span>
                                            </div>
                                            <p className="text-xs text-navy/50 mb-1">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${SUBJECT_COLORS[m.subject] ?? "bg-navy/5 text-navy/50"}`}>{m.subject}</span>
                                                <span className="text-xs text-navy/30">{new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                            <p className="text-xs text-navy/40 mt-1.5 line-clamp-1">{m.message}</p>

                                            {/* Quick action buttons */}
                                            <div className="flex gap-1.5 mt-2.5" onClick={(e) => e.stopPropagation()}>
                                                {m.status !== "resolved" && m.status !== "closed" && (
                                                    <button onClick={() => quickStatus(m, "resolved")} className="text-xs px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors font-medium">
                                                        Resolve
                                                    </button>
                                                )}
                                                {m.status === "resolved" && (
                                                    <button onClick={() => quickStatus(m, "closed")} className="text-xs px-2.5 py-1 bg-navy/5 hover:bg-navy/10 text-navy/60 rounded-lg transition-colors font-medium">
                                                        Close
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(m)} className="text-xs px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium ml-auto">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
                    </div>

                    {/* Detail panel */}
                    {selected && (
                        <div className="flex-1 min-w-0">
                            <div className="glass-card rounded-2xl p-5 sm:p-6 sticky top-8">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 mb-5">
                                    <div>
                                        <h2 className="font-fraunces text-lg font-bold text-navy">{selected.fullName}</h2>
                                        <p className="text-navy/50 text-xs mt-0.5">{selected.email}{selected.phone ? ` · ${selected.phone}` : ""}</p>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy transition-colors flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status]}`}>{STATUS_LABELS[selected.status]}</span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs ${SUBJECT_COLORS[selected.subject] ?? "bg-navy/5 text-navy/50"}`}>{selected.subject}</span>
                                    <span className="text-xs text-navy/30 self-center">{new Date(selected.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                </div>

                                {/* Message body */}
                                <div className="bg-navy/[0.03] rounded-xl p-4 mb-5">
                                    <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-2">Message</p>
                                    <p className="text-navy text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                                </div>

                                {/* Resolution info */}
                                {(selected.status === "resolved" || selected.status === "closed") && selected.resolvedBy && (
                                    <div className="flex items-center gap-2 mb-4 bg-green-50 rounded-xl px-3 py-2.5">
                                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-green-700 text-xs">
                                            {STATUS_LABELS[selected.status]} by <strong>{selected.resolvedBy}</strong>
                                            {selected.resolvedAt ? ` on ${new Date(selected.resolvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                                        </p>
                                    </div>
                                )}

                                {/* Edit status + note */}
                                <div className="space-y-3 mb-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Status</label>
                                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold transition-all">
                                            {["new", "in_review", "resolved", "closed"].map((s) => (
                                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Internal Note (optional)</label>
                                        <textarea
                                            value={editNote}
                                            onChange={(e) => setEditNote(e.target.value)}
                                            rows={3}
                                            placeholder="Add a note for your team…"
                                            className="w-full px-3 py-2.5 rounded-xl border border-navy/15 bg-cream text-navy text-sm focus:outline-none focus:border-gold transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    <button onClick={handleSave} disabled={saving} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                        {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</> : "Save Changes"}
                                    </button>
                                    <button onClick={() => handleDelete(selected)} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">Delete</button>
                                </div>

                                {/* Reply shortcut */}
                                <a
                                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}&body=Hi ${encodeURIComponent(selected.fullName)},%0A%0A`}
                                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-navy/15 text-navy/60 text-sm font-medium hover:bg-navy/5 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                    Reply via Email
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
