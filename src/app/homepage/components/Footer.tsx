"use client";

import Link from "next/link";
import Icon from "@/components/ui/AppIcon";

export default function Footer() {
  const year = 2026;

  return (
    <footer className="bg-navy border-t border-white/10">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 3 2C1.5 2 0 3.5 0 5.5C0 9 3 12 6.5 16C7.5 17.5 9 19.5 12 22C15 19.5 16.5 17.5 17.5 16C21 12 24 9 24 5.5C24 3.5 22.5 2 21 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"
                    fill="#C9A96E"
                  />
                </svg>
              </div>
              <div>
                <span className="font-display font-semibold text-white text-lg leading-none">DentalCare</span>
                <span className="block text-[10px] tracking-[0.18em] uppercase text-gold/70 font-medium mt-0.5">
                  Advanced Dentistry
                </span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Manhattan's premier dental hospital — combining 18 years of clinical excellence
              with cutting-edge technology and genuine compassionate care.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: "instagram", label: "Instagram", href: "#" },
                { icon: "facebook", label: "Facebook", href: "#" },
                { icon: "twitter", label: "Twitter / X", href: "#" },
              ]?.map((social) => (
                <a
                  key={social?.label}
                  href={social?.href}
                  aria-label={social?.label}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-gold/20 hover:text-gold transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    {social?.icon === "instagram" && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    )}
                    {social?.icon === "facebook" && (
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    )}
                    {social?.icon === "twitter" && (
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-5">Services</h4>
            <ul className="space-y-3">
              {[
                "General Dentistry",
                "Cosmetic Dentistry",
                "Dental Implants",
                "Orthodontics",
                "Teeth Whitening",
                "Emergency Care",
              ]?.map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-white/50 hover:text-gold text-sm transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Our Doctors", href: "/doctors" },
                { label: "Services", href: "/services" },
                { label: "Contact", href: "/contact" },
                { label: "Book Appointment", href: "/appointments" },
              ]?.map((link) => (
                <li key={link?.label}>
                  <Link
                    href={link?.href}
                    className="text-white/50 hover:text-gold text-sm transition-colors"
                  >
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold text-sm mb-5">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Icon name="MapPinIcon" size={16} variant="solid" className="text-gold mt-0.5 flex-shrink-0" />
                <p className="text-white/50 text-sm">
                  485 Madison Avenue, Suite 1200<br />New York, NY 10022
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="PhoneIcon" size={16} variant="solid" className="text-gold flex-shrink-0" />
                <a href="tel:+12125550190" className="text-white/50 hover:text-gold text-sm transition-colors">
                  (212) 555-0190
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="EnvelopeIcon" size={16} variant="solid" className="text-gold flex-shrink-0" />
                <a href="mailto:hello@dentalcarenyc.com" className="text-white/50 hover:text-gold text-sm transition-colors">
                  hello@dentalcarenyc.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="ClockIcon" size={16} variant="solid" className="text-gold flex-shrink-0" />
                <p className="text-white/50 text-sm">Mon–Sat: 8AM–8PM</p>
              </div>
            </div>

            {/* Emergency CTA */}
            <div className="mt-6 p-4 bg-gold/10 rounded-2xl border border-gold/20">
              <p className="text-gold text-xs font-semibold uppercase tracking-wider mb-1">
                Dental Emergency?
              </p>
              <a
                href="tel:+12125550911"
                className="text-white font-semibold text-sm hover:text-gold transition-colors flex items-center gap-2"
              >
                <Icon name="PhoneIcon" size={14} variant="solid" className="text-gold" />
                Call (212) 555-0911 — 24/7
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom bar — Pattern 1: Linear Single-Row */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {year} DentalCare Advanced Dentistry. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/30 text-sm cursor-pointer hover:text-white/60 transition-colors">
              Privacy Policy
            </span>
            <span className="text-white/30 text-sm cursor-pointer hover:text-white/60 transition-colors">
              Terms of Service
            </span>
            <span className="text-white/30 text-sm cursor-pointer hover:text-white/60 transition-colors">
              HIPAA Notice
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}