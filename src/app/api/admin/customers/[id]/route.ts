import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute } from '@/lib/db';

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

    // Fetch customer profile by numeric id or human_id
    const customer = await queryOne<any>(
      `SELECT c.*, u.email, u.status as user_status, u.role, u.failed_login_count, u.locked_until, u.created_at as user_created_at
       FROM customer_profiles c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ? OR c.human_id = ?`,
      [id, id]
    );

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // 1. EXACT tiffin partners viewed with counts and timestamps
    const viewedPartners = await query<any>(
      `SELECT v.partner_id, p.human_id as partner_human_id, p.kitchen_name, p.cover_url, p.city, p.area,
              COUNT(v.id) as view_count,
              MAX(v.created_at) as last_viewed_at,
              MIN(v.created_at) as first_viewed_at
       FROM view_logs v
       JOIN partner_profiles p ON p.id = v.partner_id
       WHERE v.customer_id = ?
       GROUP BY v.partner_id, p.human_id, p.kitchen_name, p.cover_url, p.city, p.area
       ORDER BY last_viewed_at DESC`,
      [customer.id]
    );

    // 2. Recent detailed view log timeline (exact timestamps)
    const viewTimeline = await query<any>(
      `SELECT v.id, v.created_at, v.ip_address, p.id as partner_id, p.human_id as partner_human_id, p.kitchen_name
       FROM view_logs v
       JOIN partner_profiles p ON p.id = v.partner_id
       WHERE v.customer_id = ?
       ORDER BY v.created_at DESC
       LIMIT 30`,
      [customer.id]
    );

    // 3. Reviews written by customer
    const reviews = await query<any>(
      `SELECT r.*, p.kitchen_name, p.human_id as partner_human_id
       FROM reviews r
       JOIN partner_profiles p ON p.id = r.partner_id
       WHERE r.customer_id = ?
       ORDER BY r.created_at DESC`,
      [customer.id]
    );

    // 4. Contact clicks logged (calls / whatsapp)
    const contactClicks = await query<any>(
      `SELECT c.*, p.kitchen_name, p.human_id as partner_human_id
       FROM contact_click_logs c
       JOIN partner_profiles p ON p.id = c.partner_id
       WHERE c.customer_id = ?
       ORDER BY c.created_at DESC`,
      [customer.id]
    );

    // 5. Support tickets created by this user
    const tickets = await query<any>(
      `SELECT t.*
       FROM support_tickets t
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [customer.user_id]
    );

    return NextResponse.json({
      success: true,
      customer,
      viewedPartners,
      viewTimeline,
      reviews,
      contactClicks,
      tickets,
    });
  } catch (error) {
    console.error('Customer detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['ACTIVE', 'SUSPENDED', 'LOCKED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const customer = await queryOne<any>(
      `SELECT c.id, c.user_id, c.human_id FROM customer_profiles c WHERE c.id = ? OR c.human_id = ?`,
      [id, id]
    );

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    await execute(
      `UPDATE users SET status = ?, locked_until = NULL, failed_login_count = 0 WHERE id = ?`,
      [status, customer.user_id]
    );

    await execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'UPDATE_CUSTOMER_STATUS', 'CUSTOMER', ?, ?, '127.0.0.1')`,
      [session.userId, customer.human_id, JSON.stringify({ oldStatus: 'MODIFIED', newStatus: status })]
    );

    return NextResponse.json({ success: true, message: `Customer status updated to ${status}` });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
