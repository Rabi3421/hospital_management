import type { Metadata } from "next";
import PageNavBar from "@/components/shared/PageNavBar";
import PageFooter from "@/components/shared/PageFooter";
import DoctorsPageContent from "./components/DoctorsPageContent";

export const metadata: Metadata = {
    title: "Our Doctors | DentalCare Advanced Dentistry",
    description:
        "Meet DentalCare's team of 12 board-certified dental specialists in Manhattan. From implantology and orthodontics to cosmetic and pediatric dentistry — world-class expertise, genuine care.",
};

export default function DoctorsPage() {
    return (
        <main className="min-h-screen bg-cream">
            <PageNavBar />
            <DoctorsPageContent />
            <PageFooter />
        </main>
    );
}
