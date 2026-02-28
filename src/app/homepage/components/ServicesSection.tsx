"use client";

import { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";

const services = [
{
  id: "general",
  title: "General & Preventive Dentistry",
  description: "Comprehensive checkups, professional cleanings, digital X-rays, and personalized oral health plans to keep your teeth strong for life.",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d1ee47fa-1772054604928.png",
  imageAlt: "Dentist performing professional teeth cleaning on patient in modern clinic",
  tag: "Most Popular",
  tagColor: "bg-green-100 text-green-700",
  large: true
},
{
  id: "cosmetic",
  title: "Cosmetic Dentistry",
  description: "Veneers, bonding, and smile makeovers tailored to your facial structure.",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_18566889d-1767874064164.png",
  imageAlt: "Close-up of beautiful white teeth after cosmetic dental treatment",
  tag: "Premium",
  tagColor: "bg-gold-50 text-gold-700",
  large: false
},
{
  id: "whitening",
  title: "Teeth Whitening",
  description: "In-office Zoom whitening — up to 8 shades brighter in a single 90-minute session.",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c7cbdfc6-1772103276287.png",
  imageAlt: "Professional teeth whitening procedure being performed in dental office",
  tag: "1-Day Result",
  tagColor: "bg-blue-50 text-blue-700",
  large: false
},
{
  id: "implants",
  title: "Dental Implants",
  description: "Permanent, natural-looking tooth replacements with titanium implants and porcelain crowns. Lifetime warranty on implant placement.",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_113567aef-1771898380052.png",
  imageAlt: "Dental implant model showing titanium post and porcelain crown structure",
  tag: "Lifetime Warranty",
  tagColor: "bg-navy-50 text-navy",
  large: true
},
{
  id: "ortho",
  title: "Orthodontics & Invisalign",
  description: "Clear aligner therapy and traditional braces for teens and adults.",
  image: "https://images.unsplash.com/photo-1694675236489-d73651370688",
  imageAlt: "Clear Invisalign aligners held in hands showing transparent dental braces",
  tag: "Certified Provider",
  tagColor: "bg-purple-50 text-purple-700",
  large: false
},
{
  id: "emergency",
  title: "Emergency Dental Care",
  description: "Same-day emergency appointments available 24/7 for pain relief and trauma.",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12b04269a-1772207392916.png",
  imageAlt: "Emergency dental care room with modern equipment ready for urgent treatment",
  tag: "24/7 Available",
  tagColor: "bg-red-50 text-red-600",
  large: false
}];


function ServiceCard({
  service,
  delay = 0



}: {service: (typeof services)[0];delay?: number;}) {
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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`service-card group relative overflow-hidden rounded-3xl bg-white border border-cream-dark ${
      service.large ? "md:col-span-2" : ""}`
      }>
      
      {/* Image */}
      <div className={`relative overflow-hidden ${service.large ? "h-64 md:h-72" : "h-48"}`}>
        <AppImage
          src={service.image}
          alt={service.imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
        {/* Tag */}
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${service.tagColor}`}>
          
          {service.tag}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-navy mb-2 tracking-tight">
          {service.title}
        </h3>
        <p className="text-navy/60 text-sm leading-relaxed mb-4">{service.description}</p>
        <button
          onClick={() => {
            const el = document.querySelector("#contact");
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 80;
              window.scrollTo({ top, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-1.5 text-gold font-semibold text-sm group-hover:gap-2.5 transition-all">
          
          <span>Learn More</span>
          <Icon name="ArrowRightIcon" size={14} className="text-gold" />
        </button>
      </div>
    </div>);

}

export default function ServicesSection() {
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
    <section id="services" className="py-16 sm:py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-8 mb-10 sm:mb-16">
          <div>
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
              Our Specialties
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-navy tracking-tight leading-[1.1]">
              Comprehensive Dental
              <br />
              <em className="font-light italic text-navy/60">Care Under One Roof</em>
            </h2>
            <div className="section-divider mt-5" />
          </div>
          <p className="text-navy/60 text-base leading-relaxed max-w-sm">
            From your first checkup to advanced restorative and cosmetic procedures —
            all performed by board-certified specialists in our state-of-the-art Manhattan facility.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) =>
          <ServiceCard key={service.id} service={service} delay={i * 80} />
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              const el = document.querySelector("#contact");
              if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-2 btn-primary px-8 py-4 rounded-full font-semibold text-base shadow-navy">
            
            <span>Schedule Your Visit Today</span>
            <Icon name="CalendarDaysIcon" size={18} />
          </button>
        </div>
      </div>
    </section>);

}