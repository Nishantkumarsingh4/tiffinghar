import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // 1. Total customers
    const [custResult] = await query<any>('SELECT COUNT(*) as count FROM customer_profiles');

    // 2. Total partners & active premium
    const [partnerResult] = await query<any>(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_suspended = 1 THEN 1 ELSE 0 END) as suspended FROM partner_profiles'
    );

    const [activeSubResult] = await query<any>(
      `SELECT COUNT(DISTINCT partner_id) as count FROM subscriptions
       WHERE status = 'ACTIVE' AND start_date <= NOW() AND end_date > NOW()`
    );

    // 3. Revenue (Month & Total)
    const [revenueTotal] = await query<any>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'SUCCESS'`
    );

    const [revenueMonth] = await query<any>(
      `SELECT COALESCE(SUM(amount), 0) as month_total FROM payments
       WHERE status = 'SUCCESS' AND created_at >= DATE_FORMAT(NOW() ,'%Y-%m-01')`
    );

    // 4. Reviews & Open Tickets
    const [reviewStats] = await query<any>('SELECT COUNT(*) as count FROM reviews');
    const [ticketStats] = await query<any>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count
       FROM support_tickets`
    );

    // 5. Recent signups (last 5)
    const recentSignups = await query<any>(
      `SELECT u.id, u.human_id, u.email, u.role, u.created_at,
        COALESCE(c.full_name, p.kitchen_name, 'User') as display_name
       FROM users u
       LEFT JOIN customer_profiles c ON c.user_id = u.id
       LEFT JOIN partner_profiles p ON p.user_id = u.id
       WHERE u.role != 'ADMIN'
       ORDER BY u.id DESC LIMIT 5`
    );

    // 6. Monthly revenue history (last 6 months)
    const monthlyRevenue = await query<any>(
      `SELECT DATE_FORMAT(created_at, '%b %Y') as month, SUM(amount) as revenue
       FROM payments
       WHERE status = 'SUCCESS'
       GROUP BY DATE_FORMAT(created_at, '%b %Y')
       ORDER BY MIN(created_at) ASC
       LIMIT 6`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers: custResult?.count || 0,
        totalPartners: partnerResult?.total || 0,
        suspendedPartners: partnerResult?.suspended || 0,
        activePremium: activeSubResult?.count || 0,
        totalRevenue: parseFloat(revenueTotal?.total) || 0,
        monthRevenue: parseFloat(revenueMonth?.month_total) || 0,
        totalReviews: reviewStats?.count || 0,
        openTickets: ticketStats?.open_count || 0,
        totalTickets: ticketStats?.total || 0,
        recentSignups,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
