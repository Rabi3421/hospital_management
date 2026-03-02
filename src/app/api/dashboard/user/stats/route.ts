import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import type { JWTPayload } from "@/types/auth";

/**
 * GET /api/dashboard/user/stats
 * Accessible by: user, admin, super_admin
 */
export const GET = withAuth(
    async (_req: NextRequest, ctx: { user: JWTPayload }) => {
        try {
            await connectDB();
            const userId = new mongoose.Types.ObjectId(ctx.user.userId);

            const [all, upcoming, completed, cancelled, next, recent] = await Promise.all([
                // Total count
                Appointment.countDocuments({ userId }),
                // Upcoming (pending + confirmed)
                Appointment.countDocuments({ userId, status: { $in: ["pending", "confirmed"] } }),
                // Completed
                Appointment.countDocuments({ userId, status: "completed" }),
                // Cancelled
                Appointment.countDocuments({ userId, status: "cancelled" }),
                // Next upcoming appointment
                Appointment.findOne({ userId, status: { $in: ["pending", "confirmed"] } })
                    .sort({ preferredDate: 1, preferredTime: 1 })
                    .lean(),
                // 5 most recent appointments for activity feed
                Appointment.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean(),
            ]);

            // Build monthly visits for last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1);
            const monthlyRaw = await Appointment.aggregate([
                { $match: { userId, createdAt: { $gte: sixMonthsAgo } } },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    visits: { $sum: 1 },
                }},
                { $sort: { _id: 1 } },
            ]);
            const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const monthlyVisits = monthlyRaw.map((m: { _id: string; visits: number }) => ({
                month: monthNames[parseInt(m._id.split("-")[1]) - 1],
                visits: m.visits,
            }));

            const nextAppointment = next ? {
                date: (next as { preferredDate: string }).preferredDate,
                time: (next as { preferredTime: string }).preferredTime,
                doctor: (next as { doctorPreference: string }).doctorPreference,
                type: (next as { service: string }).service,
            } : null;

            const recentActivity = (recent as Array<{ _id: mongoose.Types.ObjectId; service: string; status: string; createdAt: Date }>).map((a) => ({
                id: a._id.toString(),
                type: "appointment",
                message: `Appointment for ${a.service} — ${a.status}`,
                date: a.createdAt.toISOString().split("T")[0],
            }));

            return apiSuccess({
                userId: ctx.user.userId,
                upcomingAppointments: upcoming,
                completedAppointments: completed,
                cancelledAppointments: cancelled,
                totalAppointments: all,
                prescriptions: 0,
                medicalRecords: 0,
                nextAppointment,
                recentActivity,
                monthlyVisits: monthlyVisits.length ? monthlyVisits : [
                    { month: "Jan", visits: 0 }, { month: "Feb", visits: 0 },
                ],
            });
        } catch (err) {
            console.error("[user/stats]", err);
            return apiError("Failed to fetch user stats", 500);
        }
    },
    { roles: ["user", "admin", "super_admin"] }
);
