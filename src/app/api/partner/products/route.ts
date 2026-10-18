import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute, transaction } from '@/lib/db';
import { appConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

const productSchema = z.object({
  name: z.string().min(2, 'Meal name must be at least 2 characters').max(150),
  description: z.string().max(1000).optional(),
  price: z.number().min(1, 'Price must be greater than 0'),
  isVeg: z.boolean().default(true),
  category: z.string().default('Daily Thali'),
  coverImage: z.string().url('Cover image must be a valid URL'),
  galleryImages: z.array(z.string().url()).optional().default([]),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    const products = await query<any>(
      `SELECT p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = true LIMIT 1) as cover_image
       FROM products p
       WHERE p.partner_id = ?
       ORDER BY p.id DESC`,
      [partnerId]
    );

    // Get images count and premium status
    const [sub] = await query<any>(
      `SELECT 1 as is_active FROM subscriptions
       WHERE partner_id = ? AND status = 'ACTIVE' AND start_date <= NOW() AND end_date > NOW()`,
      [partnerId]
    );
    const [imgCount] = await query<any>(
      'SELECT COUNT(*) as count FROM product_images WHERE partner_id = ?',
      [partnerId]
    );

    return NextResponse.json({
      success: true,
      products,
      isPremium: Boolean(sub),
      imagesUsed: imgCount?.count || 0,
      freeImageLimit: appConfig.freeImageLimit,
    });
  } catch (error) {
    console.error('Error fetching partner products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

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
    const data = productSchema.parse(body);

    // Check if partner is premium
    const [sub] = await query<any>(
      `SELECT 1 as is_active FROM subscriptions
       WHERE partner_id = ? AND status = 'ACTIVE' AND start_date <= NOW() AND end_date > NOW()`,
      [partnerId]
    );
    const isPremium = Boolean(sub);

    // Check total images partner currently has
    const [currentImgs] = await query<any>(
      'SELECT COUNT(*) as total FROM product_images WHERE partner_id = ?',
      [partnerId]
    );
    const currentCount = currentImgs?.total || 0;
    const newImagesCount = 1 + (data.galleryImages?.length || 0);

    if (!isPremium && currentCount + newImagesCount > appConfig.freeImageLimit) {
      return NextResponse.json(
        {
          error: `Free partner limit exceeded: You can only have up to ${appConfig.freeImageLimit} images in total across all products. You currently have ${currentCount}. Please upgrade to Premium for unlimited photos.`,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Insert Product and Images inside a transaction
    const newProductId = await transaction(async (conn) => {
      const [prodRes] = await conn.query<any>(
        `INSERT INTO products (partner_id, name, description, price, is_veg, is_active, category)
         VALUES (?, ?, ?, ?, ?, true, ?)`,
        [partnerId, data.name, data.description || '', data.price, data.isVeg, data.category]
      );
      const prodId = prodRes.insertId;

      // Insert cover image
      await conn.query(
        `INSERT INTO product_images (product_id, partner_id, image_url, sort_order, is_cover)
         VALUES (?, ?, ?, 0, true)`,
        [prodId, partnerId, data.coverImage]
      );

      // Insert gallery images
      if (data.galleryImages && data.galleryImages.length > 0) {
        for (let i = 0; i < data.galleryImages.length; i++) {
          await conn.query(
            `INSERT INTO product_images (product_id, partner_id, image_url, sort_order, is_cover)
             VALUES (?, ?, ?, ?, false)`,
            [prodId, partnerId, data.galleryImages[i], i + 1]
          );
        }
      }

      return prodId;
    });

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      productId: newProductId,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
