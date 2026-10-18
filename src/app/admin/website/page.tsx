'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUp,
  ArrowDown,
  Pin,
  Save,
  Settings,
  HelpCircle,
  MessageSquareQuote,
  Layers,
  Crown,
  CheckCircle,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';

export default function AdminWebsiteManagementPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranking' | 'settings' | 'faqs' | 'testimonials'>('ranking');
  const [partners, setPartners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // FAQ modal/state
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);

  async function loadWebsiteData() {
    try {
      const res = await fetch('/api/admin/website');
      const json = await res.json();
      if (json.success) {
        setData(json);
        setPartners(json.partners || []);
        setSettings(json.settings || {});
      }
    } catch (err) {
      console.error('Failed to load website data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWebsiteData();
  }, []);

  // Reorder Partner Actions
  function movePartner(index: number, direction: 'up' | 'down') {
    const newPartners = [...partners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPartners.length) return;

    const temp = newPartners[index];
    newPartners[index] = newPartners[targetIndex];
    newPartners[targetIndex] = temp;

    // Recalculate admin ranks
    const total = newPartners.length;
    const updated = newPartners.map((p, idx) => ({
      ...p,
      admin_rank: (total - idx) * 10,
    }));

    setPartners(updated);
  }

  function pinToTop(index: number) {
    const newPartners = [...partners];
    const target = newPartners.splice(index, 1)[0];
    target.is_pinned = true;
    target.admin_rank = 9999;
    newPartners.unshift(target);
    setPartners(newPartners);
  }

  function pushToBottom(index: number) {
    const newPartners = [...partners];
    const target = newPartners.splice(index, 1)[0];
    target.is_pinned = false;
    target.admin_rank = 0;
    newPartners.push(target);
    setPartners(newPartners);
  }

  async function saveRanking() {
    setSaveLoading(true);
    try {
      const orders = partners.map((p, idx) => ({
        id: p.id,
        admin_rank: p.admin_rank ?? (partners.length - idx) * 10,
        is_pinned: Boolean(p.is_pinned),
      }));

      const res = await fetch('/api/admin/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder_partners', orders }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess('Marketplace partner ordering saved successfully!');
        setTimeout(() => setSaveSuccess(''), 4000);
      } else {
        alert(json.error || 'Failed to save ordering');
      }
    } catch (err) {
      console.error('Save ranking error:', err);
    } finally {
      setSaveLoading(false);
    }
  }

  async function saveSiteSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_settings', settings }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess('Site settings updated successfully!');
        setTimeout(() => setSaveSuccess(''), 4000);
      } else {
        alert(json.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSaveLoading(false);
    }
  }

  async function saveFaq(faq: any) {
    try {
      const res = await fetch('/api/admin/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_faq', ...faq }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingFaq(null);
        await loadWebsiteData();
      }
    } catch (err) {
      console.error('Save FAQ error:', err);
    }
  }

  async function deleteFaq(id: number) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await fetch('/api/admin/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_faq', id }),
      });
      await loadWebsiteData();
    } catch (err) {
      console.error('Delete FAQ error:', err);
    }
  }

  async function saveTestimonial(test: any) {
    try {
      const res = await fetch('/api/admin/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_testimonial', ...test }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingTestimonial(null);
        await loadWebsiteData();
      }
    } catch (err) {
      console.error('Save Testimonial error:', err);
    }
  }

  async function deleteTestimonial(id: number) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await fetch('/api/admin/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_testimonial', id }),
      });
      await loadWebsiteData();
    } catch (err) {
      console.error('Delete Testimonial error:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
            Site Management
          </span>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            Manage Website & Ranking
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pin partners, adjust display sequence, and edit live platform content.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-xs font-bold">
        {[
          { id: 'ranking', label: `Marketplace Listing Sequence (${partners.length})`, icon: Layers },
          { id: 'settings', label: 'Platform Content & Settings', icon: Settings },
          { id: 'faqs', label: `FAQs (${data?.faqs?.length || 0})`, icon: HelpCircle },
          { id: 'testimonials', label: `Testimonials (${data?.testimonials?.length || 0})`, icon: MessageSquareQuote },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#24422E] text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RANKING & PINNING */}
      {activeTab === 'ranking' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200/80">
            <div>
              <p className="text-xs font-bold text-[#1F2823]">
                Sequence Logic: Pinned kitchens are always top, followed by Active Premium, then Admin Priority Rank, then Rating.
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Use Move Up / Move Down, Pin to Top, or Push to Bottom to adjust. Click &ldquo;Save Ordering&rdquo; to apply to public view.
              </p>
            </div>
            <button
              onClick={saveRanking}
              disabled={saveLoading}
              className="px-5 py-2.5 rounded-xl bg-[#24422E] text-white text-xs font-bold hover:bg-[#1b3223] flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving...' : 'Save Ordering'}</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="divide-y divide-neutral-100">
              {partners.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    p.is_pinned ? 'bg-amber-50/40' : 'hover:bg-neutral-50/70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center font-black text-xs text-neutral-400 font-mono">
                      #{idx + 1}
                    </span>

                    <img
                      src={p.cover_url || '/placeholder-food.jpg'}
                      alt={p.kitchen_name}
                      className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/partners/${p.id}`}
                          className="font-bold text-sm text-[#1F2823] hover:text-[#E4753F]"
                        >
                          {p.kitchen_name}
                        </Link>
                        {p.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-[#E4753F] text-[10px] font-extrabold">
                            <Pin className="w-2.5 h-2.5" /> PINNED
                          </span>
                        )}
                        {p.is_premium_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                            <Crown className="w-2.5 h-2.5" /> PREMIUM
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-neutral-400">
                        {p.city} • Rating: ★ {p.avg_rating} • ID: <span className="font-mono">{p.human_id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Ordering Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => movePartner(idx, 'up')}
                      disabled={idx === 0}
                      title="Move up"
                      className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 transition-all"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-neutral-700" />
                    </button>
                    <button
                      onClick={() => movePartner(idx, 'down')}
                      disabled={idx === partners.length - 1}
                      title="Move down"
                      className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 transition-all"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-neutral-700" />
                    </button>
                    <button
                      onClick={() => pinToTop(idx)}
                      className="px-2.5 py-1.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#E4753F] text-xs font-bold"
                    >
                      Pin to Top
                    </button>
                    <button
                      onClick={() => pushToBottom(idx)}
                      className="px-2.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 text-xs font-bold"
                    >
                      Push to Bottom
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLATFORM CONTENT & SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={saveSiteSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-[#1F2823]">Brand, Pricing & Marketplace Settings</h3>
            <p className="text-xs text-neutral-400">All public web pages read dynamic values from these settings.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={settings.brand_name || 'TiffinGhar'}
                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Monthly Premium Plan Price (INR)</label>
              <input
                type="number"
                value={settings.premium_price ?? 49}
                onChange={(e) => setSettings({ ...settings, premium_price: parseInt(e.target.value, 10) || 49 })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Free Plan Image Limit</label>
              <input
                type="number"
                value={settings.free_image_limit ?? 3}
                onChange={(e) => setSettings({ ...settings, free_image_limit: parseInt(e.target.value, 10) || 3 })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Subscription Duration (Days)</label>
              <input
                type="number"
                value={settings.subscription_duration_days ?? 30}
                onChange={(e) => setSettings({ ...settings, subscription_duration_days: parseInt(e.target.value, 10) || 30 })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Support Phone (tel:)</label>
              <input
                type="text"
                value={settings.contact_phone || '+91 98765 43210'}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Support WhatsApp</label>
              <input
                type="text"
                value={settings.contact_whatsapp || '+91 98765 43210'}
                onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">Hero Section Headline</label>
              <input
                type="text"
                value={settings.hero_headline || 'Good Food Everyday'}
                onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">Hero Section Subtitle</label>
              <textarea
                rows={2}
                value={settings.hero_subheadline || 'Authentic home-cooked meals from verified local kitchens delivered fresh.'}
                onChange={(e) => setSettings({ ...settings, hero_subheadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-xl bg-[#24422E] text-white text-xs font-bold hover:bg-[#1b3223] flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving...' : 'Save Site Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#1F2823]">Frequently Asked Questions</h3>
            <button
              onClick={() => setEditingFaq({ category: 'General', question: '', answer: '', sort_order: 0, is_active: true })}
              className="px-4 py-2 bg-[#24422E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          {editingFaq && (
            <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#1F2823]">
                {editingFaq.id ? 'Edit FAQ' : 'New FAQ'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingFaq.sort_order}
                    onChange={(e) => setEditingFaq({ ...editingFaq, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Question</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Answer</label>
                <textarea
                  rows={3}
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveFaq(editingFaq)}
                  className="px-5 py-2 bg-[#24422E] text-white rounded-xl text-xs font-bold"
                >
                  Save FAQ
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100">
            {data?.faqs?.map((f: any) => (
              <div key={f.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4753F]">
                    {f.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#1F2823] mt-0.5">{f.question}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{f.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingFaq(f)}
                    className="px-3 py-1 rounded-lg border text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFaq(f.id)}
                    className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#1F2823]">Customer & Partner Testimonials</h3>
            <button
              onClick={() => setEditingTestimonial({ author_name: '', role_or_city: '', quote: '', rating: 5, sort_order: 0, is_featured: true })}
              className="px-4 py-2 bg-[#24422E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Testimonial</span>
            </button>
          </div>

          {editingTestimonial && (
            <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#1F2823]">
                {editingTestimonial.id ? 'Edit Testimonial' : 'New Testimonial'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingTestimonial.author_name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Role / City</label>
                  <input
                    type="text"
                    value={editingTestimonial.role_or_city}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role_or_city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    max={5}
                    min={1}
                    value={editingTestimonial.rating}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value, 10) || 5 })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Quote</label>
                <textarea
                  rows={3}
                  value={editingTestimonial.quote}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveTestimonial(editingTestimonial)}
                  className="px-5 py-2 bg-[#24422E] text-white rounded-xl text-xs font-bold"
                >
                  Save Testimonial
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.testimonials?.map((t: any) => (
              <div key={t.id} className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-500 font-bold text-xs">★ {t.rating} / 5</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingTestimonial(t)}
                        className="text-neutral-500 hover:text-neutral-800 text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTestimonial(t.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-700 italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="pt-3 mt-3 border-t border-neutral-100">
                  <p className="text-xs font-bold text-[#1F2823]">{t.author_name}</p>
                  <p className="text-[10px] text-neutral-400">{t.role_or_city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
