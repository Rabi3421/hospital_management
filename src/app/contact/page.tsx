import type { Metadata } from "next";
import PageNavBar from "@/components/shared/PageNavBar";
import PageFooter from "@/components/shared/PageFooter";
import ContactPageContent from "./components/ContactPageContent";

export const metadata: Metadata = {
    title: "Contact Us | DentalCare Advanced Dentistry",
    description:
        "Get in touch with DentalCare Manhattan. Call (212) 555-0190, email hello@dentalcare.com, or visit us at 425 Madison Avenue, Suite 1200, New York, NY 10017.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-cream">
            <PageNavBar />
            <ContactPageContent />
            <PageFooter />
        </main>
    );
}
