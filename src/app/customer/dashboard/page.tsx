'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Heart,
  Clock,
  Star,
  MapPin,
  ArrowRight,
  ExternalLink,
  Utensils,
} from 'lucide-react';
import { useAuthModal } from '@/components/AuthModalProvider';

export default function CustomerDashboardPage() {
  const { currentUser } = useAuthModal();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RECENT' | 'FAVORITES' | 'REVIEWS'>('RECENT');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/customer/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-32 bg-white rounded-3xl" />
        <div className="h-64 bg-white rounded-3xl" />
      </div>
    );
  }

  const profile = data?.profile;
  const recentlyViewed = data?.recentlyViewed || [];
  const favorites = data?.favorites || [];
  const myReviews = data?.myReviews || [];

  return (
    <div className="py-10 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#24422E] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#24422E]/15">
              {profile?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4753F]">
                Customer Account
              </span>
              <h1 className="text-2xl font-black text-[#1F2823]">
                {profile?.full_name || currentUser?.fullName || 'Valued Diner'}
              </h1>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                ID: {profile?.human_id || currentUser?.humanId} • {profile?.city || 'Bengaluru'}
              </p>
            </div>
          </div>

          <Link
            href="/partners"
            className="px-6 py-3 rounded-full bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
          >
            Browse New Tiffins
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
          <button
            onClick={() => setActiveTab('RECENT')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'RECENT'
                ? 'bg-[#24422E] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Viewed ({recentlyViewed.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FAVORITES')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'FAVORITES'
                ? 'bg-[#24422E] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REVIEWS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'REVIEWS'
                ? 'bg-[#24422E] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>My Reviews ({myReviews.length})</span>
          </button>
        </div>

        {/* Tab 1: Recently Viewed */}
        {activeTab === 'RECENT' && (
          <div>
            {recentlyViewed.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8">
                <Utensils className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-[#1F2823]">No kitchens viewed recently</h2>
                <p className="text-xs text-[#5E6961] mt-1 mb-6">
                  Explore our tiffin directory to discover authentic home kitchens.
                </p>
                <Link
                  href="/partners"
                  className="px-6 py-2.5 rounded-full bg-[#24422E] text-white text-xs font-bold"
                >
                  Explore Directory
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentlyViewed.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/partner/${item.id}`}
                    className="group rounded-3xl bg-white p-4 border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                        <img
                          src={item.cover_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
                          alt={item.kitchen_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-bold text-base text-[#1F2823] group-hover:text-[#24422E]">
                        {item.kitchen_name}
                      </h3>
                      <p className="text-xs text-[#5E6961] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E4753F]" />
                        <span>{item.area}, {item.city}</span>
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                      <span>Viewed {new Date(item.last_viewed).toLocaleDateString()}</span>
                      <span className="font-bold text-[#24422E] group-hover:underline">View Menu →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Favorites */}
        {activeTab === 'FAVORITES' && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8">
                <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-[#1F2823]">No favorite kitchens saved</h2>
                <p className="text-xs text-[#5E6961] mt-1 mb-6">
                  Tap the heart icon on any kitchen page to save it for quick re-ordering.
                </p>
                <Link
                  href="/partners"
                  className="px-6 py-2.5 rounded-full bg-[#24422E] text-white text-xs font-bold"
                >
                  Find Tiffins
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/partner/${item.id}`}
                    className="group rounded-3xl bg-white p-4 border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                        <img
                          src={item.cover_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
                          alt={item.kitchen_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-bold text-base text-[#1F2823] group-hover:text-[#24422E]">
                        {item.kitchen_name}
                      </h3>
                      <p className="text-xs text-[#5E6961] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E4753F]" />
                        <span>{item.area}, {item.city}</span>
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-600">★ {item.avg_rating || 5.0}</span>
                      <span className="font-bold text-[#24422E] group-hover:underline">Order Now →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Reviews */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-4">
            {myReviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8">
                <Star className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-[#1F2823]">You haven't reviewed any kitchens yet</h2>
                <p className="text-xs text-[#5E6961] mt-1 mb-6">
                  Leave feedback after trying home meals to help the community discover the best chefs.
                </p>
              </div>
            ) : (
              myReviews.map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-3xl bg-white p-6 border border-neutral-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/partner/${r.partner_id}`}
                        className="font-bold text-base text-[#1F2823] hover:text-[#24422E]"
                      >
                        {r.kitchen_name}
                      </Link>
                      <div className="flex items-center gap-1 text-amber-500 mt-1">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {new Date(r.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-[#5E6961] leading-relaxed">
                    "{r.comment}"
                  </p>

                  {r.partner_reply && (
                    <div className="p-3 rounded-2xl bg-[#FAF7F2] text-xs text-neutral-600">
                      <strong className="text-[#24422E] block mb-0.5">Chef's Reply:</strong>
                      {r.partner_reply}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
