"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { superAdminNavItems } from "../navItems";

type SettingTab = "general" | "security" | "notifications" | "integrations";

export default function SystemSettingsPage() {
    const [tab, setTab] = useState<SettingTab>("general");
    const [saved, setSaved] = useState(false);

    const [general, setGeneral] = useState({
        clinicName: "DentalCare Clinic",
        tagline: "Your Smile, Our Priority",
        supportEmail: "support@dentalcare.com",
        phone: "+1 (555) 100-2000",
        address: "456 Maple Avenue, Springfield, IL 62702",
        timezone: "America/Chicago",
        language: "English",
        currency: "USD",
    });

    const [security, setSecurity] = useState({
        sessionTimeout: "30",
        maxFailedLogins: "5",
        requireMFA: false,
        passwordMinLength: "8",
        tokenExpiry: "15",
        allowRegistration: true,
    });

    const [notifSettings, setNotifSettings] = useState({
        emailReminders: true,
        smsReminders: false,
        reminderLeadHours: "24",
        adminAlertOnNewUser: true,
        adminAlertOnBooking: true,
    });

    const [integrations] = useState([
        { name: "MongoDB Atlas", status: "connected", color: "bg-green-100 text-green-700" },
        { name: "Twilio SMS", status: "disconnected", color: "bg-red-100 text-red-600" },
        { name: "SendGrid Email", status: "connected", color: "bg-green-100 text-green-700" },
        { name: "Stripe Payments", status: "pending", color: "bg-yellow-100 text-yellow-700" },
        { name: "Google Calendar", status: "disconnected", color: "bg-red-100 text-red-600" },
    ]);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const TABS: { key: SettingTab; label: string }[] = [
        { key: "general", label: "General" },
        { key: "security", label: "Security" },
        { key: "notifications", label: "Notifications" },
        { key: "integrations", label: "Integrations" },
    ];

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={superAdminNavItems} title="DentalCare" subtitle="Super Admin" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">System Settings</h1>
                    <p className="text-navy/50 mt-1">Configure global clinic and system preferences.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Side nav */}
                    <nav className="lg:w-48 flex-shrink-0">
                        <div className="glass-card rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto">
                            {TABS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setTab(key)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab === key ? "bg-navy text-white" : "text-navy/50 hover:text-navy hover:bg-navy/5"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="flex-1 min-w-0">
                        {/* General */}
                        {tab === "general" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">General Settings</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {[
                                        { label: "Clinic Name", key: "clinicName" },
                                        { label: "Tagline", key: "tagline" },
                                        { label: "Support Email", key: "supportEmail" },
                                        { label: "Phone Number", key: "phone" },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
                                            <input
                                                type="text"
                                                value={general[key as keyof typeof general]}
                                                onChange={(e) => setGeneral((p) => ({ ...p, [key]: e.target.value }))}
                                                className="form-input py-2.5 text-sm"
                                            />
                                        </div>
                                    ))}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-medium text-navy/50 mb-1.5">Address</label>
                                        <input
                                            type="text"
                                            value={general.address}
                                            onChange={(e) => setGeneral((p) => ({ ...p, address: e.target.value }))}
                                            className="form-input py-2.5 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-navy/50 mb-1.5">Timezone</label>
                                        <select
                                            value={general.timezone}
                                            onChange={(e) => setGeneral((p) => ({ ...p, timezone: e.target.value }))}
                                            className="form-input py-2.5 text-sm"
                                        >
                                            {["America/Chicago", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kolkata"].map((tz) => (
                                                <option key={tz} value={tz}>{tz}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-navy/50 mb-1.5">Currency</label>
                                        <select
                                            value={general.currency}
                                            onChange={(e) => setGeneral((p) => ({ ...p, currency: e.target.value }))}
                                            className="form-input py-2.5 text-sm"
                                        >
                                            {["USD", "EUR", "GBP", "INR", "CAD"].map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <SaveRow onSave={handleSave} saved={saved} />
                            </div>
                        )}

                        {/* Security */}
                        {tab === "security" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">Security Settings</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {[
                                        { label: "Session Timeout (minutes)", key: "sessionTimeout" },
                                        { label: "Max Failed Logins", key: "maxFailedLogins" },
                                        { label: "Min Password Length", key: "passwordMinLength" },
                                        { label: "Access Token Expiry (minutes)", key: "tokenExpiry" },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
                                            <input
                                                type="number"
                                                value={security[key as keyof typeof security] as string}
                                                onChange={(e) => setSecurity((p) => ({ ...p, [key]: e.target.value }))}
                                                className="form-input py-2.5 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 space-y-4">
                                    {[
                                        { key: "requireMFA", label: "Require Multi-Factor Authentication", desc: "All users must verify via email/OTP" },
                                        { key: "allowRegistration", label: "Allow Public Registration", desc: "New users can sign up from the login page" },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-navy/5">
                                            <div>
                                                <p className="text-navy font-medium text-sm">{label}</p>
                                                <p className="text-navy/40 text-xs mt-0.5">{desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setSecurity((p) => ({ ...p, [key]: !p[key as keyof typeof security] }))}
                                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${security[key as keyof typeof security] ? "bg-gold" : "bg-navy/20"}`}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${security[key as keyof typeof security] ? "left-[22px]" : "left-0.5"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <SaveRow onSave={handleSave} saved={saved} />
                            </div>
                        )}

                        {/* Notifications */}
                        {tab === "notifications" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">Notification Settings</h3>
                                <div className="space-y-1 mb-5">
                                    {[
                                        { key: "emailReminders", label: "Email Appointment Reminders", desc: "Send email reminders to patients" },
                                        { key: "smsReminders", label: "SMS Appointment Reminders", desc: "Send SMS reminders (requires Twilio)" },
                                        { key: "adminAlertOnNewUser", label: "Alert Admin on New Sign-up", desc: "Notify admin when a new patient registers" },
                                        { key: "adminAlertOnBooking", label: "Alert Admin on New Booking", desc: "Notify admin when an appointment is booked" },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-4 rounded-xl hover:bg-navy/5 transition-colors">
                                            <div>
                                                <p className="text-navy font-medium text-sm">{label}</p>
                                                <p className="text-navy/40 text-xs mt-0.5">{desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifSettings((p) => ({ ...p, [key]: !p[key as keyof typeof notifSettings] }))}
                                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifSettings[key as keyof typeof notifSettings] ? "bg-gold" : "bg-navy/20"}`}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifSettings[key as keyof typeof notifSettings] ? "left-[22px]" : "left-0.5"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="max-w-xs">
                                    <label className="block text-xs font-medium text-navy/50 mb-1.5">Reminder Lead Time (hours)</label>
                                    <input
                                        type="number"
                                        value={notifSettings.reminderLeadHours}
                                        onChange={(e) => setNotifSettings((p) => ({ ...p, reminderLeadHours: e.target.value }))}
                                        className="form-input py-2.5 text-sm"
                                    />
                                </div>
                                <SaveRow onSave={handleSave} saved={saved} />
                            </div>
                        )}

                        {/* Integrations */}
                        {tab === "integrations" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">Third-Party Integrations</h3>
                                <div className="space-y-3">
                                    {integrations.map(({ name, status, color }) => (
                                        <div key={name} className="flex items-center justify-between p-4 rounded-xl bg-navy/5">
                                            <div>
                                                <p className="text-navy font-medium text-sm">{name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${color}`}>{status}</span>
                                                <button className="text-xs text-navy/50 hover:text-navy border border-navy/15 px-3 py-1.5 rounded-lg hover:bg-navy/5 transition-colors">
                                                    {status === "connected" ? "Configure" : "Connect"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function SaveRow({ onSave, saved }: { onSave: () => void; saved: boolean }) {
    return (
        <div className="mt-6 flex items-center gap-3">
            <button onClick={onSave} className="btn-primary text-sm px-6 py-2.5">Save Settings</button>
            {saved && (
                <span className="text-green-600 text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                </span>
            )}
        </div>
    );
}
