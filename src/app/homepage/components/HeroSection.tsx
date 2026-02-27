"use client";

import { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";

const floatingCards = [
{
  id: "rating",
  className: "absolute top-[18%] right-[6%] animate-float z-20",
  content:
  <div className="glass-card rounded-2xl px-4 py-3 shadow-gold flex items-center gap-3 min-w-[180px]">
        <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#C9A96E">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div>
          <p className="text-navy font-semibold text-sm leading-none">4.9 / 5.0</p>
          <p className="text-navy/60 text-xs mt-0.5">2,400+ Reviews</p>
        </div>
      </div>

},
{
  id: "patients",
  className: "absolute bottom-[28%] right-[8%] animate-float-2 z-20",
  content:
  <div className="glass-card rounded-2xl px-4 py-3 shadow-card flex items-center gap-3 min-w-[200px]">
        <div className="w-10 h-10 bg-navy/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <p className="text-navy font-semibold text-sm leading-none">15,000+</p>
          <p className="text-navy/60 text-xs mt-0.5">Happy Patients</p>
        </div>
      </div>

},
{
  id: "experience",
  className: "absolute top-[38%] left-[3%] animate-float-3 z-20 hidden xl:block",
  content:
  <div className="glass-card rounded-2xl px-4 py-3 shadow-card flex items-center gap-3 min-w-[170px]">
        <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <div>
          <p className="text-navy font-semibold text-sm leading-none">18 Years</p>
          <p className="text-navy/60 text-xs mt-0.5">Of Excellence</p>
        </div>
      </div>

}];


export default function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    setTimeout(() => {
      el.style.transition = "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="https://images.unsplash.com/photo-1704455306251-b4634215d98f"
          alt="Modern dental clinic interior with state-of-the-art equipment and bright white treatment room"
          fill
          className="object-cover object-center"
          priority />
        
        {/* Multi-stop gradient overlay */}
        <div className="absolute inset-0 hero-gradient" />
        {/* Bottom fade to cream */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cream to-transparent" />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-30 z-[1]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 trust-badge rounded-full px-4 py-2 mb-8 animate-fade-in"
              style={{ animationDelay: "0.1s", opacity: 0 }}>
              
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-xs font-medium tracking-wide uppercase">
                Now Accepting New Patients · Same-Day Appointments Available
              </span>
            </div>

            {/* Heading */}
            <h1
              ref={headingRef}
              className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-semibold leading-[1.05] tracking-tight mb-6">
              
              Your Smile
              <br />
              <em className="font-light italic text-gold-light not-italic">
                Deserves
              </em>
              <br />
              <span>Expert Care.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-white/75 text-lg md:text-xl font-light leading-relaxed max-w-xl mb-10 animate-fade-in"
              style={{ animationDelay: "0.4s", opacity: 0 }}>
              
              Manhattan's premier dental hospital — combining cutting-edge technology
              with compassionate care for over 18 years. From routine cleanings to
              full-mouth restorations.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in"
              style={{ animationDelay: "0.55s", opacity: 0 }}>
              
              <button
                onClick={() => {
                  const el = document.querySelector("#contact");
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                className="btn-gold px-8 py-4 rounded-full text-base font-semibold shadow-gold flex items-center justify-center gap-2 group">
                
                <span>Book Free Consultation</span>
                <Icon name="ArrowRightIcon" size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const el = document.querySelector("#services");
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/30 text-white font-medium text-base hover:bg-white/10 transition-all backdrop-blur-sm">
                
                <span>Explore Services</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              className="flex flex-wrap items-center gap-6 animate-fade-in"
              style={{ animationDelay: "0.7s", opacity: 0 }}>
              
              {[
              { icon: "ShieldCheckIcon", text: "Board-Certified Specialists" },
              { icon: "ClockIcon", text: "Emergency Care 24/7" },
              { icon: "CreditCardIcon", text: "All Insurance Accepted" }].
              map((item) =>
              <div key={item.text} className="flex items-center gap-2">
                  <Icon name={item.icon as any} size={16} variant="solid" className="text-gold" />
                  <span className="text-white/80 text-sm font-medium">{item.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-card rounded-3xl p-7 shadow-xl-navy animate-scale-in" style={{ animationDelay: "0.3s", opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-navy font-semibold text-sm">Quick Appointment</p>
                  <p className="text-navy/50 text-xs">Responses within 2 hours</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Johnson"
                    className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30" />
                  
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(212) 000-0000"
                    className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30" />
                  
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">
                    Service Needed
                  </label>
                  <select className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium appearance-none">
                    <option value="">Select a service</option>
                    <option>General Checkup & Cleaning</option>
                    <option>Teeth Whitening</option>
                    <option>Dental Implants</option>
                    <option>Orthodontics / Invisalign</option>
                    <option>Root Canal Treatment</option>
                    <option>Cosmetic Dentistry</option>
                    <option>Emergency Dental Care</option>
                  </select>
                </div>
                <button
                  className="w-full btn-primary py-4 rounded-xl font-semibold text-sm mt-2"
                  onClick={() => {
                    // Mock submit handler — connect to backend API here
                    alert("Appointment request submitted! We'll contact you within 2 hours.");
                  }}>
                  
                  <span>Request Appointment →</span>
                </button>
                <p className="text-center text-xs text-navy/40 font-medium">
                  Free first consultation · No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      {floatingCards.map((card) =>
      <div key={card.id} className={card.className}>
          {card.content}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Scroll</span>
        <Icon name="ChevronDownIcon" size={20} className="text-white/50" />
      </div>
    </section>);

}