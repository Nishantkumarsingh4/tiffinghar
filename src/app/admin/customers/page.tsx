'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Eye, UserCheck, UserX, ExternalLink } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadCustomers(searchVal = search, pageNum = page) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(searchVal)}&page=${pageNum}`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.customers);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers(search, page);
  }, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadCustomers(search, 1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
            Customer Directory
          </span>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            Registered Customers ({total})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            View profiles, engagement analytics, and kitchens viewed per customer.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-neutral-700">No customers found</p>
            <p className="text-xs text-neutral-400 mt-1">Try tweaking your search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Kitchen Views</th>
                  <th className="py-3 px-4 text-center">Reviews</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#E4753F]">
                      <Link href={`/admin/customers/${c.id}`} className="hover:underline">
                        {c.human_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {c.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F2823]">{c.full_name}</p>
                          <p className="text-[11px] text-neutral-400 font-mono">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {c.city || '—'} {c.area ? `(${c.area})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#24422E]">
                      {c.total_views || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-neutral-600">
                      {c.total_reviews || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          c.account_status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.account_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-[#24422E] hover:text-white text-neutral-700 font-bold text-[11px] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>360° View</span>
                      </Link>
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
