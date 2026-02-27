import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ACCESS_COOKIE } from "@/lib/jwt";
import type { Role } from "@/types/auth";

const DASHBOARD_ROLE_MAP: Record<string, Role[]> = {
    "/dashboard/user": ["user", "admin", "super_admin"],
    "/dashboard/admin": ["admin", "super_admin"],
    "/dashboard/super-admin": ["super_admin"],
};

function getDashboardForRole(role: Role): string {
    switch (role) {
        case "super_admin":
            return "/dashboard/super-admin";
        case "admin":
            return "/dashboard/admin";
        default:
            return "/dashboard/user";
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ---- Get access token ----
    const token = request.cookies.get(ACCESS_COOKIE)?.value;

    // ---- Auth pages (/auth/*) ----
    if (pathname.startsWith("/auth")) {
        if (token) {
            try {
                const secret = new TextEncoder().encode(
                    process.env.JWT_ACCESS_SECRET ?? ""
                );
                const { payload } = await jwtVerify(token, secret);
                const role = (payload as { role?: Role }).role;
                if (role) {
                    // Already logged in → redirect to correct dashboard
                    const url = request.nextUrl.clone();
                    url.pathname = getDashboardForRole(role);
                    return NextResponse.redirect(url);
                }
            } catch {
                // Token invalid/expired — let through to login page
            }
        }
        return NextResponse.next();
    }

    // ---- Dashboard pages (/dashboard/*) ----
    if (pathname.startsWith("/dashboard")) {
        // No token → redirect to login
        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = "/auth/login";
            url.searchParams.set("from", pathname);
            return NextResponse.redirect(url);
        }

        try {
            const secret = new TextEncoder().encode(
                process.env.JWT_ACCESS_SECRET ?? ""
            );
            const { payload } = await jwtVerify(token, secret);
            const role = (payload as { role?: Role }).role;

            if (!role) throw new Error("No role in token");

            // Check role is allowed for this dashboard segment
            const matchedSegment = Object.keys(DASHBOARD_ROLE_MAP).find((seg) =>
                pathname.startsWith(seg)
            );

            if (matchedSegment) {
                const allowedRoles = DASHBOARD_ROLE_MAP[matchedSegment];
                if (!allowedRoles.includes(role)) {
                    // Wrong role → redirect to their own dashboard
                    const url = request.nextUrl.clone();
                    url.pathname = getDashboardForRole(role);
                    return NextResponse.redirect(url);
                }
            }

            return NextResponse.next();
        } catch {
            // Token expired/invalid → redirect to login
            const url = request.nextUrl.clone();
            url.pathname = "/auth/login";
            url.searchParams.set("from", pathname);
            const response = NextResponse.redirect(url);
            // Clear the bad cookie
            response.cookies.delete(ACCESS_COOKIE);
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/:path*"],
};
