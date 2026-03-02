import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

/**
 * GET  /api/admin/appointments?status=&search=&page=1&limit=20&date=
 * Returns all appointments (admin-wide view)
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const { searchParams } = req.nextUrl;
        const status = searchParams.get("status") ?? "";
        const search = searchParams.get("search") ?? "";
        const date = searchParams.get("date") ?? "";
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
        const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (date) query.preferredDate = date;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { doctorPreference: { $regex: search, $options: "i" } },
            ];
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Appointment.countDocuments(query),
        ]);

        return apiSuccess({ appointments, total, page, limit, pages: Math.ceil(total / limit) });
    },
    { roles: ["admin", "super_admin"] }
);
