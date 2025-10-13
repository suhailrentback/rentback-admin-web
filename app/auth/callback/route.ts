// ADMIN: app/auth/callback/route.ts
// Supabase auth callback: exchanges ?code for a session, then redirects.
// This is server-side only (no UI) and works with our middleware’s ?next param.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';

  // If Supabase isn’t configured yet, just bounce back safely.
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const redirectUrl = new URL('/sign-in', url.origin);
    redirectUrl.searchParams.set('error', 'auth_not_configured');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    if (code) {
      const supabase = createRouteHandlerClient({ cookies }, {
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_ANON_KEY,
      });
      await supabase.auth.exchangeCodeForSession(code);
    }
  } catch {
    const redirectUrl = new URL('/sign-in', url.origin);
    redirectUrl.searchParams.set('error', 'auth_exchange_failed');
    return NextResponse.redirect(redirectUrl);
  }

  // Go to the intended page or home
  const redirectTarget = new URL(next, url.origin);
  return NextResponse.redirect(redirectTarget);
}
