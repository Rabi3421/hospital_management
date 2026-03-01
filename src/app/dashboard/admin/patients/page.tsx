"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MedicalHistory {
  bp: string;
  diabetes: boolean;
  allergies: string;
  otherConditions: string;
}

interface DentalHistory {
  lastVisit: string;
  previousTreatments: string;
  currentComplaints: string;
}

interface VisitSummary {
  id: string;
  date: string;
  service: string;
  doctor: string;
  diagnosis: string;
  treatment: string;
  cost: number;
  status: "completed" | "ongoing" | "planned";
}

interface Report {
  id: string;
  title: string;
  type: "xray" | "report" | "prescription";
  uploadedAt: string;
  fileUrl?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  registeredOn: string;
  isActive: boolean;
  medicalHistory: MedicalHistory;
  dentalHistory: DentalHistory;
  visits: VisitSummary[];
  reports: Report[];
  doctorNotes: string;
}

// ─── Seed data ─────────────────────────────────────────────────────────────
const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Avnish Kumar",
    age: 32,
    gender: "male",
    phone: "+91 9876543210",
    email: "avnishstm000@gmail.com",
    bloodGroup: "O+",
    address: "12 Main Street, Mumbai, MH 400001",
    registeredOn: "2026-02-27",
    isActive: true,
    medicalHistory: {
      bp: "120/80",
      diabetes: false,
      allergies: "Penicillin",
      otherConditions: "None",
    },
    dentalHistory: {
      lastVisit: "2026-02-27",
      previousTreatments: "Scaling, Filling (tooth #14)",
      currentComplaints: "Sensitivity in lower left molar",
    },
    visits: [
      {
        id: "v1",
        date: "2026-02-27",
        service: "General Dentistry",
        doctor: "Dr. Sarah Johnson",
        diagnosis: "Early caries on tooth #14",
        treatment: "Composite filling",
        cost: 1500,
        status: "completed",
      },
      {
        id: "v2",
        date: "2026-03-05",
        service: "Cleaning",
        doctor: "Dr. Sarah Johnson",
        diagnosis: "Plaque buildup",
        treatment: "Ultrasonic scaling",
        cost: 800,
        status: "planned",
      },
    ],
    reports: [
      {
        id: "r1",
        title: "OPG X-Ray — Feb 2026",
        type: "xray",
        uploadedAt: "2026-02-27",
      },
      {
        id: "r2",
        title: "Post-treatment Report",
        type: "report",
        uploadedAt: "2026-02-27",
      },
    ],
    doctorNotes:
      "Patient is co-operative. Monitor sensitivity. Follow up after 2 weeks for scaling.",
  },
  {
    id: "p2",
    name: "Priya Sharma",
    age: 28,
    gender: "female",
    phone: "+91 9123456789",
    email: "priya.sharma@email.com",
    bloodGroup: "B+",
    address: "45 Park Avenue, Delhi, DL 110001",
    registeredOn: "2026-01-15",
    isActive: true,
    medicalHistory: {
      bp: "110/70",
      diabetes: true,
      allergies: "None",
      otherConditions: "Type 2 Diabetes (controlled)",
    },
    dentalHistory: {
      lastVisit: "2026-01-15",
      previousTreatments: "RCT on tooth #26, Crown placement",
      currentComplaints: "Mild gum bleeding",
    },
    visits: [
      {
        id: "v3",
        date: "2026-01-15",
        service: "Root Canal Treatment",
        doctor: "Dr. Michael Chen",
        diagnosis: "Pulpitis tooth #26",
        treatment: "RCT + Temporary crown",
        cost: 8500,
        status: "completed",
      },
      {
        id: "v4",
        date: "2026-02-01",
        service: "Crown Placement",
        doctor: "Dr. Michael Chen",
        diagnosis: "Post-RCT crown",
        treatment: "Permanent ceramic crown",
        cost: 6000,
        status: "completed",
      },
    ],
    reports: [
      {
        id: "r3",
        title: "Pre-RCT X-Ray",
        type: "xray",
        uploadedAt: "2026-01-15",
      },
    ],
    doctorNotes:
      "Diabetic patient — extra caution with healing. Prescribed chlorhexidine mouthwash.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  ongoing: "bg-blue-100 text-blue-700",
  planned: "bg-yellow-100 text-yellow-700",
};

const REPORT_ICON: Record<string, string> = {
  xray: "🔬",
  report: "📄",
  prescription: "💊",
};

// ─── Add Patient Form ─────────────────────────────────────────────────────────
type PatientForm = {
  name: string;
  age: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  bp: string;
  diabetes: boolean;
  allergies: string;
  otherConditions: string;
  lastVisit: string;
  previousTreatments: string;
  currentComplaints: string;
  doctorNotes: string;
};

const EMPTY_FORM: PatientForm = {
  name: "",
  age: "",
  gender: "male",
  phone: "",
  email: "",
  bloodGroup: "",
  address: "",
  bp: "",
  diabetes: false,
  allergies: "",
  otherConditions: "",
  lastVisit: "",
  previousTreatments: "",
  currentComplaints: "",
  doctorNotes: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientManagementPage() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "medical" | "dental" | "visits" | "reports" | "notes"
  >("profile");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editNotes, setEditNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  const totalActive = patients.filter((p) => p.isActive).length;
  const totalVisits = patients.reduce((acc, p) => acc + p.visits.length, 0);

  const handleAddPatient = () => {
    if (!form.name || !form.email || !form.phone) return;
    const newPatient: Patient = {
      id: `p${Date.now()}`,
      name: form.name,
      age: Number(form.age) || 0,
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      bloodGroup: form.bloodGroup,
      address: form.address,
      registeredOn: new Date().toISOString().slice(0, 10),
      isActive: true,
      medicalHistory: {
        bp: form.bp,
        diabetes: form.diabetes,
        allergies: form.allergies,
        otherConditions: form.otherConditions,
      },
      dentalHistory: {
        lastVisit: form.lastVisit,
        previousTreatments: form.previousTreatments,
        currentComplaints: form.currentComplaints,
      },
      visits: [],
      reports: [],
      doctorNotes: form.doctorNotes,
    };
    setPatients((prev) => [newPatient, ...prev]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
  };

  const saveNotes = () => {
    if (!selected) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, doctorNotes: notesDraft } : p))
    );
    setSelected((prev) => (prev ? { ...prev, doctorNotes: notesDraft } : prev));
    setEditNotes(false);
  };

  const toggleActive = (id: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    if (selected?.id === id)
      setSelected((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
  };

  const TABS = [
    { key: "profile", label: "Profile" },
    { key: "medical", label: "Medical" },
    { key: "dental", label: "Dental" },
    { key: "visits", label: `Visits (${selected?.visits.length ?? 0})` },
    { key: "reports", label: `Reports (${selected?.reports.length ?? 0})` },
    { key: "notes", label: "Notes" },
  ] as const;

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
              Patient Management
            </h1>
            <p className="text-navy/50 text-sm mt-1">
              Complete lifetime records for every patient.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Patient
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Patients", value: patients.length },
            { label: "Active", value: totalActive },
            { label: "Total Visits", value: totalVisits },
            { label: "New This Month", value: patients.filter((p) => new Date(p.registeredOn).getMonth() === new Date().getMonth()).length },
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
            placeholder="Search by name, email or phone…"
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

        <div className="flex gap-4 flex-col xl:flex-row">
          {/* Patient list */}
          <div className={`glass-card rounded-2xl overflow-hidden ${selected ? "xl:w-80 flex-shrink-0" : "flex-1"}`}>
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-navy/40 text-sm">No patients found.</div>
            ) : (
              <div className="divide-y divide-navy/5">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelected(p); setActiveTab("profile"); }}
                    className={`w-full text-left px-4 py-4 hover:bg-navy/[0.02] transition-colors ${selected?.id === p.id ? "bg-gold/5 border-l-2 border-gold" : ""}`}
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
                        <p className="text-navy/40 text-xs truncate">{p.phone}</p>
                        <p className="text-navy/30 text-xs">{p.age}y · {p.gender} · {p.bloodGroup}</p>
                      </div>
                    </div>
                  </button>
                ))}
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
                      <span className="text-navy/50 text-xs">{selected.age}y · {selected.gender} · {selected.bloodGroup}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${selected.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {selected.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
                      { label: "Blood Group", value: selected.bloodGroup },
                      { label: "Gender", value: selected.gender.charAt(0).toUpperCase() + selected.gender.slice(1) },
                      { label: "Registered", value: fmtDate(selected.registeredOn) },
                      { label: "Address", value: selected.address },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-navy/[0.03] rounded-xl p-3">
                        <p className="text-navy/40 text-xs mb-1">{label}</p>
                        <p className="text-navy font-medium text-sm">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Medical History Tab ── */}
                {activeTab === "medical" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-navy/[0.03] rounded-xl p-3">
                        <p className="text-navy/40 text-xs mb-1">Blood Pressure</p>
                        <p className="text-navy font-medium text-sm">{selected.medicalHistory.bp || "—"}</p>
                      </div>
                      <div className="bg-navy/[0.03] rounded-xl p-3">
                        <p className="text-navy/40 text-xs mb-1">Diabetes</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.medicalHistory.diabetes ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {selected.medicalHistory.diabetes ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-navy/[0.03] rounded-xl p-3">
                      <p className="text-navy/40 text-xs mb-1">Allergies</p>
                      <p className="text-navy font-medium text-sm">{selected.medicalHistory.allergies || "None"}</p>
                    </div>
                    <div className="bg-navy/[0.03] rounded-xl p-3">
                      <p className="text-navy/40 text-xs mb-1">Other Conditions</p>
                      <p className="text-navy font-medium text-sm">{selected.medicalHistory.otherConditions || "None"}</p>
                    </div>
                  </div>
                )}

                {/* ── Dental History Tab ── */}
                {activeTab === "dental" && (
                  <div className="space-y-3">
                    <div className="bg-navy/[0.03] rounded-xl p-3">
                      <p className="text-navy/40 text-xs mb-1">Last Visit</p>
                      <p className="text-navy font-medium text-sm">{fmtDate(selected.dentalHistory.lastVisit) || "—"}</p>
                    </div>
                    <div className="bg-navy/[0.03] rounded-xl p-3">
                      <p className="text-navy/40 text-xs mb-1">Previous Treatments</p>
                      <p className="text-navy font-medium text-sm">{selected.dentalHistory.previousTreatments || "—"}</p>
                    </div>
                    <div className="bg-navy/[0.03] rounded-xl p-3">
                      <p className="text-navy/40 text-xs mb-1">Current Complaints</p>
                      <p className="text-navy font-medium text-sm">{selected.dentalHistory.currentComplaints || "—"}</p>
                    </div>
                  </div>
                )}

                {/* ── Visits Tab ── */}
                {activeTab === "visits" && (
                  <div className="space-y-3">
                    {selected.visits.length === 0 ? (
                      <p className="text-navy/40 text-sm text-center py-6">No visit records yet.</p>
                    ) : (
                      selected.visits.map((v) => (
                        <div key={v.id} className="bg-navy/[0.03] rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <p className="font-semibold text-navy text-sm">{v.service}</p>
                              <p className="text-navy/40 text-xs">{fmtDate(v.date)} · {v.doctor}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[v.status]}`}>{v.status}</span>
                              <span className="text-navy font-semibold text-sm">₹{v.cost.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-navy/40">Diagnosis: </span>
                              <span className="text-navy">{v.diagnosis}</span>
                            </div>
                            <div>
                              <span className="text-navy/40">Treatment: </span>
                              <span className="text-navy">{v.treatment}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── Reports Tab ── */}
                {activeTab === "reports" && (
                  <div className="space-y-3">
                    {selected.reports.length === 0 ? (
                      <p className="text-navy/40 text-sm text-center py-6">No reports uploaded yet.</p>
                    ) : (
                      selected.reports.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 bg-navy/[0.03] rounded-xl p-4">
                          <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                            {REPORT_ICON[r.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-navy text-sm truncate">{r.title}</p>
                            <p className="text-navy/40 text-xs capitalize">{r.type} · {fmtDate(r.uploadedAt)}</p>
                          </div>
                          {r.fileUrl && (
                            <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-navy/5 text-navy/60 text-xs hover:bg-navy/10 transition-colors">
                              View
                            </a>
                          )}
                        </div>
                      ))
                    )}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-navy/15 cursor-pointer hover:border-gold/40 transition-colors">
                        <svg className="w-4 h-4 text-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                        <span className="text-navy/40 text-xs">Upload X-ray / Report / Prescription</span>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                    </div>
                  </div>
                )}

                {/* ── Notes Tab ── */}
                {activeTab === "notes" && (
                  <div>
                    {editNotes ? (
                      <>
                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          rows={8}
                          className="w-full p-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 resize-none"
                          placeholder="Add clinical notes here…"
                        />
                        <div className="flex gap-3 mt-3">
                          <button onClick={saveNotes} className="btn-primary text-sm px-5 py-2">Save Notes</button>
                          <button onClick={() => setEditNotes(false)} className="px-4 py-2 rounded-xl border border-navy/15 text-navy text-sm hover:bg-navy/5 transition-colors">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-navy/[0.03] rounded-xl p-4 min-h-[140px] mb-4">
                          <p className="text-navy text-sm leading-relaxed whitespace-pre-wrap">
                            {selected.doctorNotes || <span className="text-navy/30">No notes yet.</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => { setNotesDraft(selected.doctorNotes); setEditNotes(true); }}
                          className="btn-gold text-sm px-5 py-2 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                          Edit Notes
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Add Patient Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-fraunces text-xl font-bold text-navy mb-1">Register New Patient</h2>
            <p className="text-navy/40 text-xs mb-5">Fill in the patient details to create their lifetime record.</p>

            {/* Basic Info */}
            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <FormField label="Full Name *">
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Patient full name" />
              </FormField>
              <FormField label="Age">
                <input type="number" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Age in years" />
              </FormField>
              <FormField label="Gender">
                <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as "male" | "female" | "other" }))} className="form-input py-2.5 text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              <FormField label="Blood Group">
                <select value={form.bloodGroup} onChange={(e) => setForm((p) => ({ ...p, bloodGroup: e.target.value }))} className="form-input py-2.5 text-sm">
                  <option value="">Select…</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </FormField>
              <FormField label="Phone *">
                <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="+91 9876543210" />
              </FormField>
              <FormField label="Email *">
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="patient@email.com" />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Address">
                  <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Full address" />
                </FormField>
              </div>
            </div>

            {/* Medical History */}
            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Medical History</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <FormField label="Blood Pressure">
                <input type="text" value={form.bp} onChange={(e) => setForm((p) => ({ ...p, bp: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. 120/80" />
              </FormField>
              <FormField label="Diabetes">
                <select value={form.diabetes ? "yes" : "no"} onChange={(e) => setForm((p) => ({ ...p, diabetes: e.target.value === "yes" }))} className="form-input py-2.5 text-sm">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </FormField>
              <FormField label="Allergies">
                <input type="text" value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. Penicillin, Latex" />
              </FormField>
              <FormField label="Other Conditions">
                <input type="text" value={form.otherConditions} onChange={(e) => setForm((p) => ({ ...p, otherConditions: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. Hypertension" />
              </FormField>
            </div>

            {/* Dental History */}
            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Dental History</p>
            <div className="space-y-4 mb-5">
              <FormField label="Previous Treatments">
                <input type="text" value={form.previousTreatments} onChange={(e) => setForm((p) => ({ ...p, previousTreatments: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. RCT tooth #26, Braces" />
              </FormField>
              <FormField label="Current Complaints">
                <input type="text" value={form.currentComplaints} onChange={(e) => setForm((p) => ({ ...p, currentComplaints: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g. Pain in lower right molar" />
              </FormField>
            </div>

            {/* Initial Notes */}
            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Initial Doctor Notes</p>
            <textarea
              value={form.doctorNotes}
              onChange={(e) => setForm((p) => ({ ...p, doctorNotes: e.target.value }))}
              rows={3}
              className="w-full p-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 resize-none mb-5"
              placeholder="Initial clinical observations…"
            />

            <div className="flex gap-3">
              <button
                onClick={handleAddPatient}
                disabled={!form.name || !form.email || !form.phone}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                Register Patient
              </button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm font-medium hover:bg-navy/5 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
