'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function AddProductPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Daily Thali');
  const [price, setPrice] = useState(120);
  const [isVeg, setIsVeg] = useState(true);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<any>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/partner/stats');
        const data = await res.json();
        if (data.success) {
          setPartnerStatus(data.stats);
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkStatus();
  }, []);

  const isFree = !partnerStatus?.isPremium;
  const currentImagesCount = partnerStatus?.imagesUsed || 0;
  const freeLimit = partnerStatus?.freeImageLimit || 3;
  const totalPlannedImages = 1 + galleryImages.length;
  const wouldExceedLimit = isFree && currentImagesCount + totalPlannedImages > freeLimit;

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    if (isFree && currentImagesCount + galleryImages.length + 2 > freeLimit) {
      error(`Free partners cannot exceed ${freeLimit} photos. Upgrade to Premium for unlimited photos.`);
      return;
    }
    setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/partner/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          isVeg,
          description,
          coverImage,
          galleryImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add meal');
      }

      success('Meal added to menu successfully!');
      router.push('/partner/products');
    } catch (err: any) {
      error(err.message || 'Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/partner/products"
          className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            Add New Meal / Dish
          </h1>
          <p className="text-xs text-[#5E6961]">
            Create a delicious meal package with items, photo cover, and pricing.
          </p>
        </div>
      </div>

      {/* Free limit notice if applicable */}
      {isFree && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-center justify-between gap-4">
          <span>
            You have used <strong>{currentImagesCount}</strong> of <strong>{freeLimit}</strong> free photos.
            {wouldExceedLimit && ' Adding more images requires a Premium upgrade.'}
          </span>
          <Link
            href="/partner/subscription"
            className="px-3 py-1.5 rounded-full bg-[#E4753F] text-white font-bold shrink-0 hover:bg-[#D3632D]"
          >
            Upgrade to Premium (₹49)
          </Link>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Meal / Thali Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deluxe North Indian Thali"
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Meal Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
            >
              <option value="Daily Thali">Daily Thali</option>
              <option value="Deluxe Thali">Deluxe Thali</option>
              <option value="Mini Meal">Mini Meal / Diet Box</option>
              <option value="Weekend Feast">Weekend Feast</option>
              <option value="Executive Lunch">Executive Lunch</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Price per Meal (₹)
            </label>
            <input
              type="number"
              required
              min={10}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Dietary Preference
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  isVeg ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-[#FAF7F2] text-neutral-700 border-neutral-200'
                }`}
              >
                🥗 Pure Veg
              </button>
              <button
                type="button"
                onClick={() => setIsVeg(false)}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  !isVeg ? 'bg-rose-800 text-white border-rose-800' : 'bg-[#FAF7F2] text-neutral-700 border-neutral-200'
                }`}
              >
                🍗 Non-Veg
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
            Meal Description & Items Included
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 4 phulkas, 1 seasonal green sabzi, yellow dal tadka, jeera rice, salad & pickle..."
            className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
          />
        </div>

        {/* Cover Photo */}
        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
            Cover Photo URL (Primary Image)
          </label>
          <input
            type="url"
            required
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
          />
          {coverImage && (
            <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-neutral-200">
              <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Additional Gallery Images */}
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase text-neutral-600">
              Additional Gallery Photos (Optional)
            </label>
            <span className="text-[11px] text-neutral-400">
              {galleryImages.length} additional photo(s)
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder="Paste photo URL here..."
              className="flex-1 px-4 py-2.5 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs"
            />
            <button
              type="button"
              onClick={handleAddGalleryImage}
              className="px-4 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors"
            >
              Add
            </button>
          </div>

          {galleryImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {galleryImages.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 group">
                  <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || wouldExceedLimit}
          className="w-full py-4 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
        >
          {loading ? 'Adding Dish...' : 'Publish Meal to Menu'}
        </button>
      </form>
    </div>
  );
}
