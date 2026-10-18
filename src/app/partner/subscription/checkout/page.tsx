'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Check, ShieldCheck, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '@/components/ToastProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function initOrder() {
      try {
        const res = await fetch('/api/payments/create-order', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setOrder(data);
        } else {
          error(data.error || 'Failed to initialize payment');
        }
      } catch (err) {
        error('Payment initialization error');
      } finally {
        setLoading(false);
      }
    }
    initOrder();
  }, [error]);

  const handleSimulatePayment = async () => {
    if (!order) return;
    setProcessing(true);

    try {
      // Simulate Razorpay signature verification
      const paymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}`;
      const signature = `test_sig_${Math.random().toString(36).substring(2, 15)}`;

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: order.orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setPaymentSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      success('Premium subscription activated instantly!');

      setTimeout(() => {
        router.push('/partner/dashboard');
      }, 2500);
    } catch (err: any) {
      error(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center animate-pulse">
        <div className="h-48 bg-white rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/partner/subscription"
          className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1F2823]">
            Upgrade to Premium Plan
          </h1>
          <p className="text-xs text-[#5E6961]">
            Razorpay Secure Checkout (Test Mode)
          </p>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="rounded-3xl bg-white p-8 border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F2823]">Payment Successful!</h2>
          <p className="text-sm text-[#5E6961] max-w-sm mx-auto">
            Your 30-day Premium Subscription has been activated. Unlimited food photos and your "Recommended" badge are now live!
          </p>
          <p className="text-xs text-neutral-400">
            Redirecting to your dashboard in a moment...
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/80 shadow-md space-y-6">
          {/* Order Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1F2823]">
                  {order?.planName || 'Partner Premium (30 Days)'}
                </h3>
                <span className="text-xs text-neutral-500">Auto-renewal optional</span>
              </div>
              <span className="text-xl font-black text-[#24422E]">
                ₹{order?.amount}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-200 text-xs text-[#5E6961] space-y-1">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-neutral-800">30 Days</span>
              </div>
              <div className="flex justify-between">
                <span>Order Reference</span>
                <span className="font-mono text-neutral-800">{order?.orderId}</span>
              </div>
            </div>
          </div>

          {/* Included Features */}
          <div className="space-y-2.5 text-xs text-neutral-700">
            <span className="font-bold text-neutral-900 block mb-1">
              Instant Features Unlocked:
            </span>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Unlimited dish & kitchen gallery photo uploads</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>"Recommended" badge highlighting your card in search</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Top priority placement across all neighborhood listings</span>
            </div>
          </div>

          {/* Payment Action */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleSimulatePayment}
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-[#E4753F] hover:bg-[#D3632D] text-white font-bold text-sm shadow-lg shadow-[#E4753F]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CreditCard className="w-4 h-4" />
              <span>{processing ? 'Processing Payment...' : `Pay ₹${order?.amount} with Razorpay`}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <Lock className="w-3 h-3 text-neutral-400" />
              <span>256-bit encrypted test mode checkout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
