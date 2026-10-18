import { query, queryOne } from '@/lib/db';
import { appConfig } from '@/lib/config';
import { PublicPartnerCard, PartnerDetail } from '@/types';

export interface PartnerFilterOptions {
  city?: string;
  area?: string;
  vegOnly?: boolean;
  search?: string;
  minRating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'recommended' | 'rating' | 'priceAsc' | 'priceDesc';
}

export async function getPublicPartners(options: PartnerFilterOptions = {}): Promise<{
  data: PublicPartnerCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 12));
  const offset = (page - 1) * limit;

  const whereClauses: string[] = ['p.is_suspended = false'];
  const params: any[] = [];

  if (options.city && options.city !== 'All') {
    whereClauses.push('p.city = ?');
    params.push(options.city);
  }

  if (options.area && options.area !== 'All') {
    whereClauses.push('p.area = ?');
    params.push(options.area);
  }

  if (options.search && options.search.trim()) {
    whereClauses.push('(p.kitchen_name LIKE ? OR p.bio LIKE ? OR p.area LIKE ?)');
    const searchTerm = `%${options.search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total matching partners
  const countSql = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM partner_profiles p
    ${whereSql}
  `;
  const [countResult] = await query<{ total: number }>(countSql, params);
  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Main query with subscription status, rating, and min price
  const now = new Date();
  const selectSql = `
    SELECT 
      p.id,
      p.human_id as humanId,
      p.kitchen_name as kitchenName,
      p.bio,
      p.cover_url as coverUrl,
      p.city,
      p.area,
      p.is_verified as isVerified,
      p.is_pinned as isPinned,
      p.admin_rank as adminRank,
      p.plan_type as planType,
      COALESCE(sub.is_active, 0) as isPremium,
      COALESCE(rv.avg_rating, 5.0) as averageRating,
      COALESCE(rv.review_count, 0) as totalReviews,
      COALESCE(prod.min_price, 99) as priceStartingFrom,
      COALESCE(prod.has_veg, 1) as hasVeg,
      COALESCE(prod.has_nonveg, 0) as hasNonVeg
    FROM partner_profiles p
    LEFT JOIN (
      SELECT partner_id, 1 as is_active
      FROM subscriptions
      WHERE status = 'ACTIVE' AND start_date <= NOW() AND end_date > NOW()
      GROUP BY partner_id
    ) sub ON sub.partner_id = p.id
    LEFT JOIN (
      SELECT 
        partner_id, 
        ROUND(AVG(rating), 1) as avg_rating, 
        COUNT(id) as review_count
      FROM reviews
      GROUP BY partner_id
    ) rv ON rv.partner_id = p.id
    LEFT JOIN (
      SELECT 
        partner_id,
        MIN(price) as min_price,
        MAX(CASE WHEN is_veg = 1 THEN 1 ELSE 0 END) as has_veg,
        MAX(CASE WHEN is_veg = 0 THEN 1 ELSE 0 END) as has_nonveg
      FROM products
      WHERE is_active = true
      GROUP BY partner_id
    ) prod ON prod.partner_id = p.id
    ${whereSql}
    ORDER BY 
      p.is_pinned DESC,
      isPremium DESC,
      p.admin_rank DESC,
      averageRating DESC
    LIMIT ? OFFSET ?
  `;

  const rows = await query<any>(selectSql, [...params, limit, offset]);

  const data: PublicPartnerCard[] = rows.map((r) => ({
    id: r.id,
    humanId: r.humanId,
    kitchenName: r.kitchenName,
    bio: r.bio,
    coverUrl: r.coverUrl,
    city: r.city,
    area: r.area,
    isVerified: Boolean(r.isVerified),
    isPremium: Boolean(r.isPremium),
    isPinned: Boolean(r.isPinned),
    adminRank: Number(r.adminRank),
    averageRating: parseFloat(r.averageRating) || 5.0,
    totalReviews: Number(r.totalReviews) || 0,
    priceStartingFrom: parseFloat(r.priceStartingFrom) || 99,
    hasVeg: Boolean(r.hasVeg),
    hasNonVeg: Boolean(r.hasNonVeg),
    planType: r.planType || 'Daily & Monthly',
  }));

  // Filter in memory for vegOnly or minRating if specified
  let filteredData = data;
  if (options.vegOnly) {
    filteredData = filteredData.filter((item) => item.hasVeg && !item.hasNonVeg);
  }
  if (options.minRating) {
    filteredData = filteredData.filter((item) => item.averageRating >= (options.minRating || 0));
  }

  return {
    data: filteredData,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getDistinctCitiesAndAreas() {
  const cities = await query<{ city: string }>(
    'SELECT DISTINCT city FROM partner_profiles WHERE is_suspended = false ORDER BY city ASC'
  );
  const areas = await query<{ area: string; city: string }>(
    'SELECT DISTINCT area, city FROM partner_profiles WHERE is_suspended = false ORDER BY area ASC'
  );

  return {
    cities: cities.map((c) => c.city),
    areas: areas.map((a) => ({ area: a.area, city: a.city })),
  };
}

export async function getFeaturedPartners(limitCount = 6): Promise<PublicPartnerCard[]> {
  const result = await getPublicPartners({ limit: limitCount });
  return result.data;
}
