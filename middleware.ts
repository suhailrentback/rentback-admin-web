// ADMIN: middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const PUBLIC_PATHS = new Set<string>([
  '/sign-in',
  '/auth/callback',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirect', pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
