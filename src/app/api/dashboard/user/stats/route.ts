import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import type { JWTPayload } from "@/types/auth";

/**
 * GET /api/dashboard/user/stats
 * Accessible by: user, admin, super_admin
 */
export const GET = withAuth(
    async (_req: NextRequest, ctx: { user: JWTPayload }) => {
        try {
            await connectDB();
            // Mock stats — replace with real DB queries as needed
            const stats = {
                upcomingAppointments: 2,
                completedAppointments: 8,
                prescriptions: 3,
                medicalRecords: 5,
                nextAppointment: {
                    date: "2025-02-10",
                    time: "10:30 AM",
                    doctor: "Dr. Sarah Johnson",
                    type: "General Checkup",
                },
                recentActivity: [
                    { id: 1, type: "appointment", message: "Appointment confirmed with Dr. Emily Chen", date: "2025-01-28" },
                    { id: 2, type: "prescription", message: "New prescription issued by Dr. James Wilson", date: "2025-01-25" },
                    { id: 3, type: "record", message: "Lab results uploaded", date: "2025-01-20" },
                ],
                monthlyVisits: [
                    { month: "Aug", visits: 1 },
                    { month: "Sep", visits: 2 },
                    { month: "Oct", visits: 1 },
                    { month: "Nov", visits: 3 },
                    { month: "Dec", visits: 1 },
                    { month: "Jan", visits: 2 },
                ],
            };

            return apiSuccess({ userId: ctx.user.userId, ...stats });
        } catch (err) {
            console.error("[user/stats]", err);
            return apiError("Failed to fetch user stats", 500);
        }
    },
    { roles: ["user", "admin", "super_admin"] }
);
