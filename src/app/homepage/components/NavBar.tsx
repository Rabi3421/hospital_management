"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import { useAuth } from "@/context/AuthContext";

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
            ? "bg-white/95 backdrop-blur-md shadow-card border-b border-cream-dark"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${scrolled ? "bg-navy" : "bg-white/15 backdrop-blur-sm"
                  }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={scrolled ? "text-gold" : "text-white"}
                >
                  <path
                    d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 3 2C1.5 2 0 3.5 0 5.5C0 9 3 12 6.5 16C7.5 17.5 9 19.5 12 22C15 19.5 16.5 17.5 17.5 16C21 12 24 9 24 5.5C24 3.5 22.5 2 21 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <span
                  className={`font-display font-semibold text-lg leading-none tracking-tight ${scrolled ? "text-navy" : "text-white"
                    }`}
                >
                  DentalCare
                </span>
                <span
                  className={`block text-[10px] tracking-[0.18em] uppercase font-sans font-medium ${scrolled ? "text-gold" : "text-gold-light"
                    }`}
                >
                  Advanced Dentistry
                </span>
              </div>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) =>
                link.page ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`nav-link text-sm font-medium transition-colors duration-200 ${scrolled
                        ? "text-navy-600 hover:text-navy"
                        : "text-white/85 hover:text-white"
                      }`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className={`nav-link text-sm font-medium transition-colors duration-200 ${scrolled
                        ? "text-navy-600 hover:text-navy"
                        : "text-white/85 hover:text-white"
                      }`}
                  >
                    {link.label}
                  </button>
                )
              )}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+12125550190"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${scrolled ? "text-navy" : "text-white/90 hover:text-white"
                  }`}
              >
                <Icon name="PhoneIcon" size={16} variant="solid" className={scrolled ? "text-gold" : "text-gold-light"} />
                +91 7008355987
              </a>
              {user ? (
                <Link
                  href={`/dashboard/${user.role === "super_admin" ? "super-admin" : user.role === "admin" ? "admin" : "user"}`}
                  className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-full border transition-all ${
                    scrolled
                      ? "border-navy/20 text-navy hover:bg-navy/5"
                      : "border-white/30 text-white hover:bg-white/10"
                  }`}
                >
                  <Icon name="UserCircleIcon" size={16} variant="solid" className={scrolled ? "text-navy" : "text-white"} />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-full border transition-all ${
                    scrolled
                      ? "border-navy/20 text-navy hover:bg-navy/5"
                      : "border-white/30 text-white hover:bg-white/10"
                  }`}
                >
                  <Icon name="ArrowRightOnRectangleIcon" size={16} className={scrolled ? "text-navy" : "text-white"} />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-navy hover:bg-cream" : "text-white hover:bg-white/10"
                }`}
              aria-label="Toggle menu"
            >
              <Icon name={mobileOpen ? "XMarkIcon" : "Bars3Icon"} size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-400 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`mobile-menu absolute top-0 right-0 h-full w-72 bg-white shadow-xl-navy flex flex-col ${mobileOpen ? "open" : ""
            }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-cream-dark">
            <span className="font-display font-semibold text-navy text-lg">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-cream text-navy"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          </div>
          <nav className="flex-1 p-6 space-y-1">
            {navLinks.map((link) =>
              link.page ? (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-navy font-medium hover:bg-cream transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-navy font-medium hover:bg-cream transition-colors"
                >
                  {link.label}
                </button>
              )
            )}
          </nav>
          <div className="p-6 border-t border-cream-dark space-y-3">
            <a
              href="tel:+12125550190"
              className="flex items-center gap-2 text-sm text-navy font-medium"
            >
              <Icon name="PhoneIcon" size={16} variant="solid" className="text-gold" />
              +91 7008355987
            </a>
            {user ? (
              <Link
                href={`/dashboard/${user.role === "super_admin" ? "super-admin" : user.role === "admin" ? "admin" : "user"}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full border border-navy/20 text-navy py-3 rounded-full text-sm font-semibold hover:bg-navy/5 transition-colors text-center"
              >
                <Icon name="UserCircleIcon" size={16} variant="solid" className="text-navy" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full border border-navy/20 text-navy py-3 rounded-full text-sm font-semibold hover:bg-navy/5 transition-colors text-center"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={16} className="text-navy" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}