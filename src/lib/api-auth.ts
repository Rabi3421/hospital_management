import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, ACCESS_COOKIE } from "./jwt";
import type { JWTPayload, Role } from "@/types/auth";

type RouteHandler = (
    req: NextRequest,
    context: { user: JWTPayload; params?: Record<string, string> }
) => Promise<NextResponse>;

interface ProtectOptions {
    roles?: Role[];
}

/**
 * Higher-order function that wraps an API Route handler with auth protection.
 * Usage:
 *   export const GET = withAuth(async (req, { user }) => { ... }, { roles: ["admin"] })
 */
export function withAuth(handler: RouteHandler, options: ProtectOptions = {}) {
    return async (req: NextRequest, params?: { params?: Record<string, string> }) => {
        // 1. Extract token from cookie or Authorization header
        let token =
            req.cookies.get(ACCESS_COOKIE)?.value ||
            req.headers.get("authorization")?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { error: "Access token is required." },
                { status: 401 }
            );
        }

        // 2. Verify token
        const payload = await verifyAccessToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: "Invalid or expired access token." },
                { status: 401 }
            );
        }

        // 3. Role check
        if (options.roles && options.roles.length > 0) {
            if (!options.roles.includes(payload.role)) {
                return NextResponse.json(
                    { error: "You do not have permission to access this resource." },
                    { status: 403 }
                );
            }
        }

        // 4. Call the actual handler
        return handler(req, { user: payload, params: params?.params });
    };
}

// ─── Helpers ─────────────────────────────────────────────
export function apiSuccess<T>(data: T, status = 200): NextResponse {
    return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): NextResponse {
    return NextResponse.json({ success: false, error: message }, { status });
}
