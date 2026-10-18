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
    const status = searchParams.get('status') || 'ALL'; // ALL, ACTIVE, EXPIRED, FAILED
    const format = searchParams.get('format') || 'json';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = format === 'csv' ? 1000 : 20;
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search.trim()) {
      whereClauses.push(
        `(p.human_id LIKE ? OR part.human_id LIKE ? OR part.kitchen_name LIKE ? OR p.razorpay_order_id LIKE ? OR p.razorpay_payment_id LIKE ?)`
      );
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (status !== 'ALL') {
      if (status === 'ACTIVE') {
        whereClauses.push(`s.status = 'ACTIVE' AND s.end_date > NOW()`);
      } else if (status === 'EXPIRED') {
        whereClauses.push(`(s.status = 'EXPIRED' OR s.end_date <= NOW())`);
      } else if (status === 'FAILED') {
        whereClauses.push(`p.status = 'FAILED'`);
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const records = await query<any>(
      `SELECT p.id as payment_db_id,
              p.human_id as payment_id,
              p.razorpay_order_id,
              p.razorpay_payment_id,
              p.amount,
              p.currency,
              p.status as payment_status,
              p.created_at as payment_date,
              part.id as partner_db_id,
              part.human_id as partner_id,
              part.kitchen_name,
              s.id as subscription_id,
              s.plan,
              s.start_date,
              s.end_date,
              s.status as subscription_status,
              CASE
                WHEN s.end_date > NOW() THEN GREATEST(0, DATEDIFF(s.end_date, NOW()))
                ELSE 0
              END as days_remaining,
              CASE
                WHEN s.status = 'ACTIVE' AND s.end_date > NOW() THEN 'ACTIVE'
                WHEN s.end_date <= NOW() THEN 'EXPIRED'
                ELSE COALESCE(s.status, p.status)
              END as live_status
       FROM payments p
       JOIN partner_profiles part ON part.id = p.partner_id
       LEFT JOIN subscriptions s ON s.payment_id = p.id
       ${whereSql}
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    if (format === 'csv') {
      const headers = [
        'Payment ID',
        'Partner ID',
        'Kitchen Name',
        'Amount (INR)',
        'Order ID',
        'Razorpay Payment ID',
        'Payment Status',
        'Plan',
        'Start Date',
        'End Date',
        'Days Remaining',
        'Live Status',
        'Payment Date',
      ];

      const csvRows = [headers.join(',')];

      records.forEach((r: any) => {
        csvRows.push(
          [
            `"${r.payment_id}"`,
            `"${r.partner_id}"`,
            `"${(r.kitchen_name || '').replace(/"/g, '""')}"`,
            r.amount,
            `"${r.razorpay_order_id || ''}"`,
            `"${r.razorpay_payment_id || ''}"`,
            `"${r.payment_status}"`,
            `"${r.plan || 'PREMIUM'}"`,
            `"${r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : ''}"`,
            `"${r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : ''}"`,
            r.days_remaining,
            `"${r.live_status}"`,
            `"${r.payment_date ? new Date(r.payment_date).toISOString() : ''}"`,
          ].join(',')
        );
      });

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="tiffinghar-payments-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const [countResult] = await query<any>(
      `SELECT COUNT(*) as total
       FROM payments p
       JOIN partner_profiles part ON part.id = p.partner_id
       LEFT JOIN subscriptions s ON s.payment_id = p.id
       ${whereSql}`,
      params
    );
    const total = countResult?.total || 0;

    return NextResponse.json({
      success: true,
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin payments query error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments log' }, { status: 500 });
  }
}
