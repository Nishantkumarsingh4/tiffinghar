import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Heart, Sparkles, ChefHat } from 'lucide-react';
import {
  getAllSiteSettings,
  getFaqs,
  getTestimonials,
  getPlatformStats,
} from '@/repositories/settingsRepository';
import { getFeaturedPartners } from '@/repositories/partnerRepository';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FaqSection from '@/components/FaqSection';
import PricingPreview from '@/components/PricingPreview';
import PartnerCard from '@/components/PartnerCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, faqs, testimonials, stats, featuredPartners] = await Promise.all([
    getAllSiteSettings(),
    getFaqs(),
    getTestimonials(),
    getPlatformStats(),
    getFeaturedPartners(6),
  ]);

  return (
    <div className="flex flex-col">
      {/* 1. 3D / Biomorphic Hero Section */}
      <HeroSection siteInfo={settings.siteInfo} />

      {/* 2. Platform Stats Bar */}
      <section className="bg-white border-y border-neutral-200/70 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#24422E]">
                {stats.verifiedPartners}+
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#5E6961]">
                Verified Kitchen Partners
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#E4753F]">
                {stats.happyCustomers}+
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#5E6961]">
                Happy Daily Subscribers
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#24422E]">
                {stats.activeMeals}+
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#5E6961]">
                Fresh Homemade Dishes
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-amber-500">
                {stats.avgRating} ★
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#5E6961]">
                Average Customer Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured / Recommended Partners Grid */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-[#E4753F] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Handpicked Kitchens</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1F2823] tracking-tight">
                Recommended Tiffin Partners
              </h2>
              <p className="text-[#5E6961] mt-2 text-base">
                Discover top-rated home chefs serving authentic, healthy meals in your area.
              </p>
            </div>

            <Link
              href="/partners"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#24422E] hover:text-[#E4753F] transition-colors"
            >
              <span>Explore all kitchens</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <HowItWorks />

      {/* 5. Core Features Section */}
      <FeaturesSection features={settings.features} />

      {/* 6. Partner Pricing Preview */}
      <PricingPreview pricing={settings.pricing} />

      {/* 7. Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 8. FAQs */}
      <FaqSection faqs={faqs} />

      {/* 9. Bottom CTA Section */}
      <section className="py-16 bg-[#24422E] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="font-handwriting text-3xl text-amber-300">
            Khaane ka maza, ghar jaisa!
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Ready for wholesome meals delivered to your doorstep?
          </h2>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
            Browse verified kitchens, taste a trial meal today, or turn your passion for home cooking into a thriving business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/partners"
              className="px-8 py-4 rounded-full bg-[#E4753F] hover:bg-[#D3632D] text-white font-bold text-sm shadow-xl shadow-[#E4753F]/30 transition-all"
            >
              Find Your Tiffin Partner
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
