"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";

const services = [
    {
        id: "general",
        title: "General & Preventive Dentistry",
        description:
            "Your foundation for a lifetime of healthy smiles. Our comprehensive approach covers everything from routine checkups to advanced diagnostic screenings, ensuring problems are caught early when they're easiest to treat.",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_1d1ee47fa-1772054604928.png",
        imageAlt:
            "Dentist performing professional teeth cleaning on patient in modern clinic",
        tag: "Most Popular",
        tagColor: "bg-green-100 text-green-700",
        features: [
            "Digital X-rays & 3D scanning",
            "Professional teeth cleaning",
            "Gum disease screening",
            "Oral cancer screening",
            "Custom mouthguards",
            "Tooth-colored fillings",
        ],
        icon: "HeartIcon",
    },
    {
        id: "cosmetic",
        title: "Cosmetic Dentistry",
        description:
            "Transform your smile with our bespoke cosmetic treatments. From subtle enhancements to complete smile makeovers, our experienced cosmetic team uses the finest materials to craft natural-looking, radiant results.",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_18566889d-1767874064164.png",
        imageAlt: "Close-up of beautiful white teeth after cosmetic dental treatment",
        tag: "Premium",
        tagColor: "bg-gold-50 text-gold-700",
        features: [
            "Porcelain veneers",
            "Smile design consultation",
            "Composite bonding",
            "Gum contouring",
            "Full smile makeovers",
            "Digital smile preview",
        ],
        icon: "SparklesIcon",
    },
    {
        id: "whitening",
        title: "Teeth Whitening",
        description:
            "Achieve a brilliantly brighter smile in as little as 90 minutes with our professional in-office whitening systems. We also offer custom take-home kits for gradual, comfortable brightening on your schedule.",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_1c7cbdfc6-1772103276287.png",
        imageAlt:
            "Professional teeth whitening procedure being performed in dental office",
        tag: "1-Day Result",
        tagColor: "bg-blue-50 text-blue-700",
        features: [
            "Zoom! in-office whitening",
            "Up to 8 shades brighter",
            "Custom take-home trays",
            "Sensitivity-free protocols",
            "Long-lasting results",
            "Maintenance kits available",
        ],
        icon: "SunIcon",
    },
    {
        id: "implants",
        title: "Dental Implants",
        description:
            "Reclaim your full smile with permanent, natural-looking tooth replacements. Our board-certified implant specialists use state-of-the-art titanium implants and hand-crafted porcelain crowns, backed by a lifetime warranty.",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_113567aef-1771898380052.png",
        imageAlt:
            "Dental implant model showing titanium post and porcelain crown structure",
        tag: "Lifetime Warranty",
        tagColor: "bg-navy-50 text-navy",
        features: [
            "Single & multiple implants",
            "All-on-4 full arch restoration",
            "3D guided implant placement",
            "Same-day temporary crowns",
            "Bone grafting if needed",
            "Lifetime implant warranty",
        ],
        icon: "WrenchScrewdriverIcon",
    },
    {
        id: "ortho",
        title: "Orthodontics & Invisalign",
        description:
            "Straighten your teeth discreetly with Invisalign clear aligners or traditional braces — all under the supervision of our board-certified orthodontist with 12+ years of experience. Available for teens and adults.",
        image: "https://images.unsplash.com/photo-1694675236489-d73651370688",
        imageAlt:
            "Clear Invisalign aligners held in hands showing transparent dental braces",
        tag: "Certified Provider",
        tagColor: "bg-purple-50 text-purple-700",
        features: [
            "Invisalign & clear aligners",
            "Traditional metal braces",
            "Ceramic braces",
            "Retainer fittings",
            "Accelerated orthodontics",
            "Free consultation",
        ],
        icon: "AdjustmentsHorizontalIcon",
    },
    {
        id: "emergency",
        title: "Emergency Dental Care",
        description:
            "Dental emergencies don't wait — neither do we. Our 24/7 emergency line connects you directly to a dentist who can guide you through immediate steps and schedule a same-day appointment at our Manhattan clinic.",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_12b04269a-1772207392916.png",
        imageAlt:
            "Emergency dental care room with modern equipment ready for urgent treatment",
        tag: "24/7 Available",
        tagColor: "bg-red-50 text-red-600",
        features: [
            "Same-day appointments",
            "24/7 emergency hotline",
            "Toothache relief",
            "Broken tooth repair",
            "Lost crown replacement",
            "Trauma & sports injuries",
        ],
        icon: "BoltIcon",
    },
    {
        id: "pediatric",
        title: "Pediatric Dentistry",
        description:
            "Give your child the gift of a healthy smile from the very start. Our child-friendly environment, gentle techniques, and experienced pediatric team make every visit a positive, fear-free experience.",
        image:
            "https://images.unsplash.com/photo-1579684385127-1ef15d508118",
        imageAlt: "Friendly dentist working with young child patient in bright dental office",
        tag: "Kids Welcome",
        tagColor: "bg-orange-50 text-orange-600",
        features: [
            "First dental visit guidance",
            "Fluoride treatments",
            "Dental sealants",
            "Gentle extractions",
            "Space maintainers",
            "Fun reward programs",
        ],
        icon: "FaceSmileIcon",
    },
    {
        id: "perio",
        title: "Periodontics & Gum Care",
        description:
            "Healthy gums are the foundation of your smile. Our periodontist specializes in diagnosing and treating all stages of gum disease using the latest minimally invasive techniques to restore and maintain gum health.",
        image:
            "https://images.unsplash.com/photo-1606811841689-23dfddce3e95",
        imageAlt: "Periodontist examining patient's gum tissue in dental clinic",
        tag: "Specialist Care",
        tagColor: "bg-teal-50 text-teal-700",
        features: [
            "Deep cleaning (SRP)",
            "Laser gum therapy",
            "Gum recession treatment",
            "Osseous surgery",
            "Periodontal maintenance",
            "Crown lengthening",
        ],
        icon: "ShieldCheckIcon",
    },
];

function ServiceCard({
    service,
    index,
}: {
    service: (typeof services)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.classList.add("reveal-hidden");
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => el.classList.add("revealed"), index * 80);
                    obs.disconnect();
                }
            },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [index]);

    return (
        <div
            ref={ref}
            className="service-card group bg-white rounded-3xl overflow-hidden border border-cream-dark shadow-card"
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <AppImage
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                <span
                    className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full ${service.tagColor}`}
                >
                    {service.tag}
                </span>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-navy mb-3 leading-snug">
                    {service.title}
                </h3>
                <p className="text-navy/60 text-sm leading-relaxed mb-5">
                    {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-navy/70">
                            <div className="w-4 h-4 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                                <svg
                                    width="8"
                                    height="8"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                >
                                    <path
                                        d="M1 4L3.5 6.5L9 1"
                                        stroke="#C9A96E"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>

                <Link
                    href="/appointments"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-dark transition-colors group/link"
                >
                    Book This Service
                    <Icon
                        name="ArrowRightIcon"
                        size={14}
                        className="group-hover/link:translate-x-1 transition-transform"
                    />
                </Link>
            </div>
        </div>
    );
}

export default function ServicesPageContent() {
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
            <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden bg-navy">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
                <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                            What We Offer
                        </span>
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-5">
                        Comprehensive{" "}
                        <span className="text-gold-gradient italic">Dental Services</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                        From routine cleanings to complex restorations, our expert team
                        delivers exceptional care with compassion and precision — all under
                        one roof in the heart of Manhattan.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/appointments"
                            className="btn-gold px-7 py-3.5 rounded-full font-semibold shadow-gold text-sm"
                        >
                            <span>Book Appointment</span>
                        </Link>
                        <a
                            href="tel:+12125550190"
                            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
                        >
                            <Icon name="PhoneIcon" size={16} className="text-gold" variant="solid" />
                            (212) 555-0190
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats strip */}
            <section className="bg-white border-b border-cream-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: "8", label: "Dental Specialties" },
                            { value: "15,000+", label: "Patients Treated" },
                            { value: "18 Yrs", label: "Of Excellence" },
                            { value: "4.9★", label: "Average Rating" },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="font-display text-2xl sm:text-3xl font-semibold text-navy">
                                    {stat.value}
                                </p>
                                <p className="text-navy/50 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-4">
                            Our Dental Services
                        </h2>
                        <div className="section-divider mx-auto mb-4" />
                        <p className="text-navy/55 text-base max-w-xl mx-auto leading-relaxed">
                            Every service is delivered by board-certified specialists using
                            the most advanced technology available.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {services.map((service, i) => (
                            <ServiceCard key={service.id} service={service} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Insurance & Financing Banner */}
            <section className="bg-navy py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-3xl font-semibold text-white mb-4">
                        Flexible Payment Options
                    </h2>
                    <p className="text-white/55 leading-relaxed mb-8 max-w-2xl mx-auto">
                        We accept most major insurance plans and offer 0% financing through
                        CareCredit and Alphaeon. No insurance? No problem — ask about our
                        in-house dental savings plan.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {[
                            "Delta Dental",
                            "Cigna",
                            "Aetna",
                            "MetLife",
                            "United Concordia",
                            "Guardian",
                        ].map((ins) => (
                            <span
                                key={ins}
                                className="bg-white/10 border border-white/15 rounded-full px-4 py-2 text-white/70 text-sm"
                            >
                                {ins}
                            </span>
                        ))}
                    </div>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 btn-gold px-7 py-3.5 rounded-full font-semibold text-sm shadow-gold"
                    >
                        <span>Verify Your Insurance</span>
                        <Icon name="ArrowRightIcon" size={14} />
                    </Link>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cream">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                        <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                            Same-Day Appointments Available
                        </span>
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-5">
                        Ready to Start Your Journey to a Healthier Smile?
                    </h2>
                    <p className="text-navy/55 text-base max-w-xl mx-auto leading-relaxed mb-8">
                        Book your appointment today — your first consultation is on us.
                    </p>
                    <Link
                        href="/appointments"
                        className="btn-gold px-8 py-4 rounded-full font-semibold text-base shadow-gold"
                    >
                        <span>Book Free Consultation</span>
                    </Link>
                </div>
            </section>
        </>
    );
}
