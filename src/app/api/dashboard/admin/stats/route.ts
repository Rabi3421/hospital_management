import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import type { JWTPayload } from "@/types/auth";

/**
 * GET /api/dashboard/admin/stats
 * Accessible by: admin, super_admin
 */
export const GET = withAuth(
    async (_req: NextRequest, _ctx: { user: JWTPayload }) => {
        try {
            await connectDB();

            // Real user count from DB
            const totalUsers = await User.countDocuments({ role: "user", isActive: true });
            const totalAdmins = await User.countDocuments({ role: "admin", isActive: true });

            const stats = {
                totalUsers,
                totalAdmins,
                totalAppointmentsToday: 24,
                pendingAppointments: 7,
                totalDoctors: 8,
                activeDepartments: 6,
                appointmentsTrend: [
                    { day: "Mon", appointments: 18 },
                    { day: "Tue", appointments: 22 },
                    { day: "Wed", appointments: 15 },
                    { day: "Thu", appointments: 28 },
                    { day: "Fri", appointments: 24 },
                    { day: "Sat", appointments: 12 },
                    { day: "Sun", appointments: 6 },
                ],
                departmentLoad: [
                    { name: "General", value: 35 },
                    { name: "Orthodontics", value: 25 },
                    { name: "Pediatric", value: 15 },
                    { name: "Oral Surgery", value: 10 },
                    { name: "Cosmetic", value: 15 },
                ],
                recentAppointments: [
                    { id: 1, patient: "John Smith", doctor: "Dr. Sarah Johnson", time: "09:00 AM", status: "completed" },
                    { id: 2, patient: "Emma Wilson", doctor: "Dr. James Chen", time: "10:30 AM", status: "in-progress" },
                    { id: 3, patient: "Michael Brown", doctor: "Dr. Emily Davis", time: "11:00 AM", status: "pending" },
                    { id: 4, patient: "Lisa Anderson", doctor: "Dr. Robert Kim", time: "02:00 PM", status: "pending" },
                ],
            };

            return apiSuccess(stats);
        } catch (err) {
            console.error("[admin/stats]", err);
            return apiError("Failed to fetch admin stats", 500);
        }
    },
    { roles: ["admin", "super_admin"] }
);
