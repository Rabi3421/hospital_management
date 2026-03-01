"use client";

import Link from "next/link";
import Icon from "@/components/ui/AppIcon";

const services = [
    "General Dentistry",
    "Cosmetic Dentistry",
    "Dental Implants",
    "Orthodontics",
    "Teeth Whitening",
    "Emergency Care",
];

const quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Our Doctors", href: "/doctors" },
    { label: "Appointments", href: "/appointments" },
    { label: "Contact", href: "/contact" },
    { label: "Services", href: "/services" },
];

const socials = [
    {
        icon: "instagram",
        label: "Instagram",
        href: "#",
        path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    },
    {
        icon: "facebook",
        label: "Facebook",
        href: "#",
        path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
        icon: "twitter",
        label: "Twitter / X",
        href: "#",
        path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
];

export default function PageFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-navy border-t border-white/10">
            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-4">
                        <Link href="/homepage" className="flex items-center gap-3 mb-5 w-fit">
                            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 3 2C1.5 2 0 3.5 0 5.5C0 9 3 12 6.5 16C7.5 17.5 9 19.5 12 22C15 19.5 16.5 17.5 17.5 16C21 12 24 9 24 5.5C24 3.5 22.5 2 21 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"
                                        fill="#C9A96E"
                                    />
                                </svg>
                            </div>
                            <div>
                                <span className="font-display font-semibold text-white text-lg leading-none">
                                    DentalCare
                                </span>
                                <span className="block text-[10px] tracking-[0.18em] uppercase text-gold/70 font-medium mt-0.5">
                                    Advanced Dentistry
                                </span>
                            </div>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
                            Manhattan's premier dental hospital — combining 18 years of
                            clinical excellence with cutting-edge technology and genuine
                            compassionate care.
                        </p>
                        <div className="flex items-center gap-3">
                            {socials.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-gold/20 hover:text-gold transition-all"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-semibold text-sm mb-5">Services</h4>
                        <ul className="space-y-3">
                            {services.map((s) => (
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
                        <h4 className="text-white font-semibold text-sm mb-5">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-gold text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-4">
                        <h4 className="text-white font-semibold text-sm mb-5">
                            Contact Us
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon
                                        name="MapPinIcon"
                                        size={14}
                                        className="text-gold"
                                        variant="solid"
                                    />
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    425 Madison Avenue, Suite 1200
                                    <br />
                                    New York, NY 10017
                                </p>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Icon
                                        name="PhoneIcon"
                                        size={14}
                                        className="text-gold"
                                        variant="solid"
                                    />
                                </div>
                                <a
                                    href="tel:+12125550190"
                                    className="text-white/50 hover:text-gold text-sm transition-colors"
                                >
                                    +91 7008355987
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Icon
                                        name="EnvelopeIcon"
                                        size={14}
                                        className="text-gold"
                                        variant="solid"
                                    />
                                </div>
                                <a
                                    href="mailto:hello@dentalcare.com"
                                    className="text-white/50 hover:text-gold text-sm transition-colors"
                                >
                                    hello@dentalcare.com
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon
                                        name="ClockIcon"
                                        size={14}
                                        className="text-gold"
                                        variant="solid"
                                    />
                                </div>
                                <div>
                                    <p className="text-white/50 text-sm">
                                        Mon–Fri: 8:00 AM – 7:00 PM
                                    </p>
                                    <p className="text-white/50 text-sm">Sat–Sun: 9:00 AM – 4:00 PM</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-white/35 text-xs">
                        © {year} DentalCare Advanced Dentistry. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        {["Privacy Policy", "Terms of Service", "HIPAA Notice"].map(
                            (item) => (
                                <Link
                                    key={item}
                                    href="#"
                                    className="text-white/35 hover:text-gold text-xs transition-colors"
                                >
                                    {item}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
