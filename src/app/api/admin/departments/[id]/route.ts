import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Department from "@/models/Department";
import mongoose from "mongoose";

/**
 * PATCH  /api/admin/departments/[id]
 * DELETE /api/admin/departments/[id]
 */
export const PATCH = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid department ID", 400);

        const dept = await Department.findById(id);
        if (!dept) return apiError("Department not found", 404);

        const body = await req.json();
        const { name, description, head, doctorCount, isActive, icon } = body;

        if (name !== undefined) dept.name = name;
        if (description !== undefined) dept.description = description;
        if (head !== undefined) dept.head = head;
        if (doctorCount !== undefined) dept.doctorCount = doctorCount;
        if (isActive !== undefined) dept.isActive = isActive;
        if (icon !== undefined) dept.icon = icon;

        await dept.save();
        return apiSuccess(dept.toObject());
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = req.nextUrl.pathname.split("/").pop();
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid department ID", 400);

        const dept = await Department.findByIdAndDelete(id);
        if (!dept) return apiError("Department not found", 404);
        return apiSuccess({ message: "Department deleted" });
    },
    { roles: ["admin", "super_admin"] }
);
