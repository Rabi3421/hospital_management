"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

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

type FormData = {
  name: string;
  specialty: string;
  qualification: string;
  phone: string;
  email: string;
  department: string;
  experience: string;
  bio: string;
  avatar: string;
  availableDays: Day[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const AVATAR_OPTIONS = ["👨‍⚕️", "👩‍⚕️", "🧑‍⚕️", "👨‍🔬", "👩‍🔬", "🩺"];

const SPECIALTIES = [
  "General Dentistry", "Orthodontics", "Oral Surgery", "Pediatric Dentistry",
  "Cosmetic Dentistry", "Periodontics", "Endodontics", "Implantology",
  "Prosthodontics", "Oral Medicine",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const initials = (n: string) =>
  n.replace(/^Dr\.\s*/i, "").split(" ").map((x) => x[0]).join("").toUpperCase().slice(0, 2);

const ROLE_META = {
  doctor: { label: "Doctor", style: "bg-blue-100 text-blue-700", bg: "bg-blue-50" },
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-green-100 text-green-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];

const avatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

// ─── Empty form ───────────────────────────────────────────────────────────────
const EMPTY_FORM: FormData = {
  name: "",
  specialty: "",
  qualification: "",
  phone: "",
  email: "",
  department: "",
  experience: "",
  bio: "",
  avatar: "👨‍⚕️",
  availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffManagementPage() {
  const { accessToken } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "schedule">("profile");
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }), [accessToken]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/doctors", { headers: headers(), credentials: "include" });
      const json = await res.json();
      if (json.success) setDoctors(json.data);
    } finally { setLoading(false); }
  }, [headers]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q)
    );
  });

  const activeCount = doctors.filter((d) => d.isActive).length;

  const DETAIL_TABS = [
    { key: "profile" as const, label: "Profile" },
    { key: "schedule" as const, label: "Schedule" },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleDay = (day: Day) => {
    setForm((p) => ({
      ...p,
      availableDays: p.availableDays.includes(day)
        ? p.availableDays.filter((d) => d !== day)
        : [...p.availableDays, day],
    }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          specialty: form.specialty,
          qualification: form.qualification,
          phone: form.phone,
          email: form.email,
          department: form.department,
          experience: Number(form.experience) || 0,
          bio: form.bio,
          avatar: form.avatar,
          availableDays: form.availableDays,
          isActive: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "ok", msg: "Doctor added successfully." });
        setForm(EMPTY_FORM);
        setShowAdd(false);
        fetchDoctors();
      } else {
        setFeedback({ type: "err", msg: json.error ?? "Failed to add doctor." });
      }
    } finally { setSaving(false); setTimeout(() => setFeedback(null), 4000); }
  };

  const handleEditSave = async () => {
    if (!selected || !form.name || !form.email) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/doctors/${selected._id}`, {
        method: "PATCH",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          specialty: form.specialty,
          qualification: form.qualification,
          phone: form.phone,
          email: form.email,
          department: form.department,
          experience: Number(form.experience) || 0,
          bio: form.bio,
          avatar: form.avatar,
          availableDays: form.availableDays,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "ok", msg: "Doctor updated successfully." });
        setSelected(json.data);
        setEditMode(false);
        fetchDoctors();
      } else {
        setFeedback({ type: "err", msg: json.error ?? "Failed to update doctor." });
      }
    } finally { setSaving(false); setTimeout(() => setFeedback(null), 4000); }
  };

  const toggleActive = async (doctor: Doctor) => {
    try {
      const res = await fetch(`/api/admin/doctors/${doctor._id}`, {
        method: "PATCH",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ isActive: !doctor.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        fetchDoctors();
        if (selected?._id === doctor._id) setSelected(json.data);
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!confirm(`Are you sure you want to delete ${doctor.name}?`)) return;
    try {
      await fetch(`/api/admin/doctors/${doctor._id}`, {
        method: "DELETE",
        headers: headers(),
        credentials: "include",
      });
      setSelected(null);
      fetchDoctors();
    } catch { /* silent */ }
  };

  const openEdit = (doctor: Doctor) => {
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      qualification: doctor.qualification,
      phone: doctor.phone,
      email: doctor.email,
      department: doctor.department,
      experience: String(doctor.experience),
      bio: doctor.bio,
      avatar: doctor.avatar,
      availableDays: [...(doctor.availableDays as Day[])],
    });
    setEditMode(true);
  };

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

        {/* ── Feedback ── */}
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {feedback.msg}
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
              Doctors &amp; Staff
            </h1>
            <p className="text-navy/50 text-sm mt-1">
              Manage doctors and their schedules.
            </p>
          </div>
          <button
            onClick={() => { setForm(EMPTY_FORM); setShowAdd(true); }}
            className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Doctor
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Doctors", value: loading ? "—" : doctors.length },
            { label: "Active", value: loading ? "—" : activeCount },
            { label: "Inactive", value: loading ? "—" : doctors.length - activeCount },
            { label: "Specialties", value: loading ? "—" : new Set(doctors.map((d) => d.specialty)).size },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xl sm:text-2xl font-fraunces font-bold text-navy">{value}</p>
              <p className="text-navy/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, specialty or department…"
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
        </div>

        {/* ── Main content: list + detail panel ── */}
        {loading ? (
          <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">Loading doctors…</div>
        ) : (
          <div className="flex gap-4 flex-col xl:flex-row">

            {/* Doctor list */}
            <div className={`glass-card rounded-2xl overflow-hidden ${selected ? "xl:w-80 flex-shrink-0" : "flex-1"}`}>
              {filtered.length === 0 ? (
                <div className="p-10 text-center text-navy/40 text-sm">No doctors found.</div>
              ) : (
                <div className="divide-y divide-navy/5">
                  {filtered.map((doctor) => (
                    <button
                      key={doctor._id}
                      onClick={() => { setSelected(doctor); setActiveTab("profile"); setEditMode(false); }}
                      className={`w-full text-left px-4 py-4 hover:bg-navy/[0.02] transition-colors ${
                        selected?._id === doctor._id ? "bg-gold/5 border-l-2 border-gold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-fraunces text-lg`}>
                          {doctor.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-navy text-sm truncate">{doctor.name}</p>
                            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                              Doctor
                            </span>
                          </div>
                          <p className="text-navy/40 text-xs truncate">
                            {doctor.specialty || doctor.department || doctor.email}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${doctor.isActive ? "bg-green-500" : "bg-red-400"}`} />
                            <span className="text-[10px] text-navy/40">{doctor.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Detail Panel ── */}
            {selected && !editMode && (
              <div className="flex-1 min-w-0 glass-card rounded-2xl overflow-hidden">

                {/* Detail header */}
                <div className="p-5 border-b border-navy/8 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center flex-shrink-0 text-3xl">
                      {selected.avatar}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-fraunces text-lg font-bold text-navy truncate">{selected.name}</h2>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                          Doctor
                        </span>
                        {selected.specialty && (
                          <span className="text-navy/50 text-xs">{selected.specialty}</span>
                        )}
                        <span className={`flex items-center gap-1 text-[10px] ${selected.isActive ? "text-green-600" : "text-red-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selected.isActive ? "bg-green-500" : "bg-red-400"}`} />
                          {selected.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(selected)}
                      className="px-3 py-1.5 rounded-xl border border-navy/15 text-navy/60 text-xs font-medium hover:bg-navy/5 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(selected)}
                      className="px-3 py-1.5 rounded-xl border border-navy/15 text-navy/60 text-xs font-medium hover:bg-navy/5 transition-colors"
                    >
                      {selected.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(selected)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                      Delete
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
                <div className="flex gap-1 px-4 pt-3 overflow-x-auto border-b border-navy/8">
                  {DETAIL_TABS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 -mb-px ${
                        activeTab === key ? "border-gold text-gold" : "border-transparent text-navy/50 hover:text-navy"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-5">

                  {/* ── Profile Tab ── */}
                  {activeTab === "profile" && (
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

                  {/* ── Schedule Tab ── */}
                  {activeTab === "schedule" && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Available Days</p>
                        <div className="flex gap-2 flex-wrap">
                          {ALL_DAYS.map((day) => (
                            <span
                              key={day}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                selected.availableDays.includes(day)
                                  ? "bg-navy text-white"
                                  : "bg-navy/5 text-navy/30"
                              }`}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Weekly Overview</p>
                        <div className="grid grid-cols-7 gap-1">
                          {ALL_DAYS.map((day) => {
                            const available = selected.availableDays.includes(day);
                            return (
                              <div key={day} className={`rounded-xl p-2 text-center ${available ? "bg-navy/[0.03]" : "bg-navy/[0.015] opacity-50"}`}>
                                <p className="text-[10px] font-semibold text-navy/50 mb-1">{day}</p>
                                {available ? (
                                  <p className="text-xs font-bold text-green-600">✓</p>
                                ) : (
                                  <p className="text-xs text-navy/20">Off</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Edit Panel ── */}
            {selected && editMode && (
              <div className="flex-1 min-w-0 glass-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-navy/8 flex items-center justify-between">
                  <h2 className="font-fraunces text-lg font-bold text-navy">Edit Doctor</h2>
                  <button onClick={() => setEditMode(false)} className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/40">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-5 overflow-y-auto max-h-[70vh]">
                  <DoctorForm form={form} setForm={setForm} toggleDay={toggleDay} />
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleEditSave}
                      disabled={saving || !form.name || !form.email}
                      className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={() => setEditMode(false)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm hover:bg-navy/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Add Doctor Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-fraunces text-xl font-bold text-navy mb-1">Add Doctor</h2>
            <p className="text-navy/40 text-xs mb-5">Fill in the details to register a new doctor.</p>
            <DoctorForm form={form} setForm={setForm} toggleDay={toggleDay} />
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAdd}
                disabled={saving || !form.name || !form.email}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Adding…" : "Add Doctor"}
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

// ─── Doctor Form Component ────────────────────────────────────────────────────
function DoctorForm({
  form,
  setForm,
  toggleDay,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  toggleDay: (day: Day) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Avatar picker */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Avatar</p>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_OPTIONS.map((av) => (
            <button
              key={av}
              type="button"
              onClick={() => setForm((p) => ({ ...p, avatar: av }))}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-colors ${
                form.avatar === av ? "border-gold bg-gold/10" : "border-navy/10 hover:border-navy/30"
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Basic Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FF label="Full Name *">
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Dr. Full Name" />
          </FF>
          <FF label="Phone">
            <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="+91 XXXXXXXXXX" />
          </FF>
          <div className="sm:col-span-2">
            <FF label="Email *">
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="doctor@dentalcare.com" />
            </FF>
          </div>
          <FF label="Qualification">
            <input type="text" value={form.qualification} onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. BDS, MDS" />
          </FF>
          <FF label="Experience (years)">
            <input type="number" min="0" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. 8" />
          </FF>
          <FF label="Specialty">
            <select value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} className="form-input py-2.5 text-sm">
              <option value="">Select specialty…</option>
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FF>
          <FF label="Department">
            <input type="text" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. Orthodontics" />
          </FF>
        </div>
      </div>

      {/* Available Days */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Available Days</p>
        <div className="flex gap-2 flex-wrap">
          {ALL_DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                form.availableDays.includes(day) ? "bg-navy text-white" : "bg-navy/5 text-navy/50 hover:bg-navy/10"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Bio / Notes</p>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          rows={3}
          className="w-full p-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 resize-none"
          placeholder="Brief description, expertise or notes…"
        />
      </div>
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
