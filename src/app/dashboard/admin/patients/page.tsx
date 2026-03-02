"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  bloodType: string;
  allergies: string;
  currentMedications: string;
  medicalConditions: string;
  insuranceProvider: string;
  insuranceId: string;
  emergencyContact: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const fmtDate = (d: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientManagementPage() {
  const { accessToken } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const LIMIT = 15;

  const [selected, setSelected] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "medical" | "insurance">("profile");
  const [modal, setModal] = useState<"view" | "toggle" | null>(null);
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

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: "user",
        search: debouncedSearch,
        page: String(page),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/users?${params}`, { headers: headers(), credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setPatients(json.data.users);
        setTotal(json.data.total);
        setPages(json.data.pages);
      }
    } finally { setLoading(false); }
  }, [headers, debouncedSearch, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const toggleActive = async (patient: Patient) => {
    try {
      const res = await fetch(`/api/admin/users/${patient._id}`, {
        method: "PATCH",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ isActive: !patient.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "ok", msg: `Patient ${!patient.isActive ? "activated" : "deactivated"}.` });
        fetchPatients();
        if (selected?._id === patient._id) setSelected(json.data);
      } else {
        setFeedback({ type: "err", msg: json.error ?? "Action failed." });
      }
    } catch {
      setFeedback({ type: "err", msg: "Network error." });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const TABS = [
    { key: "profile" as const, label: "Profile" },
    { key: "medical" as const, label: "Medical" },
    { key: "insurance" as const, label: "Insurance" },
  ];

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {feedback.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
              Patient Management
            </h1>
            <p className="text-navy/50 text-sm mt-1">
              View and manage all registered patients.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Patients", value: loading ? "—" : total },
            { label: "Active", value: loading ? "—" : patients.filter((p) => p.isActive).length },
            { label: "Inactive", value: loading ? "—" : patients.filter((p) => !p.isActive).length },
            { label: "Page", value: loading ? "—" : `${page} / ${pages}` },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xl sm:text-2xl font-fraunces font-bold text-navy">{value}</p>
              <p className="text-navy/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

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
            <button onClick={() => setSearch("")} className="text-navy/30 hover:text-navy">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">Loading patients…</div>
        ) : (
          <div className="flex gap-4 flex-col xl:flex-row">
            {/* Patient list */}
            <div className={`glass-card rounded-2xl overflow-hidden ${selected ? "xl:w-80 flex-shrink-0" : "flex-1"}`}>
              {patients.length === 0 ? (
                <div className="p-10 text-center text-navy/40 text-sm">No patients found.</div>
              ) : (
                <div className="divide-y divide-navy/5">
                  {patients.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => { setSelected(p); setActiveTab("profile"); }}
                      className={`w-full text-left px-4 py-4 hover:bg-navy/[0.02] transition-colors ${selected?._id === p._id ? "bg-gold/5 border-l-2 border-gold" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                          <span className="font-fraunces text-xs font-bold text-gold">{initials(p.name)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-navy text-sm truncate">{p.name}</p>
                            <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {p.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-navy/40 text-xs truncate">{p.email}</p>
                          <p className="text-navy/30 text-xs truncate">{p.phone || "No phone"}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="p-3 border-t border-navy/5 flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy/5 text-navy/60 disabled:opacity-30 hover:bg-navy/10 transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-navy/40">{page} / {pages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy/5 text-navy/60 disabled:opacity-30 hover:bg-navy/10 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Patient detail panel */}
            {selected && (
              <div className="flex-1 min-w-0 glass-card rounded-2xl overflow-hidden">
                {/* Detail header */}
                <div className="p-5 border-b border-navy/8 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <span className="font-fraunces text-base font-bold text-gold">{initials(selected.name)}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-fraunces text-lg font-bold text-navy truncate">{selected.name}</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-navy/50 text-xs">{selected.email}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${selected.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {selected.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(selected)}
                      className="px-3 py-1.5 rounded-xl border border-navy/15 text-navy/60 text-xs font-medium hover:bg-navy/5 transition-colors"
                    >
                      {selected.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/40"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto border-b border-navy/8">
                  {TABS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 -mb-px ${
                        activeTab === key
                          ? "border-gold text-gold"
                          : "border-transparent text-navy/50 hover:text-navy"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* ── Profile Tab ── */}
                  {activeTab === "profile" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Phone", value: selected.phone },
                        { label: "Email", value: selected.email },
                        { label: "Gender", value: selected.gender ? selected.gender.charAt(0).toUpperCase() + selected.gender.slice(1) : "—" },
                        { label: "Date of Birth", value: fmtDate(selected.dob) },
                        { label: "Blood Type", value: selected.bloodType },
                        { label: "Registered", value: fmtDate(selected.createdAt) },
                        { label: "Emergency Contact", value: selected.emergencyContact },
                        { label: "Address", value: selected.address },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-navy/[0.03] rounded-xl p-3">
                          <p className="text-navy/40 text-xs mb-1">{label}</p>
                          <p className="text-navy font-medium text-sm">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Medical Tab ── */}
                  {activeTab === "medical" && (
                    <div className="space-y-3">
                      {[
                        { label: "Allergies", value: selected.allergies },
                        { label: "Current Medications", value: selected.currentMedications },
                        { label: "Medical Conditions", value: selected.medicalConditions },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-navy/[0.03] rounded-xl p-4">
                          <p className="text-navy/40 text-xs mb-2">{label}</p>
                          <p className="text-navy font-medium text-sm leading-relaxed">{value || "None recorded"}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Insurance Tab ── */}
                  {activeTab === "insurance" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-navy/[0.03] rounded-xl p-3">
                          <p className="text-navy/40 text-xs mb-1">Insurance Provider</p>
                          <p className="text-navy font-medium text-sm">{selected.insuranceProvider || "—"}</p>
                        </div>
                        <div className="bg-navy/[0.03] rounded-xl p-3">
                          <p className="text-navy/40 text-xs mb-1">Insurance ID</p>
                          <p className="text-navy font-medium text-sm">{selected.insuranceId || "—"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

