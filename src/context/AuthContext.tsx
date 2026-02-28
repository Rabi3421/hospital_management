"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "@/types/auth";
import { getStoredGuestTokens, clearStoredGuestTokens } from "@/app/appointments/components/AppointmentsPageContent";

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    claimGuestAppointments: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const refreshUser = useCallback(async () => {
        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

            const res = await fetch("/api/auth/me", { headers, credentials: "include" });
            if (res.ok) {
                const json = await res.json();
                setUser(json.data?.user ?? null);
            } else {
                setUser(null);
                setAccessToken(null);
            }
        } catch {
            setUser(null);
        }
    }, [accessToken]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await refreshUser();
            setIsLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } finally {
            setUser(null);
            setAccessToken(null);
            window.location.href = "/auth/login";
        }
    };

    /**
     * Called right after a user logs in or registers.
     * Reads guest tokens from localStorage and claims those appointments
     * by linking them to the newly authenticated user.
     */
    const claimGuestAppointments = useCallback(async (token: string) => {
        const guestTokens = getStoredGuestTokens();
        if (!guestTokens.length) return;
        try {
            await fetch("/api/appointments/claim", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ guestTokens }),
            });
            // Clean up regardless of outcome
            clearStoredGuestTokens();
        } catch {
            // Non-critical — silently swallow; user can always view appointments by email
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, accessToken, setAccessToken, logout, refreshUser, claimGuestAppointments }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
