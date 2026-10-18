'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Phone,
  MessageCircle,
  Send,
  Plus,
  Clock,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react';
import { useAuthModal } from './AuthModalProvider';

export default function SupportWidget() {
  const { currentUser } = useAuthModal();
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'new_ticket' | 'chat'>('home');
  const [supportInfo, setSupportInfo] = useState({
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    hours: '9 AM - 9 PM IST',
  });

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [subject, setSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.settings) {
          setSupportInfo({
            phone: json.settings.contact_phone || '+91 98765 43210',
            whatsapp: json.settings.contact_whatsapp || '+91 98765 43210',
            hours: json.settings.support_hours || '9 AM - 9 PM IST',
          });
        }
      } catch (e) {
        console.error('Support settings load error:', e);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadTickets();
    }
  }, [isOpen, currentUser]);

  async function loadTickets() {
    try {
      const res = await fetch('/api/support/tickets');
      const json = await res.json();
      if (json.success) {
        setTickets(json.tickets || []);
      }
    } catch (e) {
      console.error('Load user tickets error:', e);
    }
  }

  async function openTicketChat(ticket: any) {
    setSelectedTicket(ticket);
    setActiveView('chat');
    try {
      const res = await fetch(`/api/support/tickets/${ticket.id}/messages`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.messages || []);
      }
    } catch (e) {
      console.error('Load messages error:', e);
    }
  }

  // Periodic polling for new messages when chat is open
  useEffect(() => {
    if (activeView !== 'chat' || !selectedTicket) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`);
        const json = await res.json();
        if (json.success) {
          setMessages(json.messages || []);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [activeView, selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !ticketMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message: ticketMessage, priority }),
      });
      const json = await res.json();
      if (json.success) {
        setSubject('');
        setTicketMessage('');
        await loadTickets();
        openTicketChat(json.ticket);
      } else {
        alert(json.error || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error('Submit ticket error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

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
    }
  }

  // Clean whatsapp phone for url
  const cleanPhone = supportInfo.whatsapp.replace(/[^0-9]/g, '');

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#24422E] text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white/80 group"
          aria-label="Contact Customer Support"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Floating Support Modal Card */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[520px] bg-white rounded-3xl shadow-2xl border border-neutral-200/80 z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#24422E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeView !== 'home' && (
                <button
                  onClick={() => setActiveView('home')}
                  className="p-1 hover:bg-white/10 rounded-lg mr-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h3 className="font-black text-sm tracking-tight">TiffinGhar Helpdesk</h3>
                <p className="text-[10px] text-emerald-200">
                  {activeView === 'chat' && selectedTicket
                    ? `Ticket: ${selectedTicket.human_id}`
                    : `Active Support • ${supportInfo.hours}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW: HOME */}
          {activeView === 'home' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]">
              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${supportInfo.phone}`}
                  className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-neutral-200 text-xs font-bold text-[#1F2823] hover:border-[#24422E] shadow-2xs transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call Support</span>
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}?text=Hi%20TiffinGhar%20Support`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-neutral-200 text-xs font-bold text-[#1F2823] hover:border-[#24422E] shadow-2xs transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Tickets Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                    My Support Tickets
                  </h4>
                  {currentUser && (
                    <button
                      onClick={() => setActiveView('new_ticket')}
                      className="text-xs font-bold text-[#E4753F] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Raise Ticket
                    </button>
                  )}
                </div>

                {!currentUser ? (
                  <div className="p-4 bg-white rounded-2xl border border-neutral-200 text-center space-y-2">
                    <p className="text-xs text-neutral-600">
                      Sign in to submit tickets and chat directly with our resolution team.
                    </p>
                    <a
                      href="/contact"
                      className="inline-block text-xs font-bold text-[#24422E] underline"
                    >
                      Or submit guest contact form &rarr;
                    </a>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-5 bg-white rounded-2xl border border-neutral-200 text-center space-y-2">
                    <p className="text-xs text-neutral-500">No active tickets found.</p>
                    <button
                      onClick={() => setActiveView('new_ticket')}
                      className="px-4 py-2 bg-[#24422E] text-white text-xs font-bold rounded-xl"
                    >
                      Raise a Support Ticket
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openTicketChat(t)}
                        className="p-3 bg-white rounded-2xl border border-neutral-200/80 hover:border-[#24422E] cursor-pointer shadow-2xs transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[11px] text-[#E4753F]">
                            {t.human_id}
                          </span>
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
                        <p className="text-xs font-bold text-[#1F2823] mt-1 line-clamp-1">
                          {t.subject}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          {new Date(t.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: NEW TICKET */}
          {activeView === 'new_ticket' && (
            <form onSubmit={handleCreateTicket} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question about delivery, account..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your issue or inquiry in detail..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="flex-1 py-2 rounded-xl border text-xs font-bold bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-[#24422E] text-white text-xs font-bold hover:bg-[#1b3223] disabled:opacity-40"
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW: CHAT WITH ADMIN */}
          {activeView === 'chat' && selectedTicket && (
            <div className="flex-1 flex flex-col bg-[#FCFBF8]">
              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {messages.map((m) => {
                  const isMe = m.sender_role !== 'ADMIN';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-2.5 text-xs ${
                          isMe
                            ? 'bg-[#24422E] text-white rounded-br-xs'
                            : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.message}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                            isMe ? 'text-emerald-200' : 'text-neutral-400'
                          }`}
                        >
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            <span>
                              {m.is_read ? (
                                <CheckCheck className="w-3 h-3 text-emerald-300" />
                              ) : null}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendMessage} className="p-2.5 border-t border-neutral-100 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type a message to admin..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2 bg-[#24422E] text-white rounded-xl hover:bg-[#1b3223] disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
