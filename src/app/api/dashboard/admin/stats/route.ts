import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import Department from "@/models/Department";
import type { JWTPayload } from "@/types/auth";

/**
 * GET /api/dashboard/admin/stats
 * Accessible by: admin, super_admin
 */
export const GET = withAuth(
    async (_req: NextRequest, _ctx: { user: JWTPayload }) => {
        try {
            await connectDB();

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            const todayStr = todayStart.toISOString().split("T")[0];

            const [
                totalUsers,
                totalAdmins,
                totalAppointmentsToday,
                pendingAppointments,
                activeDepartments,
                recentAppointments,
            ] = await Promise.all([
                User.countDocuments({ role: "user", isActive: true }),
                User.countDocuments({ role: "admin", isActive: true }),
                Appointment.countDocuments({ preferredDate: todayStr }),
                Appointment.countDocuments({ status: "pending" }),
                Department.countDocuments({ isActive: true }),
                Appointment.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean(),
            ]);

            // Weekly trend (last 7 days)
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const weeklyRaw = await Appointment.aggregate([
                { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
                { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
            ]);
            const weekMap: Record<number, number> = {};
            weeklyRaw.forEach((w) => { weekMap[w._id] = w.count; });
            const appointmentsTrend = days.map((day, i) => ({
                day,
                appointments: weekMap[i + 1] ?? 0,
            }));

            // Department appointment load
            const deptRaw = await Appointment.aggregate([
                { $match: { status: { $in: ["pending", "confirmed", "completed"] } } },
                { $group: { _id: "$service", value: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 6 },
            ]);
            const departmentLoad = deptRaw.map((d) => ({ name: d._id || "Other", value: d.value }));

            return apiSuccess({
                totalUsers,
                totalAdmins,
                totalAppointmentsToday,
                pendingAppointments,
                totalDoctors: totalAdmins, // admins act as staff
                activeDepartments,
                appointmentsTrend,
                departmentLoad: departmentLoad.length ? departmentLoad : [
                    { name: "General", value: 35 },
                    { name: "Orthodontics", value: 25 },
                    { name: "Pediatric", value: 15 },
                    { name: "Oral Surgery", value: 10 },
                    { name: "Cosmetic", value: 15 },
                ],
                recentAppointments: recentAppointments.map((a) => ({
                    id: a._id.toString(),
                    patient: `${a.firstName} ${a.lastName}`,
                    doctor: a.doctorPreference,
                    time: a.preferredTime,
                    date: a.preferredDate,
                    status: a.status,
                    service: a.service,
                })),
            });
        } catch (err) {
            console.error("[admin/stats]", err);
            return apiError("Failed to fetch admin stats", 500);
        }
    },
    { roles: ["admin", "super_admin"] }
);
