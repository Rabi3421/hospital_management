"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";

const stats = [
    { value: "2006", label: "Year Founded", suffix: "" },
    { value: "18", label: "Years of Excellence", suffix: "+" },
    { value: "15,000", label: "Happy Patients", suffix: "+" },
    { value: "12", label: "Board-Certified Specialists", suffix: "" },
    { value: "4.9", label: "Average Rating", suffix: "★" },
    { value: "98", label: "Patient Satisfaction Rate", suffix: "%" },
];

const values = [
    {
        icon: "HeartIcon",
        title: "Compassionate Care",
        description:
            "Every patient is treated with warmth, empathy, and respect. We listen first, then treat — ensuring your comfort and confidence throughout your journey.",
    },
    {
        icon: "BeakerIcon",
        title: "Clinical Excellence",
        description:
            "Our specialists hold advanced degrees from the nation's top dental schools and pursue continuous education to stay at the cutting edge of modern dentistry.",
    },
    {
        icon: "ShieldCheckIcon",
        title: "Integrity & Transparency",
        description:
            "We provide honest diagnoses, clear treatment plans, and upfront pricing — no surprises, no unnecessary procedures. Your trust is our most valuable asset.",
    },
    {
        icon: "SparklesIcon",
        title: "Innovation First",
        description:
            "From digital impressions and 3D imaging to laser therapy and same-day restorations, we invest in the latest technology to give you better outcomes faster.",
    },
    {
        icon: "UserGroupIcon",
        title: "Community Commitment",
        description:
            "We give back through free dental days, school outreach programs, and partnerships with local nonprofits — because great oral health should be accessible to everyone.",
    },
    {
        icon: "StarIcon",
        title: "Exceptional Results",
        description:
            "Our work speaks for itself — thousands of transformed smiles, glowing patient reviews, and recognition from New York's top dental associations.",
    },
];

const milestones = [
    {
        year: "2006",
        title: "The Beginning",
        description:
            "Dr. Margaret Chen founded DentalCare in a small suite on Park Avenue with a simple mission: bring world-class dentistry to everyday New Yorkers.",
    },
    {
        year: "2010",
        title: "Expansion & Growth",
        description:
            "Growing patient demand led to a move to our current 5,000 sq ft flagship clinic on Madison Avenue, with 8 fully equipped treatment rooms.",
    },
    {
        year: "2014",
        title: "Technology Investment",
        description:
            "We introduced iTero digital scanners, 3D CBCT imaging, and CEREC same-day crown technology — becoming one of the most advanced practices in Manhattan.",
    },
    {
        year: "2018",
        title: "5,000 Smiles Milestone",
        description:
            "Celebrated transforming over 5,000 patient smiles. Expanded our specialist team to include orthodontics, periodontics, and endodontics.",
    },
    {
        year: "2022",
        title: "Award & Recognition",
        description:
            "Named 'Best Dental Practice in Manhattan' by New York Magazine and received the AACD Excellence Award for cosmetic dentistry outcomes.",
    },
    {
        year: "2024",
        title: "Looking Forward",
        description:
            "Launched our 24/7 emergency care line and AI-assisted diagnostic tools. Now proudly serving 15,000+ patients across the tri-state area.",
    },
];

const certifications = [
    "American Dental Association (ADA)",
    "American Academy of Cosmetic Dentistry (AACD)",
    "American Board of Oral Implantology (ABOI)",
    "American Association of Orthodontists (AAO)",
    "International Congress of Oral Implantologists (ICOI)",
    "New York State Dental Association (NYSDA)",
];

function RevealSection({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.classList.add("reveal-hidden");
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => el.classList.add("revealed"), delay);
                    obs.disconnect();
                }
            },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [delay]);
    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

export default function AboutPageContent() {
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        setTimeout(() => {
            el.style.transition =
                "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, 100);
    }, []);

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-navy">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
                <div
                    ref={heroRef}
                    className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center"
                >
                    <span className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                            Our Story
                        </span>
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-5">
                        18 Years of Transforming{" "}
                        <span className="text-gold-gradient italic">Smiles & Lives</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                        Founded in 2006, DentalCare has grown from a single-room practice
                        to Manhattan's most trusted advanced dentistry institution — driven
                        by an unwavering commitment to excellence and patient wellbeing.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20 px-6 lg:px-8 bg-cream">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                        <RevealSection className="reveal-hidden-left">
                            <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-5">
                                <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                                    Who We Are
                                </span>
                            </span>
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy leading-tight mb-5">
                                A Practice Built on Passion, Precision & People
                            </h2>
                            <p className="text-navy/60 leading-relaxed mb-5">
                                DentalCare was born from a belief that great dental care
                                shouldn't be intimidating or inaccessible. Our founder, Dr.
                                Margaret Chen, invested seven years at Columbia University and
                                the Mayo Clinic to master the art and science of modern
                                dentistry — before bringing those skills home to New York City.
                            </p>
                            <p className="text-navy/60 leading-relaxed mb-8">
                                Today, our 12-specialist team treats patients from all five
                                boroughs and beyond, offering everything from a simple cleaning
                                to a full-smile implant reconstruction. But what hasn't changed
                                in 18 years is our philosophy: treat every patient like family.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/doctors"
                                    className="btn-primary px-6 py-3 rounded-full text-sm font-semibold text-center"
                                >
                                    <span>Meet Our Team</span>
                                </Link>
                                <Link
                                    href="/appointments"
                                    className="btn-gold px-6 py-3 rounded-full text-sm font-semibold shadow-gold text-center"
                                >
                                    <span>Book Consultation</span>
                                </Link>
                            </div>
                        </RevealSection>

                        <RevealSection delay={150} className="relative">
                            <div className="relative rounded-3xl overflow-hidden h-96 lg:h-[480px] shadow-xl-navy">
                                <AppImage
                                    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133"
                                    alt="Modern DentalCare clinic reception area with warm lighting and elegant design"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
                            </div>
                            {/* Floating badge */}
                            <div className="absolute -bottom-5 -left-5 glass-card rounded-2xl p-4 shadow-gold flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                                    <Icon name="TrophyIcon" size={22} className="text-gold" variant="solid" />
                                </div>
                                <div>
                                    <p className="text-navy font-semibold text-sm">
                                        Best Dental Practice
                                    </p>
                                    <p className="text-navy/50 text-xs">NY Magazine, 2022</p>
                                </div>
                            </div>
                        </RevealSection>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-navy">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
                        {stats.map((stat, i) => (
                            <RevealSection key={stat.label} delay={i * 80} className="reveal-scale">
                                <p className="font-display text-2xl sm:text-3xl font-semibold text-white">
                                    {stat.value}
                                    <span className="text-gold">{stat.suffix}</span>
                                </p>
                                <p className="text-white/45 text-xs mt-1.5 leading-snug">
                                    {stat.label}
                                </p>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 px-6 lg:px-8 bg-cream">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3">
                            Mission, Vision & Values
                        </h2>
                        <div className="section-divider mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                        {[
                            {
                                label: "Our Mission",
                                icon: "RocketLaunchIcon",
                                text: "To deliver exceptional, compassionate dental care that improves lives — making every patient feel seen, heard, and beautifully transformed.",
                                color: "bg-navy",
                                textColor: "text-white",
                                iconBg: "bg-gold/20",
                            },
                            {
                                label: "Our Vision",
                                icon: "EyeIcon",
                                text: "To be New York's most trusted and innovative dental institution, setting the national standard for patient experience and clinical outcomes.",
                                color: "bg-gold",
                                textColor: "text-navy",
                                iconBg: "bg-navy/15",
                            },
                            {
                                label: "Our Promise",
                                icon: "HandThumbUpIcon",
                                text: "Every patient leaves our clinic feeling confident, informed, and genuinely cared for — that's a promise we've kept for 18 years and counting.",
                                color: "bg-white",
                                textColor: "text-navy",
                                iconBg: "bg-gold/10",
                                border: true,
                            },
                        ].map((item) => (
                            <RevealSection key={item.label} className="reveal-scale">
                                <div
                                    className={`rounded-3xl p-8 h-full ${item.color} ${item.border ? "border border-cream-dark shadow-card" : ""
                                        }`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5`}
                                    >
                                        <Icon
                                            name={item.icon}
                                            size={22}
                                            className={item.color === "bg-navy" ? "text-gold" : "text-navy"}
                                            variant="solid"
                                        />
                                    </div>
                                    <h3
                                        className={`font-display text-xl font-semibold mb-3 ${item.textColor}`}
                                    >
                                        {item.label}
                                    </h3>
                                    <p
                                        className={`text-sm leading-relaxed ${item.color === "bg-navy"
                                                ? "text-white/60"
                                                : item.color === "bg-gold"
                                                    ? "text-navy/70"
                                                    : "text-navy/60"
                                            }`}
                                    >
                                        {item.text}
                                    </p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>

                    {/* Values Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((value, i) => (
                            <RevealSection key={value.title} delay={i * 80} className="reveal-hidden">
                                <div className="bg-white rounded-2xl p-6 border border-cream-dark shadow-card hover:shadow-card-hover transition-shadow">
                                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                                        <Icon name={value.icon} size={18} className="text-gold" variant="solid" />
                                    </div>
                                    <h3 className="font-semibold text-navy mb-2">{value.title}</h3>
                                    <p className="text-navy/55 text-sm leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline / Milestones */}
            <section className="py-20 px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
                            <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                                Our Journey
                            </span>
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3">
                            18 Years of Milestones
                        </h2>
                        <div className="section-divider mx-auto" />
                    </div>

                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-cream-dark md:-translate-x-0.5" />

                        <div className="space-y-10">
                            {milestones.map((m, i) => (
                                <RevealSection key={m.year} delay={i * 100} className="reveal-hidden">
                                    <div
                                        className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                            }`}
                                    >
                                        {/* Year dot */}
                                        <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-gold border-4 border-white shadow-gold md:-translate-x-2 -translate-x-2 top-6" />

                                        {/* Content */}
                                        <div
                                            className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] bg-white rounded-2xl p-6 border border-cream-dark shadow-card ${i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                                                }`}
                                        >
                                            <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-full mb-3">
                                                {m.year}
                                            </span>
                                            <h3 className="font-semibold text-navy mb-2">{m.title}</h3>
                                            <p className="text-navy/55 text-sm leading-relaxed">
                                                {m.description}
                                            </p>
                                        </div>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="py-16 px-6 lg:px-8 bg-cream">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-navy mb-3">
                        Accreditations & Memberships
                    </h2>
                    <div className="section-divider mx-auto mb-10" />
                    <div className="flex flex-wrap justify-center gap-3">
                        {certifications.map((cert) => (
                            <div
                                key={cert}
                                className="flex items-center gap-2 bg-white border border-cream-dark rounded-full px-5 py-2.5 shadow-card"
                            >
                                <Icon name="CheckBadgeIcon" size={16} className="text-gold" variant="solid" />
                                <span className="text-navy text-sm font-medium">{cert}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 lg:px-8 bg-navy">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-5">
                        Experience the DentalCare Difference
                    </h2>
                    <p className="text-white/55 text-base max-w-xl mx-auto leading-relaxed mb-8">
                        Join over 15,000 patients who trust us with their smile. Your first
                        consultation is free — let's create a plan just for you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/appointments"
                            className="btn-gold px-8 py-4 rounded-full font-semibold text-sm shadow-gold"
                        >
                            <span>Book Free Consultation</span>
                        </Link>
                        <Link
                            href="/doctors"
                            className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                        >
                            Meet the Team
                            <Icon name="ArrowRightIcon" size={14} />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
