import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";
import mongoose from "mongoose";

function getIdFromPath(req: NextRequest): string {
    return req.nextUrl.pathname.split("/").pop() ?? "";
}

/**
 * GET    /api/admin/billing/[id]
 * PATCH  /api/admin/billing/[id]
 * DELETE /api/admin/billing/[id]
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);
        const bill = await Bill.findById(id).lean();
        if (!bill) return apiError("Bill not found", 404);
        return apiSuccess(bill);
    },
    { roles: ["admin", "super_admin"] }
);

export const PATCH = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);

        const body = await req.json();
        const allowed = [
            "patientName", "patientEmail", "patientPhone", "visitDate",
            "doctor", "doctorId", "items", "discount",
            "amountPaid", "paymentMode", "notes",
        ];
        const update: Record<string, unknown> = {};
        for (const key of allowed) {
            if (key in body) update[key] = body[key];
        }

        // Recalculate totals if items or discount changed
        const existing = await Bill.findById(id).lean();
        if (!existing) return apiError("Bill not found", 404);

        const items = (update.items as { unitCost: number; quantity: number }[] | undefined) ?? existing.items;
        const subtotal = items.reduce(
            (sum, item) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 1),
            0
        );
        const discount = Number(update.discount ?? existing.discount) || 0;
        const total = Math.max(0, subtotal - discount);
        const paid = Number(update.amountPaid ?? existing.amountPaid) || 0;
        const paymentStatus: "paid" | "partial" | "pending" =
            paid >= total ? "paid" : paid > 0 ? "partial" : "pending";

        update.subtotal = subtotal;
        update.total = total;
        update.discount = discount;
        update.amountPaid = paid;
        update.paymentStatus = paymentStatus;

        const bill = await Bill.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true, runValidators: true }
        ).lean();

        return apiSuccess(bill);
    },
    { roles: ["admin", "super_admin"] }
);

export const DELETE = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const id = getIdFromPath(req);
        if (!mongoose.isValidObjectId(id)) return apiError("Invalid ID", 400);
        const bill = await Bill.findByIdAndDelete(id).lean();
        if (!bill) return apiError("Bill not found", 404);
        return apiSuccess({ deleted: true });
    },
    { roles: ["admin", "super_admin"] }
);
