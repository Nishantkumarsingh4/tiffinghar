import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/payment';
import { appConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Partner login required.' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    const order = await createRazorpayOrder({
      partnerId,
      amount: appConfig.premiumPrice,
      currency: 'INR',
      notes: {
        partnerName: session.fullName,
        plan: 'PREMIUM_30_DAYS',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: appConfig.razorpay.keyId,
      planName: `Partner Premium (30 Days)`,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
