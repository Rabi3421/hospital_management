"use client";

import { useEffect, useRef, useState } from "react";
import AppImage from "@/components/ui/AppImage";


const testimonials = [
{
  id: "t1",
  name: "Rebecca Thornton",
  role: "Dental Implant Patient",
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1658b37dd-1763299021458.png",
  avatarAlt: "Rebecca Thornton, middle-aged woman with brown hair smiling",
  rating: 5,
  text: "After losing two teeth in an accident, I was devastated. Dr. Chen walked me through the entire implant process with such patience. The results are indistinguishable from my natural teeth — I genuinely forget they're implants. Best medical decision I've ever made.",
  service: "Dental Implants",
  date: "January 2026"
},
{
  id: "t2",
  name: "Marcus Williams",
  role: "Invisalign Patient",
  avatar: "https://images.unsplash.com/photo-1724128192920-a6f9083d6aac",
  avatarAlt: "Marcus Williams, young Black man in business casual attire smiling confidently",
  rating: 5,
  text: "I had braces as a teenager but my teeth shifted over the years. Dr. Patel's Invisalign plan was incredibly detailed — he showed me a 3D simulation of my final smile before I committed. 14 months later, my teeth are perfect. The office staff is always warm and professional.",
  service: "Invisalign",
  date: "December 2025"
},
{
  id: "t3",
  name: "Linda Okonkwo",
  role: "Smile Makeover Patient",
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_109b9e6de-1772095717577.png",
  avatarAlt: "Linda Okonkwo, Nigerian-American woman with natural hair smiling broadly",
  rating: 5,
  text: "I\'ve been hiding my smile for 10 years because of chipped and discolored teeth. Dr. Rodriguez designed a complete smile makeover with 8 veneers. She showed me digital previews before touching a single tooth. I cried when I saw the final result. I smile in every photo now.",
  service: "Veneers & Smile Design",
  date: "November 2025"
},
{
  id: "t4",
  name: "David Park",
  role: "Emergency Care Patient",
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18d99b1d1-1772150489930.png",
  avatarAlt: "David Park, Korean-American man in casual clothing with friendly expression",
  rating: 5,
  text: "Cracked a molar on a Saturday night — excruciating pain. Called DentalCare's emergency line at 11PM and had an appointment at 8AM Sunday. Dr. Kim was calm, fast, and brilliant. Root canal was completely painless. I've moved all my family's dental care here permanently.",
  service: "Emergency Care",
  date: "October 2025"
},
{
  id: "t5",
  name: "Jennifer Castellano",
  role: "Family Dentistry Patient",
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a872bbed-1772101824095.png",
  avatarAlt: "Jennifer Castellano, Latina woman in her 30s with dark hair and warm smile",
  rating: 5,
  text: "Bringing three kids to the dentist used to be a nightmare. DentalCare's team is incredible with children — my 6-year-old actually asks when she gets to go back. The CEREC crown for my husband was done in one visit. This practice has genuinely changed how our family feels about dental care.",
  service: "Family Dentistry",
  date: "February 2026"
},
{
  id: "t6",
  name: "Thomas Nguyen",
  role: "Teeth Whitening Patient",
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11dc7e683-1763293107593.png",
  avatarAlt: "Thomas Nguyen, Vietnamese-American man in his 40s with professional appearance",
  rating: 5,
  text: "Had Zoom whitening done before my wedding. The hygienist was incredibly thorough with prep and the results were stunning — 7 shades whiter in 90 minutes. My teeth were a little sensitive for a day but the take-home kit they provided helped a lot. Absolutely worth every penny.",
  service: "Teeth Whitening",
  date: "March 2026"
}];


function StarRating({ count }: {count: number;}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) =>
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#C9A96E">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
    </div>);

}

export default function TestimonialsSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  useEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      el.classList.add("reveal-hidden");
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add("revealed"), i * 100);
            obs.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    });
  }, []);

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            Patient Stories
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-navy tracking-tight leading-[1.1] mb-4">
            Real Smiles,
            <br />
            <em className="font-light italic text-navy/60">Real Transformations.</em>
          </h2>
          {/* Overall rating */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <StarRating count={5} />
            <span className="text-navy font-semibold text-lg">4.9</span>
            <span className="text-navy/50 text-sm">from 2,400+ verified reviews</span>
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className="bg-navy rounded-4xl p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gold/30">
                <AppImage
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].avatarAlt}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full" />
                
              </div>
            </div>
            <div className="md:col-span-10">
              <StarRating count={5} />
              <blockquote className="font-display text-xl md:text-2xl text-white font-light italic leading-relaxed mt-4 mb-6">
                "{testimonials[activeIndex].text}"
              </blockquote>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-white font-semibold text-sm">{testimonials[activeIndex].name}</p>
                  <p className="text-white/50 text-xs mt-0.5">{testimonials[activeIndex].role}</p>
                </div>
                <span className="px-3 py-1 bg-gold/20 rounded-full text-gold text-xs font-semibold">
                  {testimonials[activeIndex].service}
                </span>
                <span className="text-white/30 text-xs">{testimonials[activeIndex].date}</span>
              </div>
            </div>
          </div>
          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) =>
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-300 ${
              i === activeIndex ?
              "w-6 h-2 bg-gold" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`
              }
              aria-label={`Show testimonial ${i + 1}`} />

            )}
          </div>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t, i) =>
          <div
            key={t.id}
            ref={(el) => {cardRefs.current[i] = el;}}
            className="testimonial-card bg-white rounded-3xl p-7 border border-cream-dark shadow-card cursor-pointer"
            onClick={() => setActiveIndex(i)}>
            
              <div className="flex items-center justify-between mb-4">
                <StarRating count={t.rating} />
                <span className="text-navy/30 text-xs">{t.date}</span>
              </div>
              <p className="text-navy/70 text-sm leading-relaxed mb-6 line-clamp-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <AppImage
                  src={t.avatar}
                  alt={t.avatarAlt}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full" />
                
                </div>
                <div>
                  <p className="text-navy font-semibold text-sm">{t.name}</p>
                  <p className="text-navy/50 text-xs">{t.service}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}