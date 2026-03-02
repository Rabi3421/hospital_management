import type { Metadata } from "next";
import PageNavBar from "@/components/shared/PageNavBar";
import PageFooter from "@/components/shared/PageFooter";
import AppointmentsPageContent from "./components/AppointmentsPageContent";

export const metadata: Metadata = {
    title: "Book an Appointment | DentalCare Advanced Dentistry",
    description:
        "Schedule your appointment at DentalCare Manhattan. Same-day bookings available for new patients. Free first consultation for all new patients — call +91 7008355987 or book online.",
};

export default function AppointmentsPage() {
    return (
        <main className="min-h-screen bg-cream">
            <PageNavBar />
            <AppointmentsPageContent />
            <PageFooter />
        </main>
    );
}
