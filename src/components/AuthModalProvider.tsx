'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Lock, Mail, User, Phone, MapPin, Building, ArrowRight, CheckCircle2, ShieldCheck, ChefHat } from 'lucide-react';
import { useToast } from './ToastProvider';
import { appConfig } from '@/lib/config';

interface UserSessionInfo {
  userId: number;
  humanId: string;
  email: string;
  role: 'CUSTOMER' | 'PARTNER' | 'ADMIN';
  fullName: string;
  partnerProfileId?: number | null;
  customerProfileId?: number | null;
}

interface AuthModalContextValue {
  isModalOpen: boolean;
  openLoginModal: (preferredRole?: 'CUSTOMER' | 'PARTNER') => void;
  closeLoginModal: () => void;
  currentUser: UserSessionInfo | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

export default function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'CUSTOMER' | 'PARTNER'>('CUSTOMER');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [currentUser, setCurrentUser] = useState<UserSessionInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [kitchenName, setKitchenName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('Koramangala');

  const { success, error, info } = useToast();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          return;
        }
      }
      setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Auto-open modal if URL contains authRequired=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('authRequired') === 'true') {
        setIsModalOpen(true);
        setAuthMode('LOGIN');
      }
    }
  }, []);

  // Auto popup after 15 seconds for unauthenticated visitors (unless dismissed in this session)
  useEffect(() => {
    const delay = (appConfig.loginPopupDelaySeconds || 15) * 1000;
    const dismissed = typeof window !== 'undefined' ? sessionStorage.getItem('tiffinghar_auth_dismissed') : null;

    if (dismissed || currentUser) return;

    const timer = setTimeout(() => {
      if (!currentUser && !sessionStorage.getItem('tiffinghar_auth_dismissed')) {
        setIsModalOpen(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const openLoginModal = useCallback((preferredRole?: 'CUSTOMER' | 'PARTNER') => {
    if (preferredRole) {
      setActiveRole(preferredRole);
    }
    setAuthMode('LOGIN');
    setIsModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsModalOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tiffinghar_auth_dismissed', 'true');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole: activeRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      success(`Welcome back, ${data.user.fullName || data.user.email}!`);
      setCurrentUser(data.user);
      closeLoginModal();

      // Redirect according to role
      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        role: activeRole,
        email,
        password,
        phone,
      };

      if (activeRole === 'CUSTOMER') {
        payload.fullName = fullName;
      } else {
        payload.ownerName = fullName;
        payload.kitchenName = kitchenName;
        payload.city = city;
        payload.area = area;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      success('Registration successful! Logging you in...');
      setCurrentUser(data.user);
      closeLoginModal();

      if (data.user.role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      info(data.message || 'If that email exists, reset instructions have been logged to console.');
      setAuthMode('LOGIN');
    } catch (err: any) {
      error(err.message || 'Failed to process password reset');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      success('Logged out successfully');
      router.push('/');
      router.refresh();
    } catch {
      error('Failed to log out');
    }
  };

  return (
    <AuthModalContext.Provider
      value={{
        isModalOpen,
        openLoginModal,
        closeLoginModal,
        currentUser,
        refreshUser,
        logout,
      }}
    >
      {children}

      {/* Global Auth Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/80 my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-4 sm:mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#24422E]/10 text-[#24422E] mb-2">
                {activeRole === 'PARTNER' ? (
                  <ChefHat className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1F2823] tracking-tight">
                {authMode === 'LOGIN' && `Welcome to ${appConfig.brandName}`}
                {authMode === 'REGISTER' && `Create your ${activeRole === 'PARTNER' ? 'Partner' : 'Customer'} Account`}
                {authMode === 'FORGOT' && 'Reset your Password'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5E6961] mt-0.5 font-medium">
                {authMode === 'LOGIN' && 'Sign in to discover authentic home cooked meals & connect with chefs'}
                {authMode === 'REGISTER' && 'Join thousands of food lovers & trusted home kitchens'}
                {authMode === 'FORGOT' && 'Enter your registered email to receive a password recovery link'}
              </p>
            </div>

            {/* Role Switcher Tabs */}
            {authMode !== 'FORGOT' && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-200/60 rounded-2xl mb-4 sm:mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveRole('CUSTOMER')}
                  className={`py-2 px-2 rounded-xl transition-all ${
                    activeRole === 'CUSTOMER'
                      ? 'bg-white text-[#24422E] shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('PARTNER')}
                  className={`py-2 px-2 rounded-xl transition-all ${
                    activeRole === 'PARTNER'
                      ? 'bg-white text-[#24422E] shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Tiffin Partner
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === 'LOGIN' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeRole === 'PARTNER' ? 'partner@kitchen.com' : 'you@example.com'}
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase text-neutral-600">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('FORGOT')}
                      className="text-xs font-medium text-[#E4753F] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white font-semibold text-sm transition-all shadow-md shadow-[#24422E]/15 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading
                    ? 'Signing in...'
                    : `Sign in as ${activeRole === 'PARTNER' ? 'Partner' : 'Customer'}`}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-neutral-500 pt-1">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('REGISTER')}
                    className="font-semibold text-[#E4753F] hover:underline"
                  >
                    Register now
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER FORM */}
            {authMode === 'REGISTER' && (
              <form onSubmit={handleRegister} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    {activeRole === 'PARTNER' ? 'Chef / Owner Full Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sunita Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs font-medium"
                    />
                  </div>
                </div>

                {activeRole === 'PARTNER' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Kitchen / Tiffin Service Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={kitchenName}
                        onChange={(e) => setKitchenName(e.target.value)}
                        placeholder="e.g. Annapurna Homestyle Meals"
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs font-medium"
                    />
                  </div>
                </div>

                {activeRole === 'PARTNER' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                        Area
                      </label>
                      <input
                        type="text"
                        required
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Koramangala"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Set Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white font-bold text-xs transition-all shadow-md shadow-[#24422E]/15 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? 'Creating account...' : `Register as ${activeRole === 'PARTNER' ? 'Partner' : 'Customer'}`}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-center text-xs text-neutral-500 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="font-semibold text-[#E4753F] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === 'FORGOT' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#24422E] hover:bg-[#1E3626] text-white font-semibold text-sm transition-all shadow-md shadow-[#24422E]/15 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending link...' : 'Send Recovery Link'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
