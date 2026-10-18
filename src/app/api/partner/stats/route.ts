import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { appConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    // 1. Total products
    const [prodResult] = await query<any>(
      'SELECT COUNT(*) as count FROM products WHERE partner_id = ?',
      [partnerId]
    );

    // 2. Images used
    const [imgResult] = await query<any>(
      'SELECT COUNT(*) as count FROM product_images WHERE partner_id = ?',
      [partnerId]
    );

    // 3. Subscription status
    const [subResult] = await query<any>(
      `SELECT id, plan, start_date, end_date, status,
        CASE WHEN status = 'ACTIVE' AND start_date <= NOW() AND end_date > NOW() THEN 1 ELSE 0 END as is_active,
        DATEDIFF(end_date, NOW()) as days_left
       FROM subscriptions
       WHERE partner_id = ?
       ORDER BY end_date DESC LIMIT 1`,
      [partnerId]
    );

    const isPremium = Boolean(subResult?.is_active);
    const daysLeft = subResult?.days_left ? Math.max(0, subResult.days_left) : 0;

    // 4. Views & Clicks
    const [viewsResult] = await query<any>(
      'SELECT COUNT(*) as total_views, COUNT(DISTINCT customer_id) as unique_customers FROM view_logs WHERE partner_id = ?',
      [partnerId]
    );

    const [clicksResult] = await query<any>(
      `SELECT 
        COUNT(*) as total_clicks,
        SUM(CASE WHEN click_type = 'CALL' THEN 1 ELSE 0 END) as call_clicks,
        SUM(CASE WHEN click_type = 'WHATSAPP' THEN 1 ELSE 0 END) as whatsapp_clicks
       FROM contact_click_logs
       WHERE partner_id = ?`,
      [partnerId]
    );

    // 5. Rating & Reviews
    const [reviewStats] = await query<any>(
      'SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE partner_id = ?',
      [partnerId]
    );

    // 6. 7-Day View History Chart Data
    const viewHistory = await query<any>(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM view_logs
       WHERE partner_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [partnerId]
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: prodResult?.count || 0,
        imagesUsed: imgResult?.count || 0,
        freeImageLimit: appConfig.freeImageLimit,
        isPremium,
        daysLeft,
        totalViews: viewsResult?.total_views || 0,
        uniqueCustomers: viewsResult?.unique_customers || 0,
        totalClicks: clicksResult?.total_clicks || 0,
        callClicks: clicksResult?.call_clicks || 0,
        whatsappClicks: clicksResult?.whatsapp_clicks || 0,
        avgRating: parseFloat(reviewStats?.avg_rating) || 5.0,
        totalReviews: reviewStats?.total_reviews || 0,
        viewHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
