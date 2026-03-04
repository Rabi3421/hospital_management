"use client";

import { useEffect, useState } from "react";

export interface ClinicSettings {
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

const DEFAULT: ClinicSettings = {
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

// Simple in-memory cache so multiple components on the same page don't
// fire duplicate network requests.
let _cache: ClinicSettings | null = null;
let _promise: Promise<ClinicSettings> | null = null;

async function fetchSettings(): Promise<ClinicSettings> {
    if (_cache) return _cache;
    if (_promise) return _promise;
    _promise = fetch("/api/clinic-settings")
        .then((r) => r.json())
        .then((json) => {
            _cache = json.success ? { ...DEFAULT, ...json.data } : DEFAULT;
            return _cache!;
        })
        .catch(() => DEFAULT);
    return _promise;
}

export function useClinicSettings() {
    const [data, setData] = useState<ClinicSettings>(_cache ?? DEFAULT);
    const [loading, setLoading] = useState(!_cache);

    useEffect(() => {
        if (_cache) { setData(_cache); setLoading(false); return; }
        fetchSettings().then((s) => { setData(s); setLoading(false); });
    }, []);

    return { clinic: data, loading };
}
