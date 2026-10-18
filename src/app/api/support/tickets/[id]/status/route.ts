import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne, execute } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const statusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

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
    const validated = statusSchema.parse(body);

    const ticket = await queryOne<any>(
      `SELECT * FROM support_tickets WHERE id = ? OR human_id = ?`,
      [id, id]
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (validated.priority) {
      await execute(
        `UPDATE support_tickets SET status = ?, priority = ?, updated_at = NOW() WHERE id = ?`,
        [validated.status, validated.priority, ticket.id]
      );
    } else {
      await execute(
        `UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?`,
        [validated.status, ticket.id]
      );
    }

    await execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'UPDATE_TICKET_STATUS', 'TICKET', ?, ?, '127.0.0.1')`,
      [session.userId, ticket.human_id, JSON.stringify({ oldStatus: ticket.status, newStatus: validated.status })]
    );

    return NextResponse.json({
      success: true,
      message: `Ticket status updated to ${validated.status}`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    console.error('Update ticket status error:', error);
    return NextResponse.json({ error: 'Failed to update ticket status' }, { status: 500 });
  }
}
