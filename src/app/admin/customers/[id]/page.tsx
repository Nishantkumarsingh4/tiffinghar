'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Star,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Clock,
  PhoneCall,
  MessageCircle,
} from 'lucide-react';

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadDetails() {
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function toggleStatus() {
    if (!data?.customer) return;
    const currentStatus = data.customer.user_status;
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change customer status to ${newStatus}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        await loadDetails();
      } else {
        alert(json.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data?.customer) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
        <h2 className="text-lg font-bold text-neutral-800">Customer Not Found</h2>
        <Link
          href="/admin/customers"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#E4753F] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
      </div>
    );
  }

  const { customer, viewedPartners, viewTimeline, reviews, contactClicks, tickets } = data;

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#1F2823] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Directory</span>
        </Link>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-600">
          Customer ID: {customer.human_id}
        </span>
      </div>

      {/* Customer 360 Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-2xl shrink-0">
              {customer.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#1F2823]">{customer.full_name}</h1>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    customer.user_status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {customer.user_status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{customer.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleStatus}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                customer.user_status === 'ACTIVE'
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {customer.user_status === 'ACTIVE' ? 'Suspend Customer' : 'Reactivate Account'}
            </button>
          </div>
        </div>

        {/* Contact & Meta Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs text-neutral-600">
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>{customer.phone || 'Phone not provided'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>
              {customer.city ? `${customer.city}, ${customer.area || ''}` : 'Location unlisted'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>Registered: {new Date(customer.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>Total Kitchen Views: {viewedPartners?.reduce((acc: number, p: any) => acc + (p.view_count || 0), 0) || 0}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: EXACT TIFFIN PARTNERS VIEWED (Primary Requirement) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-black text-[#1F2823] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#24422E]" />
              Exact Tiffin Kitchens Viewed by This Customer
            </h2>
            <p className="text-xs text-neutral-400">
              Aggregated engagement per partner kitchen with exact timestamps and visit frequency
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-[#24422E] rounded-full">
            {viewedPartners?.length || 0} Unique Kitchens
          </span>
        </div>

        {viewedPartners?.length === 0 ? (
          <p className="text-xs text-neutral-400 py-6 text-center">
            This customer has not browsed any tiffin partner profiles yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Partner ID</th>
                  <th className="py-3 px-4">Kitchen Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">View Count</th>
                  <th className="py-3 px-4">First Viewed</th>
                  <th className="py-3 px-4">Most Recent View</th>
                  <th className="py-3 px-4 text-right">Partner 360°</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {viewedPartners.map((vp: any) => (
                  <tr key={vp.partner_id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#E4753F]">
                      <Link href={`/admin/partners/${vp.partner_id}`} className="hover:underline">
                        {vp.partner_human_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1F2823]">
                      {vp.kitchen_name}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {vp.city} {vp.area ? `(${vp.area})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#24422E] font-black text-xs">
                        {vp.view_count} views
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(vp.first_viewed_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-800 font-mono text-[11px]">
                      {new Date(vp.last_viewed_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/partners/${vp.partner_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-[#24422E] hover:text-white text-neutral-700 font-bold text-[11px] transition-all"
                      >
                        <span>View Kitchen</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Section: Reviews Written & Contact Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews Written */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs">
          <h3 className="text-base font-black text-[#1F2823] mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Reviews Submitted ({reviews?.length || 0})
          </h3>

          {reviews?.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/admin/partners/${r.partner_id}`}
                      className="text-xs font-bold text-[#1F2823] hover:text-[#E4753F] transition-colors"
                    >
                      {r.kitchen_name}
                    </Link>
                    <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                      <span>★</span> {r.rating} / 5
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 italic">&ldquo;{r.comment}&rdquo;</p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Clicks (Calls & WhatsApp) */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs">
          <h3 className="text-base font-black text-[#1F2823] mb-4 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            Direct Contact Clicks ({contactClicks?.length || 0})
          </h3>

          {contactClicks?.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No contact clicks recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {contactClicks.map((c: any) => (
                <div key={c.id} className="p-3 rounded-2xl bg-neutral-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {c.click_type === 'WHATSAPP' ? (
                      <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-[#1F2823]">{c.kitchen_name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                    {c.click_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Support Tickets Section */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs">
        <h3 className="text-base font-black text-[#1F2823] mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          Support Tickets Raised ({tickets?.length || 0})
        </h3>

        {tickets?.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center">No support tickets raised.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {tickets.map((t: any) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#E4753F]">{t.human_id}</span>
                    <p className="font-bold text-[#1F2823]">{t.subject}</p>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                    Created {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      t.status === 'OPEN'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {t.status}
                  </span>
                  <Link
                    href={`/admin/support?ticket=${t.id}`}
                    className="px-3 py-1 rounded-xl bg-neutral-100 hover:bg-[#24422E] hover:text-white text-neutral-700 font-bold text-[11px] transition-all"
                  >
                    Open in Desk
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
