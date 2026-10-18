import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { queryOne, execute, transaction } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    const resetRecord = await queryOne<any>(
      `SELECT id, email, expires_at, used_at
       FROM password_reset_tokens
       WHERE token = ? AND used_at IS NULL`,
      [token]
    );

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or already used password reset link.' },
        { status: 400 }
      );
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await transaction(async (conn) => {
      // Update user password and clear any locked state
      await conn.query(
        `UPDATE users
         SET password_hash = ?, failed_login_count = 0, locked_until = NULL, status = 'ACTIVE'
         WHERE email = ?`,
        [hashedPassword, resetRecord.email]
      );

      // Mark token as used
      await conn.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
        [resetRecord.id]
      );

      // Add audit log
      await conn.query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details, ip_address)
         VALUES ('PASSWORD_RESET', 'USER', ?, ?, '127.0.0.1')`,
        [resetRecord.email, JSON.stringify({ email: resetRecord.email, time: new Date().toISOString() })]
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new password.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
