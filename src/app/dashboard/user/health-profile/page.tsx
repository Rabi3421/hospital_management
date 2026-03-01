"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { userNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisitRecord {
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
}

interface HealthProfile {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  registeredOn: string;
  medicalHistory: {
    bp: string;
    diabetes: boolean;
    allergies: string;
    otherConditions: string;
  };
  dentalHistory: {
    lastVisit: string;
    previousTreatments: string;
    currentComplaints: string;
  };
  visits: VisitRecord[];
  reports: Report[];
  doctorNotes: string;
}

// ─── Mock health profile for the logged-in user ─────────────────────────────
const MOCK_HEALTH_PROFILE: HealthProfile = {
  name: "Avnish Kumar",
  age: 32,
  gender: "Male",
  phone: "+91 9876543210",
  email: "avnishstm000@gmail.com",
  bloodGroup: "O+",
  address: "12 Main Street, Mumbai, MH 400001",
  registeredOn: "2026-02-27",
  medicalHistory: {
    bp: "120/80",
    diabetes: false,
    allergies: "Penicillin",
    otherConditions: "None",
  },
  dentalHistory: {
    lastVisit: "2026-02-27",
    previousTreatments: "Scaling, Composite Filling (tooth #14)",
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
    { id: "r1", title: "OPG X-Ray — Feb 2026", type: "xray", uploadedAt: "2026-02-27" },
    { id: "r2", title: "Post-treatment Summary", type: "report", uploadedAt: "2026-02-27" },
  ],
  doctorNotes:
    "Patient is co-operative. Monitor sensitivity in lower left area. Follow up after 2 weeks for scaling appointment.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

// ─── Section Card ─────────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gold/10 rounded-xl flex items-center justify-center text-gold flex-shrink-0">
          {icon}
        </div>
        <h2 className="font-fraunces font-bold text-navy text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span className="text-navy/40 text-xs sm:w-40 flex-shrink-0">{label}</span>
      <span className="text-navy font-medium text-sm">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HealthProfilePage() {
  const { user } = useAuth();
  const hp = MOCK_HEALTH_PROFILE;

  const initials = hp.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={userNavItems} title="DentalCare" subtitle="Patient Portal" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
            My Health Profile
          </h1>
          <p className="text-navy/50 text-sm mt-1">
            Your complete dental &amp; medical record in one place.
          </p>
        </div>

        {/* Profile hero card */}
        <div className="glass-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 flex items-center justify-center flex-shrink-0">
            <span className="font-fraunces text-2xl font-bold text-gold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-fraunces text-xl font-bold text-navy">{hp.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-navy/50">
              <span>{hp.age} years old · {hp.gender}</span>
              <span>Blood Group: <strong className="text-navy">{hp.bloodGroup}</strong></span>
              <span>Registered: <strong className="text-navy">{fmtDate(hp.registeredOn)}</strong></span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full">{hp.phone}</span>
              <span className="text-xs bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full">{hp.email}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-xs font-medium">Active Patient</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Personal Information */}
          <Section
            title="Personal Information"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
          >
            <div className="space-y-3">
              <InfoRow label="Full Name" value={hp.name} />
              <InfoRow label="Age" value={`${hp.age} years`} />
              <InfoRow label="Gender" value={hp.gender} />
              <InfoRow label="Blood Group" value={hp.bloodGroup} />
              <InfoRow label="Phone" value={hp.phone} />
              <InfoRow label="Email" value={hp.email} />
              <InfoRow label="Address" value={hp.address} />
            </div>
          </Section>

          {/* Medical History */}
          <Section
            title="Medical History"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            }
          >
            <div className="space-y-3">
              <InfoRow label="Blood Pressure" value={hp.medicalHistory.bp || "Not recorded"} />
              <InfoRow
                label="Diabetes"
                value={
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hp.medicalHistory.diabetes ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {hp.medicalHistory.diabetes ? "Yes" : "No"}
                  </span>
                }
              />
              <InfoRow label="Known Allergies" value={hp.medicalHistory.allergies || "None"} />
              <InfoRow label="Other Conditions" value={hp.medicalHistory.otherConditions || "None"} />
            </div>
          </Section>
        </div>

        {/* Dental History */}
        <div className="mb-4">
          <Section
            title="Dental History"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-navy/[0.03] rounded-xl p-3">
                <p className="text-navy/40 text-xs mb-1">Last Visit</p>
                <p className="text-navy font-medium text-sm">{fmtDate(hp.dentalHistory.lastVisit)}</p>
              </div>
              <div className="bg-navy/[0.03] rounded-xl p-3">
                <p className="text-navy/40 text-xs mb-1">Previous Treatments</p>
                <p className="text-navy font-medium text-sm">{hp.dentalHistory.previousTreatments || "—"}</p>
              </div>
              <div className="bg-navy/[0.03] rounded-xl p-3">
                <p className="text-navy/40 text-xs mb-1">Current Complaints</p>
                <p className="text-navy font-medium text-sm">{hp.dentalHistory.currentComplaints || "—"}</p>
              </div>
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Visit History */}
          <Section
            title={`Visit History (${hp.visits.length})`}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V12zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12V18zm-2.25-6h.008v.008H9.75V12zm0 3h.008v.008H9.75v-.008zm0 3h.008v.008H9.75V18zm-2.25-6h.008v.008H7.5V12zm0 3h.008v.008H7.5v-.008zm0 3h.008v.008H7.5V18zm6.75-6h.008v.008h-.008V12zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008V18zm2.25-6h.008v.008H16.5V12zm0 3h.008v.008H16.5v-.008zm0 3h.008v.008H16.5V18z" />
              </svg>
            }
          >
            {hp.visits.length === 0 ? (
              <p className="text-navy/40 text-sm text-center py-4">No visits recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {hp.visits.map((v) => (
                  <div key={v.id} className="bg-navy/[0.03] rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-navy text-sm">{v.service}</p>
                        <p className="text-navy/40 text-xs">{fmtDate(v.date)} · {v.doctor}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_STYLE[v.status]}`}>{v.status}</span>
                        <span className="text-navy font-semibold text-xs">₹{v.cost.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-navy/60">
                      <span className="text-navy/40">Diagnosis: </span>{v.diagnosis}
                      <span className="mx-2 text-navy/20">·</span>
                      <span className="text-navy/40">Treatment: </span>{v.treatment}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Reports */}
          <Section
            title={`My Reports (${hp.reports.length})`}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
          >
            {hp.reports.length === 0 ? (
              <p className="text-navy/40 text-sm text-center py-4">No reports uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {hp.reports.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 bg-navy/[0.03] rounded-xl p-3">
                    <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                      {REPORT_ICON[r.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy text-sm truncate">{r.title}</p>
                      <p className="text-navy/40 text-xs capitalize">{r.type} · {fmtDate(r.uploadedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Doctor Notes */}
        {hp.doctorNotes && (
          <Section
            title="Doctor's Notes"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            }
          >
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <p className="text-navy text-sm leading-relaxed">{hp.doctorNotes}</p>
              <p className="text-navy/30 text-xs mt-3">Last updated by Dr. Sarah Johnson · {fmtDate(hp.dentalHistory.lastVisit)}</p>
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}
