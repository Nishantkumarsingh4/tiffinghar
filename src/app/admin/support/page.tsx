'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MessageSquare,
  Send,
  User,
  ExternalLink,
  CheckCheck,
  Check,
  Clock,
  Shield,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';

function AdminSupportInboxContent() {
  const searchParams = useSearchParams();
  const initialTicketParam = searchParams.get('ticket');

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadTickets() {
    try {
      const res = await fetch(`/api/support/tickets?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setTickets(json.tickets || []);
        if (json.tickets.length > 0 && !selectedTicket) {
          if (initialTicketParam) {
            const found = json.tickets.find((t: any) => t.id === parseInt(initialTicketParam, 10) || t.human_id === initialTicketParam);
            if (found) {
              selectTicket(found);
              return;
            }
          }
          selectTicket(json.tickets[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  async function selectTicket(ticket: any) {
    setSelectedTicket(ticket);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticket.id}/messages`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyText('');
        setMessages((prev) => [...prev, json.message]);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSendLoading(false);
    }
  }

  async function updateTicketStatus(newStatus: string) {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
        loadTickets();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
          Support & Helpdesk Desk
        </span>
        <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
          Support Inbox & Active Conversations
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Communicate directly with customers and partner kitchens with real-time read receipts.
        </p>
      </div>

      {/* Main Two Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left: Tickets List */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col overflow-hidden">
          {/* Search & Tabs */}
          <div className="p-4 border-b border-neutral-100 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search ticket ID, email, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTickets()}
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 rounded-xl text-xs border border-neutral-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-[#24422E] text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-3 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-xs text-neutral-400 p-8 text-center">No tickets found</p>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => selectTicket(t)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-l-4 border-l-[#24422E]'
                        : 'hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#E4753F]">
                          {t.human_id}
                        </span>
                        {t.unread_messages > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold animate-pulse">
                            {t.unread_messages} NEW
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'OPEN'
                            ? 'bg-rose-50 text-rose-700'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1F2823] line-clamp-1">{t.subject}</h4>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{t.message}</p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-400 font-mono">
                      <span>{t.customer_name || t.kitchen_name || t.guest_name || t.user_email}</span>
                      <span>{new Date(t.updated_at || t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Ticket Chat & Linked 360 User Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Ticket Topbar */}
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-4 bg-[#FAF7F2]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#E4753F]">
                      {selectedTicket.human_id}
                    </span>
                    <h3 className="font-bold text-sm text-[#1F2823]">{selectedTicket.subject}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    {selectedTicket.customer_human_id ? (
                      <Link
                        href={`/admin/customers/${selectedTicket.customer_human_id}`}
                        className="font-bold text-[#24422E] hover:underline flex items-center gap-1"
                      >
                        <span>Customer: {selectedTicket.customer_name} ({selectedTicket.customer_human_id})</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : selectedTicket.partner_human_id ? (
                      <Link
                        href={`/admin/partners/${selectedTicket.partner_human_id}`}
                        className="font-bold text-[#24422E] hover:underline flex items-center gap-1"
                      >
                        <span>Kitchen: {selectedTicket.kitchen_name} ({selectedTicket.partner_human_id})</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span>Guest: {selectedTicket.guest_name || selectedTicket.guest_email}</span>
                    )}
                  </div>
                </div>

                {/* Status Switcher */}
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFBF8]">
                {chatLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-6 h-6 border-3 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.sender_role === 'ADMIN';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                            isAdmin
                              ? 'bg-[#24422E] text-white rounded-br-xs'
                              : 'bg-white border border-neutral-200/80 text-neutral-800 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${
                              isAdmin ? 'text-emerald-200' : 'text-neutral-400'
                            }`}
                          >
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isAdmin && (
                              <span>
                                {m.is_read ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-300" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-100 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type an official admin reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#24422E]/20"
                />
                <button
                  type="submit"
                  disabled={sendLoading || !replyText.trim()}
                  className="px-4 py-2.5 bg-[#24422E] text-white rounded-2xl text-xs font-bold hover:bg-[#1b3223] disabled:opacity-40 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 text-xs">
              <MessageSquare className="w-8 h-8 text-neutral-300 mb-2" />
              <p>Select a ticket from the left panel to begin support</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSupportInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-[#24422E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminSupportInboxContent />
    </Suspense>
  );
}
