import React from 'react';
import { getAllSiteSettings, getFaqs } from '@/repositories/settingsRepository';
import PricingPreview from '@/components/PricingPreview';
import FaqSection from '@/components/FaqSection';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const [settings, faqs] = await Promise.all([
    getAllSiteSettings(),
    getFaqs('Partner Plans'),
  ]);

  return (
    <div className="py-12 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            Transparent Partner Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1F2823] tracking-tight">
            Grow Your Home Tiffin Business
          </h1>
          <p className="text-base sm:text-lg text-[#5E6961]">
            No hefty percentage cuts. Keep 100% of your earnings with our simple, ultra-affordable subscription.
          </p>
        </div>

        {/* Pricing Component */}
        <PricingPreview pricing={settings.pricing} />

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mt-16 bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs">
          <h2 className="text-2xl font-bold text-[#1F2823] text-center mb-8">
            Compare Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-4 px-4 font-bold text-neutral-800">Feature</th>
                  <th className="py-4 px-4 font-bold text-center text-neutral-800">Free Tier</th>
                  <th className="py-4 px-4 font-bold text-center text-[#24422E]">Premium Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">Price</td>
                  <td className="py-3.5 px-4 text-center font-bold text-neutral-600">₹0</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#E4753F]">
                    ₹{settings.pricing.premiumPrice} / {settings.pricing.subscriptionDurationDays} days
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">Food Gallery Photos</td>
                  <td className="py-3.5 px-4 text-center text-neutral-600">Max {settings.pricing.freeImageLimit} photos</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">Recommended Badge</td>
                  <td className="py-3.5 px-4 text-center text-neutral-400">—</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">Listing Placement</td>
                  <td className="py-3.5 px-4 text-center text-neutral-600">Standard</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">Top Priority</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">Direct WhatsApp & Call Leads</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">✓ Included</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">Profile Analytics & Views</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">✓ Included</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">✓ Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner FAQs */}
        <div className="mt-16">
          <FaqSection faqs={faqs} />
        </div>
      </div>
    </div>
  );
}
