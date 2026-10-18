'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Heart,
  Clock,
  ShieldCheck,
  ChevronLeft,
  X,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useAuthModal } from '@/components/AuthModalProvider';
import { useToast } from '@/components/ToastProvider';

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, openLoginModal } = useAuthModal();
  const { success, error, info } = useToast();

  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/partners/${id}`);
        if (res.status === 401) {
          // Unauthenticated -> trigger login popup
          openLoginModal('CUSTOMER');
          return;
        }
        const data = await res.json();
        if (data.success && data.partner) {
          setPartner(data.partner);
          setIsFavorite(Boolean(data.partner.isFavorite));
        }
      } catch (err) {
        error('Failed to load partner details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, openLoginModal, error]);

  const handleContactClick = async (type: 'CALL' | 'WHATSAPP') => {
    try {
      await fetch(`/api/partners/${id}/contact-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } catch {
      // Background log
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      openLoginModal('CUSTOMER');
      return;
    }
    try {
      const res = await fetch('/api/customer/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: Number(id) }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.isFavorite);
        success(data.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
      }
    } catch {
      error('Failed to update favorite');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLoginModal('CUSTOMER');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/partners/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      success('Thank you! Your review has been recorded.');
      setComment('');

      // Refresh partner details
      const refreshRes = await fetch(`/api/partners/${id}`);
      const refreshData = await refreshRes.json();
      if (refreshData.partner) setPartner(refreshData.partner);
    } catch (err: any) {
      error(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-64 bg-neutral-200 rounded-3xl" />
        <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-800">Please sign in to view this kitchen</h2>
        <p className="text-sm text-neutral-500 mt-2 mb-6">
          Full menus, direct chef contact numbers, and delivery schedules require signing in.
        </p>
        <button
          onClick={() => openLoginModal('CUSTOMER')}
          className="px-6 py-3 rounded-full bg-[#24422E] text-white text-sm font-bold"
        >
          Sign in as Customer
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        {/* Hero Kitchen Header */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-neutral-200/80 shadow-md">
          {/* Cover Photo */}
          <div className="relative h-64 sm:h-80 w-full bg-neutral-100">
            <img
              src={partner.cover_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80'}
              alt={partner.kitchen_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Badges on Top */}
            <div className="absolute top-5 left-5 flex flex-wrap gap-2">
              {partner.isPremium && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4753F] text-white text-xs font-bold shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended Partner</span>
                </div>
              )}
              {partner.is_verified && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24422E] text-white text-xs font-bold shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Kitchen</span>
                </div>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-5 right-5 p-3 rounded-full backdrop-blur-md transition-all ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/80 text-neutral-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>

            {/* Bottom Title on Cover */}
            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                  {partner.kitchen_name}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-neutral-200">
                  <MapPin className="w-4 h-4 text-[#E4753F] shrink-0" />
                  <span>
                    {partner.area}, {partner.city}
                  </span>
                  <span>•</span>
                  <span>Plan: {partner.plan_type}</span>
                </div>
              </div>

              {/* Rating Pill */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shrink-0">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-black">{partner.averageRating.toFixed(1)}</span>
                <span className="text-xs text-neutral-300">({partner.totalReviews} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Info Bar */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-neutral-100">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Direct Kitchen Contacts
              </span>
              <p className="text-xs text-neutral-500">
                Connect directly with Chef {partner.owner_name} to customize meals or start delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${partner.contact_phone}`}
                onClick={() => handleContactClick('CALL')}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold shadow-md shadow-[#24422E]/15 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Kitchen ({partner.contact_phone})</span>
              </a>

              {partner.contact_whatsapp && (
                <a
                  href={`https://wa.me/${partner.contact_whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                    partner.kitchen_name
                  )},%20I%20saw%20your%20tiffin%20menu%20on%20TiffinGhar%20and%20would%20like%20to%20order.`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleContactClick('WHATSAPP')}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Order</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Main: Dishes & Menu */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Kitchen */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-[#1F2823]">
                About {partner.kitchen_name}
              </h2>
              <p className="text-sm text-[#5E6961] leading-relaxed">
                {partner.bio ||
                  'Authentic homemade recipes prepared with fresh ingredients, balanced spices, and motherly care.'}
              </p>

              <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#E4753F] shrink-0 mt-0.5" />
                  <span>Timings: {partner.delivery_timings || 'Lunch & Dinner'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#24422E] shrink-0 mt-0.5" />
                  <span>FSSAI: {partner.fssai_number || 'Registered Home Kitchen'}</span>
                </div>
              </div>
            </div>

            {/* Menu Dishes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#1F2823] tracking-tight">
                  Meals & Thalis Menu
                </h2>
                <span className="text-xs text-neutral-500 font-medium">
                  {partner.products?.length || 0} meals available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {partner.products?.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="rounded-3xl bg-white p-4 border border-neutral-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {prod.cover_image && (
                        <div
                          onClick={() => setLightboxImg(prod.cover_image)}
                          className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 mb-3 cursor-pointer group"
                        >
                          <img
                            src={prod.cover_image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prod.is_veg ? 'Veg' : 'Non-Veg'}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-[#1F2823]">{prod.name}</h3>
                        <span className="font-black text-sm text-[#24422E]">₹{prod.price}</span>
                      </div>
                      <p className="text-xs text-[#5E6961] mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">{prod.category}</span>
                      <a
                        href={`https://wa.me/${partner.contact_whatsapp?.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                          partner.kitchen_name
                        )},%20I%20would%20like%20to%20order%20the%20${encodeURIComponent(prod.name)}.`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleContactClick('WHATSAPP')}
                        className="font-bold text-[#E4753F] hover:underline"
                      >
                        Order via WhatsApp →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery with Lightbox */}
            {partner.images && partner.images.length > 0 && (
              <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1F2823]">
                    Kitchen & Food Gallery
                  </h2>
                  <span className="text-xs text-neutral-400">
                    Click any photo to enlarge
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {partner.images.map((img: any) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImg(img.image_url)}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer group"
                    >
                      <img
                        src={img.image_url}
                        alt="Gallery"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2823]">
                    Customer Reviews
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Verified feedback from daily meal subscribers
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{partner.averageRating.toFixed(1)}</span>
                </div>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-[#FAF7F2] border border-neutral-200 space-y-3">
                <span className="text-xs font-bold text-neutral-700 block">
                  Write Your Review for {partner.kitchen_name}
                </span>

                {/* Star rating selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  required
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (taste, hygiene, portion size, delivery punctuality)..."
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#24422E]"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </form>

              {/* Existing Reviews List */}
              <div className="space-y-4 pt-2 divide-y divide-neutral-100">
                {partner.reviews?.map((r: any) => (
                  <div key={r.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.customer_avatar || 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=100&q=80'}
                          alt={r.customer_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">{r.customer_name}</h4>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#5E6961] leading-relaxed pl-10.5">
                      "{r.comment}"
                    </p>

                    {r.partner_reply && (
                      <div className="ml-10.5 p-3 rounded-xl bg-[#FAF7F2] text-xs text-neutral-600">
                        <strong className="text-[#24422E] block mb-0.5">Chef's Reply:</strong>
                        {r.partner_reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Location & Delivery info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-white p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#1F2823]">
                Location & Delivery
              </h2>

              <div className="space-y-3 text-xs text-neutral-600">
                <div>
                  <span className="font-bold text-neutral-800 block mb-1">
                    Kitchen Address:
                  </span>
                  <p>{partner.address || `${partner.area}, ${partner.city}`}</p>
                </div>

                <div>
                  <span className="font-bold text-neutral-800 block mb-1">
                    Areas Served:
                  </span>
                  <p>{partner.delivery_areas || `${partner.area} and adjacent neighborhoods`}</p>
                </div>

                <div>
                  <span className="font-bold text-neutral-800 block mb-1">
                    Schedule:
                  </span>
                  <p>{partner.delivery_timings || 'Mon - Sun: Lunch & Dinner'}</p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${partner.address || partner.kitchen_name}, ${partner.area}, ${partner.city}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-[#FAF7F2] hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-neutral-200"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImg}
            alt="Enlarged"
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
