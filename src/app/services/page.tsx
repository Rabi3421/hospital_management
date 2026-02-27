import type { Metadata } from "next";
import PageNavBar from "@/components/shared/PageNavBar";
import PageFooter from "@/components/shared/PageFooter";
import ServicesPageContent from "./components/ServicesPageContent";

export const metadata: Metadata = {
    title: "Dental Services | DentalCare Advanced Dentistry",
    description:
        "Explore our full range of dental services — general dentistry, cosmetic treatments, dental implants, orthodontics, teeth whitening, and 24/7 emergency care in Manhattan, NYC.",
};

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-cream">
            <PageNavBar />
            <ServicesPageContent />
            <PageFooter />
        </main>
    );
}
