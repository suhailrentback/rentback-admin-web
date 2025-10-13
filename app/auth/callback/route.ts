// ADMIN: app/auth/callback/route.ts
// Temporary pass-through auth callback to keep builds green.
// Wave 1.2 will add Supabase helpers to exchange ?code for a session.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/';
  // If a provider sends us back with ?code, we ignore it for now and just bounce.
  // (Real exchange via @supabase/auth-helpers-nextjs lands in Wave 1.2.)
  const redirectTarget = new URL(next, url.origin);
  return NextResponse.redirect(redirectTarget);
}
