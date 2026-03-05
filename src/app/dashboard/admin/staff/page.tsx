"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const ALL_DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification: string;
  phone: string;
  email: string;
  department: string;
  experience: number;
  bio: string;
  avatar: string;
  isActive: boolean;
  availableDays: Day[];
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
  description: string;
  head: string;
  doctorCount: number;
  isActive: boolean;
  icon: string;
}

type DoctorForm = {
  name: string; specialty: string; qualification: string; phone: string;
  email: string; department: string; experience: string; bio: string;
  avatar: string; availableDays: Day[];
};

type DeptForm = {
  name: string; description: string; head: string;
  doctorCount: number; icon: string; isActive: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_OPTIONS = ["👨‍⚕️", "👩‍⚕️", "🧑‍⚕️", "��‍🔬", "👩‍🔬", "🩺"];
const ICON_OPTIONS   = ["🦷", "😁", "🔬", "👶", "✨", "🩺", "🏥", "💊", "🫀", "🧬"];
const SPECIALTIES    = [
  "General Dentistry", "Orthodontics", "Oral Surgery", "Pediatric Dentistry",
  "Cosmetic Dentistry", "Periodontics", "Endodontics", "Implantology",
  "Prosthodontics", "Oral Medicine",
];

const EMPTY_DOC: DoctorForm = {
  name: "", specialty: "", qualification: "", phone: "", email: "",
  department: "", experience: "", bio: "", avatar: "👨‍⚕️",
  availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
};
const EMPTY_DEPT: DeptForm = {
  name: "", description: "", head: "", doctorCount: 0, icon: "🦷", isActive: true,
};

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700", "bg-green-100 text-green-700",
  "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700",
];
const avatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

// ─── Shared input style ───────────────────────────────────────────────────────
const INPUT = "w-full px-4 py-2.5 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all";

function FF({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Top-level tab type ────────────────────────────────────────────────────────
type MainTab = "departments" | "doctors";

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function StaffManagementPage() {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<MainTab>("departments");

  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDoc, setLoadingDoc]   = useState(true);
  const [loadingDept, setLoadingDept] = useState(true);
  const [feedback, setFeedback]       = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }), [accessToken]);

  const flash = useCallback((type: "ok" | "err", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoadingDoc(true);
    try {
      const res  = await fetch("/api/admin/doctors", { headers: headers(), credentials: "include" });
      const json = await res.json();
      if (json.success) setDoctors(json.data);
    } finally { setLoadingDoc(false); }
  }, [headers]);

  const fetchDepts = useCallback(async () => {
    setLoadingDept(true);
    try {
      const res  = await fetch("/api/admin/departments", { headers: headers(), credentials: "include" });
      const json = await res.json();
      if (json.success) setDepartments(json.data);
    } finally { setLoadingDept(false); }
  }, [headers]);

  useEffect(() => { fetchDoctors(); fetchDepts(); }, [fetchDoctors, fetchDepts]);

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Staff &amp; Departments</h1>
          <p className="text-navy/50 text-sm mt-1">Manage your clinic departments and the doctors assigned to each.</p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${feedback.type === "ok" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {feedback.msg}
          </div>
        )}

        {/* Main tab switcher */}
        <div className="flex gap-1 mb-6 bg-navy/[0.04] p-1 rounded-xl w-fit">
          {([["departments", "🏥  Departments", departments.length], ["doctors", "👨‍⚕️  Doctors", doctors.length]] as [MainTab, string, number][]).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab === key ? "bg-white shadow-sm text-navy" : "text-navy/50 hover:text-navy"}`}
            >
              {label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === key ? "bg-navy/10 text-navy" : "bg-navy/8 text-navy/40"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Departments tab */}
        {tab === "departments" && (
          <DepartmentsTab
            departments={departments}
            doctors={doctors}
            loading={loadingDept}
            headers={headers}
            flash={flash}
            onRefresh={fetchDepts}
          />
        )}

        {/* Doctors tab */}
        {tab === "doctors" && (
          <DoctorsTab
            doctors={doctors}
            departments={departments}
            loading={loadingDoc}
            headers={headers}
            flash={flash}
            onRefresh={fetchDoctors}
          />
        )}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function DepartmentsTab({
  departments, doctors, loading, headers, flash, onRefresh,
}: {
  departments: Department[];
  doctors: Doctor[];
  loading: boolean;
  headers: () => Record<string, string>;
  flash: (t: "ok" | "err", m: string) => void;
  onRefresh: () => void;
}) {
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState<"create" | "edit" | null>(null);
  const [selected, setSelected]     = useState<Department | null>(null);
  const [form, setForm]             = useState<DeptForm>(EMPTY_DEPT);
  const [saving, setSaving]         = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  const deptDoctors = (deptName: string) =>
    doctors.filter((doc) => doc.department?.toLowerCase() === deptName.toLowerCase());

  const openCreate = () => { setForm(EMPTY_DEPT); setSelected(null); setModal("create"); };
  const openEdit   = (d: Department) => {
    setSelected(d);
    setForm({ name: d.name, description: d.description, head: d.head, doctorCount: d.doctorCount, icon: d.icon, isActive: d.isActive });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { flash("err", "Department name is required."); return; }
    setSaving(true);
    try {
      const url    = modal === "create" ? "/api/admin/departments" : `/api/admin/departments/${selected?._id}`;
      const method = modal === "create" ? "POST" : "PATCH";
      const res    = await fetch(url, { method, headers: headers(), credentials: "include", body: JSON.stringify(form) });
      const json   = await res.json();
      if (json.success) {
        flash("ok", modal === "create" ? "Department created." : "Department updated.");
        setModal(null);
        onRefresh();
      } else flash("err", json.error ?? "Failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (d: Department) => {
    if (!confirm(`Delete department "${d.name}"?`)) return;
    const res  = await fetch(`/api/admin/departments/${d._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
    const json = await res.json();
    if (json.success) { flash("ok", "Department deleted."); onRefresh(); }
    else flash("err", json.error ?? "Failed.");
  };

  const toggleActive = async (d: Department) => {
    const res  = await fetch(`/api/admin/departments/${d._id}`, { method: "PATCH", headers: headers(), credentials: "include", body: JSON.stringify({ isActive: !d.isActive }) });
    const json = await res.json();
    if (json.success) onRefresh();
  };

  const stats = [
    { label: "Total Depts", value: departments.length },
    { label: "Active", value: departments.filter((d) => d.isActive).length },
    { label: "Total Doctors", value: doctors.length },
    { label: "Specialties", value: new Set(doctors.map((d) => d.specialty)).size },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {stats.map(({ label, value }) => (
          <div key={label} className="glass-card rounded-2xl p-4 text-center">
            <p className="text-xl sm:text-2xl font-fraunces font-bold text-navy">{loading ? "—" : value}</p>
            <p className="text-navy/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3 flex-1">
          <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
          </svg>
          <input type="text" placeholder="Search departments or head doctors…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30" />
          {search && <button onClick={() => setSearch("")} className="text-navy/30 hover:text-navy"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
        </div>
        <button onClick={openCreate} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Department
        </button>
      </div>

      {/* Cards */}
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
        <div className="glass-card rounded-2xl p-12 text-center text-navy/40 text-sm">
          {search ? "No departments match your search." : "No departments yet — add one above."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const ddocs    = deptDoctors(d.name);
            const expanded = expandedId === d._id;
            return (
              <div key={d._id} className={`glass-card rounded-2xl overflow-hidden flex flex-col transition-all ${!d.isActive ? "opacity-60" : ""}`}>
                {/* Top */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">{d.icon}</div>
                    <button onClick={() => toggleActive(d)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${d.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                      {d.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <h3 className="font-fraunces font-bold text-navy text-lg leading-tight">{d.name}</h3>
                  <p className="text-navy/50 text-xs mt-1 leading-relaxed line-clamp-2">{d.description || "No description."}</p>
                  <div className="mt-4 pt-4 border-t border-navy/8 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-navy/40 uppercase tracking-wide">Head Doctor</p>
                      <p className="text-sm font-semibold text-navy mt-0.5">{d.head || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-navy/40 uppercase tracking-wide">Doctors</p>
                      <p className="text-sm font-bold text-navy mt-0.5">{ddocs.length > 0 ? ddocs.length : d.doctorCount}</p>
                    </div>
                  </div>
                </div>

                {/* Expandable doctor list */}
                {ddocs.length > 0 && (
                  <div className="border-t border-navy/8">
                    <button onClick={() => setExpandedId(expanded ? null : d._id)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-navy/50 hover:text-navy hover:bg-navy/[0.02] transition-colors">
                      <span>{expanded ? "Hide" : "Show"} {ddocs.length} doctor{ddocs.length !== 1 ? "s" : ""}</span>
                      <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expanded && (
                      <div className="divide-y divide-navy/5">
                        {ddocs.map((doc) => (
                          <div key={doc._id} className="flex items-center gap-3 px-5 py-2.5 bg-navy/[0.02]">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(doc._id)}`}>
                              {doc.avatar || doc.name.replace(/^Dr\.\s*/i, "").split(" ").map((x) => x[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-navy truncate">{doc.name}</p>
                              <p className="text-[10px] text-navy/40 truncate">{doc.specialty}</p>
                            </div>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${doc.isActive ? "bg-green-500" : "bg-red-400"}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 px-5 py-3 border-t border-navy/8">
                  <button onClick={() => openEdit(d)} className="flex-1 py-2 rounded-xl border border-navy/15 text-navy text-xs font-medium hover:bg-navy/5 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(d)} className="px-3 py-2 rounded-xl hover:bg-red-50 text-navy/30 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModal(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 hover:text-navy">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-fraunces text-xl font-bold text-navy mb-5">{modal === "create" ? "Add Department" : "Edit Department"}</h2>

            {/* Icon picker */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Icon</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button key={icon} type="button" onClick={() => setForm((p) => ({ ...p, icon }))}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === icon ? "bg-gold/20 border-2 border-gold" : "bg-navy/5 border-2 border-transparent hover:bg-navy/10"}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <FF label="Department Name *">
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={INPUT} placeholder="e.g. Orthodontics" />
              </FF>
              <FF label="Description">
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className={INPUT + " resize-none"} placeholder="Brief description…" />
              </FF>
              <FF label="Head Doctor">
                <select value={form.head} onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))} className={INPUT}>
                  <option value="">— Select a doctor —</option>
                  {doctors.map((d) => <option key={d._id} value={d.name}>{d.avatar} {d.name} — {d.specialty}</option>)}
                </select>
              </FF>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider">Status</p>
                  <p className="text-xs text-navy/35 mt-0.5">{form.isActive ? "Visible & active" : "Hidden from listings"}</p>
                </div>
                <button type="button" onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.isActive ? "bg-gold" : "bg-navy/20"}`}>
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
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCTORS TAB
// ══════════════════════════════════════════════════════════════════════════════
function DoctorsTab({
  doctors, departments, loading, headers, flash, onRefresh,
}: {
  doctors: Doctor[];
  departments: Department[];
  loading: boolean;
  headers: () => Record<string, string>;
  flash: (t: "ok" | "err", m: string) => void;
  onRefresh: () => void;
}) {
  const [search, setSearch]       = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selected, setSelected]   = useState<Doctor | null>(null);
  const [detailTab, setDetailTab] = useState<"profile" | "schedule">("profile");
  const [editMode, setEditMode]   = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState<DoctorForm>(EMPTY_DOC);
  const [saving, setSaving]       = useState(false);

  const toggleDay = (day: Day) =>
    setForm((p) => ({
      ...p,
      availableDays: p.availableDays.includes(day)
        ? p.availableDays.filter((d) => d !== day)
        : [...p.availableDays, day],
    }));

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.department.toLowerCase().includes(q)) &&
      (deptFilter ? d.department?.toLowerCase() === deptFilter.toLowerCase() : true)
    );
  });

  const deptOptions = Array.from(new Set(doctors.map((d) => d.department).filter(Boolean)));

  const stats = [
    { label: "Total Doctors", value: doctors.length },
    { label: "Active", value: doctors.filter((d) => d.isActive).length },
    { label: "Inactive", value: doctors.filter((d) => !d.isActive).length },
    { label: "Specialties", value: new Set(doctors.map((d) => d.specialty)).size },
  ];

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/doctors", { method: "POST", headers: headers(), credentials: "include", body: JSON.stringify({ ...form, experience: Number(form.experience) || 0, isActive: true }) });
      const json = await res.json();
      if (json.success) { flash("ok", "Doctor added."); setForm(EMPTY_DOC); setShowAdd(false); onRefresh(); }
      else flash("err", json.error ?? "Failed to add doctor.");
    } finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    if (!selected || !form.name || !form.email) return;
    setSaving(true);
    try {
      const res  = await fetch(`/api/admin/doctors/${selected._id}`, { method: "PATCH", headers: headers(), credentials: "include", body: JSON.stringify({ ...form, experience: Number(form.experience) || 0 }) });
      const json = await res.json();
      if (json.success) { flash("ok", "Doctor updated."); setSelected(json.data); setEditMode(false); onRefresh(); }
      else flash("err", json.error ?? "Failed.");
    } finally { setSaving(false); }
  };

  const toggleActive = async (doctor: Doctor) => {
    const res  = await fetch(`/api/admin/doctors/${doctor._id}`, { method: "PATCH", headers: headers(), credentials: "include", body: JSON.stringify({ isActive: !doctor.isActive }) });
    const json = await res.json();
    if (json.success) { onRefresh(); if (selected?._id === doctor._id) setSelected(json.data); }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!confirm(`Delete ${doctor.name}?`)) return;
    await fetch(`/api/admin/doctors/${doctor._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
    setSelected(null);
    onRefresh();
  };

  const openEdit = (doctor: Doctor) => {
    setForm({ name: doctor.name, specialty: doctor.specialty, qualification: doctor.qualification, phone: doctor.phone, email: doctor.email, department: doctor.department, experience: String(doctor.experience), bio: doctor.bio, avatar: doctor.avatar, availableDays: [...(doctor.availableDays as Day[])] });
    setEditMode(true);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {stats.map(({ label, value }) => (
          <div key={label} className="glass-card rounded-2xl p-4 text-center">
            <p className="text-xl sm:text-2xl font-fraunces font-bold text-navy">{loading ? "—" : value}</p>
            <p className="text-navy/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3 flex-1">
          <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" /></svg>
          <input type="text" placeholder="Search by name, email, specialty…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30" />
          {search && <button onClick={() => setSearch("")} className="text-navy/30 hover:text-navy"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
        </div>
        {deptOptions.length > 0 && (
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="glass-card rounded-2xl px-4 py-3 text-sm text-navy bg-transparent outline-none border-0 appearance-none cursor-pointer">
            <option value="">All Departments</option>
            {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <button onClick={() => { setForm(EMPTY_DOC); setShowAdd(true); }} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Doctor
        </button>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm animate-pulse">Loading doctors…</div>
      ) : (
        <div className="flex gap-4 flex-col xl:flex-row">
          {/* List */}
          <div className={`glass-card rounded-2xl overflow-hidden ${selected ? "xl:w-80 flex-shrink-0" : "flex-1"}`}>
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-navy/40 text-sm">No doctors found.</div>
            ) : (
              <div className="divide-y divide-navy/5">
                {filtered.map((doc) => (
                  <button key={doc._id}
                    onClick={() => { setSelected(doc); setDetailTab("profile"); setEditMode(false); }}
                    className={`w-full text-left px-4 py-3.5 hover:bg-navy/[0.02] transition-colors ${selected?._id === doc._id ? "bg-gold/5 border-l-2 border-gold" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">{doc.avatar}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-navy text-sm truncate">{doc.name}</p>
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 flex-shrink-0">Doctor</span>
                        </div>
                        <p className="text-navy/40 text-xs truncate">{doc.specialty || doc.department || doc.email}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.isActive ? "bg-green-500" : "bg-red-400"}`} />
                          <span className="text-[10px] text-navy/40">{doc.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && !editMode && (
            <div className="flex-1 min-w-0 glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-navy/8 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center flex-shrink-0 text-3xl">{selected.avatar}</div>
                  <div className="min-w-0">
                    <h2 className="font-fraunces text-lg font-bold text-navy truncate">{selected.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">Doctor</span>
                      {selected.specialty && <span className="text-navy/50 text-xs">{selected.specialty}</span>}
                      <span className={`flex items-center gap-1 text-[10px] ${selected.isActive ? "text-green-600" : "text-red-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selected.isActive ? "bg-green-500" : "bg-red-400"}`} />
                        {selected.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <button onClick={() => openEdit(selected)} className="px-3 py-1.5 rounded-xl border border-navy/15 text-navy/60 text-xs font-medium hover:bg-navy/5">Edit</button>
                  <button onClick={() => toggleActive(selected)} className="px-3 py-1.5 rounded-xl border border-navy/15 text-navy/60 text-xs font-medium hover:bg-navy/5">{selected.isActive ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => handleDelete(selected)} className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50">Delete</button>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/40">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 px-4 pt-3 border-b border-navy/8">
                {(["profile", "schedule"] as const).map((k) => (
                  <button key={k} onClick={() => setDetailTab(k)}
                    className={`px-3 py-2 text-xs font-medium capitalize whitespace-nowrap rounded-t-lg border-b-2 -mb-px transition-colors ${detailTab === k ? "border-gold text-gold" : "border-transparent text-navy/50 hover:text-navy"}`}>
                    {k}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {detailTab === "profile" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: "Phone", value: selected.phone },
                        { label: "Email", value: selected.email },
                        { label: "Qualification", value: selected.qualification },
                        { label: "Department", value: selected.department },
                        { label: "Experience", value: selected.experience ? `${selected.experience} years` : "—" },
                        { label: "Joined", value: fmtDate(selected.createdAt) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-navy/[0.03] rounded-xl p-3">
                          <p className="text-navy/40 text-xs mb-1">{label}</p>
                          <p className="text-navy font-medium text-sm">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                    {selected.bio && (
                      <div className="bg-navy/[0.03] rounded-xl p-4">
                        <p className="text-navy/40 text-xs mb-2">About</p>
                        <p className="text-navy text-sm leading-relaxed">{selected.bio}</p>
                      </div>
                    )}
                  </div>
                )}
                {detailTab === "schedule" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Available Days</p>
                      <div className="flex gap-2 flex-wrap">
                        {ALL_DAYS.map((day) => (
                          <span key={day} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${selected.availableDays.includes(day) ? "bg-navy text-white" : "bg-navy/5 text-navy/30"}`}>{day}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {ALL_DAYS.map((day) => {
                        const ok = selected.availableDays.includes(day);
                        return (
                          <div key={day} className={`rounded-xl p-2 text-center ${ok ? "bg-navy/[0.03]" : "bg-navy/[0.015] opacity-50"}`}>
                            <p className="text-[10px] font-semibold text-navy/50 mb-1">{day}</p>
                            {ok ? <p className="text-xs font-bold text-green-600">✓</p> : <p className="text-xs text-navy/20">Off</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit panel */}
          {selected && editMode && (
            <div className="flex-1 min-w-0 glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-navy/8 flex items-center justify-between">
                <h2 className="font-fraunces text-lg font-bold text-navy">Edit Doctor</h2>
                <button onClick={() => setEditMode(false)} className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[70vh]">
                <DoctorFormFields form={form} setForm={setForm} toggleDay={toggleDay} departments={departments} />
                <div className="flex gap-3 mt-5">
                  <button onClick={handleEditSave} disabled={saving || !form.name || !form.email} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50">
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button onClick={() => setEditMode(false)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm hover:bg-navy/5">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-fraunces text-xl font-bold text-navy mb-1">Add Doctor</h2>
            <p className="text-navy/40 text-xs mb-5">Fill in the details to register a new doctor.</p>
            <DoctorFormFields form={form} setForm={setForm} toggleDay={toggleDay} departments={departments} />
            <div className="flex gap-3 mt-5">
              <button onClick={handleAdd} disabled={saving || !form.name || !form.email} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50">
                {saving ? "Adding…" : "Add Doctor"}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm hover:bg-navy/5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Shared Doctor form fields ────────────────────────────────────────────────
function DoctorFormFields({ form, setForm, toggleDay, departments }: {
  form: DoctorForm;
  setForm: React.Dispatch<React.SetStateAction<DoctorForm>>;
  toggleDay: (d: Day) => void;
  departments: Department[];
}) {
  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Avatar</p>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_OPTIONS.map((av) => (
            <button key={av} type="button" onClick={() => setForm((p) => ({ ...p, avatar: av }))}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-colors ${form.avatar === av ? "border-gold bg-gold/10" : "border-navy/10 hover:border-navy/30"}`}>
              {av}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FF label="Full Name *">
          <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={INPUT} placeholder="Dr. Full Name" />
        </FF>
        <FF label="Phone">
          <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={INPUT} placeholder="+91 XXXXXXXXXX" />
        </FF>
        <FF label="Email *" span2>
          <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={INPUT} placeholder="doctor@clinic.com" />
        </FF>
        <FF label="Qualification">
          <input type="text" value={form.qualification} onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} className={INPUT} placeholder="e.g. BDS, MDS" />
        </FF>
        <FF label="Experience (years)">
          <input type="number" min="0" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} className={INPUT} placeholder="e.g. 8" />
        </FF>
        <FF label="Specialty">
          <select value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} className={INPUT}>
            <option value="">Select specialty…</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FF>
        <FF label="Department">
          <select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className={INPUT}>
            <option value="">Select department…</option>
            {departments.map((d) => <option key={d._id} value={d.name}>{d.icon} {d.name}</option>)}
          </select>
        </FF>
      </div>

      {/* Available Days */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Available Days</p>
        <div className="flex gap-2 flex-wrap">
          {ALL_DAYS.map((day) => (
            <button key={day} type="button" onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${form.availableDays.includes(day) ? "bg-navy text-white" : "bg-navy/5 text-navy/50 hover:bg-navy/10"}`}>
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Bio / Notes</p>
        <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3}
          className={INPUT + " resize-none"} placeholder="Brief description, expertise or notes…" />
      </div>
    </div>
  );
}
