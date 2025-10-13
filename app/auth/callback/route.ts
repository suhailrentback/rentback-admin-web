// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/' // default target for admin

  const supabase = createRouteSupabase()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Admin middleware will still gate access to staff-only routes
  return NextResponse.redirect(new URL(next, url.origin))
}
