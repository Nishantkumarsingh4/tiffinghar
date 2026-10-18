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
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // Partner profile with user details
    const partner = await queryOne<any>(
      `SELECT p.*, u.email, u.status as user_status, u.role, u.created_at as user_created_at,
              EXISTS (
                SELECT 1 FROM subscriptions s
                WHERE s.partner_id = p.id AND s.status = 'ACTIVE' AND s.end_date > NOW()
              ) as is_premium_active
       FROM partner_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ? OR p.human_id = ?`,
      [id, id]
    );

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Products with images
    const products = await query<any>(
      `SELECT p.*,
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id', img.id,
                    'image_url', img.image_url,
                    'is_cover', img.is_cover,
                    'sort_order', img.sort_order
                  )
                )
                FROM product_images img
                WHERE img.product_id = p.id
              ) as images_json
       FROM products p
       WHERE p.partner_id = ?
       ORDER BY p.id DESC`,
      [partner.id]
    );

    const formattedProducts = products.map((prod: any) => ({
      ...prod,
      images: prod.images_json ? (typeof prod.images_json === 'string' ? JSON.parse(prod.images_json) : prod.images_json) : [],
    }));

    // Subscriptions
    const subscriptions = await query<any>(
      `SELECT s.*, p.human_id as payment_human_id, p.razorpay_order_id, p.status as payment_status
       FROM subscriptions s
       LEFT JOIN payments p ON p.id = s.payment_id
       WHERE s.partner_id = ?
       ORDER BY s.id DESC`,
      [partner.id]
    );

    // Payments
    const payments = await query<any>(
      `SELECT p.*
       FROM payments p
       WHERE p.partner_id = ?
       ORDER BY p.id DESC`,
      [partner.id]
    );

    // Recent view logs with customer details
    const recentViews = await query<any>(
      `SELECT v.id, v.created_at, v.ip_address, c.human_id as customer_human_id, c.full_name as customer_name, c.avatar_url
       FROM view_logs v
       LEFT JOIN customer_profiles c ON c.id = v.customer_id
       WHERE v.partner_id = ?
       ORDER BY v.created_at DESC
       LIMIT 30`,
      [partner.id]
    );

    // Contact clicks (calls / whatsapp)
    const contactClicks = await query<any>(
      `SELECT cl.*, c.human_id as customer_human_id, c.full_name as customer_name
       FROM contact_click_logs cl
       LEFT JOIN customer_profiles c ON c.id = cl.customer_id
       WHERE cl.partner_id = ?
       ORDER BY cl.created_at DESC
       LIMIT 30`,
      [partner.id]
    );

    // Reviews received
    const reviews = await query<any>(
      `SELECT r.*, c.human_id as customer_human_id, c.full_name as customer_name, c.avatar_url
       FROM reviews r
       JOIN customer_profiles c ON c.id = r.customer_id
       WHERE r.partner_id = ?
       ORDER BY r.created_at DESC`,
      [partner.id]
    );

    // Support tickets
    const tickets = await query<any>(
      `SELECT t.*
       FROM support_tickets t
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [partner.user_id]
    );

    return NextResponse.json({
      success: true,
      partner,
      products: formattedProducts,
      subscriptions,
      payments,
      recentViews,
      contactClicks,
      reviews,
      tickets,
    });
  } catch (error) {
    console.error('Partner detail 360 error:', error);
    return NextResponse.json({ error: 'Failed to fetch partner 360 details' }, { status: 500 });
  }
}
