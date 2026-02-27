"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";

const doctors = [
    {
        id: "chen",
        name: "Dr. Margaret Chen",
        title: "Chief Dental Officer & Founder",
        specialty: "Implantology & Oral Surgery",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_192f25304-1767786255269.png",
        imageAlt:
            "Dr. Margaret Chen, female dentist in white coat smiling professionally in clinic",
        credentials: [
            "DDS, Columbia University",
            "Diplomate, ABOI",
            "Fellow, ICOI",
        ],
        experience: "18 yrs",
        availability: "Mon, Wed, Fri",
        category: "Implantology",
        bio: "Dr. Chen founded DentalCare in 2006 after completing her implantology fellowship at Mayo Clinic. She has placed over 3,000 implants and is widely regarded as one of NYC's foremost oral surgeons.",
        languages: ["English", "Mandarin"],
    },
    {
        id: "patel",
        name: "Dr. Arjun Patel",
        title: "Orthodontics Director",
        specialty: "Invisalign & Braces",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_10337129e-1772074664598.png",
        imageAlt:
            "Dr. Arjun Patel, male orthodontist in blue scrubs with arms crossed in modern dental office",
        credentials: [
            "DMD, NYU College of Dentistry",
            "Certified Invisalign Provider",
            "AAO Member",
        ],
        experience: "12 yrs",
        availability: "Tue, Thu, Sat",
        category: "Orthodontics",
        bio: "A top-ranked Invisalign provider with over 800 successful aligner cases, Dr. Patel combines biomechanical precision with an artistic eye for smile aesthetics. He's a frequent speaker at national orthodontic conferences.",
        languages: ["English", "Hindi"],
    },
    {
        id: "rodriguez",
        name: "Dr. Sofia Rodriguez",
        title: "Cosmetic Dentistry Lead",
        specialty: "Veneers & Smile Design",
        image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_1ba38da82-1771898381513.png",
        imageAlt:
            "Dr. Sofia Rodriguez, female cosmetic dentist in white coat reviewing dental records",
        credentials: [
            "DDS, Harvard School of Dental Medicine",
            "AACD Fellow",
            "Digital Smile Design Certified",
        ],
        experience: "15 yrs",
        availability: "Mon, Tue, Thu",
        category: "Cosmetic",
        bio: "Voted 'Best Cosmetic Dentist in Manhattan' twice by NYC Magazine, Dr. Rodriguez has transformed thousands of smiles with her signature porcelain veneer technique and bespoke smile design approach.",
        languages: ["English", "Spanish"],
    },
    {
        id: "kim",
        name: "Dr. James Kim",
        title: "Endodontics Specialist",
        specialty: "Root Canal & Pain Relief",
        image: "https://images.unsplash.com/photo-1715305957455-0d30050b81eb",
        imageAlt:
            "Dr. James Kim, male endodontist in green scrubs standing in dental treatment room",
        credentials: [
            "DMD, Penn Dental Medicine",
            "Certificate in Endodontics",
            "AAE Member",
        ],
        experience: "10 yrs",
        availability: "Wed, Fri, Sat",
        category: "Endodontics",
        bio: "Dr. Kim has performed over 5,000 root canal procedures with a near-perfect success rate. His gentle, anxiety-free approach has earned him a reputation for transforming the most feared dental procedure into a comfortable experience.",
        languages: ["English", "Korean"],
    },
    {
        id: "okonkwo",
        name: "Dr. Amara Okonkwo",
        title: "Pediatric Dental Specialist",
        specialty: "Children's Dentistry",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
        imageAlt:
            "Dr. Amara Okonkwo, female pediatric dentist smiling in colorful dental office",
        credentials: [
            "DDS, Tufts University",
            "Residency in Pediatric Dentistry",
            "AAPD Member",
        ],
        experience: "9 yrs",
        availability: "Mon, Wed, Thu",
        category: "Pediatric",
        bio: "Dr. Okonkwo has an extraordinary gift for connecting with children and making dental visits fun. Her child-friendly office, gentle technique, and warm personality ensure even the most anxious little patients leave with a smile.",
        languages: ["English", "Igbo"],
    },
    {
        id: "nakamura",
        name: "Dr. Kenji Nakamura",
        title: "Periodontics Specialist",
        specialty: "Gum Disease & Periodontal Therapy",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
        imageAlt:
            "Dr. Kenji Nakamura, male periodontist in white coat at dental clinic",
        credentials: [
            "DDS, Boston University",
            "Certificate in Periodontics",
            "AAP Board Eligible",
        ],
        experience: "11 yrs",
        availability: "Tue, Thu, Fri",
        category: "Periodontics",
        bio: "Dr. Nakamura specializes in laser-assisted gum therapy and regenerative periodontal procedures. His minimally invasive approach has helped hundreds of patients reverse advanced gum disease and save compromised teeth.",
        languages: ["English", "Japanese"],
    },
    {
        id: "hassan",
        name: "Dr. Layla Hassan",
        title: "General Dentistry Lead",
        specialty: "Comprehensive & Restorative Care",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
        imageAlt:
            "Dr. Layla Hassan, female general dentist in white coat reviewing patient X-rays",
        credentials: [
            "DMD, University of Michigan",
            "Fellow, Academy of General Dentistry",
            "CEREC Certified",
        ],
        experience: "13 yrs",
        availability: "Mon, Tue, Wed, Fri",
        category: "General",
        bio: "Dr. Hassan is the backbone of our general dentistry program, handling everything from complex restorations to full-mouth rehabilitation. Patients describe her as the most thorough and caring dentist they've ever had.",
        languages: ["English", "Arabic"],
    },
    {
        id: "thompson",
        name: "Dr. Marcus Thompson",
        title: "Oral & Maxillofacial Surgeon",
        specialty: "Extractions & Jaw Surgery",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54",
        imageAlt:
            "Dr. Marcus Thompson, male oral surgeon reviewing 3D scan in clinic",
        credentials: [
            "DDS, MD — University of Chicago",
            "Residency at NYU Langone",
            "AAOMS Member",
        ],
        experience: "14 yrs",
        availability: "Wed, Thu, Sat",
        category: "Oral Surgery",
        bio: "With dual degrees in dentistry and medicine, Dr. Thompson brings a uniquely comprehensive perspective to oral surgery. He specializes in wisdom tooth removal, jaw reconstruction, and complex implant cases.",
        languages: ["English"],
    },
];

const categories = [
    "All",
    "General",
    "Cosmetic",
    "Implantology",
    "Orthodontics",
    "Endodontics",
    "Pediatric",
    "Periodontics",
    "Oral Surgery",
];

function DoctorCard({
    doctor,
    index,
}: {
    doctor: (typeof doctors)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.classList.add("reveal-scale");
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
        <div ref={ref} className="doctor-card group bg-white rounded-3xl overflow-hidden border border-cream-dark shadow-card">
            {/* Photo */}
            <div className="relative h-72 overflow-hidden">
                <AppImage
                    src={doctor.image}
                    alt={doctor.imageAlt}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />

                {/* Overlay info */}
                <div className="doctor-overlay absolute inset-0 bg-navy/75 flex items-center justify-center p-6">
                    <div className="text-center">
                        <p className="text-white/80 text-sm leading-relaxed mb-4">{doctor.bio}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {doctor.languages.map((l) => (
                                <span key={l} className="bg-gold/20 text-gold text-xs px-2.5 py-1 rounded-full">
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-gold/20 text-gold text-xs font-semibold px-3 py-1 rounded-full">
                        {doctor.specialty}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="font-display text-lg font-semibold text-navy leading-snug">
                    {doctor.name}
                </h3>
                <p className="text-gold text-sm font-medium mt-0.5 mb-4">{doctor.title}</p>

                {/* Credentials */}
                <ul className="space-y-1.5 mb-4">
                    {doctor.credentials.map((c) => (
                        <li key={c} className="flex items-center gap-2 text-xs text-navy/60">
                            <div className="w-3.5 h-3.5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                                <svg width="7" height="6" viewBox="0 0 8 7" fill="none">
                                    <path
                                        d="M1 3.5L3 5.5L7 1"
                                        stroke="#C9A96E"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            {c}
                        </li>
                    ))}
                </ul>

                {/* Meta row */}
                <div className="flex items-center justify-between pt-4 border-t border-cream-dark">
                    <div className="flex items-center gap-1.5 text-xs text-navy/50">
                        <Icon name="ClockIcon" size={12} />
                        <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-navy/50">
                        <Icon name="CalendarDaysIcon" size={12} />
                        <span>{doctor.availability}</span>
                    </div>
                </div>

                <Link
                    href="/appointments"
                    className="mt-4 w-full btn-gold py-2.5 rounded-full text-sm font-semibold text-center block"
                >
                    <span>Book with Dr. {doctor.name.split(" ").pop()}</span>
                </Link>
            </div>
        </div>
    );
}

export default function DoctorsPageContent() {
    const [activeCategory, setActiveCategory] = useState("All");
    const heroRef = useRef<HTMLDivElement>(null);

    const filtered =
        activeCategory === "All"
            ? doctors
            : doctors.filter((d) => d.category === activeCategory);

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
                            Our Specialists
                        </span>
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-5">
                        Meet the Experts Behind{" "}
                        <span className="text-gold-gradient italic">Your Smile</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                        Our 12-member team of board-certified specialists brings together
                        decades of combined experience across every branch of modern
                        dentistry.
                    </p>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="sticky top-20 z-30 bg-white border-b border-cream-dark shadow-card">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                        ? "bg-navy text-white shadow-navy"
                                        : "bg-cream text-navy/60 hover:bg-cream-dark"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors Grid */}
            <section className="py-20 px-6 lg:px-8 bg-cream">
                <div className="max-w-7xl mx-auto">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-navy/40 text-lg">No doctors found in this specialty.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-navy/40 text-sm mb-8">
                                Showing {filtered.length} specialist{filtered.length !== 1 ? "s" : ""}
                                {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filtered.map((doctor, i) => (
                                    <DoctorCard key={doctor.id} doctor={doctor} index={i} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Why Our Team */}
            <section className="py-20 px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3">
                            Why Our Team Stands Apart
                        </h2>
                        <div className="section-divider mx-auto mb-4" />
                        <p className="text-navy/55 max-w-xl mx-auto text-sm leading-relaxed">
                            We don't just hire dentists — we recruit the best clinical minds
                            who share our commitment to patient-first care.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: "AcademicCapIcon",
                                title: "Top-Tier Education",
                                desc: "Every specialist holds advanced degrees from nationally or globally ranked dental institutions.",
                            },
                            {
                                icon: "ArrowPathIcon",
                                title: "Continuous Learning",
                                desc: "All doctors complete 40+ hours of continuing education annually to stay current with the latest techniques.",
                            },
                            {
                                icon: "UsersIcon",
                                title: "Collaborative Approach",
                                desc: "Complex cases benefit from our multidisciplinary team conferences — you get the collective wisdom of all 12 specialists.",
                            },
                            {
                                icon: "ChatBubbleLeftRightIcon",
                                title: "Patient-Centered Care",
                                desc: "Our doctors spend additional time listening, explaining, and answering questions — no rushed appointments.",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="bg-cream rounded-2xl p-6 border border-cream-dark"
                            >
                                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
                                    <Icon name={item.icon} size={18} className="text-navy" />
                                </div>
                                <h3 className="font-semibold text-navy mb-2 text-sm">{item.title}</h3>
                                <p className="text-navy/55 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 lg:px-8 bg-navy">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-5">
                        Ready to Meet Your Doctor?
                    </h2>
                    <p className="text-white/55 text-base max-w-xl mx-auto leading-relaxed mb-8">
                        Book a free consultation with any specialist on our team. We'll
                        match you with the right expert for your needs.
                    </p>
                    <Link
                        href="/appointments"
                        className="btn-gold px-8 py-4 rounded-full font-semibold text-sm shadow-gold"
                    >
                        <span>Book Free Consultation</span>
                    </Link>
                </div>
            </section>
        </>
    );
}
