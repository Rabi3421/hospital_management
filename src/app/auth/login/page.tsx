"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PageNavBar from "@/components/shared/PageNavBar";
import PageFooter from "@/components/shared/PageFooter";
import type { Role } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: {
        user: { id: string; name: string; email: string; role: Role };
        accessToken: string;
    };
}

const OAUTH_ERRORS: Record<string, string> = {
    google_denied: "Google sign-in was cancelled.",
    google_token: "Failed to authenticate with Google. Please try again.",
    google_email: "Could not verify your Google email address.",
    account_deactivated: "Your account has been deactivated. Please contact support.",
    google_server: "A server error occurred during Google sign-in.",
};

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAccessToken, refreshUser, claimGuestAppointments } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Show OAuth error if redirected back with ?error=
    useEffect(() => {
        const oauthErr = searchParams.get("error");
        if (oauthErr && OAUTH_ERRORS[oauthErr]) setError(OAUTH_ERRORS[oauthErr]);
    }, [searchParams]);

    const handleGoogleLogin = () => {
        const next = searchParams.get("next") ?? "";
        window.location.href = `/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const json: ApiResponse = await res.json();

            if (!res.ok || !json.success) {
                setError(json.message ?? "Login failed. Please try again.");
                return;
            }

            const { accessToken, user } = json.data!;
            setAccessToken(accessToken);
            await refreshUser();
            // Link any guest appointments booked before login
            await claimGuestAppointments(accessToken);

            const role = user.role;
            const dashboardMap: Record<Role, string> = {
                user: "/dashboard/user",
                admin: "/dashboard/admin",
                super_admin: "/dashboard/super-admin",
            };

            // Respect ?next= redirect param (e.g. from appointments page)
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
            <div className="min-h-screen bg-cream flex pt-20">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-10" />
                <div className="relative z-10 text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center mx-auto mb-8">
                        <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="font-fraunces text-4xl font-bold text-white mb-4">
                        Welcome Back
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Sign in to access your personalized DentalCare dashboard and manage your health journey.
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-6">
                        {[
                            { label: "Patients", value: "2,800+" },
                            { label: "Doctors", value: "8+" },
                            { label: "Years", value: "15+" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="font-fraunces text-2xl font-bold text-gold">{stat.value}</div>
                                <div className="text-white/50 text-sm mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
                        <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
                            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <span className="font-fraunces text-xl font-bold text-navy group-hover:text-gold transition-colors">
                            DentalCare
                        </span>
                    </Link>

                    <h1 className="font-fraunces text-3xl font-bold text-navy mb-2">Sign In</h1>
                    <p className="text-navy/50 mb-8">Enter your credentials to continue</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-navy/15 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all text-sm font-semibold text-navy shadow-sm"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <span className="flex-1 h-px bg-navy/10" />
                        <span className="text-xs text-navy/35 font-medium">or continue with email</span>
                        <span className="flex-1 h-px bg-navy/10" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
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
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-navy/50 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                            href={searchParams.get("next") ? `/auth/register?next=${encodeURIComponent(searchParams.get("next")!)}` : "/auth/register"}
                            className="text-gold font-medium hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
            </div>
            <PageFooter />
        </>
    );
}
