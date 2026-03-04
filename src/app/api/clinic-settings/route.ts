import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClinicSettings from "@/models/ClinicSettings";

// Public GET — no auth needed (used by frontend pages)
export async function GET() {
    try {
        await connectDB();
        // Find the single settings doc or return defaults
        let settings = await ClinicSettings.findOne().lean();
        if (!settings) {
            // Create defaults on first access
            settings = await ClinicSettings.create({});
        }
        return NextResponse.json({ success: true, data: settings });
    } catch (err) {
        console.error("[clinic-settings GET]", err);
        return NextResponse.json({ success: false, error: "Failed to load clinic settings" }, { status: 500 });
    }
}
