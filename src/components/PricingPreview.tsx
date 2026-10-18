'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, ChefHat, ArrowRight } from 'lucide-react';
import { useAuthModal } from './AuthModalProvider';

interface PricingPreviewProps {
  pricing: {
    premiumPrice: number;
    freeImageLimit: number;
    subscriptionDurationDays: number;
    features: string[];
  };
}

export default function PricingPreview({ pricing }: PricingPreviewProps) {
  const { openLoginModal, currentUser } = useAuthModal();

  return (
    <section className="py-20 relative overflow-hidden bg-white/70 border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            Partner Growth Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1F2823] tracking-tight mt-2">
            Supercharge Your Kitchen Orders
          </h2>
          <p className="text-[#5E6961] mt-3 text-base">
            Transparent, hyper-affordable pricing designed to help home chefs and tiffin services reach hundreds of hungry customers every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Card 1: Free Tier */}
          <div className="rounded-3xl bg-[#FAF7F2] p-8 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-xs font-bold mb-4">
                Starter Kitchen
              </div>
              <h3 className="text-2xl font-bold text-[#1F2823]">
                Free Lifetime Plan
              </h3>
              <p className="text-sm text-[#5E6961] mt-1 mb-6">
                Perfect for home cooks just getting started.
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-[#1F2823]">₹0</span>
                <span className="text-sm text-neutral-500">/forever</span>
              </div>

              <ul className="space-y-3.5 text-sm text-[#1F2823] mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to {pricing.freeImageLimit} food photos</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard directory listing</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Customer Call & WhatsApp clicks</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Customer reviews & ratings</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => openLoginModal('PARTNER')}
              className="w-full py-3.5 rounded-2xl bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-bold text-sm transition-colors text-center"
            >
              Get Started Free
            </button>
          </div>

          {/* Card 2: Premium Plan */}
          <div className="relative rounded-3xl bg-[#24422E] text-white p-8 border-2 border-[#E4753F] shadow-2xl flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3.5 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4753F] text-white text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Choice</span>
            </div>

            <div>
              <div className="inline-flex px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-4">
                Pro Tiffin Partner
              </div>
              <h3 className="text-2xl font-bold text-white">
                Premium Plan
              </h3>
              <p className="text-sm text-white/70 mt-1 mb-6">
                Maximum visibility, unlimited uploads & verified trust.
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-white">
                  ₹{pricing.premiumPrice}
                </span>
                <span className="text-sm text-white/70">
                  / {pricing.subscriptionDurationDays} days
                </span>
              </div>

              <ul className="space-y-3.5 text-sm text-white/90 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#E4753F] shrink-0" />
                  <span className="font-semibold text-white">Unlimited dish & kitchen gallery photos</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#E4753F] shrink-0" />
                  <span className="font-semibold text-white">Exclusive "Recommended" badge on card</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#E4753F] shrink-0" />
                  <span>Top priority placement in searches</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#E4753F] shrink-0" />
                  <span>Analytics dashboard (views & contact leads)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#E4753F] shrink-0" />
                  <span>Instant automated activation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (currentUser?.role === 'PARTNER') {
                  window.location.href = '/partner/subscription';
                } else {
                  openLoginModal('PARTNER');
                }
              }}
              className="w-full py-4 rounded-2xl bg-[#E4753F] hover:bg-[#D3632D] text-white font-bold text-sm shadow-lg shadow-[#E4753F]/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Upgrade to Premium</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
