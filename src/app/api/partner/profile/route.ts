import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    const profile = await queryOne<any>(
      'SELECT * FROM partner_profiles WHERE id = ?',
      [partnerId]
    );

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.partnerProfileId;
    const body = await req.json();

    await execute(
      `UPDATE partner_profiles SET
        kitchen_name = ?, owner_name = ?, bio = ?, logo_url = ?, cover_url = ?,
        address = ?, city = ?, area = ?, pincode = ?, contact_phone = ?, contact_whatsapp = ?,
        fssai_number = ?, delivery_areas = ?, delivery_timings = ?, plan_type = ?
       WHERE id = ?`,
      [
        body.kitchenName,
        body.ownerName,
        body.bio || '',
        body.logoUrl || '',
        body.coverUrl || '',
        body.address || '',
        body.city,
        body.area,
        body.pincode || '',
        body.contactPhone,
        body.contactWhatsapp || '',
        body.fssaiNumber || '',
        body.deliveryAreas || '',
        body.deliveryTimings || '',
        body.planType || 'Daily, Weekly, Monthly',
        partnerId,
      ]
    );

    return NextResponse.json({ success: true, message: 'Kitchen profile updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
