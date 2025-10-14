// app/api/staff/[userId]/signout/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request, ctx: { params: { userId: string } }) {
  // Verify caller (ADMIN) using their bearer token
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const supaUser = createServerSupabase() as any;
  (supaUser as any).headers = { Authorization: `Bearer ${token}` };

  const { data: role, error: roleErr } = await supaUser.rpc('current_user_role');
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 });
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  // Set the force_sign_out flag; UI should sign the user out on next refresh
  const { error } = await supaUser.rpc('admin_set_force_sign_out', {
    p_user_id: ctx.params.userId,
    p_flag: true,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    note: 'force_sign_out flag set; the user will be signed out by the client on their next refresh.',
  });
}
