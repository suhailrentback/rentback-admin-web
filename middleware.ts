// ADMIN: middleware.ts
// Temporary guard for Wave 1.1 that requires NO external auth packages.
// It redirects any non-public route to /sign-in.
// Wave 1.2 will replace this with Supabase-backed session checks.

import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set<string>([
  '/sign-in',
  '/auth/callback',
  '/api/health',
  '/robots.txt',
  '/sitemap.xml',
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/_next')) return true; // Next.js assets
  if (pathname.startsWith('/favicon')) return true;
  if (pathname.startsWith('/icon')) return true;
  if (pathname.startsWith('/opengraph-image')) return true;
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const path = nextUrl.pathname;

  if (isPublicPath(path)) return NextResponse.next();

  // Temporary demo gate until Wave 1.2 (Supabase): allow when a cookie is set.
  // We are NOT setting this cookie anywhere yet, so all protected routes will
  // redirect to /sign-in. That’s fine for Wave 1.1 (no UI change, build green).
  const hasDemoAuth = cookies.get('rb-admin-demo-auth')?.value === '1';
  if (!hasDemoAuth) {
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('next', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Match everything except Next internals and static assets (we also guard inside).
export const config = {
  matcher: ['/((?!_next/|static/).*)'],
};
