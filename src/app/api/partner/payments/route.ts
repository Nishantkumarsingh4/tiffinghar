import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

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

    const payments = await query<any>(
      `SELECT p.id, p.human_id, p.razorpay_order_id, p.razorpay_payment_id, p.amount, p.currency, p.status, p.created_at,
        s.plan, s.start_date, s.end_date
       FROM payments p
       LEFT JOIN subscriptions s ON s.payment_id = p.id
       WHERE p.partner_id = ?
       ORDER BY p.id DESC`,
      [partnerId]
    );

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
