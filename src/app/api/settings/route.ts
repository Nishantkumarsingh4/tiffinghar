import { NextResponse } from 'next/server';
import {
  getAllSiteSettings,
  getFaqs,
  getTestimonials,
  getPlatformStats,
} from '@/repositories/settingsRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [settings, faqs, testimonials, stats] = await Promise.all([
      getAllSiteSettings(),
      getFaqs(),
      getTestimonials(),
      getPlatformStats(),
    ]);

    return NextResponse.json({
      success: true,
      settings,
      faqs,
      testimonials,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load site settings' },
      { status: 500 }
    );
  }
}
