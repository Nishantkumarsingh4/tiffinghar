'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useAuthModal } from '@/components/AuthModalProvider';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();
  const { success, error } = useToast();
  const { openLoginModal } = useAuthModal();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      error('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      success('Password reset successfully!');
      setTimeout(() => {
        router.push('/');
        openLoginModal();
      }, 1500);
    } catch (err: any) {
      error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-neutral-200">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#24422E]/10 text-[#24422E] flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#1F2823]">Create New Password</h1>
        <p className="text-sm text-[#5E6961] mt-1">
          Enter your new password below to regain access to your account.
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center py-6 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-neutral-900">Password Updated!</h2>
          <p className="text-sm text-neutral-600">
            Redirecting you to sign in with your new credentials...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Updating Password...' : 'Save & Login'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen py-20 bg-[#FAF7F2] flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-md text-center">
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
