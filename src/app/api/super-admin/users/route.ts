import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import type { Role } from "@/types/auth";

/**
 * GET /api/super-admin/users?role=admin|user  → list accounts
 * POST /api/super-admin/users                 → create a new admin
 */
export const GET = withAuth(
    async (req) => {
        await connectDB();
        const role = req.nextUrl.searchParams.get("role") as Role | null;

        // Never expose super_admin list via this route
        const query = role && role !== "super_admin" ? { role } : { role: { $in: ["user", "admin"] } };

        const users = await UserModel.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return apiSuccess(users);
    },
    { roles: ["super_admin"] }
);

export const POST = withAuth(
    async (req) => {
        await connectDB();
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return apiError("Name, email and password are required.", 400);
        }

        // Only allow creating admin or user — never another super_admin
        const allowedRoles: Role[] = ["admin", "user"];
        const assignedRole: Role = allowedRoles.includes(role) ? role : "admin";

        const existing = await UserModel.findOne({ email });
        if (existing) {
            return apiError("An account with this email already exists.", 409);
        }

        const user = await UserModel.create({ name, email, password, role: assignedRole });
        const safe = { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt };

        return apiSuccess(safe, 201);
    },
    { roles: ["super_admin"] }
);
