'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Crown,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadPayments(searchVal = search, statusVal = status, pageNum = page) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/payments?search=${encodeURIComponent(searchVal)}&status=${statusVal}&page=${pageNum}`
      );
      const json = await res.json();
      if (json.success) {
        setRecords(json.records);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments(search, status, page);
  }, [status, page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadPayments(search, status, 1);
  }

  function handleExportCsv() {
    window.open(`/api/admin/payments?format=csv&search=${encodeURIComponent(search)}&status=${status}`, '_blank');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
            Audit & Financial Ledger
          </span>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            Subscriptions & Payments Log ({total})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Read-only automatic transaction log with Razorpay payment IDs, dates, and live subscription validity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { label: 'All Transactions', val: 'ALL' },
            { label: 'Active Subscriptions', val: 'ACTIVE' },
            { label: 'Expired', val: 'EXPIRED' },
            { label: 'Failed Payments', val: 'FAILED' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => {
                setStatus(tab.val);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                status === tab.val
                  ? 'bg-[#24422E] text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by Payment ID, Partner, Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E]"
          />
        </form>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-neutral-700">No payment records found</p>
            <p className="text-xs text-neutral-400 mt-1">Try resetting the status filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Partner Kitchen</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Razorpay Reference</th>
                  <th className="py-3 px-4">Validity Window</th>
                  <th className="py-3 px-4 text-center">Days Remaining</th>
                  <th className="py-3 px-4 text-center">Live Status</th>
                  <th className="py-3 px-4 text-right">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700 font-mono text-[11px]">
                {records.map((r) => (
                  <tr key={r.payment_db_id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#E4753F]">
                      {r.payment_id}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <Link
                        href={`/admin/partners/${r.partner_db_id}`}
                        className="font-bold text-[#1F2823] hover:text-[#E4753F] transition-colors flex items-center gap-1.5"
                      >
                        <span>{r.kitchen_name}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </Link>
                      <span className="text-[10px] text-neutral-400 font-mono">{r.partner_id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 text-xs font-sans">
                      ₹{r.amount}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      <div>Ord: {r.razorpay_order_id || '—'}</div>
                      <div className="text-[10px] text-neutral-400">Pay: {r.razorpay_payment_id || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {r.start_date ? (
                        <>
                          {new Date(r.start_date).toLocaleDateString()} &rarr; {new Date(r.end_date).toLocaleDateString()}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      {r.days_remaining > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#24422E] font-bold text-[10px]">
                          {r.days_remaining} days
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[10px]">0 days</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      {r.live_status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          <Crown className="w-2.5 h-2.5" /> ACTIVE
                        </span>
                      ) : r.live_status === 'EXPIRED' ? (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                          {r.live_status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-500">
                      {new Date(r.payment_date).toLocaleString()}
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
