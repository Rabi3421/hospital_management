"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type StaffRole = "doctor" | "receptionist" | "assistant";
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

interface AssignedAppointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  service: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  specialization?: string; // doctors only
  qualification?: string;
  phone: string;
  email: string;
  joinedOn: string;
  isActive: boolean;
  availableDays: Day[];
  availableFrom: string; // "09:00"
  availableTo: string;   // "18:00"
  appointments: AssignedAppointment[]; // doctors only
  bio?: string;
  photo?: string;
}

type FormData = {
  name: string;
  role: StaffRole;
  specialization: string;
  qualification: string;
  phone: string;
  email: string;
  availableDays: Day[];
  availableFrom: string;
  availableTo: string;
  bio: string;
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const ALL_DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MOCK_STAFF: StaffMember[] = [
  {
    id: "s1",
    name: "Dr. Sarah Johnson",
    role: "doctor",
    specialization: "General Dentistry",
    qualification: "BDS, MDS (Oral Medicine)",
    phone: "+91 9876501234",
    email: "sarah.johnson@dentalcare.com",
    joinedOn: "2022-06-01",
    isActive: true,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availableFrom: "09:00",
    availableTo: "18:00",
    bio: "Dr. Sarah has over 8 years of experience in general dentistry and oral medicine. She specialises in restorative treatments and patient-friendly consultations.",
    appointments: [
      { id: "a1", patientName: "Avnish Kumar", date: "2026-03-02", time: "10:00 AM", service: "Filling", status: "confirmed" },
      { id: "a2", patientName: "Sneha Reddy", date: "2026-03-02", time: "11:30 AM", service: "Scaling", status: "confirmed" },
      { id: "a3", patientName: "Kiran Das", date: "2026-03-03", time: "09:30 AM", service: "Consultation", status: "pending" },
    ],
  },
  {
    id: "s2",
    name: "Dr. Michael Chen",
    role: "doctor",
    specialization: "Endodontics (Root Canal)",
    qualification: "BDS, MDS (Endodontics)",
    phone: "+91 9876502345",
    email: "michael.chen@dentalcare.com",
    joinedOn: "2021-03-15",
    isActive: true,
    availableDays: ["Mon", "Wed", "Fri", "Sat"],
    availableFrom: "10:00",
    availableTo: "17:00",
    bio: "Dr. Michael is a specialist in root canal treatments with a painless approach. He has performed over 3,000 successful RCT procedures.",
    appointments: [
      { id: "a4", patientName: "Priya Sharma", date: "2026-03-02", time: "02:00 PM", service: "RCT Follow-up", status: "confirmed" },
      { id: "a5", patientName: "Rahul Mehta", date: "2026-03-04", time: "11:00 AM", service: "Root Canal", status: "pending" },
    ],
  },
  {
    id: "s3",
    name: "Dr. Anika Patel",
    role: "doctor",
    specialization: "Orthodontics",
    qualification: "BDS, MDS (Orthodontics)",
    phone: "+91 9876503456",
    email: "anika.patel@dentalcare.com",
    joinedOn: "2023-01-10",
    isActive: true,
    availableDays: ["Tue", "Thu", "Sat"],
    availableFrom: "09:00",
    availableTo: "16:00",
    bio: "Dr. Anika specialises in braces, aligners and jaw correction. She brings a meticulous eye for alignment and aesthetic outcomes.",
    appointments: [
      { id: "a6", patientName: "Kiran Das", date: "2026-03-04", time: "10:30 AM", service: "Braces Adjustment", status: "confirmed" },
    ],
  },
  {
    id: "s4",
    name: "Meena Nair",
    role: "receptionist",
    qualification: "B.Com, Diploma in Healthcare Management",
    phone: "+91 9876504567",
    email: "meena.nair@dentalcare.com",
    joinedOn: "2023-07-20",
    isActive: true,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    availableFrom: "08:30",
    availableTo: "17:30",
    bio: "Meena handles front-desk operations, appointment scheduling, and patient coordination with exceptional efficiency.",
    appointments: [],
  },
  {
    id: "s5",
    name: "Raj Sharma",
    role: "receptionist",
    qualification: "BBA",
    phone: "+91 9876505678",
    email: "raj.sharma@dentalcare.com",
    joinedOn: "2024-02-01",
    isActive: true,
    availableDays: ["Mon", "Wed", "Thu", "Fri", "Sat"],
    availableFrom: "09:00",
    availableTo: "18:00",
    bio: "Raj manages billing queries, insurance claims follow-ups and patient communication.",
    appointments: [],
  },
  {
    id: "s6",
    name: "Divya Krishnan",
    role: "assistant",
    qualification: "Diploma in Dental Assisting",
    phone: "+91 9876506789",
    email: "divya.k@dentalcare.com",
    joinedOn: "2023-09-15",
    isActive: true,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availableFrom: "09:00",
    availableTo: "18:00",
    bio: "Divya assists dentists during procedures, sterilises instruments and prepares treatment rooms.",
    appointments: [],
  },
  {
    id: "s7",
    name: "Suresh Pillai",
    role: "assistant",
    qualification: "ITI Certificate, Dental Support",
    phone: "+91 9876507890",
    email: "suresh.p@dentalcare.com",
    joinedOn: "2024-05-01",
    isActive: false,
    availableDays: ["Mon", "Tue", "Thu", "Sat"],
    availableFrom: "08:00",
    availableTo: "16:00",
    bio: "Suresh handles patient seating, equipment prep and post-procedure cleanup.",
    appointments: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const initials = (n: string) =>
  n.replace(/^Dr\.\s*/i, "").split(" ").map((x) => x[0]).join("").toUpperCase().slice(0, 2);

const ROLE_META: Record<StaffRole, { label: string; style: string; bg: string }> = {
  doctor: { label: "Doctor", style: "bg-blue-100 text-blue-700", bg: "bg-blue-50" },
  receptionist: { label: "Receptionist", style: "bg-purple-100 text-purple-700", bg: "bg-purple-50" },
  assistant: { label: "Assistant", style: "bg-amber-100 text-amber-700", bg: "bg-amber-50" },
};

const APPT_STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-navy/10 text-navy/60",
  cancelled: "bg-red-100 text-red-600",
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
  role: "doctor",
  specialization: "",
  qualification: "",
  phone: "",
  email: "",
  availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  availableFrom: "09:00",
  availableTo: "18:00",
  bio: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "schedule" | "appointments">("profile");
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.specialization ?? "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const doctors = staff.filter((s) => s.role === "doctor");
  const receptionists = staff.filter((s) => s.role === "receptionist");
  const assistants = staff.filter((s) => s.role === "assistant");
  const activeCount = staff.filter((s) => s.isActive).length;

  const FILTER_TABS: { key: StaffRole | "all"; label: string }[] = [
    { key: "all", label: `All (${staff.length})` },
    { key: "doctor", label: `Doctors (${doctors.length})` },
    { key: "receptionist", label: `Receptionists (${receptionists.length})` },
    { key: "assistant", label: `Assistants (${assistants.length})` },
  ];

  const DETAIL_TABS = [
    { key: "profile" as const, label: "Profile" },
    { key: "schedule" as const, label: "Schedule" },
    ...(selected?.role === "doctor"
      ? [{ key: "appointments" as const, label: `Appointments (${selected.appointments.length})` }]
      : []),
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

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const newMember: StaffMember = {
      id: `s${Date.now()}`,
      name: form.name,
      role: form.role,
      specialization: form.role === "doctor" ? form.specialization : undefined,
      qualification: form.qualification,
      phone: form.phone,
      email: form.email,
      joinedOn: new Date().toISOString().slice(0, 10),
      isActive: true,
      availableDays: form.availableDays,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
      bio: form.bio,
      appointments: [],
    };
    setStaff((prev) => [newMember, ...prev]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
  };

  const handleEditSave = () => {
    if (!selected || !form.name || !form.email) return;
    const updated: StaffMember = {
      ...selected,
      name: form.name,
      role: form.role,
      specialization: form.role === "doctor" ? form.specialization : undefined,
      qualification: form.qualification,
      phone: form.phone,
      email: form.email,
      availableDays: form.availableDays,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
      bio: form.bio,
    };
    setStaff((prev) => prev.map((s) => (s.id === selected.id ? updated : s)));
    setSelected(updated);
    setEditMode(false);
  };

  const toggleActive = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    if (selected?.id === id)
      setSelected((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
  };

  const openEdit = (member: StaffMember) => {
    setForm({
      name: member.name,
      role: member.role,
      specialization: member.specialization ?? "",
      qualification: member.qualification ?? "",
      phone: member.phone,
      email: member.email,
      availableDays: [...member.availableDays],
      availableFrom: member.availableFrom,
      availableTo: member.availableTo,
      bio: member.bio ?? "",
    });
    setEditMode(true);
  };

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
              Doctors &amp; Staff
            </h1>
            <p className="text-navy/50 text-sm mt-1">
              Manage doctors, receptionists and assistants.
            </p>
          </div>
          <button
            onClick={() => { setForm(EMPTY_FORM); setShowAdd(true); }}
            className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Staff Member
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Staff", value: staff.length },
            { label: "Doctors", value: doctors.length },
            { label: "Support Staff", value: receptionists.length + assistants.length },
            { label: "Active Today", value: activeCount },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xl sm:text-2xl font-fraunces font-bold text-navy">{value}</p>
              <p className="text-navy/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or specialization…"
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
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  roleFilter === key ? "bg-navy text-white" : "bg-navy/5 text-navy/60 hover:bg-navy/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content: list + detail panel ── */}
        <div className="flex gap-4 flex-col xl:flex-row">

          {/* Staff list */}
          <div className={`glass-card rounded-2xl overflow-hidden ${selected ? "xl:w-80 flex-shrink-0" : "flex-1"}`}>
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-navy/40 text-sm">No staff members found.</div>
            ) : (
              <div className="divide-y divide-navy/5">
                {filtered.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => { setSelected(member); setActiveTab("profile"); setEditMode(false); }}
                    className={`w-full text-left px-4 py-4 hover:bg-navy/[0.02] transition-colors ${
                      selected?.id === member.id ? "bg-gold/5 border-l-2 border-gold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-fraunces text-xs font-bold ${avatarColor(member.id)}`}>
                        {initials(member.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-navy text-sm truncate">{member.name}</p>
                          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${ROLE_META[member.role].style}`}>
                            {ROLE_META[member.role].label}
                          </span>
                        </div>
                        <p className="text-navy/40 text-xs truncate">
                          {member.specialization || member.qualification || member.email}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${member.isActive ? "bg-green-500" : "bg-red-400"}`} />
                          <span className="text-[10px] text-navy/40">{member.isActive ? "Active" : "Inactive"}</span>
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
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-fraunces text-lg font-bold ${avatarColor(selected.id)}`}>
                    {initials(selected.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-fraunces text-lg font-bold text-navy truncate">{selected.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_META[selected.role].style}`}>
                        {ROLE_META[selected.role].label}
                      </span>
                      {selected.specialization && (
                        <span className="text-navy/50 text-xs">{selected.specialization}</span>
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
                    onClick={() => toggleActive(selected.id)}
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
                        { label: "Joined", value: fmtDate(selected.joinedOn) },
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
                    {/* Available days */}
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

                    {/* Working hours */}
                    <div>
                      <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Working Hours</p>
                      <div className="flex items-center gap-3">
                        <div className="bg-navy/[0.03] rounded-xl px-4 py-3 flex-1 text-center">
                          <p className="text-navy/40 text-xs mb-1">From</p>
                          <p className="text-navy font-bold text-lg font-fraunces">{fmtTime(selected.availableFrom)}</p>
                        </div>
                        <svg className="w-5 h-5 text-navy/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                        <div className="bg-navy/[0.03] rounded-xl px-4 py-3 flex-1 text-center">
                          <p className="text-navy/40 text-xs mb-1">To</p>
                          <p className="text-navy font-bold text-lg font-fraunces">{fmtTime(selected.availableTo)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Weekly view */}
                    <div>
                      <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Weekly Overview</p>
                      <div className="grid grid-cols-7 gap-1">
                        {ALL_DAYS.map((day) => {
                          const dayAppts = selected.appointments.filter((a) => {
                            const d = new Date(a.date);
                            const dayNames: Day[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            return dayNames[d.getDay()] === day;
                          });
                          const available = selected.availableDays.includes(day);
                          return (
                            <div key={day} className={`rounded-xl p-2 text-center ${available ? "bg-navy/[0.03]" : "bg-navy/[0.015] opacity-50"}`}>
                              <p className="text-[10px] font-semibold text-navy/50 mb-1">{day}</p>
                              {available ? (
                                <p className="text-xs font-bold text-navy">{dayAppts.length > 0 ? dayAppts.length : "—"}</p>
                              ) : (
                                <p className="text-xs text-navy/20">Off</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-navy/30 text-[10px] mt-2">Numbers show appointments scheduled for this week.</p>
                    </div>
                  </div>
                )}

                {/* ── Appointments Tab (doctors only) ── */}
                {activeTab === "appointments" && selected.role === "doctor" && (
                  <div className="space-y-3">
                    {selected.appointments.length === 0 ? (
                      <p className="text-navy/40 text-sm text-center py-6">No appointments assigned.</p>
                    ) : (
                      selected.appointments.map((appt) => (
                        <div key={appt.id} className="flex items-center gap-3 bg-navy/[0.03] rounded-xl p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-semibold text-navy text-sm">{appt.patientName}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${APPT_STATUS_STYLE[appt.status]}`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-navy/40 text-xs">
                              {fmtDate(appt.date)} · {appt.time} · {appt.service}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Edit Panel ── */}
          {selected && editMode && (
            <div className="flex-1 min-w-0 glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-navy/8 flex items-center justify-between">
                <h2 className="font-fraunces text-lg font-bold text-navy">Edit Staff Member</h2>
                <button onClick={() => setEditMode(false)} className="p-1.5 rounded-lg hover:bg-navy/10 text-navy/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[70vh]">
                <StaffForm form={form} setForm={setForm} toggleDay={toggleDay} isEdit />
                <div className="flex gap-3 mt-5">
                  <button onClick={handleEditSave} className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors">
                    Save Changes
                  </button>
                  <button onClick={() => setEditMode(false)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm hover:bg-navy/5 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Add Staff Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-fraunces text-xl font-bold text-navy mb-1">Add Staff Member</h2>
            <p className="text-navy/40 text-xs mb-5">Fill in the details to register a new doctor or staff member.</p>
            <StaffForm form={form} setForm={setForm} toggleDay={toggleDay} />
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAdd}
                disabled={!form.name || !form.email}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                Add Staff Member
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

// ─── Shared Form Component ────────────────────────────────────────────────────
function StaffForm({
  form,
  setForm,
  toggleDay,
  isEdit = false,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  toggleDay: (day: Day) => void;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Role */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Role</p>
        <div className="grid grid-cols-3 gap-2">
          {(["doctor", "receptionist", "assistant"] as StaffRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: r }))}
              className={`py-2.5 rounded-xl text-xs font-semibold capitalize border transition-colors ${
                form.role === r
                  ? `${ROLE_META[r].style} border-transparent`
                  : "border-navy/10 text-navy/50 hover:bg-navy/5"
              }`}
            >
              {ROLE_META[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Basic Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FF label="Full Name *">
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="form-input py-2.5 text-sm" placeholder={form.role === "doctor" ? "Dr. Full Name" : "Full Name"} />
          </FF>
          <FF label="Phone">
            <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="+91 XXXXXXXXXX" />
          </FF>
          <div className="sm:col-span-2">
            <FF label="Email *">
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="staff@dentalcare.com" />
            </FF>
          </div>
          <FF label="Qualification">
            <input type="text" value={form.qualification} onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. BDS, MDS" />
          </FF>
          {form.role === "doctor" && (
            <FF label="Specialization">
              <input type="text" value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. Orthodontics" />
            </FF>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Schedule</p>
        <p className="text-xs text-navy/40 mb-2">Available Days</p>
        <div className="flex gap-2 flex-wrap mb-4">
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
        <div className="grid grid-cols-2 gap-4">
          <FF label="Available From">
            <input type="time" value={form.availableFrom} onChange={(e) => setForm((p) => ({ ...p, availableFrom: e.target.value }))} className="form-input py-2.5 text-sm" />
          </FF>
          <FF label="Available To">
            <input type="time" value={form.availableTo} onChange={(e) => setForm((p) => ({ ...p, availableTo: e.target.value }))} className="form-input py-2.5 text-sm" />
          </FF>
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
