import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "@/types/auth";

const ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || "fallback_access_secret_change_me"
);
const REFRESH_SECRET = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_change_me"
);

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

// ─── Sign ────────────────────────────────────────────────
export async function signAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(ACCESS_EXPIRES)
        .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(REFRESH_EXPIRES)
        .sign(REFRESH_SECRET);
}

// ─── Verify ──────────────────────────────────────────────
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, ACCESS_SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, REFRESH_SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

// ─── Cookie Helpers ──────────────────────────────────────
export const ACCESS_COOKIE = "dc_access_token";
export const REFRESH_COOKIE = "dc_refresh_token";

export function accessCookieOptions(maxAge = 15 * 60) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge,
    };
}

export function refreshCookieOptions(maxAge = 7 * 24 * 60 * 60) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge,
    };
}

export function clearCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
    };
}
