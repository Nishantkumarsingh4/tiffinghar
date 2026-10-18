import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tiffinghar_secure_jwt_token_key_fallback_2026'
);

const COOKIE_NAME = 'tiffinghar_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow admin login page without restriction
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const isCustomerRoute = pathname.startsWith('/customer');
  const isPartnerRoute = pathname.startsWith('/partner');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isCustomerRoute && !isPartnerRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    const url = new URL('/', req.url);
    url.searchParams.set('authRequired', 'true');
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    const isPartnerManagement =
      pathname.startsWith('/partner/dashboard') ||
      pathname.startsWith('/partner/products') ||
      pathname.startsWith('/partner/profile') ||
      pathname.startsWith('/partner/reviews') ||
      pathname.startsWith('/partner/subscription');

    if (isPartnerManagement && role !== 'PARTNER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (isCustomerRoute && role !== 'CUSTOMER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    const redirectUrl = isAdminRoute ? new URL('/admin/login', req.url) : new URL('/', req.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/customer/:path*', '/partner/:path*', '/admin/:path*'],
};
