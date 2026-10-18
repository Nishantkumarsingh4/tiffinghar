'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Layers,
  CreditCard,
  MessageSquareCheck,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuthModal } from '@/components/AuthModalProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuthModal();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Tiffin Partners', href: '/admin/partners', icon: UtensilsCrossed },
    { name: 'Website & Ranking', href: '/admin/website', icon: Layers },
    { name: 'Payments & Plans', href: '/admin/payments', icon: CreditCard },
    { name: 'Support Inbox', href: '/admin/support', icon: MessageSquareCheck },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  // If user is on the admin login page, don't show the dashboard sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200/80 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="pb-6 mb-6 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E4753F]">
                Super Admin
              </span>
            </div>
            <h2 className="text-xl font-black text-[#1F2823] tracking-tight mt-1">
              Admin Portal
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 truncate font-mono">
              {currentUser?.email || 'nisant746181@mail.com'}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#24422E] text-white shadow-sm'
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
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <span>Live Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
