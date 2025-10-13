// ADMIN: /middleware.ts
// Wave 1.1 — Edge middleware that blocks non-staff from admin.rentback.app.
// Strategy (pre-DB roles): allow if email is in ADMIN_ALLOW_EMAILS (CSV) OR email domain matches ADMIN_EMAIL_DOMAIN (default "rentback.app").
// Unauthed or not-allowed -> redirect to /sign-in (no UI change).
// Fails safe: if Supabase env is missing, we still build green and redirect to /sign-in.

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const PUBLIC_PATHS = new Set<string>([
  '/sign-in',
  '/auth/callback',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/icon.png',
  '/apple-touch-icon.png',
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let static assets & known public paths through quickly.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If auth isn’t configured yet, don’t crash — just send visitors to /sign-in.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();

  try {
    // Create a Supabase client bound to middleware (reads/writes cookies safely)
    const supabase = createMiddlewareClient(
      { req, res },
      { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY }
    );

    const { data } = await supabase.auth.getUser();
    const email = (data?.user?.email || '').toLowerCase();

    if (!email) {
      // Not signed in → /sign-in with return path
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    // Email allow-list
    const domain = (process.env.ADMIN_EMAIL_DOMAIN || 'rentback.app').toLowerCase();
    const list = (process.env.ADMIN_ALLOW_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const allowed = list.includes(email) || (!!domain && email.endsWith('@' + domain));

    if (!allowed) {
      // Signed-in but not allowed
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('error', 'not_authorized');
      return NextResponse.redirect(url);
    }

    // Allowed → proceed
    return res;
  } catch {
    // Any unexpected error → be safe, send to /sign-in
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }
}

// Run on all non-asset routes
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
