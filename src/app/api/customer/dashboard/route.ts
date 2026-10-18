import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'CUSTOMER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = session.customerProfileId;
    if (!customerId) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    // 1. Profile
    const profile = await queryOne<any>(
      'SELECT * FROM customer_profiles WHERE id = ?',
      [customerId]
    );

    // 2. Reviews written by customer
    const myReviews = await query<any>(
      `SELECT r.*, p.kitchen_name, p.cover_url, p.area, p.city
       FROM reviews r
       JOIN partner_profiles p ON p.id = r.partner_id
       WHERE r.customer_id = ?
       ORDER BY r.updated_at DESC`,
      [customerId]
    );

    // 3. Recently viewed kitchens
    const recentlyViewed = await query<any>(
      `SELECT DISTINCT p.id, p.kitchen_name, p.cover_url, p.area, p.city, p.human_id,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE partner_id = p.id) as avg_rating,
        MAX(vl.created_at) as last_viewed
       FROM view_logs vl
       JOIN partner_profiles p ON p.id = vl.partner_id
       WHERE vl.customer_id = ?
       GROUP BY p.id
       ORDER BY last_viewed DESC
       LIMIT 6`,
      [customerId]
    );

    // 4. Favorites
    const favorites = await query<any>(
      `SELECT p.id, p.kitchen_name, p.cover_url, p.area, p.city, p.human_id,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE partner_id = p.id) as avg_rating
       FROM favorites f
       JOIN partner_profiles p ON p.id = f.partner_id
       WHERE f.customer_id = ?
       ORDER BY f.created_at DESC`,
      [customerId]
    );

    return NextResponse.json({
      success: true,
      profile,
      myReviews,
      recentlyViewed,
      favorites,
    });
  } catch (error) {
    console.error('Customer dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
  }
}
