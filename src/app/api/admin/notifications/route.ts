import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

// GET /api/admin/notifications – list all notifications with filters & pagination
export const GET = withAuth(
  async (req: NextRequest) => {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "";
    const read = searchParams.get("read"); // "true" | "false" | ""
    const search = searchParams.get("search") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (type) filter.type = type;
    if (read === "true") filter.read = true;
    if (read === "false") filter.read = false;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ read: false }),
    ]);

    return apiSuccess({
      notifications,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      unreadCount,
    });
  },
  { roles: ["admin", "super_admin"] }
);
