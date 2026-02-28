import { NextRequest } from "next/server";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

const DEFAULT_DOCTORS = [
    { name: "Dr. Margaret Chen", specialty: "Implantology", department: "Oral Surgery", qualification: "BDS, MDS (Oral Surgery)", experience: 12, avatar: "👩‍⚕️", availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { name: "Dr. Arjun Patel", specialty: "Orthodontics", department: "Orthodontics", qualification: "BDS, MDS (Orthodontics)", experience: 9, avatar: "👨‍⚕️", availableDays: ["Mon", "Tue", "Thu", "Fri"] },
    { name: "Dr. Sofia Rodriguez", specialty: "Cosmetic Dentistry", department: "Cosmetic Dentistry", qualification: "BDS, Fellowship (Cosmetic)", experience: 7, avatar: "👩‍⚕️", availableDays: ["Mon", "Wed", "Fri"] },
    { name: "Dr. James Kim", specialty: "Endodontics", department: "General Dentistry", qualification: "BDS, MDS (Endodontics)", experience: 11, avatar: "👨‍⚕️", availableDays: ["Tue", "Wed", "Thu"] },
    { name: "Dr. Amara Okonkwo", specialty: "Pediatric Dentistry", department: "Pediatric Dentistry", qualification: "BDS, MDS (Pedodontics)", experience: 6, avatar: "👩‍⚕️", availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { name: "Dr. Kenji Nakamura", specialty: "Periodontics", department: "Periodontics", qualification: "BDS, MDS (Periodontics)", experience: 14, avatar: "👨‍⚕️", availableDays: ["Mon", "Wed", "Fri"] },
    { name: "Dr. Layla Hassan", specialty: "General Dentistry", department: "General Dentistry", qualification: "BDS, MFDS", experience: 5, avatar: "👩‍⚕️", availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { name: "Dr. Marcus Thompson", specialty: "Oral Surgery", department: "Oral Surgery", qualification: "BDS, MS (Oral & Maxillofacial)", experience: 16, avatar: "👨‍⚕️", availableDays: ["Tue", "Thu"] },
];

/**
 * GET  /api/admin/doctors   — list all doctors
 * POST /api/admin/doctors   — create a doctor
 */
export const GET = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        // Seed defaults if none exist
        const count = await Doctor.countDocuments();
        if (count === 0) {
            await Doctor.insertMany(DEFAULT_DOCTORS);
        }

        const url = new URL(req.url);
        const activeOnly = url.searchParams.get("active") === "true";
        const query = activeOnly ? { isActive: true } : {};

        const doctors = await Doctor.find(query).sort({ name: 1 }).lean();
        return apiSuccess(doctors);
    },
    { roles: ["admin", "super_admin"] }
);

export const POST = withAuth(
    async (req: NextRequest) => {
        await connectDB();
        const body = await req.json();
        const { name, specialty, email, phone, department, qualification, experience, bio, avatar, availableDays } = body;

        if (!name?.trim()) return apiError("Doctor name is required", 400);

        const doctor = await Doctor.create({
            name: name.trim(),
            specialty: specialty ?? "",
            email: email ?? "",
            phone: phone ?? "",
            department: department ?? "",
            qualification: qualification ?? "",
            experience: experience ?? 0,
            bio: bio ?? "",
            avatar: avatar ?? "👨‍⚕️",
            availableDays: availableDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri"],
            isActive: true,
        });

        return apiSuccess(doctor.toObject(), 201);
    },
    { roles: ["admin", "super_admin"] }
);
