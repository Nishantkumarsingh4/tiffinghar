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
  X,
  Save,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function PartnerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [imagesUsed, setImagesUsed] = useState(0);
  const [freeImageLimit, setFreeImageLimit] = useState(3);
  const { success, error } = useToast();

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Daily Thali');
  const [editPrice, setEditPrice] = useState('');
  const [editIsVeg, setEditIsVeg] = useState(true);
  const [editDescription, setEditDescription] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editGalleryImages, setEditGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
        loadProducts();
      }
    } catch {
      error('Failed to delete meal');
    }
  };

  const handleOpenEdit = async (p: any) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category || 'Daily Thali');
    setEditPrice(p.price?.toString() || '');
    setEditIsVeg(Boolean(p.is_veg));
    setEditDescription(p.description || '');
    setEditCoverImage(p.cover_image || '');
    setEditGalleryImages([]);
    setNewGalleryUrl('');
    setLoadingDetails(true);

    try {
      const res = await fetch(`/api/partner/products/${p.id}`);
      const data = await res.json();
      if (data.success && data.product?.images) {
        const cover = data.product.images.find((img: any) => img.is_cover);
        if (cover) {
          setEditCoverImage(cover.image_url);
        }
        const gallery = data.product.images
          .filter((img: any) => !img.is_cover)
          .map((img: any) => img.image_url);
        setEditGalleryImages(gallery);
      }
    } catch {
      // fallback to p.cover_image
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    if (!isPremium && imagesUsed + editGalleryImages.length + 1 > freeImageLimit) {
      error(`Free partners cannot exceed ${freeImageLimit} total photos. Upgrade to Premium for unlimited photos.`);
      return;
    }
    setEditGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setEditGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);

    try {
      const res = await fetch(`/api/partner/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          price: parseFloat(editPrice),
          isVeg: editIsVeg,
          description: editDescription,
          coverImage: editCoverImage,
          galleryImages: editGalleryImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update meal');
      }

      success('Meal and photos updated successfully!');
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: editName,
                category: editCategory,
                price: parseFloat(editPrice).toFixed(2),
                is_veg: editIsVeg ? 1 : 0,
                description: editDescription,
                cover_image: editCoverImage,
              }
            : item
        )
      );
      loadProducts();
      setEditingProduct(null);
    } catch (err: any) {
      error(err.message || 'Failed to update meal');
    } finally {
      setEditSaving(false);
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
              className="rounded-3xl bg-white p-4 border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
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
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-[#24422E] hover:bg-neutral-100 transition-colors"
                    title="Edit meal details & photos"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
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

      {/* EDIT MEAL MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-neutral-200/90 max-h-[88vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4753F]">
                Quick Menu Editor
              </span>
              <h2 className="text-xl font-black text-[#1F2823] tracking-tight mt-0.5">
                Edit Meal: {editingProduct.name}
              </h2>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Meal Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Deluxe North Indian Thali"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E] bg-white cursor-pointer"
                  >
                    <option value="Daily Thali">Daily Thali</option>
                    <option value="Mini Thali">Mini Thali</option>
                    <option value="Special Meal">Special Meal</option>
                    <option value="Weekend Feast">Weekend Feast</option>
                    <option value="Diet Box">Diet Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="120"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Dietary Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsVeg(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      editIsVeg
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    🥦 100% Pure Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsVeg(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      !editIsVeg
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    🍗 Non-Veg
                  </button>
                </div>
              </div>

              {/* Cover Photo */}
              <div className="border border-neutral-200 rounded-2xl p-3 bg-neutral-50/60 space-y-2">
                <label className="block text-xs font-bold text-neutral-700">
                  Main Cover Photo URL
                </label>
                <div className="flex items-center gap-3">
                  {editCoverImage ? (
                    <img
                      src={editCoverImage}
                      alt="Cover preview"
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <input
                    type="url"
                    required
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
                  />
                </div>
              </div>

              {/* Additional Photos / Gallery */}
              <div className="border border-neutral-200 rounded-2xl p-3 bg-neutral-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700">
                    Additional Gallery Photos ({editGalleryImages.length})
                  </label>
                  {!isPremium && (
                    <span className="text-[11px] text-amber-700 font-semibold">
                      Free Limit: {freeImageLimit} photos total
                    </span>
                  )}
                </div>

                {loadingDetails ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading existing photos...</span>
                  </div>
                ) : (
                  <>
                    {/* Existing gallery thumbnails */}
                    {editGalleryImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {editGalleryImages.map((url, idx) => (
                          <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove photo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new photo input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="url"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="Paste additional image URL..."
                        className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        className="px-3 py-1.5 rounded-xl bg-[#24422E] text-white text-xs font-bold hover:bg-[#1E3626] transition-colors shrink-0"
                      >
                        + Add Photo
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Meal Description / Items Included
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="e.g. 4 soft rotis, dal fry, seasonal dry vegetable, steamed rice, and salad."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold transition-all shadow-md shadow-[#24422E]/15 disabled:opacity-60 flex items-center gap-1.5"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
