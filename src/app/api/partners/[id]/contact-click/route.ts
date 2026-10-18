import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const partnerId = parseInt(id, 10);
    const body = await req.json();

    const clickType = body.type === 'WHATSAPP' ? 'WHATSAPP' : 'CALL';
    const customerId = session?.customerProfileId || null;

    await execute(
      `INSERT INTO contact_click_logs (partner_id, customer_id, click_type, ip_address)
       VALUES (?, ?, ?, '127.0.0.1')`,
      [partnerId, customerId, clickType]
    );

    return NextResponse.json({ success: true, message: 'Click logged' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log contact click' }, { status: 500 });
  }
}
