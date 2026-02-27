"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
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

    return (
        <AuthContext.Provider value={{ user, isLoading, accessToken, setAccessToken, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
