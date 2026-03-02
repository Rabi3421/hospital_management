/**
 * GET  /api/notifications         — user's notifications (requires auth)
 * POST /api/notifications/read    — mark notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifyAccessToken, ACCESS_COOKIE } from "@/lib/jwt";

async function getUser(req: NextRequest) {
    const token =
        req.cookies.get(ACCESS_COOKIE)?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    return verifyAccessToken(token);
}

export async function GET(req: NextRequest) {
    const payload = await getUser(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = req.nextUrl;
    const unreadOnly = searchParams.get("unread") === "1";
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

    const query: Record<string, unknown> = { userId: payload.userId };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    const unreadCount = await Notification.countDocuments({ userId: payload.userId, read: false });

    return NextResponse.json({
        success: true,
        data: { notifications, unreadCount },
    });
}

export async function PATCH(req: NextRequest) {
    const payload = await getUser(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { ids } = body as { ids?: string[] };

    if (ids && ids.length > 0) {
        await Notification.updateMany(
            { _id: { $in: ids }, userId: payload.userId },
            { read: true }
        );
    } else {
        // Mark all as read
        await Notification.updateMany({ userId: payload.userId, read: false }, { read: true });
    }

    return NextResponse.json({ success: true });
}
