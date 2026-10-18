import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute, transaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const partnerId = session.partnerProfileId;

    const product = await queryOne<any>(
      'SELECT * FROM products WHERE id = ? AND partner_id = ?',
      [id, partnerId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = await query<any>(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [id]
    );

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        images,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const partnerId = session.partnerProfileId;
    const body = await req.json();

    // Toggle active status or full edit
    if (body.toggleActive !== undefined) {
      await execute(
        'UPDATE products SET is_active = ? WHERE id = ? AND partner_id = ?',
        [body.toggleActive, id, partnerId]
      );
      return NextResponse.json({ success: true, message: 'Status updated' });
    }

    await execute(
      `UPDATE products SET
        name = ?, description = ?, price = ?, is_veg = ?, category = ?
       WHERE id = ? AND partner_id = ?`,
      [body.name, body.description || '', body.price, body.isVeg, body.category, id, partnerId]
    );

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const partnerId = session.partnerProfileId;

    await execute(
      'DELETE FROM products WHERE id = ? AND partner_id = ?',
      [id, partnerId]
    );

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
