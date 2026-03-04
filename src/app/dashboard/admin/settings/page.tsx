"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

interface ClinicInfo {
    clinicName: string;
    tagline: string;
    phone: string;
    emergencyPhone: string;
    email: string;
    website: string;
    address: string;
    city: string;
    openTime: string;
    closeTime: string;
    workDays: string;
}

const defaultInfo: ClinicInfo = {
    clinicName: "DentalCare Clinic",
    tagline: "Your smile, our priority.",
    phone: "+1 (555) 234-5678",
    emergencyPhone: "+1 (555) 234-5678",
    email: "info@dentalcare.com",
    website: "https://dentalcare.com",
    address: "123 Dental Street, Medicity, CA 90210",
    city: "New York, NY 10017",
    openTime: "08:00",
    closeTime: "18:00",
    workDays: "Monday – Saturday",
};

export default function AdminSettingsPage() {
    const { user, isLoading, accessToken, logout } = useAuth();
    const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(defaultInfo);
    const [clinicLoading, setClinicLoading] = useState(true);
    const [clinicSaving, setClinicSaving] = useState(false);
    const [clinicSaved, setClinicSaved] = useState(false);
    const [clinicError, setClinicError] = useState<string | null>(null);

    // Password change
    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [showPw, setShowPw] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const authHeaders = useCallback(() => ({
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }), [accessToken]);

    // Load clinic settings from DB on mount
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/clinic-settings");
                const json = await res.json();
                if (json.success && json.data) {
                    setClinicInfo({ ...defaultInfo, ...json.data });
                }
            } catch (e) { console.error(e); }
            finally { setClinicLoading(false); }
        };
        load();
    }, []);

    const saveClinic = async () => {
        if (!accessToken) return;
        setClinicSaving(true);
        setClinicError(null);
        try {
            const res = await fetch("/api/admin/clinic-settings", {
                method: "PUT",
                headers: authHeaders(),
                credentials: "include",
                body: JSON.stringify(clinicInfo),
            });
            const json = await res.json();
            if (json.success) {
                setClinicSaved(true);
                setTimeout(() => setClinicSaved(false), 3000);
            } else {
                setClinicError(json.error ?? "Failed to save.");
            }
        } catch {
            setClinicError("Network error. Please try again.");
        } finally {
            setClinicSaving(false);
        }
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
                setPwMsg({ type: "ok", msg: "Password changed. Logging you out..." });
                setPwForm({ current: "", next: "", confirm: "" });
                setTimeout(() => logout(), 2000);
            } else {
                setPwMsg({ type: "err", msg: json.error ?? "Failed to change password." });
            }
        } catch {
            setPwMsg({ type: "err", msg: "Network error." });
        } finally {
            setPwSaving(false);
        }
    };

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">

                {/* Page header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">Settings</h1>
                    <p className="text-navy/50 text-sm mt-1">Manage clinic information and your account.</p>
                </div>

                {/* Two-column layout on large screens */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 items-start">

                    {/* ── LEFT: Clinic Information (takes 2/3) ── order-2 on mobile so Account/Password appear first */}
                    <section className="order-2 xl:order-1 xl:col-span-2 glass-card rounded-2xl p-5 sm:p-7">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                    </svg>
                                </div>
                                <h2 className="font-fraunces font-bold text-navy text-lg">Clinic Information</h2>
                            </div>
                            <span className="text-xs text-navy/30 bg-navy/5 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                Saved to database
                            </span>
                        </div>

                        {clinicLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className={`h-12 rounded-xl bg-navy/5 ${i === 8 || i === 9 ? "sm:col-span-2" : ""}`} />
                                ))}
                            </div>
                        ) : (
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
                                <FormField label="Emergency Phone">
                                    <input type="tel" value={clinicInfo.emergencyPhone} onChange={(e) => setClinicInfo((p) => ({ ...p, emergencyPhone: e.target.value }))} className={INPUT} placeholder="24/7 emergency line" />
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
                                <FormField label="City / Location">
                                    <input type="text" value={clinicInfo.city} onChange={(e) => setClinicInfo((p) => ({ ...p, city: e.target.value }))} className={INPUT} placeholder="New York, NY 10017" />
                                </FormField>
                                <FormField label="Open Time">
                                    <input type="time" value={clinicInfo.openTime} onChange={(e) => setClinicInfo((p) => ({ ...p, openTime: e.target.value }))} className={INPUT} />
                                </FormField>
                                <FormField label="Close Time">
                                    <input type="time" value={clinicInfo.closeTime} onChange={(e) => setClinicInfo((p) => ({ ...p, closeTime: e.target.value }))} className={INPUT} />
                                </FormField>
                                <div className="sm:col-span-2">
                                    <FormField label="Full Address">
                                        <input type="text" value={clinicInfo.address} onChange={(e) => setClinicInfo((p) => ({ ...p, address: e.target.value }))} className={INPUT} />
                                    </FormField>
                                </div>
                            </div>
                        )}

                        {clinicError && (
                            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                {clinicError}
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-navy/8">
                            <button onClick={saveClinic} disabled={clinicSaving || clinicLoading} className="bg-navy text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors flex items-center gap-2 disabled:opacity-60">
                                {clinicSaving
                                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>
                                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>Save Changes</>}
                            </button>
                            {clinicSaved && (
                                <span className="text-green-600 text-sm flex items-center gap-1.5 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Saved — changes are now live on the website!
                                </span>
                            )}
                        </div>
                    </section>

                    {/* ── RIGHT: Account + Password (takes 1/3) ── order-1 on mobile so it appears at top */}
                    <div className="order-1 xl:order-2 flex flex-col gap-5 sm:gap-6">

                        {/* Account card */}
                        <section className="glass-card rounded-2xl p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <h2 className="font-fraunces font-bold text-navy text-base">Your Account</h2>
                            </div>

                            {/* Avatar + info */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-navy/3 border border-navy/8 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy to-navy/70 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="font-fraunces text-lg font-bold text-white">
                                        {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "AD"}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-navy truncate">{user?.name ?? "Admin"}</p>
                                    <p className="text-navy/50 text-xs truncate">{user?.email}</p>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold mt-1.5 inline-block">Admin</span>
                                </div>
                            </div>

                            {/* Quick info pills */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-navy/3">
                                    <svg className="w-3.5 h-3.5 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-navy/60 truncate">Active</span>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-navy/3">
                                    <svg className="w-3.5 h-3.5 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                    <span className="text-navy/60 truncate">Secured</span>
                                </div>
                            </div>
                        </section>

                        {/* Change Password card */}
                        <section className="glass-card rounded-2xl p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                    </svg>
                                </div>
                                <h2 className="font-fraunces font-bold text-navy text-base">Change Password</h2>
                            </div>

                            {pwMsg && (
                                <div className={`mb-4 px-3.5 py-3 rounded-xl text-xs font-medium flex items-start gap-2 ${pwMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {pwMsg.type === "ok"
                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />}
                                    </svg>
                                    {pwMsg.msg}
                                </div>
                            )}

                            <div className="space-y-3.5">
                                <FormField label="Current Password">
                                    <div className="relative">
                                        <input type={showPw ? "text" : "password"} value={pwForm.current} onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))} className={INPUT + " pr-11"} placeholder="Current password" />
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

                            <button onClick={handlePwChange} disabled={pwSaving} className="mt-5 w-full bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                {pwSaving
                                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Changing…</>
                                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>Update Password</>}
                            </button>
                        </section>

                    </div>
                </div>

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
