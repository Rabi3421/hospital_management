"use client";

import { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";


const doctors = [
{
  id: "chen",
  name: "Dr. Margaret Chen",
  title: "Chief Dental Officer",
  specialty: "Implantology & Oral Surgery",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_192f25304-1767786255269.png",
  imageAlt: "Dr. Margaret Chen, female dentist in white coat smiling professionally in clinic",
  credentials: ["DDS, Columbia University", "Diplomate, ABOI", "18 yrs experience"],
  availability: "Mon, Wed, Fri"
},
{
  id: "patel",
  name: "Dr. Arjun Patel",
  title: "Orthodontics Director",
  specialty: "Invisalign & Braces",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_10337129e-1772074664598.png",
  imageAlt: "Dr. Arjun Patel, male orthodontist in blue scrubs with arms crossed in modern dental office",
  credentials: ["DMD, NYU College", "Certified Invisalign Provider", "12 yrs experience"],
  availability: "Tue, Thu, Sat"
},
{
  id: "rodriguez",
  name: "Dr. Sofia Rodriguez",
  title: "Cosmetic Dentistry Lead",
  specialty: "Veneers & Smile Design",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ba38da82-1771898381513.png",
  imageAlt: "Dr. Sofia Rodriguez, female cosmetic dentist in white coat reviewing dental records",
  credentials: ["DDS, Harvard School", "AACD Fellow", "15 yrs experience"],
  availability: "Mon, Tue, Thu"
},
{
  id: "kim",
  name: "Dr. James Kim",
  title: "Endodontics Specialist",
  specialty: "Root Canal & Pain Relief",
  image: "https://images.unsplash.com/photo-1715305957455-0d30050b81eb",
  imageAlt: "Dr. James Kim, male endodontist in green scrubs standing in dental treatment room",
  credentials: ["DMD, Penn Dental", "AAE Member", "10 yrs experience"],
  availability: "Wed, Fri, Sat"
}];


function DoctorCard({ doctor, delay = 0 }: {doctor: (typeof doctors)[0];delay?: number;}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal-scale");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("revealed"), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="doctor-card group bg-white rounded-3xl overflow-hidden border border-cream-dark shadow-card">
      {/* Photo */}
      <div className="relative h-72 overflow-hidden">
        <AppImage
          src={doctor.image}
          alt={doctor.imageAlt}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700" />
        
        {/* Overlay on hover */}
        <div className="doctor-overlay absolute inset-0 bg-navy/70 flex items-end p-6">
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-wider mb-2">Available</p>
            <p className="text-white font-medium text-sm">{doctor.availability}</p>
            <button
              onClick={() => {
                const el = document.querySelector("#contact");
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
              className="mt-4 w-full btn-gold py-2.5 rounded-xl text-sm font-semibold">
              
              <span>Book with Dr. {doctor.name.split(" ")[1]}</span>
            </button>
          </div>
        </div>
        {/* Specialty badge */}
        <div className="absolute top-4 left-4 glass-dark rounded-full px-3 py-1.5">
          <span className="text-gold text-xs font-semibold">{doctor.specialty}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-navy tracking-tight">{doctor.name}</h3>
        <p className="text-gold text-sm font-medium mt-0.5 mb-4">{doctor.title}</p>
        <ul className="space-y-1.5">
          {doctor.credentials.map((cred) =>
          <li key={cred} className="flex items-center gap-2 text-xs text-navy/60 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
              {cred}
            </li>
          )}
        </ul>
      </div>
    </div>);

}

export default function TeamSection() {
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.classList.add("reveal-hidden");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="team" className="py-16 sm:py-24 lg:py-32 bg-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            Meet Our Specialists
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-navy tracking-tight leading-[1.1] mb-4">
            Doctors Who Care
            <br />
            <em className="font-light italic text-navy/60">As Much As You Do.</em>
          </h2>
          <p className="text-navy/60 text-base max-w-xl mx-auto leading-relaxed">
            Our team of 12 board-certified specialists brings decades of combined experience
            and a genuine commitment to your oral health and comfort.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc, i) =>
          <DoctorCard key={doc.id} doctor={doc} delay={i * 100} />
          )}
        </div>

        {/* Accreditation bar */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-cream-dark">
          <p className="text-center text-xs font-semibold tracking-[0.18em] uppercase text-navy/40 mb-6">
            Accreditations & Memberships
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12">
            {[
            "American Dental Association",
            "New York State Dental Association",
            "American Academy of Cosmetic Dentistry",
            "International Team for Implantology",
            "American Association of Endodontists"].
            map((org) =>
            <span key={org} className="text-navy/50 text-sm font-medium text-center">
                {org}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>);

}