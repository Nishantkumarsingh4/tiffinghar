export const appConfig = {
  brandName: 'TiffinGhar',
  tagline: 'Ghar Jaisa Khana',
  premiumPrice: 49,
  freeImageLimit: 3,
  subscriptionDurationDays: 30,
  loginPopupDelaySeconds: 15,
  reminderDaysBeforeExpiry: 3,
  adminEmail: process.env.ADMIN_EMAIL || 'nisant746181@mail.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'nishant123',
  jwtSecret: process.env.JWT_SECRET || 'tiffinghar_secure_jwt_token_key_fallback_2026',
  cookieSecret: process.env.COOKIE_SECRET || 'tiffinghar_cookie_secret_fallback',
  cookieName: 'tiffinghar_session',
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_tiffinghar_demo_key',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_tiffinghar_demo_secret',
  },
  support: {
    email: 'support@tiffinghar.local',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

/**
 * Generates human-friendly IDs like CUS-000001, TIF-000001, PAY-000001, TKT-000001
 */
export function formatHumanId(prefix: 'CUS' | 'TIF' | 'PAY' | 'TKT' | 'USR', numericId: number): string {
  return `${prefix}-${numericId.toString().padStart(6, '0')}`;
}

export default appConfig;
