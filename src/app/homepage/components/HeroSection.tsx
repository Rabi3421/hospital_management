"use client";

import { useEffect, useRef } from "react";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";

const floatingCards = [
{
  id: "rating",
  className: "absolute top-[18%] right-[6%] animate-float z-20 hidden sm:block",
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
  className: "absolute bottom-[28%] right-[8%] animate-float-2 z-20 hidden sm:block",
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
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
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-semibold leading-[1.05] tracking-tight mb-5 sm:mb-6">
              
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
              className="text-white/75 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-xl mb-8 sm:mb-10 animate-fade-in"
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
              className="flex flex-wrap items-center gap-3 sm:gap-6 animate-fade-in"
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

          {/* Right — Why Choose Us Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-card rounded-3xl p-7 shadow-xl-navy animate-scale-in" style={{ animationDelay: "0.3s", opacity: 0 }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-navy font-semibold text-sm">Why Choose Us</p>
                  <p className="text-navy/50 text-xs">Trusted by thousands of patients</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { value: "15,000+", label: "Patients Treated", icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )},
                  { value: "18 Years", label: "Of Excellence", icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  )},
                  { value: "50+", label: "Specialist Doctors", icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )},
                  { value: "4.9 / 5.0", label: "Patient Rating", icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#C9A96E">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )},
                ].map((stat) => (
                  <div key={stat.label} className="bg-cream rounded-2xl p-4 flex flex-col gap-2">
                    <div className="w-8 h-8 bg-gold/15 rounded-lg flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <p className="text-navy font-bold text-lg leading-none">{stat.value}</p>
                    <p className="text-navy/55 text-xs font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Feature List */}
              <div className="space-y-3 mb-6">
                {[
                  "Board-certified specialists in every department",
                  "State-of-the-art diagnostic & treatment equipment",
                  "24/7 emergency care, always available",
                  "All major insurance plans accepted",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-navy/70 text-sm font-medium leading-snug">{item}</span>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <button
                onClick={() => {
                  const el = document.querySelector("#services");
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 group">
                <span>Explore Our Services</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
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