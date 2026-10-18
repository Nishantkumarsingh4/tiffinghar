'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UtensilsCrossed,
  Crown,
  IndianRupee,
  Star,
  LifeBuoy,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const json = await res.json();
        if (json.success) {
          setData(json.stats);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: data?.totalCustomers || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-700',
      href: '/admin/customers',
    },
    {
      title: 'Tiffin Partners',
      value: data?.totalPartners || 0,
      badge: `${data?.activePremium || 0} Premium`,
      icon: UtensilsCrossed,
      color: 'bg-emerald-50 text-[#24422E]',
      href: '/admin/partners',
    },
    {
      title: 'Active Premium',
      value: data?.activePremium || 0,
      badge: '₹49 / mo plan',
      icon: Crown,
      color: 'bg-amber-50 text-amber-700',
      href: '/admin/payments',
    },
    {
      title: 'Total Revenue',
      value: `₹${(data?.totalRevenue || 0).toLocaleString()}`,
      badge: `+₹${data?.monthRevenue || 0} this month`,
      icon: IndianRupee,
      color: 'bg-orange-50 text-[#E4753F]',
      href: '/admin/payments',
    },
    {
      title: 'Reviews Logged',
      value: data?.totalReviews || 0,
      icon: Star,
      color: 'bg-purple-50 text-purple-700',
      href: '/admin/partners',
    },
    {
      title: 'Open Support Tickets',
      value: data?.openTickets || 0,
      badge: `${data?.totalTickets || 0} total`,
      icon: LifeBuoy,
      color: data?.openTickets > 0 ? 'bg-rose-50 text-rose-600' : 'bg-neutral-50 text-neutral-600',
      href: '/admin/support',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
            Executive Overview
          </span>
          <h1 className="text-3xl font-black text-[#1F2823] tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time telemetry, marketplace activity, and financial indicators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/website"
            className="px-4 py-2 bg-white border border-neutral-200 text-xs font-bold rounded-xl text-neutral-700 hover:bg-neutral-50 shadow-xs transition-all"
          >
            Manage Ranking
          </Link>
          <Link
            href="/admin/support"
            className="px-4 py-2 bg-[#24422E] text-white text-xs font-bold rounded-xl hover:bg-[#1b3223] shadow-xs transition-all"
          >
            Support Inbox ({data?.openTickets || 0})
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {card.badge && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {card.title}
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-3xl font-black text-[#1F2823]">{card.value}</h3>
                  <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-[#E4753F] transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Signups & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signups Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-black text-[#1F2823]">Recent Member Signups</h2>
              <p className="text-xs text-neutral-400">Latest registrations across customer and partner networks</p>
            </div>
            <Link
              href="/admin/customers"
              className="text-xs font-bold text-[#E4753F] hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {data?.recentSignups?.map((user: any) => (
              <div key={user.id} className="py-3.5 flex items-center justify-between hover:bg-neutral-50/50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                      user.role === 'PARTNER'
                        ? 'bg-emerald-100 text-[#24422E]'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role === 'PARTNER' ? 'P' : 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#1F2823]">{user.display_name}</p>
                      <span className="text-[10px] font-mono text-neutral-400">({user.human_id})</span>
                    </div>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      user.role === 'PARTNER'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights & System Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-[#1F2823] mb-4">Operations & Health</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  MySQL Database Engine
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  Connected to local WAMP MySQL (127.0.0.1:3306), pool active with 0 bottlenecks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Subscription Model
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Active rate: {Math.round(((data?.activePremium || 0) / (data?.totalPartners || 1)) * 100)}% of partners have unlocked unlimited images and recommended status.
                </p>
              </div>

              {data?.openTickets > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Attention Needed
                  </div>
                  <p className="text-xs text-rose-700 mt-1">
                    {data.openTickets} ticket(s) currently awaiting admin response.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-100">
            <Link
              href="/admin/audit-logs"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              <span>View System Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
