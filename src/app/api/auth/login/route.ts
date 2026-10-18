import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { queryOne, execute } from '@/lib/db';
import { comparePassword, signToken, setSessionCookie } from '@/lib/auth';
import { UserSession } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  expectedRole: z.enum(['CUSTOMER', 'PARTNER', 'ADMIN']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, expectedRole } = loginSchema.parse(body);

    // 1. Fetch user by email
    const user = await queryOne<any>(
      'SELECT id, human_id, role, email, password_hash, status, failed_login_count, locked_until FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 2. Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const waitMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to repeated failed logins. Please try again in ${waitMinutes} minutes.`,
        },
        { status: 423 }
      );
    }

    // 3. Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      const nextFailures = (user.failed_login_count || 0) + 1;
      let lockUntilSql: string | null = null;

      // Lock account after 5 consecutive failures
      if (nextFailures >= 5) {
        await execute(
          'UPDATE users SET failed_login_count = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE), status = "LOCKED" WHERE id = ?',
          [nextFailures, user.id]
        );
        return NextResponse.json(
          {
            error:
              'Account has been locked for 15 minutes due to 5 failed attempts.',
          },
          { status: 423 }
        );
      } else {
        await execute(
          'UPDATE users SET failed_login_count = ? WHERE id = ?',
          [nextFailures, user.id]
        );
        return NextResponse.json(
          { error: `Invalid email or password. (${5 - nextFailures} attempts left before temporary lock)` },
          { status: 401 }
        );
      }
    }

    // Reset failed count on successful password
    await execute(
      'UPDATE users SET failed_login_count = 0, locked_until = NULL, status = "ACTIVE" WHERE id = ?',
      [user.id]
    );

    // 4. Fetch specific profile details (Customer or Partner)
    let fullName = user.email.split('@')[0];
    let partnerProfileId: number | null = null;
    let customerProfileId: number | null = null;

    if (user.role === 'CUSTOMER') {
      const cust = await queryOne<any>(
        'SELECT id, full_name, avatar_url FROM customer_profiles WHERE user_id = ?',
        [user.id]
      );
      if (cust) {
        fullName = cust.full_name;
        customerProfileId = cust.id;
      }
    } else if (user.role === 'PARTNER') {
      const partner = await queryOne<any>(
        'SELECT id, kitchen_name, owner_name, logo_url FROM partner_profiles WHERE user_id = ?',
        [user.id]
      );
      if (partner) {
        fullName = partner.kitchen_name || partner.owner_name;
        partnerProfileId = partner.id;
      }
    } else if (user.role === 'ADMIN') {
      fullName = 'Administrator';
    }

    const sessionPayload: UserSession = {
      userId: user.id,
      humanId: user.human_id,
      email: user.email,
      role: user.role,
      fullName,
      partnerProfileId,
      customerProfileId,
    };

    const token = signToken(sessionPayload);
    await setSessionCookie(token);

    // Record in audit log
    await execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'LOGIN', 'USER', ?, ?, '127.0.0.1')`,
      [user.id, user.human_id, JSON.stringify({ role: user.role, time: new Date().toISOString() })]
    );

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
