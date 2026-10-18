import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Partners in rank order
    const partners = await query<any>(
      `SELECT p.id, p.human_id, p.kitchen_name, p.cover_url, p.city, p.area,
              p.admin_rank, p.is_pinned, p.is_suspended, p.is_verified,
              (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE partner_id = p.id) as avg_rating,
              EXISTS (
                SELECT 1 FROM subscriptions s
                WHERE s.partner_id = p.id AND s.status = 'ACTIVE' AND s.end_date > NOW()
              ) as is_premium_active
       FROM partner_profiles p
       ORDER BY p.is_pinned DESC, p.admin_rank DESC, avg_rating DESC`
    );

    // 2. Site settings
    const settingsRows = await query<any>(`SELECT setting_key, setting_value, description FROM site_settings`);
    const settings: Record<string, any> = {};
    settingsRows.forEach((row: any) => {
      let val = row.setting_value;
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      settings[row.setting_key] = val;
    });

    // 3. FAQs
    const faqs = await query<any>(`SELECT * FROM faqs ORDER BY sort_order ASC, id ASC`);

    // 4. Testimonials
    const testimonials = await query<any>(`SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC`);

    return NextResponse.json({
      success: true,
      partners,
      settings,
      faqs,
      testimonials,
    });
  } catch (error) {
    console.error('Admin website GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch website data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'reorder_partners') {
      // payload: orders: Array<{ id: number, admin_rank: number, is_pinned?: boolean }>
      const { orders } = body;
      if (Array.isArray(orders)) {
        for (const item of orders) {
          const isPinnedVal = item.is_pinned !== undefined ? (item.is_pinned ? 1 : 0) : null;
          if (isPinnedVal !== null) {
            await execute(
              `UPDATE partner_profiles SET admin_rank = ?, is_pinned = ? WHERE id = ?`,
              [item.admin_rank, isPinnedVal, item.id]
            );
          } else {
            await execute(
              `UPDATE partner_profiles SET admin_rank = ? WHERE id = ?`,
              [item.admin_rank, item.id]
            );
          }
        }
      }

      await execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, 'REORDER_PARTNERS', 'WEBSITE', 'RANKING', ?, '127.0.0.1')`,
        [session.userId, JSON.stringify({ count: orders?.length })]
      );

      return NextResponse.json({ success: true, message: 'Partner ranking updated successfully' });
    }

    if (action === 'update_settings') {
      const { settings } = body; // object with key-value pairs
      if (settings && typeof settings === 'object') {
        for (const [key, val] of Object.entries(settings)) {
          const jsonVal = JSON.stringify(val);
          await execute(
            `INSERT INTO site_settings (setting_key, setting_value)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [key, jsonVal, jsonVal]
          );
        }
      }

      await execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, 'UPDATE_SITE_SETTINGS', 'SETTINGS', 'GLOBAL', ?, '127.0.0.1')`,
        [session.userId, JSON.stringify({ keys: Object.keys(settings || {}) })]
      );

      return NextResponse.json({ success: true, message: 'Site settings updated successfully' });
    }

    if (action === 'save_faq') {
      const { id, category, question, answer, sort_order, is_active } = body;
      if (id) {
        await execute(
          `UPDATE faqs SET category = ?, question = ?, answer = ?, sort_order = ?, is_active = ? WHERE id = ?`,
          [category || 'General', question, answer, sort_order || 0, is_active ? 1 : 0, id]
        );
      } else {
        await execute(
          `INSERT INTO faqs (category, question, answer, sort_order, is_active) VALUES (?, ?, ?, ?, ?)`,
          [category || 'General', question, answer, sort_order || 0, is_active !== false ? 1 : 0]
        );
      }
      return NextResponse.json({ success: true, message: 'FAQ saved successfully' });
    }

    if (action === 'delete_faq') {
      const { id } = body;
      await execute(`DELETE FROM faqs WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, message: 'FAQ deleted' });
    }

    if (action === 'save_testimonial') {
      const { id, author_name, role_or_city, quote, rating, avatar_url, is_featured, sort_order } = body;
      if (id) {
        await execute(
          `UPDATE testimonials SET author_name = ?, role_or_city = ?, quote = ?, rating = ?, avatar_url = ?, is_featured = ?, sort_order = ? WHERE id = ?`,
          [author_name, role_or_city, quote, rating || 5, avatar_url || null, is_featured ? 1 : 0, sort_order || 0, id]
        );
      } else {
        await execute(
          `INSERT INTO testimonials (author_name, role_or_city, quote, rating, avatar_url, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [author_name, role_or_city, quote, rating || 5, avatar_url || null, is_featured !== false ? 1 : 0, sort_order || 0]
        );
      }
      return NextResponse.json({ success: true, message: 'Testimonial saved successfully' });
    }

    if (action === 'delete_testimonial') {
      const { id } = body;
      await execute(`DELETE FROM testimonials WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Testimonial deleted' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin website POST error:', error);
    return NextResponse.json({ error: 'Failed to process website update' }, { status: 500 });
  }
}
