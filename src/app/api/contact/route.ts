import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

/**
 * POST /api/contact
 * Public — no auth required.
 * Accepts: { fullName, phone?, email, subject, message, consent }
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { fullName, phone, email, subject, message, consent } = body;

        // Basic validation
        if (!fullName?.trim()) return NextResponse.json({ error: "Full name is required." }, { status: 422 });
        if (!email?.trim()) return NextResponse.json({ error: "Email address is required." }, { status: 422 });
        if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
        if (!subject?.trim()) return NextResponse.json({ error: "Please select a subject." }, { status: 422 });
        if (!message?.trim()) return NextResponse.json({ error: "Message cannot be empty." }, { status: 422 });
        if (!consent) return NextResponse.json({ error: "You must agree to our privacy policy." }, { status: 422 });

        const contact = await ContactMessage.create({
            fullName: fullName.trim(),
            phone: phone?.trim() ?? "",
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            consent: true,
            status: "new",
        });

        return NextResponse.json({ success: true, data: { id: contact._id } }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/contact]", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
