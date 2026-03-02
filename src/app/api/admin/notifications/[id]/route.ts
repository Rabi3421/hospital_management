import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

// PATCH /api/admin/notifications/[id] – mark read/unread
export const PATCH = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid notification ID", 400);

    await dbConnect();
    const body = await req.json();
    const allowed = ["read"];
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) update[k] = body[k];

    const notification = await Notification.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!notification) return apiError("Notification not found", 404);
    return apiSuccess(notification);
  },
  { roles: ["admin", "super_admin"] }
);

// DELETE /api/admin/notifications/[id]
export const DELETE = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid notification ID", 400);

    await dbConnect();
    const notification = await Notification.findByIdAndDelete(id).lean();
    if (!notification) return apiError("Notification not found", 404);
    return apiSuccess({ message: "Notification deleted." });
  },
  { roles: ["admin", "super_admin"] }
);
