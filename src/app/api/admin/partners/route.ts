import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all'; // all, verified, suspended, premium
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 15;
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search.trim()) {
      whereClauses.push(
        `(p.kitchen_name LIKE ? OR p.owner_name LIKE ? OR p.human_id LIKE ? OR u.email LIKE ? OR p.city LIKE ?)`
      );
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (filter === 'verified') {
      whereClauses.push(`p.is_verified = 1`);
    } else if (filter === 'suspended') {
      whereClauses.push(`p.is_suspended = 1`);
    } else if (filter === 'premium') {
      whereClauses.push(
        `EXISTS (SELECT 1 FROM subscriptions s WHERE s.partner_id = p.id AND s.status = 'ACTIVE' AND s.end_date > NOW())`
      );
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countResult] = await query<any>(
      `SELECT COUNT(*) as total
       FROM partner_profiles p
       JOIN users u ON u.id = p.user_id
       ${whereSql}`,
      params
    );
    const total = countResult?.total || 0;

    const partners = await query<any>(
      `SELECT p.id, p.human_id, p.kitchen_name, p.owner_name, p.city, p.area, p.cover_url,
              p.is_verified, p.is_suspended, p.is_pinned, p.admin_rank, p.created_at,
              u.email, u.status as account_status,
              (SELECT COUNT(*) FROM products WHERE partner_id = p.id) as total_products,
              (SELECT COUNT(*) FROM view_logs WHERE partner_id = p.id) as total_views,
              (SELECT COUNT(*) FROM contact_click_logs WHERE partner_id = p.id) as total_clicks,
              (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE partner_id = p.id) as avg_rating,
              (SELECT COUNT(*) FROM reviews WHERE partner_id = p.id) as review_count,
              EXISTS (
                SELECT 1 FROM subscriptions s
                WHERE s.partner_id = p.id AND s.status = 'ACTIVE' AND s.end_date > NOW()
              ) as is_premium_active
       FROM partner_profiles p
       JOIN users u ON u.id = p.user_id
       ${whereSql}
       ORDER BY p.is_pinned DESC, p.admin_rank DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      partners,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin partners list error:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}
