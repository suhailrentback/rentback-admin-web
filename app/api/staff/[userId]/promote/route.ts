// app/api/staff/[userId]/promote/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request, ctx: { params: { userId: string } }) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  if (!token) return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });

  const supabase = createServerSupabase() as any;
  (supabase as any).headers = { Authorization: `Bearer ${token}` };

  const { data: role, error: rErr } = await supabase.rpc('current_user_role');
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { error } = await supabase.rpc('admin_promote_to_staff', { p_user_id: ctx.params.userId });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
