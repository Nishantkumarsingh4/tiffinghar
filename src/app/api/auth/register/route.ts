import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { queryOne, execute, transaction } from '@/lib/db';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';
import { formatHumanId } from '@/lib/config';
import { UserSession } from '@/types';

const registerSchema = z.object({
  role: z.enum(['CUSTOMER', 'PARTNER']),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  fullName: z.string().optional(),
  ownerName: z.string().optional(),
  kitchenName: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // 1. Check if email already exists
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(data.password);

    // 2. Perform insertion inside transaction
    const session = await transaction<UserSession>(async (conn) => {
      // Find max user ID for human ID
      const [userMax] = await conn.query<any>('SELECT MAX(id) as maxId FROM users');
      const nextUserNumericId = (userMax[0]?.maxId || 0) + 1;
      const userHumanId = formatHumanId('USR', nextUserNumericId);

      // Insert User
      const [userRes] = await conn.query<any>(
        `INSERT INTO users (human_id, role, email, phone, password_hash, status)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [userHumanId, data.role, data.email, data.phone, hashedPassword]
      );
      const userId = userRes.insertId;

      let partnerProfileId: number | null = null;
      let customerProfileId: number | null = null;
      let displayName = data.fullName || data.ownerName || data.kitchenName || data.email;

      if (data.role === 'CUSTOMER') {
        const [custMax] = await conn.query<any>('SELECT MAX(id) as maxId FROM customer_profiles');
        const nextCustNumericId = (custMax[0]?.maxId || 0) + 1;
        const custHumanId = formatHumanId('CUS', nextCustNumericId);

        const [custRes] = await conn.query<any>(
          `INSERT INTO customer_profiles (user_id, human_id, full_name, phone, city, area)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, custHumanId, data.fullName || 'Valued Customer', data.phone, data.city || 'Bengaluru', data.area || 'Koramangala']
        );
        customerProfileId = custRes.insertId;
        displayName = data.fullName || 'Valued Customer';
      } else {
        const [partMax] = await conn.query<any>('SELECT MAX(id) as maxId FROM partner_profiles');
        const nextPartNumericId = (partMax[0]?.maxId || 0) + 1;
        const partHumanId = formatHumanId('TIF', nextPartNumericId);

        const kitchenName = data.kitchenName || `${data.ownerName}'s Homestyle Kitchen`;
        const [partRes] = await conn.query<any>(
          `INSERT INTO partner_profiles (
            user_id, human_id, kitchen_name, owner_name, city, area, contact_phone, contact_whatsapp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            partHumanId,
            kitchenName,
            data.ownerName || 'Chef',
            data.city || 'Bengaluru',
            data.area || 'Koramangala',
            data.phone,
            data.phone,
          ]
        );
        partnerProfileId = partRes.insertId;
        displayName = kitchenName;
      }

      // Record audit log
      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, 'REGISTER', 'USER', ?, ?, '127.0.0.1')`,
        [userId, userHumanId, JSON.stringify({ role: data.role, email: data.email })]
      );

      return {
        userId,
        humanId: userHumanId,
        email: data.email,
        role: data.role,
        fullName: displayName,
        partnerProfileId,
        customerProfileId,
      };
    });

    const token = signToken(session);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: session,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
