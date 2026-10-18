import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute, transaction } from '@/lib/db';
import { appConfig } from '@/lib/config';

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

    // 1. Quick Toggle active status
    if (body.toggleActive !== undefined) {
      await execute(
        'UPDATE products SET is_active = ? WHERE id = ? AND partner_id = ?',
        [body.toggleActive, id, partnerId]
      );
      return NextResponse.json({ success: true, message: 'Status updated' });
    }

    // 2. Full product update (name, price, category, isVeg, description, coverImage, galleryImages)
    // Check if partner is premium
    const [sub] = await query<any>(
      `SELECT 1 as is_active FROM subscriptions
       WHERE partner_id = ? AND status = 'ACTIVE' AND start_date <= NOW() AND end_date > NOW()`,
      [partnerId]
    );
    const isPremium = Boolean(sub);

    const hasNewImages = body.coverImage !== undefined;
    const newCover = body.coverImage || '';
    const newGallery: string[] = Array.isArray(body.galleryImages) ? body.galleryImages : [];

    if (hasNewImages && !isPremium) {
      // Calculate images used by all other products
      const [otherImgs] = await query<any>(
        'SELECT COUNT(*) as total FROM product_images WHERE partner_id = ? AND product_id != ?',
        [partnerId, id]
      );
      const otherCount = otherImgs?.total || 0;
      const plannedForThisMeal = (newCover ? 1 : 0) + newGallery.length;

      if (otherCount + plannedForThisMeal > appConfig.freeImageLimit) {
        return NextResponse.json(
          {
            error: `Free partner limit exceeded: Maximum ${appConfig.freeImageLimit} images allowed across all meals. Upgrade to Premium for unlimited photos.`,
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    await transaction(async (conn) => {
      // Update product info
      await conn.query(
        `UPDATE products SET
          name = ?, description = ?, price = ?, is_veg = ?, category = ?
         WHERE id = ? AND partner_id = ?`,
        [body.name, body.description || '', body.price, body.isVeg, body.category, id, partnerId]
      );

      // Update photos if provided
      if (hasNewImages && newCover) {
        await conn.query(
          'DELETE FROM product_images WHERE product_id = ? AND partner_id = ?',
          [id, partnerId]
        );

        // Insert cover image
        await conn.query(
          `INSERT INTO product_images (product_id, partner_id, image_url, sort_order, is_cover)
           VALUES (?, ?, ?, 0, true)`,
          [id, partnerId, newCover]
        );

        // Insert gallery images
        for (let i = 0; i < newGallery.length; i++) {
          if (newGallery[i]?.trim()) {
            await conn.query(
              `INSERT INTO product_images (product_id, partner_id, image_url, sort_order, is_cover)
               VALUES (?, ?, ?, ?, false)`,
              [id, partnerId, newGallery[i].trim(), i + 1]
            );
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Meal and photos updated successfully' });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
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
