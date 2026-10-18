'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function PartnerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [imagesUsed, setImagesUsed] = useState(0);
  const [freeImageLimit, setFreeImageLimit] = useState(3);
  const { success, error } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partner/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setIsPremium(data.isPremium);
        setImagesUsed(data.imagesUsed || 0);
        setFreeImageLimit(data.freeImageLimit || 3);
      }
    } catch (err) {
      error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/partner/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleActive: !currentStatus }),
      });
      if (res.ok) {
        success(`Dish marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
        );
      }
    } catch {
      error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this meal from your menu?')) return;
    try {
      const res = await fetch(`/api/partner/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Meal removed from menu');
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      error('Failed to delete meal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            My Meals & Dishes
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6961] mt-0.5">
            Manage your daily thalis, weekend specials, prices, and photo galleries.
          </p>
        </div>

        <Link
          href="/partner/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold shadow-md shadow-[#24422E]/15 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Meal</span>
        </Link>
      </div>

      {/* Storage Limit Banner */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-800">
              Photo Storage Status:
            </span>
            <span className="text-xs font-semibold text-[#24422E]">
              {imagesUsed} of {isPremium ? 'Unlimited' : freeImageLimit} images used
            </span>
          </div>
          <div className="w-full sm:w-64 bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isPremium ? 'bg-emerald-500' : imagesUsed >= freeImageLimit ? 'bg-rose-500' : 'bg-[#24422E]'
              }`}
              style={{
                width: isPremium ? '100%' : `${Math.min(100, (imagesUsed / freeImageLimit) * 100)}%`,
              }}
            />
          </div>
        </div>

        {!isPremium && imagesUsed >= freeImageLimit && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-700 font-medium">
              Free image limit reached
            </span>
            <Link
              href="/partner/subscription"
              className="px-4 py-2 rounded-full bg-[#E4753F] hover:bg-[#D3632D] text-white text-xs font-bold shadow-xs transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}
      </div>

      {/* Products Table/Grid */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8">
          <UtensilsCrossed className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#1F2823]">No meals added yet</h2>
          <p className="text-xs text-[#5E6961] mt-1 mb-6">
            Add your daily thali or special meal so nearby customers can start discovering you.
          </p>
          <Link
            href="/partner/products/new"
            className="px-6 py-2.5 rounded-full bg-[#24422E] text-white text-xs font-bold"
          >
            Add Your First Meal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-white p-4 border border-neutral-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src={p.cover_image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-bold text-neutral-800">
                    {p.category}
                  </div>
                  <div
                    className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {p.is_veg ? 'Veg' : 'Non-Veg'}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-[#1F2823] line-clamp-1">{p.name}</h3>
                  <span className="font-black text-sm text-[#24422E] shrink-0">₹{p.price}</span>
                </div>

                <p className="text-xs text-[#5E6961] line-clamp-2 mt-1">
                  {p.description || 'Nutritious homestyle food cooked with fresh ingredients.'}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(p.id, Boolean(p.is_active))}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                    p.is_active
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  {p.is_active ? '● Active' : '○ Inactive'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
