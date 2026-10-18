'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Utensils } from 'lucide-react';
import { useAuthModal } from '@/components/AuthModalProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuthModal();

  const [email, setEmail] = useState('nisant746181@mail.com');
  const [password, setPassword] = useState('nishant123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole: 'ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Admin authentication failed');
      }

      await refreshUser();
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 flex flex-col items-center justify-start px-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-100/40 via-amber-100/30 to-orange-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#24422E]/10 border border-[#24422E]/15 text-[#24422E] text-xs font-bold tracking-wide mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Super Admin Gateway</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/80">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#24422E]/10 text-[#24422E] mb-3">
            <ShieldCheck className="w-6 h-6 text-[#24422E]" />
          </div>
          <h1 className="text-2xl font-black text-[#1F2823] tracking-tight">
            Admin Console Login
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Enter administrative credentials to access platform controls.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tiffinghar.local"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E] text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E]/20 focus:border-[#24422E] text-xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Seeded helper reminder */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
            <span>Pre-filled with seeded admin credentials</span>
            <span className="font-bold font-mono">nishant123</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#24422E] hover:bg-[#1b3223] text-white font-bold text-xs shadow-md shadow-[#24422E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Sign in as Super Admin'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-neutral-500 hover:text-[#24422E] transition-colors"
          >
            &larr; Return to Live Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
