'use client';

import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadLogs(searchVal = search, pageNum = page) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/audit-logs?search=${encodeURIComponent(searchVal)}&page=${pageNum}`
      );
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs(search, page);
  }, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadLogs(search, 1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
            Security & Governance
          </span>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            Unified System Audit Trail ({total})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable log of all administrative actions, ranking changes, status shifts, and payment events.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search action, entity ID, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
          />
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-neutral-700">No audit logs found</p>
            <p className="text-xs text-neutral-400 mt-1">Try resetting the search filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Payload Details</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1F2823] font-sans">
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-[#24422E] font-extrabold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#E4753F]">{log.entity_id}</div>
                      <div className="text-[10px] text-neutral-400 font-sans">{log.entity_type}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-neutral-800">{log.user_email || 'System'}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{log.user_role || 'DAEMON'}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-neutral-500 text-[10px]" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-500">
                      {new Date(log.created_at).toLocaleString()}
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
