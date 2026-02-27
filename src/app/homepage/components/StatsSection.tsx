"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/AppIcon";

const stats = [
  { value: 15000, suffix: "+", label: "Patients Treated", icon: "UserGroupIcon" },
  { value: 18, suffix: " yrs", label: "Years of Excellence", icon: "TrophyIcon" },
  { value: 99, suffix: "%", label: "Patient Satisfaction", icon: "HeartIcon" },
  { value: 12, suffix: "", label: "Specialist Doctors", icon: "AcademicCapIcon" },
];

const features = [
  {
    icon: "ComputerDesktopIcon",
    title: "Digital X-Ray & 3D Imaging",
    desc: "90% less radiation than traditional X-rays with instant high-res imaging for precise diagnosis.",
  },
  {
    icon: "SparklesIcon",
    title: "CEREC Same-Day Crowns",
    desc: "Computer-milled ceramic crowns designed, fabricated, and placed in a single appointment.",
  },
  {
    icon: "ShieldCheckIcon",
    title: "Hospital-Grade Sterilization",
    desc: "Autoclave sterilization and single-use instruments for every patient, every time.",
  },
  {
    icon: "HeartIcon",
    title: "Sedation Dentistry",
    desc: "Nitrous oxide and IV sedation options for anxious patients — completely comfortable care.",
  },
  {
    icon: "CreditCardIcon",
    title: "Flexible Financing",
    desc: "0% APR payment plans available. We accept 40+ insurance plans including Medicaid.",
  },
  {
    icon: "ClockIcon",
    title: "Extended Hours",
    desc: "Open Monday–Saturday 8AM–8PM. Emergency line available 24 hours, 7 days a week.",
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="stat-number">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    featureRefs.current.forEach((el, i) => {
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
    <section id="about" className="bg-navy py-24 lg:py-32 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 cross-pattern opacity-40" />
      {/* Gold glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20 pb-20 border-b border-white/10">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/15 mb-4">
                <Icon name={stat.icon as any} size={22} variant="solid" className="text-gold" />
              </div>
              <div className="font-display text-4xl md:text-5xl font-semibold text-white mb-2 leading-none">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-white/50 text-sm font-medium tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.1]">
            Advanced Technology,
            <br />
            <em className="font-light italic text-gold-light">Compassionate Hands.</em>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              ref={(el) => { featureRefs.current[i] = el; }}
              className="group p-7 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/30 transition-all duration-400 cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center mb-5 group-hover:bg-gold/25 transition-colors">
                <Icon name={feat.icon as any} size={22} variant="solid" className="text-gold" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2 tracking-tight">{feat.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}