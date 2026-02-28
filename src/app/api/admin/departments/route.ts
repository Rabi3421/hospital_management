import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Department from "@/models/Department";

const DEFAULT_DEPARTMENTS = [
    { name: "General Dentistry", description: "Routine checkups, cleanings, fillings, and preventive care.", head: "Dr. Sarah Johnson", doctorCount: 3, icon: "🦷" },
    { name: "Orthodontics", description: "Braces, aligners, and bite correction treatments.", head: "Dr. James Chen", doctorCount: 2, icon: "😁" },
    { name: "Oral Surgery", description: "Extractions, implants, jaw surgery.", head: "Dr. Emily Davis", doctorCount: 2, icon: "🔬" },
    { name: "Pediatric Dentistry", description: "Dental care for children and teenagers.", head: "Dr. Robert Kim", doctorCount: 2, icon: "👶" },
    { name: "Cosmetic Dentistry", description: "Whitening, veneers, smile makeovers.", head: "Dr. Lisa Park", doctorCount: 2, icon: "✨" },
    { name: "Periodontics", description: "Gum disease treatment and prevention.", head: "Dr. Michael Torres", doctorCount: 1, icon: "🩺" },
];

/**
 * GET  /api/admin/departments  — list all departments
 * POST /api/admin/departments  — create a department
 */
export const GET = withAuth(
    async () => {
        await connectDB();
        // Seed defaults if none exist
        const count = await Department.countDocuments();
        if (count === 0) {
            await Department.insertMany(DEFAULT_DEPARTMENTS);
        }
        const departments = await Department.find().sort({ name: 1 }).lean();
        return apiSuccess(departments);
    },
    { roles: ["admin", "super_admin"] }
);

export const POST = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const body = await req.json();
        const { name, description, head, doctorCount, icon } = body;
        if (!name) return apiError("Department name is required", 400);

        const existing = await Department.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        if (existing) return apiError("A department with this name already exists", 409);

        const dept = await Department.create({ name, description, head, doctorCount: doctorCount ?? 0, icon: icon ?? "🏥" });
        return apiSuccess(dept.toObject(), 201);
    },
    { roles: ["admin", "super_admin"] }
);
