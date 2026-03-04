import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import ClinicSettings from "@/models/ClinicSettings";
import { withAuth, apiError, apiSuccess } from "@/lib/api-auth";

export const PUT = withAuth(
    async (req: NextRequest, { user }) => {
        try {
            await connectDB();
            const body = await req.json();

            const allowed = [
                "clinicName", "tagline", "phone", "emergencyPhone",
                "email", "website", "address", "city",
                "openTime", "closeTime", "workDays",
            ];
            const update: Record<string, string> = {};
            for (const key of allowed) {
                if (typeof body[key] === "string") update[key] = body[key].trim();
            }
            update.updatedBy = user?.name ?? user?.email ?? "admin";

            const settings = await ClinicSettings.findOneAndUpdate(
                {},
                { $set: update },
                { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
            ).lean();

            return apiSuccess(settings);
        } catch (err) {
            console.error("[admin/clinic-settings PUT]", err);
            return apiError("Failed to save clinic settings", 500);
        }
    },
    { roles: ["admin", "super-admin"] }
);
