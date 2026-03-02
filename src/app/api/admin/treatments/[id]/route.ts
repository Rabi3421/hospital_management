import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Treatment from "@/models/Treatment";
import mongoose from "mongoose";

function getIdFromPath(req: NextRequest): string {
    return req.nextUrl.pathname.split("/").pop() ?? "";
}

/**
 * GET    /api/admin/treatments/[id]
 * PATCH  /api/admin/treatments/[id]
 * DELETE /api/admin/treatments/[id]
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);
        const treatment = await Treatment.findById(id).lean();
        if (!treatment) return apiError("Treatment not found", 404);
        return apiSuccess(treatment);
    },
    { roles: ["admin", "super_admin"] }
);

export const PATCH = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);

        const body = await req.json();
        const allowed = [
            "patientName", "patientEmail", "patientPhone", "treatmentName",
            "toothNumbers", "date", "doctor", "doctorId", "cost",
            "status", "notes", "followUpDate",
        ];
        const update: Record<string, unknown> = {};
        for (const key of allowed) {
            if (key in body) update[key] = body[key];
        }

        const treatment = await Treatment.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true, runValidators: true }
        ).lean();
        if (!treatment) return apiError("Treatment not found", 404);
        return apiSuccess(treatment);
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);
        const treatment = await Treatment.findByIdAndDelete(id).lean();
        if (!treatment) return apiError("Treatment not found", 404);
        return apiSuccess({ deleted: true });
    },
    { roles: ["admin", "super_admin"] }
);
