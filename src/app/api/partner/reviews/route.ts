import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    const reviews = await query<any>(
      `SELECT r.*, c.full_name as customer_name, c.avatar_url as customer_avatar
       FROM reviews r
       JOIN customer_profiles c ON c.id = r.customer_id
       WHERE r.partner_id = ?
       ORDER BY r.created_at DESC`,
      [partnerId]
    );

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    const { reviewId, reply } = await req.json();

    if (!reviewId || !reply) {
      return NextResponse.json({ error: 'Review ID and reply text are required' }, { status: 400 });
    }

    await execute(
      `UPDATE reviews SET
        partner_reply = ?, reply_created_at = NOW()
       WHERE id = ? AND partner_id = ?`,
      [reply.trim(), reviewId, partnerId]
    );

    return NextResponse.json({ success: true, message: 'Reply posted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }
}
