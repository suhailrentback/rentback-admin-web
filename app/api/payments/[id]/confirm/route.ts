// app/api/payments/[id]/confirm/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

async function sendEmailIfConfigured(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY || '';
  if (!key) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: 'no-reply@rentback.app', to: [to], subject, html }),
    });
    await res.text();
  } catch { /* ignore */ }
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }
  const token = auth.slice(7);

  // Use server client and forward token for RLS
  const supabase = createServerSupabase() as any;
  (supabase as any)['headers'] = { Authorization: `Bearer ${token}` };

  // Require STAFF/ADMIN
  const { data: role, error: roleErr } = await supabase.rpc('current_user_role');
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 });
  if (role !== 'STAFF' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const paymentId = ctx.params.id;

  // Load payment + tenant + lease (needs landlord_id)
  const { data: pay, error: pErr } = await supabase
    .from('payment')
    .select(`
      id, status, amount, reference, created_at, lease_id, tenant_id,
      tenant:tenant_id ( email, full_name ),
      lease:lease_id ( id, landlord_id )
    `)
    .eq('id', paymentId)
    .maybeSingle();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  if (!pay) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

  // Confirm if not already confirmed
  if (pay.status !== 'CONFIRMED') {
    const { error: upErr } = await supabase
      .from('payment')
      .update({ status: 'CONFIRMED', paid_at: new Date().toISOString() })
      .eq('id', paymentId);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // Ensure a receipt exists
  const { data: rExists } = await supabase.from('receipt').select('id').eq('payment_id', paymentId).maybeSingle();
  if (!rExists) {
    const { error: insErr } = await supabase.from('receipt').insert({ payment_id: paymentId, pdf_url: null });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // CREDIT landlord ledger (idempotent via unique index)
  const landlordId = pay.lease?.landlord_id ?? null;
  if (landlordId) {
    // Try insert; ignore duplicate error
    const { error: ledErr } = await supabase.from('landlord_ledger').insert({
      landlord_id: landlordId,
      entry_type: 'CREDIT',
      amount: pay.amount,
      payment_id: pay.id,
      memo: `Payment ${pay.id} confirmed`,
    });
    // If uniqueness violation, ignore
    if (ledErr && !/duplicate/i.test(ledErr.message)) {
      return NextResponse.json({ error: ledErr.message }, { status: 500 });
    }
  }

  // Best-effort: mark an ISSUED invoice as PAID if amount covers it
  const { data: inv } = await supabase
    .from('invoice')
    .select('id, amount_due, status')
    .eq('lease_id', pay.lease_id)
    .eq('status', 'ISSUED')
    .order('due_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (inv && Number(inv.amount_due) <= Number(pay.amount)) {
    await supabase.from('invoice').update({ status: 'PAID' }).eq('id', inv.id);
  }

  // Optional email to tenant
  if (pay.tenant?.email) {
    await sendEmailIfConfigured(
      pay.tenant.email,
      'Your RentBack receipt is ready',
      `<p>Hi ${pay.tenant.full_name ?? ''},</p>
       <p>Your payment has been confirmed. You can download your receipt from the dashboard.</p>
       <p>Thanks,<br/>RentBack</p>`
    );
  }

  return NextResponse.json({ ok: true });
}
