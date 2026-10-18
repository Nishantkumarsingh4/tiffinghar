import { NextRequest, NextResponse } from 'next/server';
import {
  getPublicPartners,
  getDistinctCitiesAndAreas,
} from '@/repositories/partnerRepository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get('city') || undefined;
    const area = searchParams.get('area') || undefined;
    const vegOnly = searchParams.get('vegOnly') === 'true';
    const search = searchParams.get('search') || undefined;
    const minRating = searchParams.get('minRating')
      ? parseFloat(searchParams.get('minRating')!)
      : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 12;

    const [partnerResults, filterOptions] = await Promise.all([
      getPublicPartners({
        city,
        area,
        vegOnly,
        search,
        minRating,
        page,
        limit,
      }),
      getDistinctCitiesAndAreas(),
    ]);

    return NextResponse.json({
      success: true,
      ...partnerResults,
      filterOptions,
    });
  } catch (error: any) {
    console.error('Error fetching public partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tiffin partners' },
      { status: 500 }
    );
  }
}
