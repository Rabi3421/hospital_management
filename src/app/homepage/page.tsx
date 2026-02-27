import type { Metadata } from "next";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import StatsSection from "./components/StatsSection";
import TeamSection from "./components/TeamSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FAQSection from "./components/FAQSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "DentalCare Advanced Dentistry | Manhattan's Premier Dental Hospital",
  description:
    "DentalCare offers comprehensive dental services in Manhattan, NYC — from general dentistry and cosmetic treatments to dental implants, Invisalign, and 24/7 emergency care. Board-certified specialists, same-day appointments available.",
  keywords: [
    "dentist manhattan",
    "dental implants nyc",
    "cosmetic dentistry new york",
    "invisalign manhattan",
    "teeth whitening nyc",
    "emergency dentist new york",
    "dental hospital nyc",
  ],
  openGraph: {
    title: "DentalCare Advanced Dentistry | Manhattan, NYC",
    description:
      "18 years of clinical excellence. Board-certified specialists. Same-day appointments. Free first consultation.",
    type: "website",
    locale: "en_US",
  },
};

export default function Homepage() {
  return (
    <main className="min-h-screen bg-cream">
      <NavBar />
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <TeamSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}