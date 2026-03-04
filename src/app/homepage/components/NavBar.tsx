"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import { useAuth } from "@/context/AuthContext";
import { useClinicSettings } from "@/context/useClinicSettings";

// page: true → navigates to a new page; page: false → smooth-scrolls on homepage
const navLinks = [
  { label: "Services", href: "/services", page: true },
  { label: "About Us", href: "/about", page: true },
  { label: "Our Doctors", href: "/doctors", page: true },
  { label: "Testimonials", href: "#testimonials", page: false },
  { label: "FAQ", href: "#faq", page: false },
  { label: "Contact", href: "/contact", page: true },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { clinic } = useClinicSettings();

  const handleBookAppointment = () => {
    setMobileOpen(false);
    if (user) {
      router.push("/appointments");
    } else {
      router.push("/auth/login?next=/appointments");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Logo / Brand ── */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Avatar */}
              <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${scrolled
                ? "bg-navy shadow-md"
                : "bg-white/15 backdrop-blur-md border border-white/20"
                }`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  className={scrolled ? "text-gold" : "text-white"}>
                  <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 3 2C1.5 2 0 3.5 0 5.5C0 9 3 12 6.5 16C7.5 17.5 9 19.5 12 22C15 19.5 16.5 17.5 17.5 16C21 12 24 9 24 5.5C24 3.5 22.5 2 21 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"
                    fill="currentColor" />
                </svg>
                {/* Gold dot badge */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gold border-2 border-white" />
              </div>

              {/* Name + Phone */}
              <div className="flex flex-col leading-none">
                <span className={`font-display font-bold text-[15px] tracking-tight whitespace-nowrap transition-colors duration-300 ${scrolled ? "text-navy" : "text-white"
                  }`}>
                  {clinic.clinicName}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-medium mt-[3px] whitespace-nowrap transition-colors duration-300 ${scrolled ? "text-gold" : "text-gold-light"
                  }`}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                  </svg>
                  {clinic.phone}
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) =>
                link.page ? (
                  <Link key={link.label} href={link.href}
                    className={`relative text-[13px] font-medium tracking-wide transition-colors duration-200 group ${scrolled ? "text-navy/70 hover:text-navy" : "text-white/80 hover:text-white"
                      }`}>
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gold rounded-full transition-all duration-300 group-hover:w-full" />
                  </Link>
                ) : (
                  <button key={link.label} onClick={() => handleNavClick(link.href)}
                    className={`relative text-[13px] font-medium tracking-wide transition-colors duration-200 group ${scrolled ? "text-navy/70 hover:text-navy" : "text-white/80 hover:text-white"
                      }`}>
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gold rounded-full transition-all duration-300 group-hover:w-full" />
                  </button>
                )
              )}
            </div>

            {/* ── Desktop CTA ── */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Phone */}
              <a href={`tel:${clinic.phone.replace(/\s+/g, "")}`}
                className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${scrolled ? "text-navy/70 hover:text-navy" : "text-white/80 hover:text-white"
                  }`}>
                <Icon name="PhoneIcon" size={14} variant="solid" className={scrolled ? "text-gold" : "text-gold-light"} />
                {clinic.phone}
              </a>

              {/* Divider */}
              <span className={`w-px h-5 ${scrolled ? "bg-navy/15" : "bg-white/20"}`} />

              {user ? (
                <Link
                  href={`/dashboard/${user.role === "super_admin" ? "super-admin" : user.role === "admin" ? "admin" : "user"}`}
                  className={`flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-xl border transition-all ${scrolled
                    ? "border-navy/15 text-navy bg-navy/5 hover:bg-navy/10"
                    : "border-white/25 text-white bg-white/10 hover:bg-white/20"
                    }`}>
                  <Icon name="UserCircleIcon" size={15} variant="solid" className={scrolled ? "text-navy" : "text-white"} />
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth/login"
                  className={`flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-xl border transition-all ${scrolled
                    ? "border-navy/15 text-navy bg-navy/5 hover:bg-navy/10"
                    : "border-white/25 text-white bg-white/10 hover:bg-white/20"
                    }`}>
                  <Icon name="ArrowRightOnRectangleIcon" size={15} className={scrolled ? "text-navy" : "text-white"} />
                  My Account
                </Link>
              )}

              <Link href="/appointments"
                className="flex items-center gap-1.5 btn-gold px-5 py-2 rounded-xl text-[13px] font-bold shadow-gold tracking-wide">
                <Icon name="CalendarDaysIcon" size={14} variant="solid" />
                Book Appointment
              </Link>
            </div>

            {/* ── Mobile Right: Account pill + Hamburger ── */}
            <div className="flex items-center gap-2 lg:hidden">
              {user ? (
                <Link
                  href={`/dashboard/${user.role === "super_admin" ? "super-admin" : user.role === "admin" ? "admin" : "user"}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap border transition-all ${scrolled
                    ? "border-navy/15 bg-navy/5 text-navy"
                    : "border-white/20 bg-white/10 text-white backdrop-blur-md"
                    }`}>
                  {/* Initials avatar */}
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${scrolled ? "bg-navy text-white" : "bg-gold text-navy"
                    }`}>
                    {user.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                  </span>
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth/login"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap border transition-all ${scrolled
                    ? "border-navy/15 bg-navy/5 text-navy"
                    : "border-white/20 bg-white/10 text-white backdrop-blur-md"
                    }`}>
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${scrolled ? "bg-navy" : "bg-white/20"
                    }`}>
                    <Icon name="UserIcon" size={11} className={scrolled ? "text-gold" : "text-white"} />
                  </span>
                  My Account
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${scrolled
                  ? "bg-navy/8 text-navy hover:bg-navy/15"
                  : "bg-white/12 text-white hover:bg-white/20 backdrop-blur-md"
                  }`}
                aria-label="Toggle menu">
                <Icon name={mobileOpen ? "XMarkIcon" : "Bars3Icon"} size={20} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

        {/* Panel */}
        <div className={`mobile-menu absolute top-0 right-0 h-full w-[300px] bg-white flex flex-col shadow-2xl ${mobileOpen ? "open" : ""}`}>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gold">
                  <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 3 2C1.5 2 0 3.5 0 5.5C0 9 3 12 6.5 16C7.5 17.5 9 19.5 12 22C15 19.5 16.5 17.5 17.5 16C21 12 24 9 24 5.5C24 3.5 22.5 2 21 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" fill="currentColor" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-navy leading-none">{clinic.clinicName}</p>
                <p className="text-[10px] text-gold font-medium mt-0.5">{clinic.phone}</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-navy/50 hover:text-navy transition-colors">
              <Icon name="XMarkIcon" size={18} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
            {navLinks.map((link) =>
              link.page ? (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-navy/80 font-medium hover:bg-gray-50 hover:text-navy transition-colors">
                  {link.label}
                </Link>
              ) : (
                <button key={link.label} onClick={() => handleNavClick(link.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-navy/80 font-medium hover:bg-gray-50 hover:text-navy transition-colors text-left">
                  {link.label}
                </button>
              )
            )}
          </nav>

          {/* Drawer Footer */}
          <div className="px-4 py-5 border-t border-gray-100 space-y-2.5">
            <a href={`tel:${clinic.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 text-[12px] text-navy font-medium">
              <Icon name="PhoneIcon" size={14} variant="solid" className="text-gold" />
              {clinic.phone}
            </a>

            {user ? (
              <Link
                href={`/dashboard/${user.role === "super_admin" ? "super-admin" : user.role === "admin" ? "admin" : "user"}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full border border-navy/15 bg-navy/5 text-navy py-2.5 rounded-xl text-[13px] font-semibold hover:bg-navy/10 transition-colors">
                <Icon name="UserCircleIcon" size={15} variant="solid" className="text-navy" />
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full border border-navy/15 bg-navy/5 text-navy py-2.5 rounded-xl text-[13px] font-semibold hover:bg-navy/10 transition-colors">
                <Icon name="ArrowRightOnRectangleIcon" size={15} className="text-navy" />
                My Account
              </Link>
            )}

            <Link href="/appointments" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full btn-gold py-2.5 rounded-xl text-[13px] font-bold shadow-gold text-center">
              <Icon name="CalendarDaysIcon" size={14} variant="solid" />
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}