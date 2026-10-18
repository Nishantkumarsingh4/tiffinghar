import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute } from '@/lib/db';
import { formatHumanId } from '@/lib/config';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';

    const isAdmin = session.role === 'ADMIN';

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (!isAdmin) {
      whereClauses.push(`t.user_id = ?`);
      params.push(session.userId);
    }

    if (status !== 'ALL') {
      whereClauses.push(`t.status = ?`);
      params.push(status);
    }

    if (search.trim()) {
      whereClauses.push(
        `(t.human_id LIKE ? OR t.subject LIKE ? OR t.guest_name LIKE ? OR t.guest_email LIKE ? OR u.email LIKE ?)`
      );
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const tickets = await query<any>(
      `SELECT t.*,
              u.email as user_email,
              u.role as user_role,
              cp.human_id as customer_human_id,
              cp.full_name as customer_name,
              pp.human_id as partner_human_id,
              pp.kitchen_name,
              (SELECT COUNT(*) FROM chat_messages m WHERE m.ticket_id = t.id) as total_messages,
              (
                SELECT COUNT(*) FROM chat_messages m
                WHERE m.ticket_id = t.id AND m.is_read = 0
                AND (CASE WHEN ? = 1 THEN m.sender_role != 'ADMIN' ELSE m.sender_role = 'ADMIN' END)
              ) as unread_messages
       FROM support_tickets t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN customer_profiles cp ON cp.user_id = u.id
       LEFT JOIN partner_profiles pp ON pp.user_id = u.id
       ${whereSql}
       ORDER BY
         CASE WHEN t.status = 'OPEN' THEN 1 WHEN t.status = 'IN_PROGRESS' THEN 2 ELSE 3 END,
         t.updated_at DESC`,
      [isAdmin ? 1 : 0, ...params]
    );

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Support tickets GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = createTicketSchema.parse(body);

    const lastTicket = await queryOne<{ id: number }>(
      'SELECT id FROM support_tickets ORDER BY id DESC LIMIT 1'
    );
    const nextNumericId = (lastTicket?.id || 0) + 1;
    const humanId = formatHumanId('TKT', nextNumericId);

    const ticketResult = await execute(
      `INSERT INTO support_tickets (
        human_id, user_id, role_type, subject, message, status, priority
      ) VALUES (?, ?, ?, ?, ?, 'OPEN', ?)`,
      [humanId, session.userId, session.role, validated.subject, validated.message, validated.priority]
    );

    // Initial message
    await execute(
      `INSERT INTO chat_messages (ticket_id, sender_id, sender_role, message, is_read)
       VALUES (?, ?, 'USER', ?, false)`,
      [ticketResult.insertId, session.userId, validated.message]
    );

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketResult.insertId,
        human_id: humanId,
        subject: validated.subject,
        status: 'OPEN',
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}
