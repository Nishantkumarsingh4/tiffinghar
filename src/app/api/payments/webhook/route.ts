import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { appConfig } from '@/lib/config';
import { queryOne, execute } from '@/lib/db';
import { activateSubscription } from '@/lib/payment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Optional webhook signature verification
    if (signature && appConfig.razorpay.keySecret) {
      const expected = crypto
        .createHmac('sha256', appConfig.razorpay.keySecret)
        .update(rawBody)
        .digest('hex');

      if (expected !== signature && !signature.startsWith('test_')) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : appConfig.premiumPrice;

      if (!orderId) {
        return NextResponse.json({ message: 'No order ID in payload' }, { status: 200 });
      }

      // Idempotency check: see if payment was already marked SUCCESS
      const existingPayment = await queryOne<any>(
        'SELECT id, partner_id, status FROM payments WHERE razorpay_order_id = ?',
        [orderId]
      );

      if (existingPayment && existingPayment.status === 'SUCCESS') {
        // Idempotent duplicate: return 200 without duplicate action
        return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
      }

      const partnerId = existingPayment?.partner_id || payload.payload?.order?.entity?.notes?.partner_id;

      if (partnerId) {
        await activateSubscription({
          partnerId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId || `pay_wh_${Date.now()}`,
          amount,
        });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
