"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type NotificationType = "slot_reminder" | "slot_starting" | "appointment_done" | "general";

interface Notification {
  _id: string;
  email: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const TYPE_META: Record<NotificationType, { label: string; style: string; dot: string }> = {
  slot_reminder: { label: "Reminder", style: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  slot_starting: { label: "Starting", style: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
  appointment_done: { label: "Done", style: "bg-green-100 text-green-700", dot: "bg-green-400" },
  general: { label: "General", style: "bg-navy/10 text-navy/70", dot: "bg-navy/40" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const LIMIT = 25;

  const [selected, setSelected] = useState<Notification | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }), [accessToken]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        type: typeFilter === "all" ? "" : typeFilter,
        read: readFilter === "all" ? "" : readFilter === "read" ? "true" : "false",
        page: String(page),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/notifications?${params}`, { headers: headers(), credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications);
        setTotal(json.data.total);
        setPages(json.data.pages);
        setUnreadCount(json.data.unreadCount);
      }
    } finally { setLoading(false); }
  }, [headers, debouncedSearch, typeFilter, readFilter, page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const toggleRead = async (n: Notification) => {
    try {
      const res = await fetch(`/api/admin/notifications/${n._id}`, {
        method: "PATCH",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ read: !n.read }),
      });
      const json = await res.json();
      if (json.success) {
        fetchNotifications();
        if (selected?._id === n._id) setSelected(json.data);
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (n: Notification) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await fetch(`/api/admin/notifications/${n._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
      setSelected(null);
      fetchNotifications();
      setFeedback({ type: "ok", msg: "Notification deleted." });
      setTimeout(() => setFeedback(null), 3000);
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    // Mark all unread on current view as read
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) =>
        fetch(`/api/admin/notifications/${n._id}`, {
          method: "PATCH",
          headers: headers(),
          credentials: "include",
          body: JSON.stringify({ read: true }),
        })
      )
    );
    fetchNotifications();
  };

  const TYPE_TABS: { key: NotificationType | "all"; label: string }[] = [
    { key: "all", label: "All Types" },
    { key: "slot_reminder", label: "Reminders" },
    { key: "slot_starting", label: "Starting" },
    { key: "appointment_done", label: "Done" },
    { key: "general", label: "General" },
  ];

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-sm font-semibold">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-navy/50 text-sm mt-1">
              System notifications sent to patients for appointments.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm px-4 py-2 rounded-xl border border-navy/15 text-navy/70 hover:bg-navy/5 transition-colors self-start sm:self-auto"
            >
              Mark visible as read
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: total, color: "text-navy" },
            { label: "Unread", value: unreadCount, color: "text-gold" },
            { label: "Reminders", value: "—", color: "text-yellow-600" },
            { label: "Sent via Email", value: "—", color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className={`text-xl sm:text-2xl font-fraunces font-bold ${color}`}>{value}</p>
              <p className="text-navy/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            feedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-4 space-y-3">
          {/* Search */}
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by email, title or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-navy/30 hover:text-navy">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="flex gap-2 flex-wrap">
            {TYPE_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTypeFilter(key); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  typeFilter === key ? "bg-navy text-white" : "bg-navy/5 text-navy/60 hover:bg-navy/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Read filter */}
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((k) => (
              <button
                key={k}
                onClick={() => { setReadFilter(k); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                  readFilter === k ? "bg-gold text-white" : "bg-navy/5 text-navy/60 hover:bg-navy/10"
                }`}
              >
                {k === "all" ? "All" : k === "unread" ? "Unread" : "Read"}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">No notifications found.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`glass-card rounded-2xl p-4 border-l-4 ${n.read ? "border-transparent" : "border-gold"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_META[n.type]?.dot ?? "bg-navy/40"}`} />
                    <p className={`text-sm font-semibold ${n.read ? "text-navy/60" : "text-navy"}`}>{n.title}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${TYPE_META[n.type]?.style ?? ""}`}>
                    {TYPE_META[n.type]?.label}
                  </span>
                </div>
                <p className="text-navy/50 text-xs mb-1">{n.email}</p>
                <p className="text-navy/60 text-xs mb-3 line-clamp-2">{n.message}</p>
                <div className="flex items-center justify-between">
                  <p className="text-navy/30 text-xs">{fmtDate(n.createdAt)}</p>
                  <button onClick={() => setSelected(n)} className="text-xs text-gold font-medium hover:underline">
                    View →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/8">
                <th className="text-left text-xs font-semibold text-navy/50 px-5 py-4">Title</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Type</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Date</th>
                <th className="text-center text-xs font-semibold text-navy/50 px-4 py-4">Read</th>
                <th className="text-center text-xs font-semibold text-navy/50 px-4 py-4">Email Sent</th>
                <th className="text-right text-xs font-semibold text-navy/50 px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-navy/40 text-sm py-10">Loading…</td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-navy/40 text-sm py-10">No notifications found.</td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr
                    key={n._id}
                    className={`hover:bg-navy/[0.015] transition-colors ${!n.read ? "bg-gold/[0.02]" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-navy/20" : "bg-gold"}`} />
                        <span className={`font-medium ${n.read ? "text-navy/60" : "text-navy"}`}>{n.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-navy/60 text-xs">{n.email}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_META[n.type]?.style ?? ""}`}>
                        {TYPE_META[n.type]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-navy/50 text-xs">{fmtDate(n.createdAt)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-medium ${n.read ? "text-green-600" : "text-amber-500"}`}>
                        {n.read ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-medium ${n.emailSent ? "text-green-600" : "text-navy/30"}`}>
                        {n.emailSent ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(n)} className="text-xs text-gold font-medium hover:underline mr-3">
                        View
                      </button>
                      <button onClick={() => toggleRead(n)} className="text-xs text-navy/50 hover:text-navy font-medium hover:underline mr-3">
                        {n.read ? "Unread" : "Read"}
                      </button>
                      <button onClick={() => handleDelete(n)} className="text-xs text-red-400 font-medium hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-navy/40">Showing {notifications.length} of {total} notifications</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-navy/15 text-navy disabled:opacity-40 hover:bg-navy/5 transition-colors"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-navy/60">{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 text-xs rounded-lg border border-navy/15 text-navy disabled:opacity-40 hover:bg-navy/5 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Notification Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy">{selected.title}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_META[selected.type]?.style ?? ""}`}>
                  {TYPE_META[selected.type]?.label}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "Recipient Email", value: selected.email },
                { label: "Created At", value: fmtDate(selected.createdAt) },
                { label: "Read", value: selected.read ? "Yes" : "No" },
                { label: "Email Sent", value: selected.emailSent ? `Yes (${selected.emailSentAt ? fmtDate(selected.emailSentAt) : ""})` : "No" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between bg-navy/[0.03] rounded-xl px-4 py-3">
                  <span className="text-navy/40 text-xs">{label}</span>
                  <span className="text-navy font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-navy/[0.03] rounded-xl p-4 mb-5">
              <p className="text-navy/40 text-xs mb-2">Message</p>
              <p className="text-navy text-sm leading-relaxed">{selected.message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleRead(selected)}
                className="flex-1 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors"
              >
                Mark as {selected.read ? "Unread" : "Read"}
              </button>
              <button
                onClick={() => handleDelete(selected)}
                className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
