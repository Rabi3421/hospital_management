import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import type { JWTPayload } from "@/types/auth";

/**
 * GET /api/dashboard/super-admin/stats
 * Accessible by: super_admin only
 */
export const GET = withAuth(
    async (_req: NextRequest, _ctx: { user: JWTPayload }) => {
        try {
            await connectDB();

            const [totalUsers, totalAdmins, totalSuperAdmins, inactiveUsers] =
                await Promise.all([
                    User.countDocuments({ role: "user" }),
                    User.countDocuments({ role: "admin" }),
                    User.countDocuments({ role: "super_admin" }),
                    User.countDocuments({ isActive: false }),
                ]);

            const stats = {
                systemOverview: {
                    totalUsers,
                    totalAdmins,
                    totalSuperAdmins,
                    inactiveUsers,
                    totalAccounts: totalUsers + totalAdmins + totalSuperAdmins,
                },
                systemHealth: {
                    uptime: "99.97%",
                    avgResponseTime: "142ms",
                    errorRate: "0.03%",
                    activeConnections: 47,
                },
                monthlyGrowth: [
                    { month: "Aug", users: 45, appointments: 320 },
                    { month: "Sep", users: 52, appointments: 380 },
                    { month: "Oct", users: 61, appointments: 410 },
                    { month: "Nov", users: 74, appointments: 450 },
                    { month: "Dec", users: 68, appointments: 390 },
                    { month: "Jan", users: 89, appointments: 520 },
                ],
                revenueData: [
                    { month: "Aug", revenue: 42000 },
                    { month: "Sep", revenue: 48500 },
                    { month: "Oct", revenue: 51200 },
                    { month: "Nov", revenue: 55800 },
                    { month: "Dec", revenue: 49300 },
                    { month: "Jan", revenue: 62100 },
                ],
                auditLogs: [
                    { id: 1, action: "User role updated", by: "admin@dentalcare.com", target: "john@example.com", time: "5 mins ago" },
                    { id: 2, action: "New admin created", by: "superadmin@dentalcare.com", target: "jane@example.com", time: "1 hour ago" },
                    { id: 3, action: "Department added", by: "admin@dentalcare.com", target: "Implantology Dept.", time: "3 hours ago" },
                    { id: 4, action: "User deactivated", by: "superadmin@dentalcare.com", target: "spam@example.com", time: "1 day ago" },
                ],
                roleSplit: [
                    { name: "Users", value: totalUsers },
                    { name: "Admins", value: totalAdmins },
                    { name: "Super Admins", value: totalSuperAdmins },
                ],
            };

            return apiSuccess(stats);
        } catch (err) {
            console.error("[super-admin/stats]", err);
            return apiError("Failed to fetch super-admin stats", 500);
        }
    },
    { roles: ["super_admin"] }
);
