import { NextRequest, NextResponse } from 'next/server';
import { syncSubscriptionExpirations } from '@/lib/payment';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const result = await syncSubscriptionExpirations();

    console.log(`\n======================================================`);
    console.log(`⏰ [SUBSCRIPTION SYNC & EXPIRY SWEEPER]`);
    console.log(`✓ Expired subscriptions marked: ${result.expiredCount}`);
    console.log(`✓ Partners expiring within reminder window: ${result.expiringSoonPartners.length}`);
    if (result.expiringSoonPartners.length > 0) {
      console.log('👉 Reminders sent to:', result.expiringSoonPartners.map(p => `${p.kitchen_name} (${p.days_left}d left)`).join(', '));
    }
    console.log(`======================================================\n`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('Subscription sync error:', error);
    return NextResponse.json({ error: 'Failed to run subscription sync' }, { status: 500 });
  }
}
