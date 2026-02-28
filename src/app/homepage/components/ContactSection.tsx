"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/AppIcon";

const services = [
  "General Checkup & Cleaning",
  "Teeth Whitening",
  "Dental Implants",
  "Orthodontics / Invisalign",
  "Root Canal Treatment",
  "Cosmetic Dentistry",
  "Veneers & Smile Design",
  "Emergency Dental Care",
  "Pediatric Dentistry",
  "Other / Not Sure",
];

const timeSlots = [
  "Morning (8AM – 12PM)",
  "Afternoon (12PM – 4PM)",
  "Evening (4PM – 8PM)",
  "Any time works",
];

const contactInfo = [
  {
    icon: "MapPinIcon",
    label: "Address",
    value: "485 Madison Avenue, Suite 1200",
    sub: "New York, NY 10022",
    href: "https://maps.google.com",
  },
  {
    icon: "PhoneIcon",
    label: "Phone",
    value: "(212) 555-0190",
    sub: "Emergency: (212) 555-0911",
    href: "tel:+12125550190",
  },
  {
    icon: "EnvelopeIcon",
    label: "Email",
    value: "hello@dentalcarenyc.com",
    sub: "Replies within 2 hours",
    href: "mailto:hello@dentalcarenyc.com",
  },
  {
    icon: "ClockIcon",
    label: "Hours",
    value: "Mon–Sat: 8AM – 8PM",
    sub: "Sunday: Emergency Only",
    href: null,
  },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    timeSlot: "",
    message: "",
    insurance: "",
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    el.classList.add("reveal-hidden-left");
    const el2 = formRef.current;
    if (el2) el2.classList.add("reveal-hidden-right");

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          if (el2) setTimeout(() => el2.classList.add("revealed"), 150);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock submit handler — connect to Next.js API route at /api/appointments here
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-cream relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-navy/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Info */}
          <div ref={sectionRef} className="lg:col-span-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
              Book an Appointment
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-navy tracking-tight leading-[1.1] mb-6">
              Begin Your
              <br />
              <em className="font-light italic text-navy/60">Smile Journey.</em>
            </h2>
            <p className="text-navy/60 text-base leading-relaxed mb-10">
              Fill out the form and our patient coordinators will contact you within
              2 hours to confirm your appointment. First consultation is always free.
            </p>

            {/* Contact Info */}
            <div className="space-y-5 mb-10">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-navy flex items-center justify-center flex-shrink-0">
                    <Icon name={info.icon as any} size={18} variant="solid" className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-0.5">
                      {info.label}
                    </p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-navy font-semibold text-sm hover:text-gold transition-colors"
                        target={info.href.startsWith("https") ? "_blank" : undefined}
                        rel={info.href.startsWith("https") ? "noopener noreferrer" : undefined}
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-navy font-semibold text-sm">{info.value}</p>
                    )}
                    <p className="text-navy/50 text-xs mt-0.5">{info.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="rounded-3xl overflow-hidden h-52 bg-cream-dark border border-cream-darker relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.9754!3d40.7614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s485+Madison+Ave%2C+New+York%2C+NY+10022!5e0!3m2!1sen!2sus!4v1000000000000"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(20%) contrast(95%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DentalCare NYC location map"
              />
            </div>
          </div>

          {/* Right Form */}
          <div ref={formRef} className="lg:col-span-7">
            <div className="bg-white rounded-4xl p-6 sm:p-8 md:p-10 border border-cream-dark shadow-xl-navy">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="CheckCircleIcon" size={40} variant="solid" className="text-green-500" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-navy mb-3">
                    Appointment Requested!
                  </h3>
                  <p className="text-navy/60 text-base mb-6 max-w-sm mx-auto">
                    We'll call or email you within 2 hours to confirm your appointment time.
                  </p>
                  <div className="bg-cream rounded-2xl p-5 text-sm text-navy/70">
                    <p className="font-semibold text-navy mb-1">What happens next?</p>
                    <ul className="space-y-1 text-left">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        Our team reviews your request
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        We call to confirm time & insurance
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        You receive a confirmation email
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm text-navy/50 hover:text-navy transition-colors"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-navy mb-1">
                      Request Your Appointment
                    </h3>
                    <p className="text-navy/50 text-sm">
                      Free first consultation · Most insurance accepted
                    </p>
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="Sarah"
                        className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Johnson"
                        className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30"
                      />
                    </div>
                  </div>

                  {/* Contact row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="sarah@email.com"
                        className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="(212) 000-0000"
                        className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30"
                      />
                    </div>
                  </div>

                  {/* Service & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                        Service Needed
                      </label>
                      <select
                        value={form.service}
                        onChange={(e) => setForm({ ...form, service: e.target.value })}
                        className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium appearance-none"
                      >
                        <option value="">Select service</option>
                        {services.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                        Preferred Time
                      </label>
                      <select
                        value={form.timeSlot}
                        onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                        className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium appearance-none"
                      >
                        <option value="">Any time</option>
                        {timeSlots.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Insurance */}
                  <div>
                    <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                      Insurance Provider (optional)
                    </label>
                    <input
                      type="text"
                      value={form.insurance}
                      onChange={(e) => setForm({ ...form, insurance: e.target.value })}
                      placeholder="e.g. Delta Dental, Aetna, Cigna, Uninsured"
                      className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                      Tell Us More (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your symptoms, concerns, or anything else we should know..."
                      className="w-full px-4 py-3 bg-cream rounded-xl border border-cream-dark form-input text-navy text-sm font-medium placeholder:text-navy/30 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gold py-4 rounded-xl font-semibold text-base shadow-gold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Request Free Consultation</span>
                        <Icon name="ArrowRightIcon" size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-navy/40">
                    By submitting, you agree to our{" "}
                    <span className="underline cursor-pointer hover:text-navy transition-colors">Privacy Policy</span>.
                    We never share your information.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}