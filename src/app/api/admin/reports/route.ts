import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

/**
 * GET /api/admin/reports
 * Returns aggregated stats for reports page
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const { searchParams } = req.nextUrl;
        const range = searchParams.get("range") ?? "30"; // days
        const days = parseInt(range);

        const since = new Date();
        since.setDate(since.getDate() - days);

        // Appointment counts by status
        const [total, pending, confirmed, completed, cancelled] = await Promise.all([
            Appointment.countDocuments({ createdAt: { $gte: since } }),
            Appointment.countDocuments({ status: "pending", createdAt: { $gte: since } }),
            Appointment.countDocuments({ status: "confirmed", createdAt: { $gte: since } }),
            Appointment.countDocuments({ status: "completed", createdAt: { $gte: since } }),
            Appointment.countDocuments({ status: "cancelled", createdAt: { $gte: since } }),
        ]);

        // Total users registered in period
        const newPatients = await User.countDocuments({ role: "user", createdAt: { $gte: since } });
        const totalPatients = await User.countDocuments({ role: "user" });

        // Daily trend for the period
        const dailyRaw = await Appointment.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Service distribution
        const serviceRaw = await Appointment.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: "$service", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);

        // Status distribution
        const statusDist = [
            { name: "Pending", value: pending, color: "#C9A96E" },
            { name: "Confirmed", value: confirmed, color: "#4B9CD3" },
            { name: "Completed", value: completed, color: "#5BBF8E" },
            { name: "Cancelled", value: cancelled, color: "#EF4444" },
        ];

        return apiSuccess({
            summary: { total, pending, confirmed, completed, cancelled, newPatients, totalPatients },
            daily: dailyRaw.map((d) => ({ date: d._id, count: d.count })),
            services: serviceRaw.map((s) => ({ name: s._id || "Other", count: s.count })),
            statusDist,
        });
    },
    { roles: ["admin", "super_admin"] }
);
