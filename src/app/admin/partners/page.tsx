'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  ShieldAlert,
  Crown,
  Pin,
  ExternalLink,
} from 'lucide-react';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadPartners(searchVal = search, filterVal = filter, pageNum = page) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/partners?search=${encodeURIComponent(searchVal)}&filter=${filterVal}&page=${pageNum}`
      );
      const json = await res.json();
      if (json.success) {
        setPartners(json.partners);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error('Failed to load partners:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPartners(search, filter, page);
  }, [filter, page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadPartners(search, filter, 1);
  }

  async function handleAction(partnerId: number, action: string, value?: any) {
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      const json = await res.json();
      if (json.success) {
        loadPartners(search, filter, page);
      } else {
        alert(json.error || 'Action failed');
      }
    } catch (err) {
      console.error('Action error:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
            Partner Management
          </span>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            Tiffin Kitchens Directory ({total})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Inspect individual partner profiles, manage verifications, suspensions, and subscriptions.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search kitchen, owner, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
          />
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { label: 'All Partners', val: 'all' },
          { label: 'Active Premium', val: 'premium' },
          { label: 'Verified Only', val: 'verified' },
          { label: 'Suspended', val: 'suspended' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => {
              setFilter(tab.val);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              filter === tab.val
                ? 'bg-[#24422E] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-neutral-700">No partner kitchens found</p>
            <p className="text-xs text-neutral-400 mt-1">Try resetting search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Partner ID</th>
                  <th className="py-3 px-4">Kitchen & Owner</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Meals</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-center">Plan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#E4753F]">
                      <Link href={`/admin/partners/${p.id}`} className="hover:underline">
                        {p.human_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#24422E] flex items-center justify-center font-bold text-xs shrink-0">
                          {p.kitchen_name?.charAt(0) || 'K'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#1F2823]">{p.kitchen_name}</span>
                            {p.is_verified ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : null}
                            {p.is_pinned ? (
                              <Pin className="w-3 h-3 text-[#E4753F] shrink-0" />
                            ) : null}
                          </div>
                          <p className="text-[11px] text-neutral-400">{p.owner_name} • {p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {p.city} ({p.area})
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      {p.total_products}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#24422E]">
                      {p.total_views}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.is_premium_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          <Crown className="w-3 h-3" />
                          PREMIUM
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400">FREE</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.is_suspended ? (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(p.id, 'toggle_verify')}
                          title={p.is_verified ? 'Remove verified badge' : 'Verify partner'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_verified
                              ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                              : 'border-neutral-200 text-neutral-400 hover:text-emerald-600'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'toggle_suspend')}
                          title={p.is_suspended ? 'Unsuspend partner' : 'Suspend partner'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_suspended
                              ? 'border-rose-200 text-rose-600 bg-rose-50'
                              : 'border-neutral-200 text-neutral-400 hover:text-rose-600'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/admin/partners/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-[#24422E] hover:text-white text-neutral-700 font-bold text-[11px] transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>360°</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing page {page} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
