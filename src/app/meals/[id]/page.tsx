'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Share2,
} from 'lucide-react';
import { useAuthModal } from '@/components/AuthModalProvider';
import { useToast } from '@/components/ToastProvider';

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { openLoginModal } = useAuthModal();
  const { success, error } = useToast();

  const [meal, setMeal] = useState<any>(null);
  const [moreMeals, setMoreMeals] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeal() {
      setLoading(true);
      try {
        const res = await fetch(`/api/meals/${id}`);
        if (res.status === 401) {
          openLoginModal('CUSTOMER');
          return;
        }
        const data = await res.json();
        if (data.success && data.meal) {
          setMeal(data.meal);
          setMoreMeals(data.moreMeals || []);
          const cover = data.meal.images?.[0]?.image_url || data.meal.cover_image || '';
          setActiveImage(cover);
        } else {
          error(data.error || 'Meal not found');
        }
      } catch (err) {
        error('Failed to load meal details');
      } finally {
        setLoading(false);
      }
    }

    fetchMeal();
  }, [id]);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  const handleContactClick = (type: 'WHATSAPP' | 'CALL') => {
    if (typeof window !== 'undefined' && meal?.partner_id) {
      fetch('/api/contact/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: meal.partner_id,
          type,
        }),
      }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-[#FAF7F2]">
        <div className="w-10 h-10 border-3 border-[#24422E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-500 font-bold tracking-wide">
          Loading freshly prepared meal details...
        </p>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center bg-[#FAF7F2] min-h-[60vh]">
        <h2 className="text-xl font-bold text-neutral-800">Meal details not found</h2>
        <p className="text-sm text-neutral-500 mt-2 mb-6">
          This meal may have been updated or removed by the kitchen partner.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full bg-[#24422E] text-white text-xs font-bold shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const cleanWhatsapp = meal.contact_whatsapp ? meal.contact_whatsapp.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=Hi%20${encodeURIComponent(
        meal.kitchen_name
      )},%20I%20saw%20your%20${encodeURIComponent(meal.name)}%20(₹${meal.price})%20on%20TiffinGhar%20and%20would%20like%20to%20order.`
    : '';

  return (
    <div className="py-8 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link href="/partners" className="hover:text-neutral-900 transition-colors">
              Find Tiffin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link
              href={`/partner/${meal.partner_id}`}
              className="hover:text-neutral-900 transition-colors font-medium text-neutral-700"
            >
              {meal.kitchen_name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-bold text-[#24422E] truncate max-w-[200px]">
              {meal.name}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/partner/${meal.partner_id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Kitchen Menu</span>
            </Link>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-2xs transition-all"
              title="Share this meal"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content: Left Gallery & Right Detail Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Kitchen Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Image Card */}
            <div className="rounded-3xl overflow-hidden bg-white border border-neutral-200/80 shadow-md">
              <div className="relative aspect-[16/11] w-full bg-neutral-900 overflow-hidden">
                <img
                  src={
                    activeImage ||
                    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt={meal.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Dietary & Category Badges */}
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-black shadow-md ${
                      meal.is_veg
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {meal.is_veg ? '🥦 100% Pure Veg' : '🍗 Non-Veg Meal'}
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/95 text-neutral-800 backdrop-blur-md shadow-md">
                    {meal.category}
                  </span>
                </div>

                <div className="absolute bottom-5 left-6 right-6 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      Homestyle Specialty
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                      {meal.name}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Photos Gallery Thumbnails (Uploaded by Kitchen Partner) */}
              {meal.images && meal.images.length > 1 && (
                <div className="p-4 sm:p-5 bg-neutral-50/80 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                      All Meal Photos ({meal.images.length})
                    </span>
                    <span className="text-[11px] text-neutral-400">Click any photo to preview</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {meal.images.map((img: any, idx: number) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setActiveImage(img.image_url)}
                        className={`relative aspect-[4/3] w-24 sm:w-28 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImage === img.image_url
                            ? 'border-[#24422E] ring-3 ring-[#24422E]/20 scale-105 shadow-md'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={`Dish photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kitchen Profile & Chef Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Prepared By Kitchen
                  </span>
                  <h3 className="text-xl font-black text-[#1F2823] mt-0.5">
                    {meal.kitchen_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 text-[#E4753F]" />
                    <span>
                      {meal.area}, {meal.city}
                    </span>
                    <span>•</span>
                    <span>Chef {meal.owner_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 text-amber-900 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{meal.average_rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5E6961] leading-relaxed">
                {meal.kitchen_bio ||
                  'Authentic homemade recipes prepared with fresh ingredients, balanced spices, and motherly care.'}
              </p>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href={`/partner/${meal.partner_id}`}
                  className="text-xs font-bold text-[#24422E] hover:underline flex items-center gap-1"
                >
                  <span>Explore Full Kitchen Menu & Reviews</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Meal Details & Ordering CTA */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 self-start">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-md space-y-6">
              {/* Header: Name & Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Open for Delivery Today
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    {meal.category}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#1F2823] tracking-tight">
                  {meal.name}
                </h2>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-black text-[#24422E]">
                    ₹{meal.price}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    (inclusive of packaging & preparation)
                  </span>
                </div>
              </div>

              {/* What's Inside this Thali */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
                  What's Inside / Meal Items Included
                </h3>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-neutral-200/70">
                  <p className="text-xs sm:text-sm text-[#1F2823] leading-relaxed whitespace-pre-line font-medium">
                    {meal.description ||
                      'Prepared fresh daily with wholesome ingredients, balanced spices, and authentic homestyle recipes.'}
                  </p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 gap-2.5 text-xs text-neutral-600">
                <div className="p-3 rounded-2xl bg-neutral-50 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#E4753F] shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Delivery Timings</span>
                    <span>{meal.delivery_timings || 'Lunch (12-2 PM) & Dinner (7:30-9:30 PM)'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#24422E] shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Areas Served</span>
                    <span>{meal.delivery_areas || `${meal.area} and adjacent neighborhoods`}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#24422E] shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Hygiene & Safety</span>
                    <span>FSSAI: {meal.fssai_number || 'Registered Home Kitchen'}</span>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="space-y-3 pt-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleContactClick('WHATSAPP')}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Order on WhatsApp (₹{meal.price})</span>
                  </a>
                )}

                <a
                  href={`tel:${meal.contact_phone}`}
                  onClick={() => handleContactClick('CALL')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Kitchen ({meal.contact_phone})</span>
                </a>
              </div>

              <div className="pt-4 border-t border-neutral-100 space-y-1.5 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Direct chef pricing • 0% middleman fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% Home Cooked fresh daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Daily & monthly recurring delivery available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Meals from this Kitchen Section */}
        {moreMeals.length > 0 && (
          <div className="pt-8 border-t border-neutral-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
                  From {meal.kitchen_name}
                </span>
                <h3 className="text-2xl font-black text-[#1F2823] tracking-tight mt-0.5">
                  More Homestyle Meals & Thalis
                </h3>
              </div>
              <Link
                href={`/partner/${meal.partner_id}`}
                className="text-xs font-bold text-[#24422E] hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {moreMeals.map((item) => (
                <Link
                  key={item.id}
                  href={`/meals/${item.id}`}
                  className="rounded-3xl bg-white p-4 border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-[#24422E]/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {item.cover_image && (
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                        <img
                          src={item.cover_image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div
                          className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.is_veg ? 'Veg' : 'Non-Veg'}
                        </div>
                      </div>
                    )}

                    <h4 className="font-bold text-sm text-[#1F2823] group-hover:text-[#24422E] transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#5E6961] mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-black text-sm text-[#24422E]">₹{item.price}</span>
                    <span className="font-bold text-[#E4753F] group-hover:underline">
                      View Dish →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
