'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function KitchenProfilePage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    kitchenName: '',
    ownerName: '',
    bio: '',
    logoUrl: '',
    coverUrl: '',
    address: '',
    city: 'Bengaluru',
    area: 'Koramangala',
    pincode: '560034',
    contactPhone: '',
    contactWhatsapp: '',
    fssaiNumber: '',
    deliveryAreas: '',
    deliveryTimings: 'Lunch: 12-2 PM | Dinner: 7:30-9:30 PM',
    planType: 'Daily, Weekly, Monthly',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/partner/profile');
        const data = await res.json();
        if (data.success && data.profile) {
          const p = data.profile;
          setForm({
            kitchenName: p.kitchen_name || '',
            ownerName: p.owner_name || '',
            bio: p.bio || '',
            logoUrl: p.logo_url || '',
            coverUrl: p.cover_url || '',
            address: p.address || '',
            city: p.city || 'Bengaluru',
            area: p.area || 'Koramangala',
            pincode: p.pincode || '',
            contactPhone: p.contact_phone || '',
            contactWhatsapp: p.contact_whatsapp || '',
            fssaiNumber: p.fssai_number || '',
            deliveryAreas: p.delivery_areas || '',
            deliveryTimings: p.delivery_timings || 'Lunch: 12-2 PM | Dinner: 7:30-9:30 PM',
            planType: p.plan_type || 'Daily, Weekly, Monthly',
          });
        }
      } catch (err) {
        error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/partner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      success('Kitchen profile updated successfully!');
    } catch (err: any) {
      error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-500">Loading kitchen profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
          Kitchen Profile & Logistics
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6961] mt-0.5">
          Update your public profile, delivery coverage, FSSAI hygiene certificate, and direct contact details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Kitchen / Tiffin Service Name
            </label>
            <input
              type="text"
              required
              value={form.kitchenName}
              onChange={(e) => setForm({ ...form, kitchenName: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Chef / Owner Name
            </label>
            <input
              type="text"
              required
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
            About Kitchen & Cooking Philosophy
          </label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell diners about your regional recipes, pure ghee/oil usage, spice levels, and motherly care..."
            className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Primary Contact Phone
            </label>
            <input
              type="tel"
              required
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              WhatsApp Order Phone
            </label>
            <input
              type="tel"
              value={form.contactWhatsapp}
              onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              City
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Neighborhood / Area
            </label>
            <input
              type="text"
              required
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
            Full Kitchen Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Door / Flat No, Street, Landmark..."
            className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Delivery Areas Covered
            </label>
            <input
              type="text"
              value={form.deliveryAreas}
              onChange={(e) => setForm({ ...form, deliveryAreas: e.target.value })}
              placeholder="e.g. Koramangala 1-8th block, HSR Sector 1-4, BTM"
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Delivery Timings
            </label>
            <input
              type="text"
              value={form.deliveryTimings}
              onChange={(e) => setForm({ ...form, deliveryTimings: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              FSSAI Registration Number (Optional)
            </label>
            <input
              type="text"
              value={form.fssaiNumber}
              onChange={(e) => setForm({ ...form, fssaiNumber: e.target.value })}
              placeholder="e.g. 21221190000101"
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Cover Photo URL
            </label>
            <input
              type="url"
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving changes...' : 'Save Kitchen Profile'}</span>
        </button>
      </form>
    </div>
  );
}
