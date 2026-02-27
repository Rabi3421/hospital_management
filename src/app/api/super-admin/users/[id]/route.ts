import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";

/**
 * PATCH /api/super-admin/users/[id]  → update name, role, isActive, reset password
 * DELETE /api/super-admin/users/[id] → delete account (cannot delete super_admin)
 */
export const PATCH = withAuth(
    async (req) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id) return apiError("User ID is required.", 400);

        const target = await UserModel.findById(id).select("+password");
        if (!target) return apiError("User not found.", 404);

        // Cannot promote anyone to super_admin or modify an existing super_admin
        if (target.role === "super_admin") {
            return apiError("Super admin account cannot be modified via this endpoint.", 403);
        }

        const body = await req.json();
        const { name, email, role, isActive, newPassword } = body;

        if (name !== undefined) target.name = name;
        if (email !== undefined) target.email = email;
        if (role !== undefined && role !== "super_admin") target.role = role;
        if (isActive !== undefined) target.isActive = isActive;
        if (newPassword) target.password = newPassword; // pre-save hook re-hashes

        await target.save();

        const safe = {
            _id: target._id,
            name: target.name,
            email: target.email,
            role: target.role,
            isActive: target.isActive,
            updatedAt: target.updatedAt,
        };
        return apiSuccess(safe);
    },
    { roles: ["super_admin"] }
);

export const DELETE = withAuth(
    async (req) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id) return apiError("User ID is required.", 400);

        const target = await UserModel.findById(id);
        if (!target) return apiError("User not found.", 404);

        if (target.role === "super_admin") {
            return apiError("Super admin account cannot be deleted.", 403);
        }

        await target.deleteOne();
        return apiSuccess({ message: "Account deleted successfully." });
    },
    { roles: ["super_admin"] }
);
