import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { execute, queryOne } from '@/lib/db';
import { appConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await queryOne<{ id: number; email: string }>(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await execute(
        `INSERT INTO password_reset_tokens (email, token, expires_at)
         VALUES (?, ?, ?)`,
        [email, resetToken, expiresAt]
      );

      const resetUrl = `${appConfig.appUrl}/reset-password?token=${resetToken}`;
      console.log(`\n======================================================`);
      console.log(`🔑 [PASSWORD RESET LINK FOR ${email}]`);
      console.log(`👉 Link: ${resetUrl}`);
      console.log(`======================================================\n`);
    }

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive password reset instructions.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
