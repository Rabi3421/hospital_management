import type { Metadata } from "next";
import PageNavBar from "@/components/shared/PageNavBar";
import PageFooter from "@/components/shared/PageFooter";
import AboutPageContent from "./components/AboutPageContent";

export const metadata: Metadata = {
    title: "About Us | DentalCare Advanced Dentistry",
    description:
        "Learn about DentalCare's 18-year legacy of clinical excellence in Manhattan. Meet our leadership, discover our mission, and understand why over 15,000 patients trust us with their smiles.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-cream">
            <PageNavBar />
            <AboutPageContent />
            <PageFooter />
        </main>
    );
}
