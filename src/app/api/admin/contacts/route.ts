import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

/**
 * GET  /api/admin/contacts   — paginated list with search + status filter
 * POST /api/admin/contacts   — (unused, messages come from public /api/contact)
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") ?? "";
        const status = searchParams.get("status") ?? "";
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
        const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (search) {
            const re = { $regex: search, $options: "i" };
            query.$or = [{ fullName: re }, { email: re }, { phone: re }, { subject: re }, { message: re }];
        }

        const [messages, total] = await Promise.all([
            ContactMessage.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ContactMessage.countDocuments(query),
        ]);

        return apiSuccess({
            messages,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    },
    { roles: ["admin", "super_admin"] }
);
