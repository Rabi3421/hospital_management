"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type TreatmentStatus = "planned" | "ongoing" | "completed";

interface Treatment {
  id: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  treatmentName: string;
  toothNumbers: string;
  date: string;
  doctor: string;
  cost: number;
  status: TreatmentStatus;
  notes: string;
  followUpDate?: string;
}

// ─── Seed data ─────────────────────────────────────────────────────────────
const MOCK_TREATMENTS: Treatment[] = [
  {
    id: "t1",
    patientName: "Avnish Kumar",
    patientId: "p1",
    patientAge: 32,
    treatmentName: "Composite Filling",
    toothNumbers: "#14",
    date: "2026-02-27",
    doctor: "Dr. Sarah Johnson",
    cost: 1500,
    status: "completed",
    notes: "Class II composite filling. Patient tolerated procedure well.",
    followUpDate: "2026-03-15",
  },
  {
    id: "t2",
    patientName: "Avnish Kumar",
    patientId: "p1",
    patientAge: 32,
    treatmentName: "Ultrasonic Scaling",
    toothNumbers: "Full Mouth",
    date: "2026-03-05",
    doctor: "Dr. Sarah Johnson",
    cost: 800,
    status: "planned",
    notes: "Full mouth scaling scheduled post-filling review.",
  },
  {
    id: "t3",
    patientName: "Priya Sharma",
    patientId: "p2",
    patientAge: 28,
    treatmentName: "Root Canal Treatment",
    toothNumbers: "#26",
    date: "2026-01-15",
    doctor: "Dr. Michael Chen",
    cost: 8500,
    status: "completed",
    notes: "3-canal RCT. Obturation completed. Temporary crown placed.",
    followUpDate: "2026-02-01",
  },
  {
    id: "t4",
    patientName: "Priya Sharma",
    patientId: "p2",
    patientAge: 28,
    treatmentName: "Ceramic Crown",
    toothNumbers: "#26",
    date: "2026-02-01",
    doctor: "Dr. Michael Chen",
    cost: 6000,
    status: "completed",
    notes: "E-max ceramic crown cemented. Occlusion checked.",
  },
  {
    id: "t5",
    patientName: "Rahul Mehta",
    patientId: "p3",
    patientAge: 45,
    treatmentName: "Braces (Orthodontic)",
    toothNumbers: "Full Arch",
    date: "2026-02-10",
    doctor: "Dr. Anika Patel",
    cost: 35000,
    status: "ongoing",
    notes: "Metal braces upper + lower arch. Wire adjustment monthly.",
    followUpDate: "2026-03-10",
  },
  {
    id: "t6",
    patientName: "Sneha Reddy",
    patientId: "p4",
    patientAge: 35,
    treatmentName: "Tooth Extraction",
    toothNumbers: "#28",
    date: "2026-03-01",
    doctor: "Dr. Sarah Johnson",
    cost: 1200,
    status: "completed",
    notes: "Wisdom tooth extraction. Socket packed. Prescribed antibiotics.",
    followUpDate: "2026-03-08",
  },
  {
    id: "t7",
    patientName: "Kiran Das",
    patientId: "p5",
    patientAge: 22,
    treatmentName: "Teeth Whitening",
    toothNumbers: "Front 12",
    date: "2026-03-08",
    doctor: "Dr. Anika Patel",
    cost: 4500,
    status: "planned",
    notes: "LED whitening session planned. Pre-check for sensitivity.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
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
  patientAge: "",
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
  const [treatments, setTreatments] = useState<Treatment[]>(MOCK_TREATMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | "all">("all");
  const [selected, setSelected] = useState<Treatment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Filters
  const filtered = treatments.filter((t) => {
    const matchSearch =
      t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.treatmentName.toLowerCase().includes(search.toLowerCase()) ||
      t.doctor.toLowerCase().includes(search.toLowerCase()) ||
      t.toothNumbers.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: treatments.length,
    planned: treatments.filter((t) => t.status === "planned").length,
    ongoing: treatments.filter((t) => t.status === "ongoing").length,
    completed: treatments.filter((t) => t.status === "completed").length,
  };

  const handleAdd = () => {
    if (!form.patientName || !form.treatmentName) return;
    const newT: Treatment = {
      id: `t${Date.now()}`,
      patientName: form.patientName,
      patientId: `p${Date.now()}`,
      patientAge: Number(form.patientAge) || 0,
      treatmentName: form.treatmentName,
      toothNumbers: form.toothNumbers,
      date: form.date,
      doctor: form.doctor,
      cost: Number(form.cost) || 0,
      status: form.status,
      notes: form.notes,
      followUpDate: form.followUpDate || undefined,
    };
    setTreatments((prev) => [newT, ...prev]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
  };

  const updateStatus = (id: string, status: TreatmentStatus) => {
    setTreatments((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : prev));
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">No treatments found.</div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <span className="font-fraunces text-[10px] font-bold text-gold">{initials(t.patientName)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{t.treatmentName}</p>
                      <p className="text-navy/40 text-xs">{t.patientName} · {t.patientAge}y</p>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-navy/40 text-sm py-10">No treatments found.</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-navy/[0.015] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                          <span className="font-fraunces text-[10px] font-bold text-gold">{initials(t.patientName)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{t.patientName}</p>
                          <p className="text-navy/40 text-xs">{t.patientAge}y</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-navy font-medium">{t.treatmentName}</td>
                    <td className="px-4 py-4 text-navy/60">{t.toothNumbers}</td>
                    <td className="px-4 py-4 text-navy/70">{t.doctor}</td>
                    <td className="px-4 py-4 text-navy/60">{fmtDate(t.date)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-navy">₹{t.cost.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[t.status].style}`}>
                        {STATUS_META[t.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(t)}
                        className="text-xs text-gold font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <p className="text-navy/40 text-xs">{selected.patientName} · {selected.patientAge}y</p>
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
                    onClick={() => updateStatus(selected.id, s)}
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
              <FF label="Patient Age">
                <input type="number" value={form.patientAge} onChange={(e) => setForm((p) => ({ ...p, patientAge: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Age" />
              </FF>
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
                disabled={!form.patientName || !form.treatmentName}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                Save Treatment
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
