'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Star,
  CreditCard,
  LifeBuoy,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuthModal } from '@/components/AuthModalProvider';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuthModal();

  const navItems = [
    { name: 'Overview', href: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'My Meals & Dishes', href: '/partner/products', icon: UtensilsCrossed },
    { name: 'Kitchen Profile', href: '/partner/profile', icon: ChefHat },
    { name: 'Customer Reviews', href: '/partner/reviews', icon: Star },
    { name: 'Subscription & Billing', href: '/partner/subscription', icon: CreditCard },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAF7F2] flex flex-col md:flex-row items-start relative">
      {/* Desktop Sidebar - Sticky & Contained (Stops before Footer) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-neutral-200/80 p-6 flex-col justify-between shrink-0 sticky top-20 h-[calc(100vh-5rem)] self-start overflow-y-auto no-scrollbar z-20">
        <div>
          <div className="pb-6 mb-6 border-b border-neutral-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4753F]">
              Partner Portal
            </span>
            <h2 className="text-lg font-black text-[#1F2823] truncate mt-0.5">
              {currentUser?.fullName || 'My Kitchen'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              {currentUser?.humanId}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#24422E] text-white shadow-xs'
                      : 'text-[#5E6961] hover:text-[#1F2823] hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-100 space-y-2">
          {currentUser?.partnerProfileId && (
            <Link
              href={`/partner/${currentUser.partnerProfileId}`}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden w-full bg-white border-b border-neutral-200/80 p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#24422E] text-white'
                  : 'text-neutral-600 bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area - naturally flexed next to sidebar, never overlapping */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 w-full">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
