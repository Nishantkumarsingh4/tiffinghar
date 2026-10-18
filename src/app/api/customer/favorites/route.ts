import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.customerProfileId) {
      return NextResponse.json({ error: 'Please sign in to favorite kitchens' }, { status: 401 });
    }

    const { partnerId } = await req.json();
    const customerId = session.customerProfileId;

    const existing = await queryOne<any>(
      'SELECT id FROM favorites WHERE customer_id = ? AND partner_id = ?',
      [customerId, partnerId]
    );

    if (existing) {
      await execute('DELETE FROM favorites WHERE id = ?', [existing.id]);
      return NextResponse.json({ success: true, isFavorite: false });
    } else {
      await execute(
        'INSERT INTO favorites (customer_id, partner_id) VALUES (?, ?)',
        [customerId, partnerId]
      );
      return NextResponse.json({ success: true, isFavorite: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
