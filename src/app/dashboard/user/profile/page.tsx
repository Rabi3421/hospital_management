"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { userNavItems } from "../navItems";
import { useAuth } from "@/context/AuthContext";

type Section = "personal" | "health" | "security" | "notifications";
const SECTION_LABELS: Record<Section, string> = {
    personal: "Personal Info",
    health: "Health Info",
    security: "Security",
    notifications: "Notifications",
};

interface ProfileData {
    name: string; email: string; phone: string; dob: string; gender: string;
    address: string; emergencyContact: string; bloodType: string;
    allergies: string; currentMedications: string; medicalConditions: string;
    insuranceProvider: string; insuranceId: string;
}

export default function ProfilePage() {
    const { user, accessToken } = useAuth();
    const [activeSection, setActiveSection] = useState<Section>("personal");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

    const [profile, setProfile] = useState<ProfileData>({
        name: "", email: "", phone: "", dob: "", gender: "",
        address: "", emergencyContact: "", bloodType: "",
        allergies: "", currentMedications: "", medicalConditions: "",
        insuranceProvider: "", insuranceId: "",
    });

    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [pwSaving, setPwSaving] = useState(false);

    const [notifPrefs, setNotifPrefs] = useState({
        appointmentReminders: true, prescriptionAlerts: true,
        labResults: true, promotions: false, smsAlerts: true, emailAlerts: true,
    });

    const headers = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    const flash = (ok: boolean, msg: string) => {
        setFeedback({ ok, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/auth/me", { headers: headers(), credentials: "include" });
                const json = await res.json();
                if (json.success) {
                    const u = json.data.user;
                    setProfile({
                        name: u.name ?? "", email: u.email ?? "",
                        phone: u.phone ?? "", dob: u.dob ?? "",
                        gender: u.gender ?? "", address: u.address ?? "",
                        emergencyContact: u.emergencyContact ?? "",
                        bloodType: u.bloodType ?? "", allergies: u.allergies ?? "",
                        currentMedications: u.currentMedications ?? "",
                        medicalConditions: u.medicalConditions ?? "",
                        insuranceProvider: u.insuranceProvider ?? "",
                        insuranceId: u.insuranceId ?? "",
                    });
                }
            } finally { setLoading(false); }
        };
        load();
    }, [headers]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/auth/me", {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify(profile),
            });
            const json = await res.json();
            if (json.success) flash(true, "Profile saved successfully.");
            else flash(false, json.error ?? "Failed to save.");
        } finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (!pwForm.current || !pwForm.next) return flash(false, "Fill in all password fields.");
        if (pwForm.next !== pwForm.confirm) return flash(false, "New passwords do not match.");
        if (pwForm.next.length < 8) return flash(false, "New password must be at least 8 characters.");
        setPwSaving(true);
        try {
            const res = await fetch("/api/auth/me", {
                method: "PATCH", headers: headers(), credentials: "include",
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
            });
            const json = await res.json();
            if (json.success) { flash(true, "Password updated."); setPwForm({ current: "", next: "", confirm: "" }); }
            else flash(false, json.error ?? "Failed to update password.");
        } finally { setPwSaving(false); }
    };

    const initials = (user?.name ?? "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={userNavItems} title="DentalCare" subtitle="Patient Portal" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
                <div className="mb-5 sm:mb-8">
                    <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">My Profile</h1>
                    <p className="text-navy/50 text-sm mt-1">Manage your personal information and preferences.</p>
                </div>

                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${feedback.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {feedback.msg}
                    </div>
                )}

                {/* Profile hero */}
                <div className="glass-card rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-navy flex items-center justify-center flex-shrink-0">
                        <span className="font-fraunces text-xl sm:text-2xl font-bold text-gold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-fraunces text-xl font-bold text-navy">{profile.name || user?.name || "Patient"}</h2>
                        <p className="text-navy/50 text-sm mt-0.5">{user?.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-medium capitalize">{user?.role ?? "user"}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Active</span>
                            {profile.bloodType && <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">Blood: {profile.bloodType}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Section nav */}
                    <div className="lg:w-52 flex-shrink-0">
                        <nav className="glass-card rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto">
                            {(Object.keys(SECTION_LABELS) as Section[]).map((sec) => (
                                <button key={sec} onClick={() => setActiveSection(sec)}
                                    className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeSection === sec ? "bg-navy text-white" : "text-navy/50 hover:text-navy hover:bg-navy/5"}`}>
                                    {SECTION_LABELS[sec]}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="glass-card rounded-2xl p-4 sm:p-6 animate-pulse space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-11 bg-navy/8 rounded-xl" />)}
                            </div>
                        ) : (
                            <>
                                {activeSection === "personal" && (
                                    <div className="glass-card rounded-2xl p-4 sm:p-6">
                                        <h3 className="font-fraunces text-base sm:text-lg font-semibold text-navy mb-4 sm:mb-6">Personal Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <Field label="Full Name">
                                                <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <Field label="Email Address">
                                                <input type="email" value={profile.email} disabled className="form-input py-2.5 text-sm opacity-50 cursor-not-allowed" />
                                            </Field>
                                            <Field label="Phone Number">
                                                <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <Field label="Date of Birth">
                                                <input type="date" value={profile.dob} onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))} className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <Field label="Gender">
                                                <select value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))} className="form-input py-2.5 text-sm appearance-none">
                                                    <option value="">Select…</option>
                                                    {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => <option key={g}>{g}</option>)}
                                                </select>
                                            </Field>
                                            <div className="sm:col-span-2">
                                                <Field label="Address">
                                                    <input type="text" value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} placeholder="Street, City, State ZIP" className="form-input py-2.5 text-sm" />
                                                </Field>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Field label="Emergency Contact">
                                                    <input type="text" value={profile.emergencyContact} onChange={(e) => setProfile((p) => ({ ...p, emergencyContact: e.target.value }))} placeholder="Full name + phone number" className="form-input py-2.5 text-sm" />
                                                </Field>
                                            </div>
                                        </div>
                                        <SaveBar onSave={handleSaveProfile} saving={saving} />
                                    </div>
                                )}

                                {activeSection === "health" && (
                                    <div className="glass-card rounded-2xl p-4 sm:p-6">
                                        <h3 className="font-fraunces text-base sm:text-lg font-semibold text-navy mb-4 sm:mb-6">Health Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <Field label="Blood Type">
                                                <select value={profile.bloodType} onChange={(e) => setProfile((p) => ({ ...p, bloodType: e.target.value }))} className="form-input py-2.5 text-sm appearance-none">
                                                    <option value="">Select…</option>
                                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => <option key={t}>{t}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Insurance Provider">
                                                <input type="text" value={profile.insuranceProvider} onChange={(e) => setProfile((p) => ({ ...p, insuranceProvider: e.target.value }))} className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <Field label="Insurance ID">
                                                <input type="text" value={profile.insuranceId} onChange={(e) => setProfile((p) => ({ ...p, insuranceId: e.target.value }))} className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <div className="sm:col-span-2">
                                                <Field label="Known Allergies">
                                                    <textarea rows={2} value={profile.allergies} onChange={(e) => setProfile((p) => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin, Latex" className="form-input py-2.5 text-sm resize-none" />
                                                </Field>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Field label="Current Medications">
                                                    <textarea rows={2} value={profile.currentMedications} onChange={(e) => setProfile((p) => ({ ...p, currentMedications: e.target.value }))} placeholder="e.g. Fluoride Gel 1.1% nightly" className="form-input py-2.5 text-sm resize-none" />
                                                </Field>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Field label="Medical Conditions">
                                                    <textarea rows={2} value={profile.medicalConditions} onChange={(e) => setProfile((p) => ({ ...p, medicalConditions: e.target.value }))} placeholder="e.g. Diabetes, Hypertension, None" className="form-input py-2.5 text-sm resize-none" />
                                                </Field>
                                            </div>
                                        </div>
                                        <SaveBar onSave={handleSaveProfile} saving={saving} />
                                    </div>
                                )}

                                {activeSection === "security" && (
                                    <div className="glass-card rounded-2xl p-4 sm:p-6">
                                        <h3 className="font-fraunces text-base sm:text-lg font-semibold text-navy mb-4 sm:mb-6">Change Password</h3>
                                        <div className="space-y-4 max-w-md">
                                            <Field label="Current Password">
                                                <input type="password" value={pwForm.current} onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))} placeholder="••••••••" className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <Field label="New Password">
                                                <input type="password" value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <Field label="Confirm New Password">
                                                <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter new password" className="form-input py-2.5 text-sm" />
                                            </Field>
                                            <button onClick={handleChangePassword} disabled={pwSaving}
                                                className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60 flex items-center gap-2">
                                                {pwSaving ? <><Spinner />Updating…</> : "Update Password"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSection === "notifications" && (
                                    <div className="glass-card rounded-2xl p-4 sm:p-6">
                                        <h3 className="font-fraunces text-base sm:text-lg font-semibold text-navy mb-4 sm:mb-6">Notification Preferences</h3>
                                        <div className="space-y-1">
                                            {([
                                                { key: "appointmentReminders", label: "Appointment Reminders", desc: "Get reminded 24h before your appointment" },
                                                { key: "prescriptionAlerts", label: "Prescription Alerts", desc: "Notify when new prescription is issued" },
                                                { key: "labResults", label: "Lab Results Ready", desc: "Alert when test results are uploaded" },
                                                { key: "promotions", label: "Promotions & Offers", desc: "Special offers and health tips" },
                                                { key: "smsAlerts", label: "SMS Alerts", desc: "Receive notifications via text message" },
                                                { key: "emailAlerts", label: "Email Alerts", desc: "Receive notifications via email" },
                                            ] as { key: keyof typeof notifPrefs; label: string; desc: string }[]).map(({ key, label, desc }) => (
                                                <div key={key} className="flex items-center justify-between p-4 rounded-xl hover:bg-navy/5 transition-colors">
                                                    <div>
                                                        <p className="text-navy font-medium text-sm">{label}</p>
                                                        <p className="text-navy/40 text-xs mt-0.5">{desc}</p>
                                                    </div>
                                                    <button onClick={() => setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
                                                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifPrefs[key] ? "bg-gold" : "bg-navy/20"}`}>
                                                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifPrefs[key] ? "left-[22px]" : "left-0.5"}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <SaveBar onSave={() => flash(true, "Preferences saved.")} saving={false} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
    return (
        <div className="mt-6">
            <button onClick={onSave} disabled={saving}
                className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60 flex items-center gap-2">
                {saving ? <><Spinner />Saving…</> : "Save Changes"}
            </button>
        </div>
    );
}

function Spinner() {
    return <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}
