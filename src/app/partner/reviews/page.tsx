'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, CornerDownRight } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function PartnerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const { success, error } = useToast();

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partner/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch {
      error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handlePostReply = async (reviewId: number) => {
    const text = replyTextMap[reviewId];
    if (!text || !text.trim()) return;

    setSubmittingId(reviewId);
    try {
      const res = await fetch('/api/partner/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reply: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post reply');

      success('Reply posted successfully!');
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, partner_reply: text, reply_created_at: new Date().toISOString() } : r
        )
      );
      setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (err: any) {
      error(err.message || 'Failed to post reply');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
          Customer Reviews & Ratings
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6961] mt-0.5">
          Read what daily diners love about your food and reply to their feedback.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8">
          <Star className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#1F2823]">No reviews received yet</h2>
          <p className="text-xs text-[#5E6961] mt-1">
            As diners order your meals and rate their experience, their feedback will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-3xl bg-white p-6 border border-neutral-200/80 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.customer_avatar || 'https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=100&q=80'}
                    alt={rev.customer_name}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2823]">{rev.customer_name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-neutral-400">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-[#1F2823] leading-relaxed pl-13">
                "{rev.comment}"
              </p>

              {/* Existing Partner Reply */}
              {rev.partner_reply ? (
                <div className="ml-8 p-4 rounded-2xl bg-[#FAF7F2] border border-neutral-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#24422E]">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Your Response:</span>
                  </div>
                  <p className="text-xs text-[#5E6961] leading-relaxed">
                    {rev.partner_reply}
                  </p>
                </div>
              ) : (
                /* Reply Box */
                <div className="ml-8 pt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a warm, polite response to this review..."
                      value={replyTextMap[rev.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })
                      }
                      className="flex-1 px-4 py-2 bg-[#FAF7F2] rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#24422E]"
                    />
                    <button
                      type="button"
                      disabled={submittingId === rev.id || !replyTextMap[rev.id]?.trim()}
                      onClick={() => handlePostReply(rev.id)}
                      className="px-4 py-2 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Reply</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
