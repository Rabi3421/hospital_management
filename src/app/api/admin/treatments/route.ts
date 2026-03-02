import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Treatment from "@/models/Treatment";

/**
 * GET  /api/admin/treatments  — list treatments (filterable by status, search, date)
 * POST /api/admin/treatments  — create a treatment record
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const { searchParams } = req.nextUrl;
        const status = searchParams.get("status") ?? "";
        const search = searchParams.get("search") ?? "";
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
        const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { patientName: { $regex: search, $options: "i" } },
                { treatmentName: { $regex: search, $options: "i" } },
                { doctor: { $regex: search, $options: "i" } },
                { patientEmail: { $regex: search, $options: "i" } },
            ];
        }

        const [treatments, total] = await Promise.all([
            Treatment.find(query)
                .sort({ date: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Treatment.countDocuments(query),
        ]);

        return apiSuccess({ treatments, total, page, limit, pages: Math.ceil(total / limit) });
    },
    { roles: ["admin", "super_admin"] }
);

export const POST = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const body = await req.json();
        const {
            patientName, patientEmail, patientPhone, treatmentName,
            toothNumbers, date, doctor, doctorId, cost, status, notes, followUpDate,
        } = body;

        if (!patientName?.trim()) return apiError("Patient name is required", 400);
        if (!treatmentName?.trim()) return apiError("Treatment name is required", 400);
        if (!date) return apiError("Date is required", 400);

        const treatment = await Treatment.create({
            patientName: patientName.trim(),
            patientEmail: patientEmail ?? "",
            patientPhone: patientPhone ?? "",
            treatmentName: treatmentName.trim(),
            toothNumbers: toothNumbers ?? "",
            date,
            doctor: doctor ?? "",
            doctorId: doctorId ?? null,
            cost: Number(cost) || 0,
            status: status ?? "planned",
            notes: notes ?? "",
            followUpDate: followUpDate ?? "",
        });

        return apiSuccess(treatment.toObject(), 201);
    },
    { roles: ["admin", "super_admin"] }
);
