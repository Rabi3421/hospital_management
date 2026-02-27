import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

/**
 * GET /api/seed/super-admin
 * One-time route: creates the single super admin if none exists.
 * Protected by a SEED_SECRET env var so only you can call it.
 *
 * Call once:
 *   curl http://localhost:3000/api/seed/super-admin?secret=YOUR_SEED_SECRET
 */
export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get("secret");
    const SEED_SECRET = process.env.SEED_SECRET ?? "dc_seed_2026";

    if (secret !== SEED_SECRET) {
        return NextResponse.json(
            { success: false, error: "Invalid seed secret." },
            { status: 403 }
        );
    }

    await connectDB();

    // Enforce only ONE super_admin ever
    const existing = await UserModel.findOne({ role: "super_admin" });
    if (existing) {
        return NextResponse.json({
            success: false,
            message: "Super admin already exists. Only one super admin is allowed.",
            email: existing.email,
        });
    }

    // Create the super admin
    const superAdmin = await UserModel.create({
        name: "Super Admin",
        email: process.env.SUPER_ADMIN_EMAIL ?? "superadmin@dentalcare.com",
        password: process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin@2026",
        role: "super_admin",
        isActive: true,
    });

    return NextResponse.json({
        success: true,
        message: "Super admin created successfully.",
        data: {
            name: superAdmin.name,
            email: superAdmin.email,
            role: superAdmin.role,
            id: superAdmin._id,
        },
    });
}
