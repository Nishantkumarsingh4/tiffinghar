import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { verifyRazorpaySignature, activateSubscription } from '@/lib/payment';
import { appConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = verifySchema.parse(body);

    const isValid = verifyRazorpaySignature({
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Untrusted payload.' },
        { status: 400 }
      );
    }

    // Activate subscription
    const subscription = await activateSubscription({
      partnerId,
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      amount: appConfig.premiumPrice,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and Premium subscription activated successfully!',
      subscription,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payment parameters' }, { status: 400 });
    }
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
