import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { execute, queryOne } from '@/lib/db';
import { formatHumanId } from '@/lib/config';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(20),
  role: z.enum(['CUSTOMER', 'PARTNER', 'OTHER']).default('CUSTOMER'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactSchema.parse(body);

    // Get max ticket ID to generate safe next human ID
    const lastTicket = await queryOne<{ id: number }>(
      'SELECT id FROM support_tickets ORDER BY id DESC LIMIT 1'
    );
    const nextNumericId = (lastTicket?.id || 0) + 1;
    const humanId = formatHumanId('TKT', nextNumericId);

    const ticketResult = await execute(
      `INSERT INTO support_tickets (
        human_id, guest_name, guest_email, guest_phone, role_type, subject, message, status, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', 'MEDIUM')`,
      [
        humanId,
        validated.name,
        validated.email,
        validated.phone,
        validated.role,
        validated.subject,
        validated.message,
      ]
    );

    // Add initial message in chat_messages
    await execute(
      `INSERT INTO chat_messages (ticket_id, sender_role, message, is_read)
       VALUES (?, 'GUEST', ?, false)`,
      [ticketResult.insertId, validated.message]
    );

    return NextResponse.json({
      success: true,
      message: 'Your message has been submitted. Our team will get back to you shortly.',
      ticketId: humanId,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('Contact submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit your message. Please try again later.' },
      { status: 500 }
    );
  }
}
