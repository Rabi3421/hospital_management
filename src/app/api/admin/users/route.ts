import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

/**
 * GET  /api/admin/users?role=user|admin&search=&page=1&limit=20
 * PATCH /api/admin/users  (bulk — not used, individual via [id])
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const { searchParams } = req.nextUrl;
        const role = searchParams.get("role") ?? "user";
        const search = searchParams.get("search") ?? "";
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
        const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

        const query: Record<string, unknown> = { role: { $in: ["user"] } };
        if (role && role !== "all") query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const [users, total] = await Promise.all([
            UserModel.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            UserModel.countDocuments(query),
        ]);

        return apiSuccess({ users, total, page, limit, pages: Math.ceil(total / limit) });
    },
    { roles: ["admin", "super_admin"] }
);
