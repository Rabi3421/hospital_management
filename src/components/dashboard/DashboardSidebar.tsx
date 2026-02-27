"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface DashboardSidebarProps {
    navItems: NavItem[];
    title: string;
    subtitle: string;
}

export default function DashboardSidebar({ navItems, title, subtitle }: DashboardSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <div className="font-fraunces font-bold text-white text-base leading-tight truncate">{title}</div>
                        <div className="text-white/40 text-xs truncate">{subtitle}</div>
                    </div>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? "bg-gold text-navy font-semibold"
                                    : "text-white/60 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            <span className={`flex-shrink-0 w-5 h-5 ${isActive ? "text-navy" : "text-white/50 group-hover:text-white"}`}>
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <span className="text-sm truncate">{item.label}</span>
                            )}
                            {!collapsed && isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-navy/40" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="p-3 border-t border-white/10 space-y-2">
                {!collapsed && user && (
                    <div className="px-3 py-2">
                        <p className="text-white text-sm font-medium truncate">{user.name}</p>
                        <p className="text-white/40 text-xs truncate">{user.email}</p>
                    </div>
                )}
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 ${collapsed ? "justify-center" : ""
                        }`}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    {!collapsed && <span className="text-sm">Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile toggle button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-20 lg:hidden w-10 h-10 bg-navy rounded-lg flex items-center justify-center shadow-lg"
                aria-label="Open menu"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-navy z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 text-white/50 hover:text-white"
                    aria-label="Close menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <SidebarContent />
            </aside>

            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col bg-navy h-screen sticky top-0 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-20" : "w-64"
                    }`}
            >
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-gold rounded-full flex items-center justify-center shadow-md z-10 hover:bg-gold/80 transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <svg
                        className={`w-3 h-3 text-navy transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <SidebarContent />
            </aside>
        </>
    );
}
