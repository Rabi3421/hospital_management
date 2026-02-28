"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

const CLINIC_INFO_KEY = "dc_admin_clinic_info";

interface ClinicInfo {
    clinicName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    openTime: string;
    closeTime: string;
    workDays: string;
    tagline: string;
}

function loadClinicInfo(): ClinicInfo {
    if (typeof window === "undefined") return defaultInfo;
    try {
        const raw = localStorage.getItem(CLINIC_INFO_KEY);
        return raw ? { ...defaultInfo, ...JSON.parse(raw) } : defaultInfo;
    } catch { return defaultInfo; }
}

const defaultInfo: ClinicInfo = {
    clinicName: "DentalCare Clinic",
    address: "123 Dental Street, Medicity, CA 90210",
    phone: "+1 (555) 234-5678",
    email: "info@dentalcare.com",
    website: "https://dentalcare.com",
    openTime: "08:00",
    closeTime: "18:00",
    workDays: "Monday – Saturday",
    tagline: "Your smile, our priority.",
};

export default function AdminSettingsPage() {
    const { user, accessToken } = useAuth();
    const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(() => loadClinicInfo());
    const [clinicSaved, setClinicSaved] = useState(false);

    // Password change
    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [showPw, setShowPw] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const saveClinic = () => {
        localStorage.setItem(CLINIC_INFO_KEY, JSON.stringify(clinicInfo));
        setClinicSaved(true);
        setTimeout(() => setClinicSaved(false), 3000);
    };

    const handlePwChange = async () => {
        if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
            setPwMsg({ type: "err", msg: "All password fields are required." }); return;
        }
        if (pwForm.next !== pwForm.confirm) {
            setPwMsg({ type: "err", msg: "New passwords do not match." }); return;
        }
        if (pwForm.next.length < 6) {
            setPwMsg({ type: "err", msg: "New password must be at least 6 characters." }); return;
        }

        setPwSaving(true);
        try {
            // Uses the /api/auth/me-based change-password endpoint
            const res = await fetch("/api/auth/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                credentials: "include",
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
            });
            const json = await res.json();
            if (json.success) {
                setPwMsg({ type: "ok", msg: "Password changed successfully." });
                setPwForm({ current: "", next: "", confirm: "" });
            } else {
                setPwMsg({ type: "err", msg: json.error ?? "Failed to change password." });
            }
        } catch {
            setPwMsg({ type: "err", msg: "Network error." });
        } finally {
            setPwSaving(false);
            setTimeout(() => setPwMsg(null), 4000);
        }
    };

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Settings</h1>
                    <p className="text-navy/50 mt-1">Manage clinic information and your account.</p>
                </div>

                {/* Profile card */}
                <section className="glass-card rounded-2xl p-6 mb-6">
                    <h2 className="font-fraunces font-bold text-navy text-lg mb-4">Your Account</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-navy/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-fraunces text-xl font-bold text-navy">
                                {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "AD"}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-navy">{user?.name ?? "Admin"}</p>
                            <p className="text-navy/50 text-sm">{user?.email}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium mt-1 inline-block">Admin</span>
                        </div>
                    </div>
                </section>

                {/* Clinic info */}
                <section className="glass-card rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-fraunces font-bold text-navy text-lg">Clinic Information</h2>
                        <span className="text-xs text-navy/30">Stored locally</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Clinic Name">
                            <input type="text" value={clinicInfo.clinicName} onChange={(e) => setClinicInfo((p) => ({ ...p, clinicName: e.target.value }))} className={INPUT} />
                        </FormField>
                        <FormField label="Tagline">
                            <input type="text" value={clinicInfo.tagline} onChange={(e) => setClinicInfo((p) => ({ ...p, tagline: e.target.value }))} className={INPUT} />
                        </FormField>
                        <FormField label="Phone">
                            <input type="tel" value={clinicInfo.phone} onChange={(e) => setClinicInfo((p) => ({ ...p, phone: e.target.value }))} className={INPUT} />
                        </FormField>
                        <FormField label="Email">
                            <input type="email" value={clinicInfo.email} onChange={(e) => setClinicInfo((p) => ({ ...p, email: e.target.value }))} className={INPUT} />
                        </FormField>
                        <FormField label="Website">
                            <input type="url" value={clinicInfo.website} onChange={(e) => setClinicInfo((p) => ({ ...p, website: e.target.value }))} className={INPUT} />
                        </FormField>
                        <FormField label="Working Days">
                            <input type="text" value={clinicInfo.workDays} onChange={(e) => setClinicInfo((p) => ({ ...p, workDays: e.target.value }))} className={INPUT} placeholder="Mon – Sat" />
                        </FormField>
                        <FormField label="Open Time">
                            <input type="time" value={clinicInfo.openTime} onChange={(e) => setClinicInfo((p) => ({ ...p, openTime: e.target.value }))} className={INPUT} />
                        </FormField>
                        <FormField label="Close Time">
                            <input type="time" value={clinicInfo.closeTime} onChange={(e) => setClinicInfo((p) => ({ ...p, closeTime: e.target.value }))} className={INPUT} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Address">
                                <input type="text" value={clinicInfo.address} onChange={(e) => setClinicInfo((p) => ({ ...p, address: e.target.value }))} className={INPUT} />
                            </FormField>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                        <button onClick={saveClinic} className="bg-navy text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors">
                            Save Changes
                        </button>
                        {clinicSaved && <span className="text-green-600 text-sm flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Saved!</span>}
                    </div>
                </section>

                {/* Password change */}
                <section className="glass-card rounded-2xl p-6">
                    <h2 className="font-fraunces font-bold text-navy text-lg mb-5">Change Password</h2>
                    {pwMsg && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${pwMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {pwMsg.msg}
                        </div>
                    )}
                    <div className="space-y-4">
                        <FormField label="Current Password">
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={pwForm.current} onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))} className={INPUT + " pr-11"} placeholder="Your current password" />
                                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/30 hover:text-gold transition-colors">
                                    {showPw
                                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                </button>
                            </div>
                        </FormField>
                        <FormField label="New Password">
                            <input type="password" value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} className={INPUT} placeholder="Min. 6 characters" />
                        </FormField>
                        <FormField label="Confirm New Password">
                            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} className={INPUT} placeholder="Re-enter new password" />
                        </FormField>
                    </div>
                    <button onClick={handlePwChange} disabled={pwSaving} className="mt-5 bg-navy text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                        {pwSaving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Changing…</> : "Change Password"}
                    </button>
                </section>
            </main>
        </div>
    );
}

const INPUT = "w-full px-4 py-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">{label}</label>
            {children}
        </div>
    );
}
