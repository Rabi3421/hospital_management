"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageNavBar from "@/components/shared/PageNavBar";
import PageFooter from "@/components/shared/PageFooter";
import type { Role } from "@/types/auth";

export default function RegisterPage() {
    const router = useRouter();
    const { setAccessToken, refreshUser, claimGuestAppointments } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                setError(json.message ?? "Registration failed. Please try again.");
                return;
            }

            const accessToken: string = json.data?.accessToken ?? "";
            setAccessToken(accessToken);
            await refreshUser();
            // Link any guest appointments booked before registration
            if (accessToken) await claimGuestAppointments(accessToken);

            const role: Role = json.data?.user?.role ?? "user";
            const dashboardMap: Record<Role, string> = {
                user: "/dashboard/user",
                admin: "/dashboard/admin",
                super_admin: "/dashboard/super-admin",
            };
            // Respect ?next= redirect param
            const params = new URLSearchParams(window.location.search);
            const next = params.get("next");
            router.push(next ?? dashboardMap[role]);
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageNavBar />
            <div className="min-h-screen bg-cream flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-10" />
                <div className="relative z-10 text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center mx-auto mb-8">
                        <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                    </div>
                    <h2 className="font-fraunces text-4xl font-bold text-white mb-4">
                        Join DentalCare
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Create your account and start managing your dental health with our world-class team of professionals.
                    </p>
                    <div className="mt-10 space-y-4">
                        {[
                            "Personalized appointment management",
                            "Direct access to dental records",
                            "Real-time notifications & reminders",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-left">
                                <div className="w-5 h-5 rounded-full bg-gold/30 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-white/70 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
                            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <span className="font-fraunces text-xl font-bold text-navy group-hover:text-gold transition-colors">
                            DentalCare
                        </span>
                    </Link>

                    <h1 className="font-fraunces text-3xl font-bold text-navy mb-2">Create Account</h1>
                    <p className="text-navy/50 mb-8">Fill in your details to get started</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                    placeholder="John Smith"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                    placeholder="Min. 8 characters"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/30 hover:text-gold transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-navy/30 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                    placeholder="Re-enter your password"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-navy text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-navy/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-navy/50 text-sm">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-gold font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            </div>
            <PageFooter />
        </>
    );
}
