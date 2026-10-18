import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne, execute } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(3000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch ticket
    const ticket = await queryOne<any>(
      `SELECT t.*,
              u.email as user_email,
              u.role as user_role,
              cp.human_id as customer_human_id,
              cp.full_name as customer_name,
              pp.human_id as partner_human_id,
              pp.kitchen_name
       FROM support_tickets t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN customer_profiles cp ON cp.user_id = u.id
       LEFT JOIN partner_profiles pp ON pp.user_id = u.id
       WHERE t.id = ? OR t.human_id = ?`,
      [id, id]
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Access check: Admin or Ticket Owner
    if (session.role !== 'ADMIN' && ticket.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark unread messages as read
    if (session.role === 'ADMIN') {
      await execute(
        `UPDATE chat_messages
         SET is_read = 1, read_at = NOW()
         WHERE ticket_id = ? AND sender_role != 'ADMIN' AND is_read = 0`,
        [ticket.id]
      );
    } else {
      await execute(
        `UPDATE chat_messages
         SET is_read = 1, read_at = NOW()
         WHERE ticket_id = ? AND sender_role = 'ADMIN' AND is_read = 0`,
        [ticket.id]
      );
    }

    // Fetch messages
    const messages = await query<any>(
      `SELECT m.*, u.email as sender_email, u.role as sender_user_role
       FROM chat_messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.ticket_id = ?
       ORDER BY m.created_at ASC`,
      [ticket.id]
    );

    return NextResponse.json({
      success: true,
      ticket,
      messages,
    });
  } catch (error) {
    console.error('Ticket messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = messageSchema.parse(body);

    const ticket = await queryOne<any>(
      `SELECT * FROM support_tickets WHERE id = ? OR human_id = ?`,
      [id, id]
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (session.role !== 'ADMIN' && ticket.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const senderRole = session.role === 'ADMIN' ? 'ADMIN' : 'USER';

    const insertResult = await execute(
      `INSERT INTO chat_messages (ticket_id, sender_id, sender_role, message, is_read)
       VALUES (?, ?, ?, ?, false)`,
      [ticket.id, session.userId, senderRole, validated.message]
    );

    // If ticket was resolved/closed and user replies, re-open it
    if (session.role !== 'ADMIN' && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
      await execute(
        `UPDATE support_tickets SET status = 'IN_PROGRESS', updated_at = NOW() WHERE id = ?`,
        [ticket.id]
      );
    } else {
      await execute(`UPDATE support_tickets SET updated_at = NOW() WHERE id = ?`, [ticket.id]);
    }

    const newMessage = await queryOne<any>(
      `SELECT m.*, u.email as sender_email
       FROM chat_messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [insertResult.insertId]
    );

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
