"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/AppIcon";

const faqs = [
  {
    q: "Do you accept dental insurance?",
    a: "Yes — we accept over 40 dental insurance plans including Delta Dental, Cigna, Aetna, MetLife, Guardian, and most major PPO plans. We also accept Medicaid and offer in-house membership plans for uninsured patients. Our billing team will verify your benefits before your first appointment.",
  },
  {
    q: "How soon can I get an appointment?",
    a: "New patient appointments are typically available within 2–3 business days. For dental emergencies, we offer same-day appointments — call our emergency line at (212) 555-0190 and we'll see you as soon as possible, including evenings and weekends.",
  },
  {
    q: "Is teeth whitening safe?",
    a: "Absolutely. Our Zoom in-office whitening uses a clinically proven hydrogen peroxide gel activated by LED light. It's safe for enamel when performed by a licensed dental professional. Some patients experience mild sensitivity for 24–48 hours, which we manage with desensitizing agents included in your treatment kit.",
  },
  {
    q: "What's the difference between an implant and a bridge?",
    a: "A dental implant is a titanium post surgically placed in the jawbone that functions exactly like a natural tooth root — it preserves bone and doesn't affect adjacent teeth. A bridge is a fixed prosthetic that requires grinding down neighboring healthy teeth for support. Implants are generally the superior long-term solution and carry our lifetime placement warranty.",
  },
  {
    q: "Do you offer payment plans for expensive treatments?",
    a: "Yes. We partner with CareCredit and Lending Club Patient Solutions to offer 0% APR financing for up to 24 months on qualifying treatments. We also offer in-house payment plans for established patients. Our treatment coordinators will walk you through all financial options before you commit to anything.",
  },
  {
    q: "Are dental X-rays safe?",
    a: "Our digital X-ray system emits up to 90% less radiation than traditional film X-rays. The exposure from a full set of digital dental X-rays is roughly equivalent to the natural radiation you receive during a 1-hour flight. We also use lead aprons and follow strict ALARA protocols to minimize exposure.",
  },
  {
    q: "Do you treat children?",
    a: "Yes! We see patients from age 3 onward. Our pediatric-trained hygienists use child-friendly language and techniques to make dental visits a positive experience. We recommend first visits by age 1 or when the first tooth appears, and routine checkups every 6 months thereafter.",
  },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal-hidden");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("revealed"), index * 60);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`border border-cream-dark rounded-2xl overflow-hidden transition-all duration-300 ${
        open ? "bg-white shadow-card" : "bg-white hover:border-gold/40"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left gap-4"
        aria-expanded={open}
      >
        <span className="font-semibold text-navy text-base pr-2">{faq.q}</span>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            open ? "bg-navy rotate-45" : "bg-cream-dark"
          }`}
        >
          <Icon
            name="PlusIcon"
            size={16}
            className={open ? "text-white" : "text-navy"}
          />
        </div>
      </button>
      <div className={`faq-answer px-6 ${open ? "open" : ""}`}>
        <p className="text-navy/65 text-sm leading-relaxed pb-6">{faq.a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
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
    <section id="faq" className="py-16 sm:py-24 lg:py-32 bg-cream-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            Common Questions
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-navy tracking-tight leading-[1.1]">
            Everything You
            <br />
            <em className="font-light italic text-navy/60">Need to Know.</em>
          </h2>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-white rounded-3xl p-8 border border-cream-dark">
          <p className="text-navy/60 text-sm mb-4">Still have questions? Our team is happy to help.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+12125550190"
              className="flex items-center gap-2 btn-primary px-6 py-3 rounded-full text-sm font-semibold"
            >
              <Icon name="PhoneIcon" size={16} variant="solid" />
              <span>Call (212) 555-0190</span>
            </a>
            <a
              href="mailto:hello@dentalcarenyc.com"
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-cream-darker text-navy font-semibold text-sm hover:bg-cream transition-colors"
            >
              <Icon name="EnvelopeIcon" size={16} />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}