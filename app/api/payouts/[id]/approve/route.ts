// app/api/payouts/[id]/approve/route.ts
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

  // Load payout
  const { data: p, error } = await supabase
    .from('payout')
    .select('id, landlord_id, amount, status, approved_at')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // If already approved, idempotent
  if (p.status !== 'APPROVED') {
    const { error: upErr } = await supabase
      .from('payout')
      .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
      .eq('id', id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // Insert DEBIT in ledger (idempotent via unique index)
  const { error: ledErr } = await supabase.from('landlord_ledger').insert({
    landlord_id: p.landlord_id,
    entry_type: 'DEBIT',
    amount: p.amount,
    payout_id: p.id,
    memo: `Payout ${p.id} approved`,
  });
  if (ledErr && !/duplicate/i.test(ledErr.message)) {
    return NextResponse.json({ error: ledErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
