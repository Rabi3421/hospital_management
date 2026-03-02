"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type TreatmentStatus = "planned" | "ongoing" | "completed";

interface Treatment {
  _id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  treatmentName: string;
  toothNumbers: string;
  date: string;
  doctor: string;
  cost: number;
  status: TreatmentStatus;
  notes: string;
  followUpDate?: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_META: Record<TreatmentStatus, { label: string; style: string }> = {
  planned: { label: "Planned", style: "bg-yellow-100 text-yellow-700" },
  ongoing: { label: "Ongoing", style: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", style: "bg-green-100 text-green-700" },
};

const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const EMPTY_FORM = {
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  treatmentName: "",
  toothNumbers: "",
  date: new Date().toISOString().slice(0, 10),
  doctor: "",
  cost: "",
  status: "planned" as TreatmentStatus,
  notes: "",
  followUpDate: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TreatmentRecordsPage() {
  const { accessToken } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const LIMIT = 20;

  const [selected, setSelected] = useState<Treatment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, planned: 0, ongoing: 0, completed: 0 });

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }), [accessToken]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter === "all" ? "" : statusFilter,
        page: String(page),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/treatments?${params}`, { headers: headers(), credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setTreatments(json.data.treatments);
        setTotal(json.data.total);
        setPages(json.data.pages);
      }
    } finally { setLoading(false); }
  }, [headers, debouncedSearch, statusFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      const [all, planned, ongoing, completed] = await Promise.all([
        fetch("/api/admin/treatments?limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
        fetch("/api/admin/treatments?status=planned&limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
        fetch("/api/admin/treatments?status=ongoing&limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
        fetch("/api/admin/treatments?status=completed&limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
      ]);
      setStats({
        total: all.data?.total ?? 0,
        planned: planned.data?.total ?? 0,
        ongoing: ongoing.data?.total ?? 0,
        completed: completed.data?.total ?? 0,
      });
    } catch { /* silent */ }
  }, [headers]);

  useEffect(() => { fetchTreatments(); }, [fetchTreatments]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleAdd = async () => {
    if (!form.patientName || !form.treatmentName) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/treatments", {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ ...form, cost: Number(form.cost) || 0, followUpDate: form.followUpDate || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "ok", msg: "Treatment record added." });
        setForm(EMPTY_FORM);
        setShowAdd(false);
        fetchTreatments();
        fetchStats();
      } else {
        setFeedback({ type: "err", msg: json.error ?? "Failed to add treatment." });
      }
    } finally { setSaving(false); setTimeout(() => setFeedback(null), 4000); }
  };

  const updateStatus = async (treatment: Treatment, status: TreatmentStatus) => {
    try {
      const res = await fetch(`/api/admin/treatments/${treatment._id}`, {
        method: "PATCH",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTreatments();
        fetchStats();
        if (selected?._id === treatment._id) setSelected(json.data);
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (treatment: Treatment) => {
    if (!confirm(`Delete treatment for ${treatment.patientName}?`)) return;
    try {
      await fetch(`/api/admin/treatments/${treatment._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
      setSelected(null);
      fetchTreatments();
      fetchStats();
    } catch { /* silent */ }
  };

  const FILTER_TABS: { key: TreatmentStatus | "all"; label: string }[] = [
    { key: "all", label: `All (${stats.total})` },
    { key: "planned", label: `Planned (${stats.planned})` },
    { key: "ongoing", label: `Ongoing (${stats.ongoing})` },
    { key: "completed", label: `Completed (${stats.completed})` },
  ];

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
              Treatment Records
            </h1>
            <p className="text-navy/50 text-sm mt-1">
              Per-visit, per-tooth treatment tracking for every patient.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Treatment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Treatments", value: stats.total, color: "text-navy" },
            { label: "Planned", value: stats.planned, color: "text-yellow-600" },
            { label: "Ongoing", value: stats.ongoing, color: "text-blue-600" },
            { label: "Completed", value: stats.completed, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className={`text-xl sm:text-2xl font-fraunces font-bold ${color}`}>{value}</p>
              <p className="text-navy/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-4 space-y-3">
          {/* Search */}
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search patient, treatment, doctor or tooth…"
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
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  statusFilter === key
                    ? "bg-navy text-white"
                    : "bg-navy/5 text-navy/60 hover:bg-navy/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            feedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">Loading treatments…</div>
          ) : treatments.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">No treatments found.</div>
          ) : (
            treatments.map((t) => (
              <div key={t._id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <span className="font-fraunces text-[10px] font-bold text-gold">{initials(t.patientName)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{t.treatmentName}</p>
                      <p className="text-navy/40 text-xs">{t.patientName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize flex-shrink-0 ${STATUS_META[t.status].style}`}>
                    {STATUS_META[t.status].label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-navy/40">Tooth: </span><span className="text-navy font-medium">{t.toothNumbers}</span></div>
                  <div><span className="text-navy/40">Cost: </span><span className="text-navy font-semibold">₹{t.cost.toLocaleString()}</span></div>
                  <div><span className="text-navy/40">Doctor: </span><span className="text-navy">{t.doctor}</span></div>
                  <div><span className="text-navy/40">Date: </span><span className="text-navy">{fmtDate(t.date)}</span></div>
                </div>
                <button onClick={() => setSelected(t)} className="text-xs text-gold font-medium hover:underline">
                  View Details →
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/8">
                <th className="text-left text-xs font-semibold text-navy/50 px-5 py-4">Patient</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Treatment</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Tooth</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Doctor</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Date</th>
                <th className="text-right text-xs font-semibold text-navy/50 px-4 py-4">Cost</th>
                <th className="text-center text-xs font-semibold text-navy/50 px-4 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-navy/50 px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center text-navy/40 text-sm py-10">Loading…</td>
                </tr>
              ) : treatments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-navy/40 text-sm py-10">No treatments found.</td>
                </tr>
              ) : (
                treatments.map((t) => (
                  <tr key={t._id} className="hover:bg-navy/[0.015] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                          <span className="font-fraunces text-[10px] font-bold text-gold">{initials(t.patientName)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{t.patientName}</p>
                          <p className="text-navy/40 text-xs">{t.patientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-navy font-medium">{t.treatmentName}</td>
                    <td className="px-4 py-4 text-navy/60">{t.toothNumbers || "—"}</td>
                    <td className="px-4 py-4 text-navy/70">{t.doctor}</td>
                    <td className="px-4 py-4 text-navy/60">{fmtDate(t.date)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-navy">₹{t.cost.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[t.status].style}`}>
                        {STATUS_META[t.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(t)} className="text-xs text-gold font-medium hover:underline mr-3">
                        View
                      </button>
                      <button onClick={() => handleDelete(t)} className="text-xs text-red-400 font-medium hover:underline">
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
            <p className="text-xs text-navy/40">Showing {treatments.length} of {total} treatments</p>
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

      {/* ── Treatment Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                <span className="font-fraunces text-base font-bold text-gold">{initials(selected.patientName)}</span>
              </div>
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy">{selected.treatmentName}</h2>
                <p className="text-navy/40 text-xs">{selected.patientName} · {selected.patientEmail}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "Tooth / Region", value: selected.toothNumbers },
                { label: "Doctor", value: selected.doctor },
                { label: "Treatment Date", value: fmtDate(selected.date) },
                { label: "Follow-Up Date", value: selected.followUpDate ? fmtDate(selected.followUpDate) : "—" },
                { label: "Cost", value: `₹${selected.cost.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between bg-navy/[0.03] rounded-xl px-4 py-3">
                  <span className="text-navy/40 text-xs">{label}</span>
                  <span className="text-navy font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Status</p>
              <div className="flex gap-2">
                {(["planned", "ongoing", "completed"] as TreatmentStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected, s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors border ${
                      selected.status === s
                        ? `${STATUS_META[s].style} border-transparent`
                        : "border-navy/10 text-navy/50 hover:bg-navy/5"
                    }`}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selected.notes && (
              <div className="bg-navy/[0.03] rounded-xl p-4">
                <p className="text-navy/40 text-xs mb-2">Clinical Notes</p>
                <p className="text-navy text-sm leading-relaxed">{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add Treatment Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-fraunces text-xl font-bold text-navy mb-5">Add Treatment Record</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <FF label="Patient Name *">
                <input type="text" value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Patient full name" />
              </FF>
              <FF label="Patient Phone">
                <input type="tel" value={form.patientPhone} onChange={(e) => setForm((p) => ({ ...p, patientPhone: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Phone number" />
              </FF>
              <div className="sm:col-span-2">
                <FF label="Patient Email">
                  <input type="email" value={form.patientEmail} onChange={(e) => setForm((p) => ({ ...p, patientEmail: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="patient@email.com" />
                </FF>
              </div>
              <div className="sm:col-span-2">
                <FF label="Treatment Name *">
                  <input type="text" value={form.treatmentName} onChange={(e) => setForm((p) => ({ ...p, treatmentName: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. Root Canal Treatment" />
                </FF>
              </div>
              <FF label="Tooth Number(s)">
                <input type="text" value={form.toothNumbers} onChange={(e) => setForm((p) => ({ ...p, toothNumbers: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. #14, Full Mouth" />
              </FF>
              <FF label="Doctor">
                <input type="text" value={form.doctor} onChange={(e) => setForm((p) => ({ ...p, doctor: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Doctor name" />
              </FF>
              <FF label="Date">
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="form-input py-2.5 text-sm" />
              </FF>
              <FF label="Follow-Up Date">
                <input type="date" value={form.followUpDate} onChange={(e) => setForm((p) => ({ ...p, followUpDate: e.target.value }))} className="form-input py-2.5 text-sm" />
              </FF>
              <FF label="Cost (₹)">
                <input type="number" value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="0" />
              </FF>
              <FF label="Status">
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TreatmentStatus }))} className="form-input py-2.5 text-sm">
                  <option value="planned">Planned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </FF>
            </div>

            <FF label="Clinical Notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full p-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 resize-none"
                placeholder="Diagnosis, procedure details, observations…"
              />
            </FF>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAdd}
                disabled={saving || !form.patientName || !form.treatmentName}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Treatment"}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm hover:bg-navy/5 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
