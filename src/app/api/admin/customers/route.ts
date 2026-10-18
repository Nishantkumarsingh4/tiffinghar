import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 15;
    const offset = (page - 1) * limit;

    let whereSql = '';
    const params: any[] = [];

    if (search.trim()) {
      whereSql = `WHERE c.human_id LIKE ? OR c.full_name LIKE ? OR u.email LIKE ? OR c.city LIKE ?`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const [countResult] = await query<any>(
      `SELECT COUNT(*) as total
       FROM customer_profiles c
       JOIN users u ON u.id = c.user_id
       ${whereSql}`,
      params
    );
    const total = countResult?.total || 0;

    const customers = await query<any>(
      `SELECT c.id, c.human_id, c.full_name, c.avatar_url, c.phone, c.city, c.area, c.created_at,
        u.email, u.status as account_status,
        (SELECT COUNT(*) FROM view_logs WHERE customer_id = c.id) as total_views,
        (SELECT COUNT(*) FROM reviews WHERE customer_id = c.id) as total_reviews
       FROM customer_profiles c
       JOIN users u ON u.id = c.user_id
       ${whereSql}
       ORDER BY c.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
