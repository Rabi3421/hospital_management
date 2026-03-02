import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";

/**
 * GET  /api/admin/billing  — list bills (filterable by status, search, date)
 * POST /api/admin/billing  — create a bill
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const { searchParams } = req.nextUrl;
        const status = searchParams.get("status") ?? "";
        const search = searchParams.get("search") ?? "";
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
        const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

        const query: Record<string, unknown> = {};
        if (status) query.paymentStatus = status;
        if (search) {
            query.$or = [
                { patientName: { $regex: search, $options: "i" } },
                { invoiceNumber: { $regex: search, $options: "i" } },
                { doctor: { $regex: search, $options: "i" } },
                { patientEmail: { $regex: search, $options: "i" } },
            ];
        }

        const [bills, total] = await Promise.all([
            Bill.find(query)
                .sort({ visitDate: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Bill.countDocuments(query),
        ]);

        // Aggregate totals for summary
        const totals = await Bill.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" },
                    totalPaid: { $sum: "$amountPaid" },
                    totalPending: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "pending"] }, "$total", 0],
                        },
                    },
                },
            },
        ]);

        const summary = totals[0] ?? { totalRevenue: 0, totalPaid: 0, totalPending: 0 };

        return apiSuccess({ bills, total, page, limit, pages: Math.ceil(total / limit), summary });
    },
    { roles: ["admin", "super_admin"] }
);

export const POST = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const body = await req.json();
        const {
            patientName, patientEmail, patientPhone, visitDate,
            doctor, doctorId, items, discount, amountPaid, paymentMode, notes,
        } = body;

        if (!patientName?.trim()) return apiError("Patient name is required", 400);
        if (!visitDate) return apiError("Visit date is required", 400);
        if (!Array.isArray(items) || items.length === 0) return apiError("At least one item is required", 400);

        const subtotal = items.reduce(
            (sum: number, item: { unitCost: number; quantity: number }) =>
                sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 1),
            0
        );
        const discountAmt = Number(discount) || 0;
        const total = Math.max(0, subtotal - discountAmt);
        const paid = Number(amountPaid) || 0;
        const paymentStatus: "paid" | "partial" | "pending" =
            paid >= total ? "paid" : paid > 0 ? "partial" : "pending";

        // Generate invoice number
        const count = await Bill.countDocuments();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

        const bill = await Bill.create({
            invoiceNumber,
            patientName: patientName.trim(),
            patientEmail: patientEmail ?? "",
            patientPhone: patientPhone ?? "",
            visitDate,
            doctor: doctor ?? "",
            doctorId: doctorId ?? null,
            items,
            subtotal,
            discount: discountAmt,
            total,
            amountPaid: paid,
            paymentStatus,
            paymentMode: paymentMode ?? "",
            notes: notes ?? "",
        });

        return apiSuccess(bill.toObject(), 201);
    },
    { roles: ["admin", "super_admin"] }
);
