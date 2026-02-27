"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    {
        label: "Overview",
        href: "/dashboard/user",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        label: "My Appointments",
        href: "/dashboard/user/appointments",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
    },
    {
        label: "Medical Records",
        href: "/dashboard/user/records",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
    },
    {
        label: "Prescriptions",
        href: "/dashboard/user/prescriptions",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />
            </svg>
        ),
    },
    {
        label: "Profile",
        href: "/dashboard/user/profile",
        icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
];

type Section = "personal" | "health" | "security" | "notifications";

const SECTION_LABELS: Record<Section, string> = {
    personal: "Personal Info",
    health: "Health Info",
    security: "Security",
    notifications: "Notifications",
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<Section>("personal");
    const [saved, setSaved] = useState(false);

    // Form states
    const [personalForm, setPersonalForm] = useState({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: "+1 (555) 234-5678",
        dob: "1992-06-15",
        gender: "Male",
        address: "123 Oak Street, Springfield, IL 62701",
        emergencyContact: "Jane Smith (+1 555 999 8888)",
    });

    const [healthForm, setHealthForm] = useState({
        bloodType: "O+",
        allergies: "Penicillin, Latex",
        currentMedications: "Fluoride Gel 1.1% (nightly)",
        medicalConditions: "None",
        insuranceProvider: "BlueCross BlueShield",
        insuranceId: "BCBS-78901234",
        primaryDoctor: "Dr. Sarah Johnson",
        lastCheckup: "Feb 10, 2026",
    });

    const [notifications, setNotifications] = useState({
        appointmentReminders: true,
        prescriptionAlerts: true,
        labResults: true,
        promotions: false,
        smsAlerts: true,
        emailAlerts: true,
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const initials = (user?.name ?? "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={navItems} title="DentalCare" subtitle="Patient Portal" />

            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">My Profile</h1>
                    <p className="text-navy/50 mt-1">Manage your personal information and preferences.</p>
                </div>

                {/* Profile hero card */}
                <div className="glass-card rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-navy flex items-center justify-center flex-shrink-0">
                        <span className="font-fraunces text-2xl font-bold text-gold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-fraunces text-xl font-bold text-navy">{user?.name ?? "Patient"}</h2>
                        <p className="text-navy/50 text-sm mt-0.5">{user?.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-medium capitalize">
                                {user?.role ?? "user"}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                Active
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-gold text-sm px-4 py-2">Edit Photo</button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar nav */}
                    <div className="lg:w-52 flex-shrink-0">
                        <nav className="glass-card rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto">
                            {(Object.keys(SECTION_LABELS) as Section[]).map((sec) => (
                                <button
                                    key={sec}
                                    onClick={() => setActiveSection(sec)}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeSection === sec
                                            ? "bg-navy text-white"
                                            : "text-navy/50 hover:text-navy hover:bg-navy/5"
                                        }`}
                                >
                                    {SECTION_LABELS[sec]}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main content panel */}
                    <div className="flex-1 min-w-0">
                        {/* ─── Personal Info ─── */}
                        {activeSection === "personal" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">Personal Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {[
                                        { label: "Full Name", key: "name", type: "text" },
                                        { label: "Email Address", key: "email", type: "email" },
                                        { label: "Phone Number", key: "phone", type: "tel" },
                                        { label: "Date of Birth", key: "dob", type: "date" },
                                    ].map(({ label, key, type }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
                                            <input
                                                type={type}
                                                value={personalForm[key as keyof typeof personalForm]}
                                                onChange={(e) => setPersonalForm((prev) => ({ ...prev, [key]: e.target.value }))}
                                                className="form-input py-2.5 text-sm"
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-xs font-medium text-navy/50 mb-1.5">Gender</label>
                                        <select
                                            value={personalForm.gender}
                                            onChange={(e) => setPersonalForm((prev) => ({ ...prev, gender: e.target.value }))}
                                            className="form-input py-2.5 text-sm appearance-none"
                                        >
                                            {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                                                <option key={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-medium text-navy/50 mb-1.5">Address</label>
                                        <input
                                            type="text"
                                            value={personalForm.address}
                                            onChange={(e) => setPersonalForm((prev) => ({ ...prev, address: e.target.value }))}
                                            className="form-input py-2.5 text-sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-medium text-navy/50 mb-1.5">Emergency Contact</label>
                                        <input
                                            type="text"
                                            value={personalForm.emergencyContact}
                                            onChange={(e) => setPersonalForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                                            className="form-input py-2.5 text-sm"
                                        />
                                    </div>
                                </div>
                                <SaveButton onSave={handleSave} saved={saved} />
                            </div>
                        )}

                        {/* ─── Health Info ─── */}
                        {activeSection === "health" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">Health Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {[
                                        { label: "Blood Type", key: "bloodType" },
                                        { label: "Insurance Provider", key: "insuranceProvider" },
                                        { label: "Insurance ID", key: "insuranceId" },
                                        { label: "Primary Doctor", key: "primaryDoctor" },
                                        { label: "Last Checkup", key: "lastCheckup" },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
                                            <input
                                                type="text"
                                                value={healthForm[key as keyof typeof healthForm]}
                                                onChange={(e) => setHealthForm((prev) => ({ ...prev, [key]: e.target.value }))}
                                                className="form-input py-2.5 text-sm"
                                            />
                                        </div>
                                    ))}
                                    {[
                                        { label: "Known Allergies", key: "allergies" },
                                        { label: "Current Medications", key: "currentMedications" },
                                        { label: "Medical Conditions", key: "medicalConditions" },
                                    ].map(({ label, key }) => (
                                        <div key={key} className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
                                            <textarea
                                                rows={2}
                                                value={healthForm[key as keyof typeof healthForm]}
                                                onChange={(e) => setHealthForm((prev) => ({ ...prev, [key]: e.target.value }))}
                                                className="form-input py-2.5 text-sm resize-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <SaveButton onSave={handleSave} saved={saved} />
                            </div>
                        )}

                        {/* ─── Security ─── */}
                        {activeSection === "security" && (
                            <div className="space-y-4">
                                {/* Change password */}
                                <div className="glass-card rounded-2xl p-6">
                                    <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">Change Password</h3>
                                    <div className="space-y-4 max-w-md">
                                        {[
                                            { label: "Current Password", placeholder: "••••••••" },
                                            { label: "New Password", placeholder: "Min. 8 characters" },
                                            { label: "Confirm New Password", placeholder: "Re-enter new password" },
                                        ].map(({ label, placeholder }) => (
                                            <div key={label}>
                                                <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
                                                <input type="password" placeholder={placeholder} className="form-input py-2.5 text-sm" />
                                            </div>
                                        ))}
                                        <button className="btn-primary text-sm px-6 py-2.5 mt-2">Update Password</button>
                                    </div>
                                </div>

                                {/* Sessions */}
                                <div className="glass-card rounded-2xl p-6">
                                    <h3 className="font-fraunces text-lg font-semibold text-navy mb-5">Active Sessions</h3>
                                    <div className="space-y-3">
                                        {[
                                            { device: "MacBook Air — Chrome", location: "Springfield, IL", current: true, time: "Now" },
                                            { device: "iPhone 15 — Safari", location: "Springfield, IL", current: false, time: "2 hours ago" },
                                        ].map((session) => (
                                            <div key={session.device} className="flex items-center justify-between p-4 rounded-xl bg-navy/5">
                                                <div>
                                                    <p className="text-navy text-sm font-medium flex items-center gap-2">
                                                        {session.device}
                                                        {session.current && (
                                                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Current</span>
                                                        )}
                                                    </p>
                                                    <p className="text-navy/40 text-xs mt-0.5">{session.location} • {session.time}</p>
                                                </div>
                                                {!session.current && (
                                                    <button className="text-xs text-red-500 hover:underline">Revoke</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Notifications ─── */}
                        {activeSection === "notifications" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="font-fraunces text-lg font-semibold text-navy mb-6">Notification Preferences</h3>
                                <div className="space-y-1">
                                    {(
                                        [
                                            { key: "appointmentReminders", label: "Appointment Reminders", desc: "Get reminded 24h before your appointment" },
                                            { key: "prescriptionAlerts", label: "Prescription Alerts", desc: "Notify when new prescription is issued" },
                                            { key: "labResults", label: "Lab Results Ready", desc: "Alert when test results are uploaded" },
                                            { key: "promotions", label: "Promotions & Offers", desc: "Special offers and health tips" },
                                            { key: "smsAlerts", label: "SMS Alerts", desc: "Receive notifications via text message" },
                                            { key: "emailAlerts", label: "Email Alerts", desc: "Receive notifications via email" },
                                        ] as { key: keyof typeof notifications; label: string; desc: string }[]
                                    ).map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-4 rounded-xl hover:bg-navy/5 transition-colors">
                                            <div>
                                                <p className="text-navy font-medium text-sm">{label}</p>
                                                <p className="text-navy/40 text-xs mt-0.5">{desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifications[key] ? "bg-gold" : "bg-navy/20"
                                                    }`}
                                                aria-label={`Toggle ${label}`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications[key] ? "left-[22px]" : "left-0.5"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <SaveButton onSave={handleSave} saved={saved} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function SaveButton({ onSave, saved }: { onSave: () => void; saved: boolean }) {
    return (
        <div className="mt-6 flex items-center gap-3">
            <button onClick={onSave} className="btn-primary text-sm px-6 py-2.5">
                Save Changes
            </button>
            {saved && (
                <span className="text-green-600 text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved successfully
                </span>
            )}
        </div>
    );
}
