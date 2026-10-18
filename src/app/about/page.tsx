import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Users, Sparkles, ChefHat, CheckCircle2 } from 'lucide-react';
import { appConfig } from '@/lib/config';

export default function AboutPage() {
  const brandName = appConfig.brandName;

  return (
    <div className="py-16 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            Our Mission & Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1F2823] tracking-tight">
            Bringing Homestyle Comfort to Every Neighborhood
          </h1>
          <p className="text-lg text-[#5E6961] leading-relaxed">
            {brandName} was born out of a simple, universal longing: the taste of clean, warm, home-cooked food when you are away from home.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
              alt="Home Chef Cooking"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
              <span className="font-handwriting text-3xl text-amber-300 font-bold">
                Cooked with motherly care & pure spices
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F2823]">
              Empowering Home Chefs, Nourishing Daily Routines
            </h2>
            <p className="text-[#5E6961] leading-relaxed">
              In every community, there are passionate homemakers, family cooks, and regional culinary masters who prepare extraordinary food. At the same time, millions of young professionals and students struggle with greasy restaurant takeouts and irregular meals.
            </p>
            <p className="text-[#5E6961] leading-relaxed">
              {brandName} bridges this gap. We empower talented home chefs to run independent, profitable tiffin enterprises directly from their kitchens while giving customers reliable access to healthy, affordable everyday meals.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                <span className="text-2xl font-black text-[#24422E]">100%</span>
                <p className="text-xs font-semibold text-[#5E6961] mt-1">
                  Fresh Daily Cooking (No Re-heating)
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                <span className="text-2xl font-black text-[#E4753F]">Zero</span>
                <p className="text-xs font-semibold text-[#5E6961] mt-1">
                  Chemical Colors or Soda Used
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="rounded-3xl bg-white p-8 border border-neutral-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#24422E] flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2823] mb-2">Hygiene First</h3>
            <p className="text-sm text-[#5E6961] leading-relaxed">
              Every kitchen on our platform undergoes verification, FSSAI compliance checks, and regular customer feedback audits.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-neutral-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#E4753F] flex items-center justify-center mb-6">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2823] mb-2">Chef Empowerment</h3>
            <p className="text-sm text-[#5E6961] leading-relaxed">
              We charge zero predatory commissions. Chefs keep 100% of their meal earnings and build direct, lasting relationships with customers.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-neutral-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2823] mb-2">Direct Connection</h3>
            <p className="text-sm text-[#5E6961] leading-relaxed">
              Connect directly via WhatsApp or Call with your tiffin provider to customize rotis, spice preferences, or delivery schedules.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-[#24422E] text-white p-10 md:p-14 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">
            Want to join the {brandName} movement?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-base">
            Whether you are looking for healthy daily meals or want to showcase your culinary heritage to your neighborhood, you are warmly welcome.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/partners"
              className="px-8 py-3.5 rounded-full bg-[#E4753F] hover:bg-[#D3632D] text-white font-bold text-sm shadow-lg transition-all"
            >
              Explore Tiffins
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
