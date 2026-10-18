'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  Pin,
  Crown,
  Eye,
  Star,
  PhoneCall,
  MessageCircle,
  UtensilsCrossed,
  CreditCard,
  LifeBuoy,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Shield,
} from 'lucide-react';

export default function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [rankInput, setRankInput] = useState<number>(0);

  async function loadDetails() {
    try {
      const res = await fetch(`/api/admin/partners/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setRankInput(json.partner.admin_rank || 0);
      }
    } catch (err) {
      console.error('Failed to load partner details:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function handleAction(action: string, value?: any) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/partners/${id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      const json = await res.json();
      if (json.success) {
        await loadDetails();
      } else {
        alert(json.error || 'Action failed');
      }
    } catch (err) {
      console.error('Action error:', err);
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

  if (!data?.partner) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
        <h2 className="text-lg font-bold text-neutral-800">Partner Kitchen Not Found</h2>
        <Link
          href="/admin/partners"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#E4753F] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Partners
        </Link>
      </div>
    );
  }

  const { partner, products, subscriptions, payments, recentViews, contactClicks, reviews, tickets } = data;

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/partners"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#1F2823] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Partners</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/partner/${partner.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all"
          >
            <span>Live Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-neutral-100 text-[#E4753F]">
            {partner.human_id}
          </span>
        </div>
      </div>

      {/* 360 Partner Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#24422E] flex items-center justify-center font-black text-2xl shrink-0">
              {partner.kitchen_name?.charAt(0) || 'K'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-[#1F2823]">{partner.kitchen_name}</h1>
                {partner.is_verified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                ) : null}
                {partner.is_premium_active ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                    <Crown className="w-3 h-3" /> ACTIVE PREMIUM
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                    FREE TIER
                  </span>
                )}
                {partner.is_pinned ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#E4753F] border border-orange-200 text-[10px] font-extrabold">
                    <Pin className="w-3 h-3" /> PINNED TO TOP
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Owner: <span className="font-bold text-neutral-800">{partner.owner_name}</span> •{' '}
                <span className="font-mono">{partner.email}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleAction('toggle_verify')}
              disabled={actionLoading}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                partner.is_verified
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              {partner.is_verified ? 'Remove Verified Badge' : 'Grant Verified Badge'}
            </button>

            <button
              onClick={() => handleAction('toggle_pin')}
              disabled={actionLoading}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                partner.is_pinned
                  ? 'border-orange-200 bg-orange-50 text-[#E4753F]'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              {partner.is_pinned ? 'Unpin' : 'Pin to Top'}
            </button>

            <button
              onClick={() => handleAction('toggle_suspend')}
              disabled={actionLoading}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                partner.is_suspended
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              {partner.is_suspended ? 'Unsuspend Partner' : 'Suspend Partner'}
            </button>
          </div>
        </div>

        {/* Rank & Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>Call: {partner.contact_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>WhatsApp: {partner.contact_whatsapp || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>{partner.city}, {partner.area} {partner.pincode ? `(${partner.pincode})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>FSSAI: {partner.fssai_number || 'Not provided'}</span>
          </div>
        </div>

        {/* Priority Rank Control */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-700">Display Priority Rank (higher = shows earlier):</span>
            <input
              type="number"
              value={rankInput}
              onChange={(e) => setRankInput(parseInt(e.target.value, 10) || 0)}
              className="w-20 px-2.5 py-1 text-xs border border-neutral-200 rounded-lg text-center font-bold"
            />
            <button
              onClick={() => handleAction('set_rank', rankInput)}
              disabled={actionLoading}
              className="px-3 py-1 rounded-lg bg-[#24422E] text-white text-xs font-bold hover:bg-[#1b3223]"
            >
              Save Rank
            </button>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            Joined: {new Date(partner.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 overflow-x-auto text-xs font-bold">
        {[
          { id: 'products', label: `Dishes & Meals (${products?.length || 0})`, icon: UtensilsCrossed },
          { id: 'subscriptions', label: `Subscriptions & Billing (${subscriptions?.length || 0})`, icon: CreditCard },
          { id: 'views', label: `Customer View Logs (${recentViews?.length || 0})`, icon: Eye },
          { id: 'leads', label: `Contact Inquiries (${contactClicks?.length || 0})`, icon: PhoneCall },
          { id: 'reviews', label: `Reviews Received (${reviews?.length || 0})`, icon: Star },
          { id: 'tickets', label: `Support Tickets (${tickets?.length || 0})`, icon: LifeBuoy },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
        {/* Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-[#1F2823]">Menu & Dishes Offered</h3>
            {products?.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No dishes added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              p.is_veg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          ></span>
                          <h4 className="text-sm font-bold text-[#1F2823]">{p.name}</h4>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      <span className="text-sm font-black text-[#24422E] shrink-0">₹{p.price}</span>
                    </div>

                    {/* Image gallery */}
                    {p.images && p.images.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pt-2">
                        {p.images.map((img: any) => (
                          <img
                            key={img.id}
                            src={img.image_url}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscriptions & Payments */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-[#1F2823] mb-4">Subscription History</h3>
              {subscriptions?.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">No subscriptions on record.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-neutral-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Start Date</th>
                        <th className="py-2.5 px-3">End Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment ID</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {subscriptions.map((s: any) => (
                        <tr key={s.id}>
                          <td className="py-3 px-3 font-bold text-[#1F2823]">{s.plan}</td>
                          <td className="py-3 px-3 font-mono">{new Date(s.start_date).toLocaleDateString()}</td>
                          <td className="py-3 px-3 font-mono">{new Date(s.end_date).toLocaleDateString()}</td>
                          <td className="py-3 px-3 font-bold">₹{s.amount}</td>
                          <td className="py-3 px-3 font-mono text-[#E4753F]">{s.payment_human_id || '—'}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                s.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-base font-black text-[#1F2823] mb-4">Payment Transactions</h3>
              {payments?.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">No payment transactions recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-neutral-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Payment ID</th>
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Razorpay ID</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium font-mono">
                      {payments.map((pay: any) => (
                        <tr key={pay.id}>
                          <td className="py-3 px-3 font-bold text-[#E4753F]">{pay.human_id}</td>
                          <td className="py-3 px-3 text-neutral-500">{pay.razorpay_order_id}</td>
                          <td className="py-3 px-3 text-neutral-500">{pay.razorpay_payment_id || '—'}</td>
                          <td className="py-3 px-3 font-bold text-neutral-800">₹{pay.amount}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                pay.status === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {pay.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-neutral-500">{new Date(pay.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Views */}
        {activeTab === 'views' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-[#1F2823]">Recent Customer Visits</h3>
            {recentViews?.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No views logged yet.</p>
            ) : (
              <div className="divide-y divide-neutral-100 text-xs">
                {recentViews.map((v: any) => (
                  <div key={v.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">
                        {v.customer_name ? v.customer_name.charAt(0) : 'U'}
                      </div>
                      <div>
                        {v.customer_name ? (
                          <Link
                            href={`/admin/customers/${v.customer_human_id}`}
                            className="font-bold text-[#1F2823] hover:text-[#E4753F]"
                          >
                            {v.customer_name} ({v.customer_human_id})
                          </Link>
                        ) : (
                          <span className="font-mono text-neutral-500">Unauthenticated Visitor</span>
                        )}
                        <p className="text-[10px] text-neutral-400 font-mono">IP: {v.ip_address || '127.0.0.1'}</p>
                      </div>
                    </div>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Leads */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-[#1F2823]">Call & WhatsApp Leads</h3>
            {contactClicks?.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No contact inquiries recorded yet.</p>
            ) : (
              <div className="divide-y divide-neutral-100 text-xs">
                {contactClicks.map((c: any) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
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
                        <p className="font-bold text-[#1F2823]">
                          {c.customer_name ? (
                            <Link href={`/admin/customers/${c.customer_human_id}`} className="hover:underline">
                              {c.customer_name}
                            </Link>
                          ) : (
                            'Guest Customer'
                          )}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {new Date(c.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded-full bg-neutral-100">
                      {c.click_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-[#1F2823]">Customer Reviews & Feedback</h3>
            {reviews?.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No reviews received yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/admin/customers/${r.customer_human_id}`}
                        className="text-xs font-bold text-[#1F2823] hover:text-[#E4753F]"
                      >
                        {r.customer_name} ({r.customer_human_id})
                      </Link>
                      <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                        <span>★</span> {r.rating} / 5
                      </div>
                    </div>
                    <p className="text-xs text-neutral-700 italic">&ldquo;{r.comment}&rdquo;</p>
                    {r.partner_reply && (
                      <div className="p-3 bg-white rounded-xl border border-neutral-200/60 text-xs">
                        <span className="font-bold text-[#24422E]">Kitchen Reply: </span>
                        <span className="text-neutral-600">{r.partner_reply}</span>
                      </div>
                    )}
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Support Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-[#1F2823]">Support Tickets</h3>
            {tickets?.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No support tickets raised.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {tickets.map((t: any) => (
                  <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#E4753F]">{t.human_id}</span>
                        <p className="font-bold text-[#1F2823]">{t.subject}</p>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/admin/support?ticket=${t.id}`}
                      className="px-3 py-1 rounded-xl bg-neutral-100 hover:bg-[#24422E] hover:text-white text-neutral-700 font-bold text-[11px]"
                    >
                      Open Ticket
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
