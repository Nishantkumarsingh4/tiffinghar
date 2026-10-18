'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Check, CreditCard, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function PartnerSubscriptionPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/partner/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch {
        error('Failed to load subscription info');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [error]);

  const isPremium = stats?.isPremium;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
          Subscription & Growth Plan
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6961] mt-0.5">
          Manage your kitchen plan, unlock unlimited gallery photos, and get top placement across all searches.
        </p>
      </div>

      {/* Current Plan Status Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Current Plan
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[#1F2823]">
              {isPremium ? 'Pro Partner (Premium)' : 'Starter Kitchen (Free)'}
            </h2>
            {isPremium && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            {isPremium
              ? `Your subscription is active with ${stats.daysLeft} days remaining. Benefits are running automatically.`
              : `You are limited to ${stats?.freeImageLimit || 3} food photos. Upgrade anytime to unlock all features.`}
          </p>
        </div>

        {isPremium ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-900 text-xs font-bold">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{stats.daysLeft} days left</span>
          </div>
        ) : (
          <button
            onClick={() => {
              window.location.href = '#upgrade-plans';
            }}
            className="px-6 py-3 rounded-full bg-[#E4753F] hover:bg-[#D3632D] text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
          >
            Upgrade for ₹49
          </button>
        )}
      </div>

      {/* Upgrade Option Card */}
      <div id="upgrade-plans" className="rounded-3xl bg-[#24422E] text-white p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maximum Orders & Visibility</span>
          </div>

          <h2 className="text-3xl font-black">Partner Premium Plan</h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Gain unfair advantage in your area. Unlimited dish galleries, verified "Recommended" badge, and priority placement at the top of diner searches.
          </p>

          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-400">₹49</span>
            <span className="text-sm text-white/70">/ 30 days subscription</span>
          </div>

          <ul className="space-y-3 pt-3 text-sm text-white/90">
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#E4753F]" />
              <span>Unlimited food photos & thali gallery pictures</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#E4753F]" />
              <span>"Recommended" badge highlighting your kitchen card</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#E4753F]" />
              <span>Top search placement in Koramangala, HSR, Indiranagar, etc.</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#E4753F]" />
              <span>Direct customer WhatsApp and Call lead tracking</span>
            </li>
          </ul>

          <div className="pt-6">
            <Link
              href="/partner/subscription/checkout"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E4753F] hover:bg-[#D3632D] text-white text-sm font-bold shadow-lg shadow-[#E4753F]/30 transition-all"
            >
              <span>{isPremium ? 'Extend Subscription (+30 Days)' : 'Activate Premium Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
