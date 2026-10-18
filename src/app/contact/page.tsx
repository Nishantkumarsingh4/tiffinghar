'use client';

import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function ContactPage() {
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'PARTNER' | 'OTHER'>('CUSTOMER');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmittedTicket(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          role,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit message');
      }

      setSubmittedTicket(data.ticketId);
      success(`Ticket ${data.ticketId} created! Our support team will reach out soon.`);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            We're Here to Help
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1F2823] tracking-tight">
            Contact & Support
          </h1>
          <p className="text-[#5E6961] text-base">
            Have questions about a meal order, need help customizing your subscription, or want to partner with us? Send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-[#1F2823]">
                Direct Support Channels
              </h2>

              <div className="space-y-5">
                <a
                  href="tel:+919876543210"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF7F2] hover:bg-neutral-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#24422E] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#E4753F]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Customer Helpline
                    </h3>
                    <p className="text-base font-bold text-[#1F2823] group-hover:text-[#24422E]">
                      +91 98765 43210
                    </p>
                    <span className="text-xs text-neutral-500">
                      Toll-free daily 7 AM - 10 PM
                    </span>
                  </div>
                </a>

                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/60 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      WhatsApp Quick Help
                    </h3>
                    <p className="text-base font-bold text-[#1F2823] group-hover:text-emerald-900">
                      Chat on WhatsApp
                    </p>
                    <span className="text-xs text-emerald-700">
                      Instant response for meal changes
                    </span>
                  </div>
                </a>

                <a
                  href="mailto:support@tiffinghar.local"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF7F2] hover:bg-neutral-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Official Email
                    </h3>
                    <p className="text-base font-bold text-[#1F2823] group-hover:text-neutral-900">
                      support@tiffinghar.local
                    </p>
                    <span className="text-xs text-neutral-500">
                      Average response under 2 hours
                    </span>
                  </div>
                </a>
              </div>

              <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs text-[#5E6961]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#E4753F] shrink-0 mt-0.5" />
                  <span>
                    4th Floor, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <span>Operating Hours: Monday – Sunday, 7:00 AM – 10:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Support Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-6 sm:p-10 border border-neutral-200/80 shadow-md">
              <h2 className="text-2xl font-bold text-[#1F2823] mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-[#5E6961] mb-8">
                Every message creates an official support ticket tracked until resolved.
              </p>

              {submittedTicket && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold">Ticket Created Successfully!</h3>
                    <p className="text-xs mt-1">
                      Your reference ID is <strong className="font-mono text-emerald-800">{submittedTicket}</strong>. We have logged your request.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                      I Am A
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
                    >
                      <option value="CUSTOMER">Customer / Subscriber</option>
                      <option value="PARTNER">Tiffin Partner / Home Chef</option>
                      <option value="OTHER">Corporate / Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question about daily deliveries in Koramangala"
                    className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query or requirement..."
                    className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white font-bold text-sm shadow-md shadow-[#24422E]/15 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Submitting ticket...' : 'Submit Support Ticket'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
