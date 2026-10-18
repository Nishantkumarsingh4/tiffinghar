import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to view meal details' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const mealId = parseInt(id, 10);

    // 1. Fetch product with kitchen partner details
    const product = await queryOne<any>(
      `SELECT p.*,
        pp.id as partner_id,
        pp.kitchen_name,
        pp.owner_name,
        pp.contact_phone,
        pp.contact_whatsapp,
        pp.address,
        pp.area,
        pp.city,
        pp.delivery_areas,
        pp.delivery_timings,
        pp.fssai_number,
        pp.is_verified,
        pp.plan_type,
        pp.bio as kitchen_bio,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE partner_id = pp.id) as average_rating,
        (SELECT COUNT(*) FROM reviews WHERE partner_id = pp.id) as total_reviews
       FROM products p
       JOIN partner_profiles pp ON pp.id = p.partner_id
       WHERE p.id = ? AND p.is_active = true`,
      [mealId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Meal not found or inactive' }, { status: 404 });
    }

    // 2. Fetch all images uploaded for this specific meal
    const images = await query<any>(
      `SELECT id, product_id, image_url, is_cover, sort_order
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_cover DESC, sort_order ASC, id ASC`,
      [mealId]
    );

    // 3. Fetch other meals from this same kitchen partner
    const moreMeals = await query<any>(
      `SELECT p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = true LIMIT 1) as cover_image
       FROM products p
       WHERE p.partner_id = ? AND p.id != ? AND p.is_active = true
       ORDER BY p.id ASC
       LIMIT 4`,
      [product.partner_id, mealId]
    );

    return NextResponse.json({
      success: true,
      meal: {
        ...product,
        average_rating: parseFloat(product.average_rating) || 5.0,
        total_reviews: product.total_reviews || 0,
        images: images.length > 0 ? images : (product.cover_image ? [{ id: 0, image_url: product.cover_image, is_cover: true }] : []),
      },
      moreMeals,
    });
  } catch (error) {
    console.error('Error in meal detail API:', error);
    return NextResponse.json({ error: 'Failed to load meal details' }, { status: 500 });
  }
}
