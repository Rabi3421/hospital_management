import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import mongoose from "mongoose";

/**
 * PATCH /api/admin/users/[id] — toggle isActive, update name/email
 * DELETE /api/admin/users/[id] — soft-delete (deactivate)
 */
export const PATCH = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid user ID", 400);

        const target = await UserModel.findById(id);
        if (!target) return apiError("User not found", 404);
        if (target.role === "super_admin") return apiError("Cannot modify super admin", 403);

        const body = await req.json();
        const { name, email, isActive, newPassword } = body;

        if (name !== undefined) target.name = name;
        if (email !== undefined) target.email = email.toLowerCase();
        if (isActive !== undefined) target.isActive = isActive;
        if (newPassword) target.password = newPassword;

        await target.save();
        const safe = { _id: target._id, name: target.name, email: target.email, role: target.role, isActive: target.isActive };
        return apiSuccess(safe);
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid user ID", 400);

        const target = await UserModel.findById(id);
        if (!target) return apiError("User not found", 404);
        if (target.role !== "user") return apiError("Admins cannot be deleted from this endpoint", 403);

        await UserModel.findByIdAndDelete(id);
        return apiSuccess({ message: "User deleted" });
    },
    { roles: ["admin", "super_admin"] }
);
