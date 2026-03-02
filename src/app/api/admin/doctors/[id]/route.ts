import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import mongoose from "mongoose";

function getIdFromPath(req: NextRequest): string {
    return req.nextUrl.pathname.split("/").pop() ?? "";
}

/**
 * GET    /api/admin/doctors/[id]   — get single doctor
 * PATCH  /api/admin/doctors/[id]   — update doctor
 * DELETE /api/admin/doctors/[id]   — delete doctor
 */

export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid doctor ID", 400);
        const doctor = await Doctor.findById(id).lean();
        if (!doctor) return apiError("Doctor not found", 404);
        return apiSuccess(doctor);
    },
    { roles: ["admin", "super_admin"] }
);

export const PATCH = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid doctor ID", 400);

        const body = await req.json();
        const allowedFields = ["name", "specialty", "email", "phone", "department", "qualification", "experience", "bio", "avatar", "availableDays", "isActive"];
        const update: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (key in body) update[key] = body[key];
        }

        const doctor = await Doctor.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
        if (!doctor) return apiError("Doctor not found", 404);
        return apiSuccess(doctor);
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid doctor ID", 400);
        const doctor = await Doctor.findByIdAndDelete(id).lean();
        if (!doctor) return apiError("Doctor not found", 404);
        return apiSuccess({ deleted: true });
    },
    { roles: ["admin", "super_admin"] }
);
