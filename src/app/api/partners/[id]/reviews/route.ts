import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(1000),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.customerProfileId) {
      return NextResponse.json({ error: 'Please sign in as a customer to leave a review' }, { status: 401 });
    }

    const { id } = await params;
    const partnerId = parseInt(id, 10);
    const body = await req.json();
    const data = reviewSchema.parse(body);

    await execute(
      `INSERT INTO reviews (customer_id, partner_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = NOW()`,
      [session.customerProfileId, partnerId, data.rating, data.comment.trim()]
    );

    return NextResponse.json({ success: true, message: 'Review submitted successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
