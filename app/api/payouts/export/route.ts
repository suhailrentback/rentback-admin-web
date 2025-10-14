// app/api/payouts/export/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

function toCsv(rows: any[]): string {
  const header = ['payout_id','landlord_id','amount','status','approved_at','requested_at','note'];
  const esc = (s: any) => String(s ?? '').replace(/"/g, '""');
  const body = rows.map(r => header.map(h => `"${esc(r[h])}"`).join(',')).join('\n');
  return header.join(',') + '\n' + body + '\n';
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }
  const token = auth.slice(7);
  const url = new URL(req.url);
  const start = url.searchParams.get('start'); // YYYY-MM-DD
  const end = url.searchParams.get('end');     // YYYY-MM-DD

  const supabase = createServerSupabase() as any;
  (supabase as any)['headers'] = { Authorization: `Bearer ${token}` };

  const { data: role, error: roleErr } = await supabase.rpc('current_user_role');
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 });
  if (role !== 'STAFF' && role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let q = supabase.from('payout').select('id, landlord_id, amount, status, approved_at, requested_at, note').eq('status', 'APPROVED');
  if (start) q = q.gte('approved_at', start);
  if (end) q = q.lte('approved_at', end + ' 23:59:59');

  const { data, error } = await q.order('approved_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((r: any) => ({
    payout_id: r.id,
    landlord_id: r.landlord_id,
    amount: r.amount,
    status: r.status,
    approved_at: r.approved_at,
    requested_at: r.requested_at,
    note: r.note
  }));

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="payouts_${start ?? 'all'}_${end ?? 'all'}.csv"`,
      'Cache-Control': 'no-store'
    }
  });
}
