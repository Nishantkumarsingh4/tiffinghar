import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute } from '@/lib/db';
import { appConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Crucial requirement: Clicking a partner card while logged out opens login popup, and detail API returns 401
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to view tiffin partner contact details and full menu' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const partnerId = parseInt(id, 10);

    const partner = await queryOne<any>(
      `SELECT * FROM partner_profiles WHERE id = ? AND is_suspended = false`,
      [partnerId]
    );

    if (!partner) {
      return NextResponse.json({ error: 'Kitchen partner not found' }, { status: 404 });
    }

    // 1. Check subscription validity
    const [sub] = await query<any>(
      `SELECT 1 as is_active FROM subscriptions
       WHERE partner_id = ? AND status = 'ACTIVE' AND start_date <= NOW() AND end_date > NOW()`,
      [partnerId]
    );
    const isPremium = Boolean(sub);

    // 2. Fetch images based on subscription limit:
    // "FREE: max 3 visible images (cover first, then upload order). PREMIUM: unlimited images. On expiry: only the FIRST 3 images remain publicly visible"
    let images = await query<any>(
      `SELECT id, image_url, is_cover, sort_order
       FROM product_images
       WHERE partner_id = ?
       ORDER BY is_cover DESC, sort_order ASC, id ASC`,
      [partnerId]
    );

    if (!isPremium && images.length > appConfig.freeImageLimit) {
      images = images.slice(0, appConfig.freeImageLimit);
    }

    // 3. Fetch products with all attached images
    const products = await query<any>(
      `SELECT p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = true LIMIT 1) as cover_image
       FROM products p
       WHERE p.partner_id = ? AND p.is_active = true
       ORDER BY p.id ASC`,
      [partnerId]
    );

    const productImages = await query<any>(
      `SELECT id, product_id, image_url, is_cover, sort_order
       FROM product_images
       WHERE partner_id = ? AND product_id IS NOT NULL
       ORDER BY is_cover DESC, sort_order ASC, id ASC`,
      [partnerId]
    );

    const productsWithImages = products.map((p) => {
      const pImgs = productImages.filter((img) => img.product_id === p.id);
      return {
        ...p,
        images: pImgs.length > 0 ? pImgs : (p.cover_image ? [{ id: 0, product_id: p.id, image_url: p.cover_image, is_cover: true, sort_order: 0 }] : []),
      };
    });

    // 4. Fetch reviews & summary
    const reviews = await query<any>(
      `SELECT r.*, c.full_name as customer_name, c.avatar_url as customer_avatar
       FROM reviews r
       JOIN customer_profiles c ON c.id = r.customer_id
       WHERE r.partner_id = ?
       ORDER BY r.created_at DESC`,
      [partnerId]
    );

    const [reviewStats] = await query<any>(
      'SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE partner_id = ?',
      [partnerId]
    );

    // 5. Check if customer has favorited this partner
    let isFavorite = false;
    if (session.customerProfileId) {
      const [fav] = await query<any>(
        'SELECT id FROM favorites WHERE customer_id = ? AND partner_id = ?',
        [session.customerProfileId, partnerId]
      );
      isFavorite = Boolean(fav);
    }

    // 6. Log View (deduplicating within 15-minute window for the same customer)
    if (session.customerProfileId) {
      const [recentView] = await query<any>(
        `SELECT id FROM view_logs
         WHERE partner_id = ? AND customer_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
        [partnerId, session.customerProfileId]
      );

      if (!recentView) {
        await execute(
          `INSERT INTO view_logs (partner_id, customer_id, ip_address, user_agent)
           VALUES (?, ?, '127.0.0.1', ?)`,
          [partnerId, session.customerProfileId, req.headers.get('user-agent') || 'Browser']
        );
      }
    }

    return NextResponse.json({
      success: true,
      partner: {
        ...partner,
        isPremium,
        averageRating: parseFloat(reviewStats?.avg_rating) || 5.0,
        totalReviews: reviewStats?.total_reviews || 0,
        isFavorite,
        images,
        products: productsWithImages,
        reviews,
      },
    });
  } catch (error) {
    console.error('Error in partner detail API:', error);
    return NextResponse.json({ error: 'Failed to load partner details' }, { status: 500 });
  }
}
