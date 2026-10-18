'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Eye,
  Users,
  Star,
  PhoneCall,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';

export default function PartnerDashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/partner/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching partner stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const isFree = !stats?.isPremium;
  const imagesLimit = stats?.freeImageLimit || 3;
  const imagesUsed = stats?.imagesUsed || 0;

  return (
    <div className="space-y-8">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F2823] tracking-tight">
            Kitchen Dashboard Overview
          </h1>
          <p className="text-sm text-[#5E6961] mt-1">
            Real-time analytics, subscriber engagement, and menu performance.
          </p>
        </div>

        <Link
          href="/partner/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold shadow-md shadow-[#24422E]/15 transition-all"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Add New Dish</span>
        </Link>
      </div>

      {/* Subscription Alert Pill */}
      {isFree ? (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#E4753F]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                You are on the Free Starter Plan
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                Limited to {imagesLimit} photos. Upgrade to Premium for ₹49 to unlock unlimited gallery images and top search placement.
              </p>
            </div>
          </div>
          <Link
            href="/partner/subscription"
            className="px-5 py-2.5 rounded-full bg-[#E4753F] hover:bg-[#D3632D] text-white text-xs font-bold shrink-0 text-center shadow-md shadow-[#E4753F]/20"
          >
            Upgrade to Premium
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl bg-emerald-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Active Premium Partner</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-[10px] font-bold text-emerald-200">
                  Recommended Badge Active
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Enjoying unlimited dish gallery uploads & priority search rankings. {stats.daysLeft} days remaining.
              </p>
            </div>
          </div>
          <Link
            href="/partner/subscription"
            className="px-5 py-2 rounded-full bg-white text-[#24422E] text-xs font-bold shrink-0 text-center hover:bg-neutral-100 transition-colors"
          >
            Manage Subscription
          </Link>
        </div>
      )}

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="rounded-3xl bg-white p-5 border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Profile Views
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#1F2823]">
            {stats?.totalViews || 0}
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            {stats?.uniqueCustomers || 0} unique diners
          </p>
        </div>

        {/* Contact Leads */}
        <div className="rounded-3xl bg-white p-5 border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Lead Clicks
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#1F2823]">
            {stats?.totalClicks || 0}
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            {stats?.callClicks || 0} Calls • {stats?.whatsappClicks || 0} WhatsApp
          </p>
        </div>

        {/* Rating & Reviews */}
        <div className="rounded-3xl bg-white p-5 border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Average Rating
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#1F2823]">
            {stats?.avgRating || 5.0} ★
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            {stats?.totalReviews || 0} customer reviews
          </p>
        </div>

        {/* Images Used */}
        <div className="rounded-3xl bg-white p-5 border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Image Storage
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#1F2823]">{imagesUsed}</span>
            <span className="text-sm text-neutral-400">
              / {stats?.isPremium ? '∞' : imagesLimit} photos
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                stats?.isPremium ? 'bg-emerald-500' : imagesUsed >= imagesLimit ? 'bg-rose-500' : 'bg-[#24422E]'
              }`}
              style={{
                width: stats?.isPremium ? '100%' : `${Math.min(100, (imagesUsed / imagesLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Views Visual Card */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#24422E]" />
              <h2 className="text-base font-bold text-[#1F2823]">
                Daily Diner Profile Views (Last 7 Days)
              </h2>
            </div>
            <span className="text-xs font-semibold text-neutral-400">
              Updated hourly
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-neutral-100">
            {stats?.viewHistory?.length > 0 ? (
              stats.viewHistory.map((item: any, idx: number) => {
                const max = Math.max(...stats.viewHistory.map((v: any) => v.count), 5);
                const heightPercent = Math.max(15, (item.count / max) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div
                      className="w-full bg-[#24422E]/80 group-hover:bg-[#E4753F] rounded-t-xl transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-neutral-400 truncate w-full text-center">
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                View activity will appear here as diners browse your kitchen.
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-500">
            Tip: Keep your daily delivery areas and timings updated to increase conversion from views to orders!
          </p>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-3xl bg-white p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1F2823] mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/partner/products"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-neutral-100 transition-colors text-xs font-bold text-[#1F2823]"
              >
                <span>Manage Meal Menu</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-400" />
              </Link>
              <Link
                href="/partner/profile"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-neutral-100 transition-colors text-xs font-bold text-[#1F2823]"
              >
                <span>Edit Kitchen Address & Timing</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-400" />
              </Link>
              <Link
                href="/partner/reviews"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-neutral-100 transition-colors text-xs font-bold text-[#1F2823]"
              >
                <span>Respond to Reviews</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-400" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100 text-center">
            <span className="text-xs text-neutral-400">
              Need assistance? Call helpline at +91 98765 43210
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
