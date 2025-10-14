// app/api/payouts/[id]/deny/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }
  const token = auth.slice(7);

  const supabase = createServerSupabase() as any;
  (supabase as any)['headers'] = { Authorization: `Bearer ${token}` };

  const { data: role, error: roleErr } = await supabase.rpc('current_user_role');
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 });
  if (role !== 'STAFF' && role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = ctx.params.id;

  // Idempotent deny
  const { error: upErr } = await supabase
    .from('payout')
    .update({ status: 'DENIED', denied_at: new Date().toISOString() })
    .eq('id', id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
