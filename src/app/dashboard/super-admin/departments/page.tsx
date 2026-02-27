"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { superAdminNavItems } from "../navItems";

interface Department {
    id: number;
    name: string;
    head: string;
    doctors: number;
    patients: number;
    color: string;
    icon: string;
    status: "active" | "maintenance";
}

const DEPTS: Department[] = [
    { id: 1, name: "General Dentistry", head: "Dr. Sarah Johnson", doctors: 6, patients: 340, color: "bg-blue-100 text-blue-700", icon: "🦷", status: "active" },
    { id: 2, name: "Orthodontics", head: "Dr. Michael Chen", doctors: 3, patients: 180, color: "bg-purple-100 text-purple-700", icon: "🔬", status: "active" },
    { id: 3, name: "Oral Surgery", head: "Dr. Emily Rodriguez", doctors: 2, patients: 95, color: "bg-red-100 text-red-700", icon: "🏥", status: "active" },
    { id: 4, name: "Periodontics", head: "Dr. James Williams", doctors: 2, patients: 120, color: "bg-green-100 text-green-700", icon: "🌿", status: "active" },
    { id: 5, name: "Endodontics", head: "Dr. Priya Patel", doctors: 2, patients: 88, color: "bg-yellow-100 text-yellow-700", icon: "⚙️", status: "active" },
    { id: 6, name: "Pediatric Dentistry", head: "Dr. Lisa Thompson", doctors: 3, patients: 210, color: "bg-pink-100 text-pink-700", icon: "👶", status: "maintenance" },
];

export default function DepartmentsPage() {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", head: "", status: "active" });

    const filtered = DEPTS.filter(
        (d) =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.head.toLowerCase().includes(search.toLowerCase())
    );

    const totalDoctors = DEPTS.reduce((s, d) => s + d.doctors, 0);
    const totalPatients = DEPTS.reduce((s, d) => s + d.patients, 0);

    return (
        <div className="flex w-full">
            <DashboardSidebar navItems={superAdminNavItems} title="DentalCare" subtitle="Super Admin" />
            <main className="flex-1 min-w-0 p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-fraunces text-2xl lg:text-3xl font-bold text-navy">Departments</h1>
                        <p className="text-navy/50 mt-1">Manage clinic departments and their staff.</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Department
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Departments", value: DEPTS.length },
                        { label: "Active", value: DEPTS.filter((d) => d.status === "active").length },
                        { label: "Total Doctors", value: totalDoctors },
                        { label: "Total Patients", value: totalPatients },
                    ].map(({ label, value }) => (
                        <div key={label} className="glass-card rounded-2xl p-4 text-center">
                            <p className="text-2xl font-fraunces font-bold text-navy">{value}</p>
                            <p className="text-navy/50 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3">
                    <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search departments…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30"
                    />
                </div>

                {/* Department grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((dept) => (
                        <div key={dept.id} className="glass-card rounded-2xl p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${dept.color.split(" ")[0]}`}>
                                    {dept.icon}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${dept.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {dept.status === "active" ? "Active" : "Maintenance"}
                                </span>
                            </div>
                            <h3 className="font-fraunces font-semibold text-navy text-base mb-1">{dept.name}</h3>
                            <p className="text-navy/50 text-xs mb-4">{dept.head}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-navy/5 p-3 text-center">
                                    <p className="text-lg font-bold text-navy font-fraunces">{dept.doctors}</p>
                                    <p className="text-navy/40 text-xs">Doctors</p>
                                </div>
                                <div className="rounded-xl bg-navy/5 p-3 text-center">
                                    <p className="text-lg font-bold text-navy font-fraunces">{dept.patients}</p>
                                    <p className="text-navy/40 text-xs">Patients</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 text-xs py-2 rounded-xl border border-navy/15 text-navy/60 hover:bg-navy/5 transition-colors">Edit</button>
                                <button className="flex-1 text-xs py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Add Department Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-6 w-full max-w-md relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="font-fraunces text-xl font-bold text-navy mb-6">Add Department</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-navy/50 mb-1.5">Department Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="e.g., Cosmetic Dentistry" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-navy/50 mb-1.5">Department Head</label>
                                <input type="text" value={form.head} onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Dr. Full Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-navy/50 mb-1.5">Status</label>
                                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="form-input py-2.5 text-sm">
                                    <option value="active">Active</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="btn-primary text-sm px-6 py-2.5" onClick={() => setShowModal(false)}>Create Department</button>
                            <button className="btn-gold text-sm px-5 py-2.5" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
