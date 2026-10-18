import { query, queryOne } from '@/lib/db';
import { appConfig } from '@/lib/config';
import { SiteSettings, Testimonial, FaqItem } from '@/types';

export async function getAllSiteSettings(): Promise<SiteSettings> {
  const rows = await query<{ setting_key: string; setting_value: any }>(
    'SELECT setting_key, setting_value FROM site_settings'
  );

  const map: Record<string, any> = {};
  for (const r of rows) {
    try {
      map[r.setting_key] = typeof r.setting_value === 'string'
        ? JSON.parse(r.setting_value)
        : r.setting_value;
    } catch {
      map[r.setting_key] = r.setting_value;
    }
  }

  return {
    siteInfo: map['site_info'] || {
      brandName: appConfig.brandName,
      tagline: 'Ghar jaisa Khana ♡',
      heroHeadline: 'Good Food Everyday',
      heroHighlightWord: 'Everyday',
      heroSubtext: `${appConfig.brandName} connects you with authentic homemade meals straight from trusted neighborhood kitchens.`,
      ctaPrimaryText: 'Find Tiffin Partner',
      ctaSecondaryText: 'Become a Partner',
    },
    pricing: map['pricing'] || {
      premiumPrice: appConfig.premiumPrice,
      freeImageLimit: appConfig.freeImageLimit,
      subscriptionDurationDays: appConfig.subscriptionDurationDays,
      features: [
        'Unlimited food & kitchen gallery images',
        'Featured "Recommended" badge on cards',
        'Top placement in search results',
        'Direct customer Call and WhatsApp leads',
      ],
    },
    contactInfo: map['contact_info'] || {
      phone: appConfig.support.phone,
      whatsapp: appConfig.support.whatsapp,
      email: appConfig.support.email,
      address: 'Green Glen Layout, Bellandur, Bengaluru 560103',
      hours: 'Mon-Sun, 7:00 AM - 10:00 PM IST',
    },
    features: map['features'] || [
      {
        title: 'Freshly Cooked',
        subtitle: 'Everyday',
        description: 'Prepared fresh every morning and evening with clean ingredients and pure love.',
        icon: 'leaf',
      },
      {
        title: 'Trusted Kitchens',
        subtitle: 'Home chefs & families',
        description: 'Verified home cooks who take immense pride in their recipes and cleanliness.',
        icon: 'chef',
      },
      {
        title: 'On-Time Delivery',
        subtitle: 'Hot & fresh',
        description: 'Delivered straight to your doorstep right before lunch or dinner time.',
        icon: 'truck',
      },
    ],
  };
}

export async function getFaqs(category?: string): Promise<FaqItem[]> {
  const sql = category
    ? 'SELECT id, category, question, answer FROM faqs WHERE is_active = true AND category = ? ORDER BY sort_order ASC'
    : 'SELECT id, category, question, answer FROM faqs WHERE is_active = true ORDER BY sort_order ASC';

  const params = category ? [category] : [];
  return query<FaqItem>(sql, params);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await query<any>(
    'SELECT id, author_name, role_or_city, quote, rating, avatar_url FROM testimonials WHERE is_featured = true ORDER BY sort_order ASC'
  );

  return rows.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    roleOrCity: r.role_or_city,
    quote: r.quote,
    rating: r.rating,
    avatarUrl: r.avatar_url,
  }));
}

export async function getPlatformStats() {
  const [partnerCount] = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM partner_profiles WHERE is_suspended = false'
  );
  const [customerCount] = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM customer_profiles'
  );
  const [reviewCount] = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM reviews'
  );
  const [mealCount] = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM products WHERE is_active = true'
  );

  return {
    verifiedPartners: partnerCount?.count || 12,
    happyCustomers: customerCount?.count || 120,
    totalReviews: reviewCount?.count || 48,
    activeMeals: mealCount?.count || 36,
    avgRating: 4.8,
  };
}
