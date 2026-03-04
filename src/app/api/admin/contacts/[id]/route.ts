import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import mongoose from "mongoose";

/**
 * GET    /api/admin/contacts/[id]   — full message detail
 * PATCH  /api/admin/contacts/[id]   — update status / add admin note
 * DELETE /api/admin/contacts/[id]   — hard delete
 */
export const GET = withAuth(
    async (req: NextRequest, { params }) => {
        await connectDB();
        const { id } = params;
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid message ID", 400);
        const msg = await ContactMessage.findById(id).lean();
        if (!msg) return apiError("Message not found", 404);
        return apiSuccess({ message: msg });
    },
    { roles: ["admin", "super_admin"] }
);

export const PATCH = withAuth(
    async (req: NextRequest, { params, user }) => {
        await connectDB();
        const { id } = params;
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid message ID", 400);

        const msg = await ContactMessage.findById(id);
        if (!msg) return apiError("Message not found", 404);

        const body = await req.json();
        const { status, adminNote } = body;

        const VALID_STATUSES = ["new", "in_review", "resolved", "closed"];
        if (status !== undefined) {
            if (!VALID_STATUSES.includes(status)) return apiError("Invalid status", 422);
            msg.status = status;
            if (status === "resolved" || status === "closed") {
                msg.resolvedBy = user?.name ?? "Admin";
                msg.resolvedAt = new Date();
            } else {
                // Clear resolution if re-opened
                msg.resolvedBy = "";
                msg.resolvedAt = undefined;
            }
        }
        if (adminNote !== undefined) msg.adminNote = adminNote;

        await msg.save();
        return apiSuccess({ message: msg.toObject() });
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest, { params }) => {
        await connectDB();
        const { id } = params;
        if (!id || !mongoose.isValidObjectId(id)) return apiError("Invalid message ID", 400);
        const msg = await ContactMessage.findByIdAndDelete(id);
        if (!msg) return apiError("Message not found", 404);
        return apiSuccess({ message: "Deleted." });
    },
    { roles: ["admin", "super_admin"] }
);
