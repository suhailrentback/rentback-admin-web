// app/api/staff/[userId]/signout/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request, ctx: { params: { userId: string } }) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });

  // Verify caller is ADMIN using the user's token
  const supaUser = createServerSupabase() as any;
  (supaUser as any).headers = { Authorization: `Bearer ${token}` };
  const { data: role, error: rErr } = await supaUser.rpc('current_user_role');
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  // Service role key optional; if missing, we soft-fail with a helpful message
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !serviceKey) {
    return NextResponse.json({
      ok: false,
      note: 'Service role not configured; set SUPABASE_SERVICE_ROLE_KEY to enable remote sign-out.'
    }, { status: 200 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  // Revoke all refresh tokens for the user (forces sign-in next time)
  const { error } = await admin.auth.admin.revokeRefreshTokens(ctx.params.userId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  // Also set the flag so any active session UI can act if desired
  await supaUser.rpc('admin_set_force_sign_out', { p_user_id: ctx.params.userId, p_flag: true }).catch(() => {});

  return NextResponse.json({ ok: true });
}
