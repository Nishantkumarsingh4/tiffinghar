'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, Menu, X, User, LogOut, LayoutDashboard, Shield, ChefHat } from 'lucide-react';
import { useAuthModal } from './AuthModalProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { openLoginModal, currentUser, logout } = useAuthModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'TiffinGhar';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Tiffin', href: '/partners' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const getDashboardLink = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'ADMIN') return '/admin/dashboard';
    if (currentUser.role === 'PARTNER') return '/partner/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF7F2]/85 border-b border-black/[0.04] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#24422E] flex items-center justify-center text-white shadow-md shadow-[#24422E]/20 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5 text-[#E4753F]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#24422E] tracking-tight">
              {brandName}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E4753F] -mt-1">
              Ghar Jaisa Khana
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 px-4 py-1.5 rounded-full border border-black/[0.05] shadow-xs">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#24422E] text-white shadow-xs'
                    : 'text-[#5E6961] hover:text-[#1F2823] hover:bg-black/[0.03]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm font-semibold text-[#1F2823] hover:border-[#24422E] transition-all shadow-xs"
              >
                {currentUser.role === 'ADMIN' && <Shield className="w-4 h-4 text-rose-600" />}
                {currentUser.role === 'PARTNER' && <ChefHat className="w-4 h-4 text-[#E4753F]" />}
                {currentUser.role === 'CUSTOMER' && <User className="w-4 h-4 text-[#24422E]" />}
                <span>Dashboard</span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="p-2.5 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="px-6 py-2.5 rounded-full bg-[#24422E] hover:bg-[#1E3626] text-white text-sm font-bold shadow-md shadow-[#24422E]/20 hover:shadow-lg transition-all"
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-200/50 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-[#FAF7F2] px-6 py-6 space-y-4 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-2xl text-base font-semibold ${
                  pathname === link.href
                    ? 'bg-[#24422E] text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-neutral-200">
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-2xl bg-white border border-neutral-200 text-center text-sm font-bold text-[#1F2823]"
                >
                  Go to {currentUser.role} Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-3 rounded-2xl bg-rose-50 text-rose-700 text-center text-sm font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#24422E] text-white font-bold text-center text-sm shadow-md"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
