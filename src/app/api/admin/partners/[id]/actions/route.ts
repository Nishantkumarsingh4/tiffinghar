import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const { action, value } = body;

    const partner = await queryOne<any>(
      `SELECT p.id, p.human_id, p.kitchen_name, p.is_suspended, p.is_verified, p.is_pinned, p.admin_rank
       FROM partner_profiles p
       WHERE p.id = ? OR p.human_id = ?`,
      [id, id]
    );

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    let message = '';

    switch (action) {
      case 'toggle_suspend': {
        const newStatus = !partner.is_suspended;
        await execute(`UPDATE partner_profiles SET is_suspended = ? WHERE id = ?`, [newStatus ? 1 : 0, partner.id]);
        message = newStatus ? 'Partner suspended successfully' : 'Partner unsuspended successfully';
        break;
      }
      case 'toggle_verify': {
        const newVerified = !partner.is_verified;
        await execute(`UPDATE partner_profiles SET is_verified = ? WHERE id = ?`, [newVerified ? 1 : 0, partner.id]);
        message = newVerified ? 'Partner verified successfully' : 'Partner verification removed';
        break;
      }
      case 'toggle_pin': {
        const newPinned = !partner.is_pinned;
        await execute(`UPDATE partner_profiles SET is_pinned = ? WHERE id = ?`, [newPinned ? 1 : 0, partner.id]);
        message = newPinned ? 'Partner pinned to top' : 'Partner unpinned';
        break;
      }
      case 'set_rank': {
        const rank = parseInt(value, 10) || 0;
        await execute(`UPDATE partner_profiles SET admin_rank = ? WHERE id = ?`, [rank, partner.id]);
        message = `Partner rank updated to ${rank}`;
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Record audit log
    await execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, 'PARTNER', ?, ?, '127.0.0.1')`,
      [
        session.userId,
        `PARTNER_ACTION_${action.toUpperCase()}`,
        partner.human_id,
        JSON.stringify({ action, value, kitchen: partner.kitchen_name }),
      ]
    );

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Partner action error:', error);
    return NextResponse.json({ error: 'Failed to perform partner action' }, { status: 500 });
  }
}
