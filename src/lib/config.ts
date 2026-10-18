
export const appConfig = {
  brandName:
    process.env.NEXT_PUBLIC_BRAND_NAME ||
    process.env.BRAND_NAME ||
    'TiffinGhar',
  tagline: 'Ghar Jaisa Khana',
  premiumPrice: parseInt(
    process.env.NEXT_PUBLIC_PREMIUM_PRICE || process.env.PREMIUM_PRICE || '49',
    10
  ),
  freeImageLimit: parseInt(
    process.env.NEXT_PUBLIC_FREE_IMAGE_LIMIT || process.env.FREE_IMAGE_LIMIT || '3',
    10
  ),
  subscriptionDurationDays: parseInt(
    process.env.SUBSCRIPTION_DURATION_DAYS || '30',
    10
  ),
  loginPopupDelaySeconds: parseInt(
    process.env.NEXT_PUBLIC_LOGIN_POPUP_DELAY_SECONDS ||
      process.env.LOGIN_POPUP_DELAY_SECONDS ||
      '15',
    10
  ),
  reminderDaysBeforeExpiry: parseInt(
    process.env.REMINDER_DAYS_BEFORE_EXPIRY || '3',
    10
  ),
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
    email: process.env.SUPPORT_EMAIL || 'support@tiffinghar.local',
    phone: process.env.SUPPORT_PHONE || '+91 98765 43210',
    whatsapp: process.env.SUPPORT_WHATSAPP || '+91 98765 43210',
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
