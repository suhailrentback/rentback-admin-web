// app/payments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type PaymentRow = {
  id: string;
  amount: number;
  status: 'PENDING'|'CONFIRMED';
  reference: string | null;
  paid_at: string | null;
  created_at: string;
  lease: {
    id: string;
    unit: { unit_number: string | null; property: { name: string | null } | null } | null;
  } | null;
  tenant: { full_name: string | null; email: string | null } | null;
};

export default function AdminPaymentsPage() {
  const supabase = getSupabaseBrowser();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('payment')
      .select(`
        id, amount, status, reference, paid_at, created_at,
        lease:lease_id (
          id,
          unit:unit_id ( unit_number, property:property_id ( name ) )
        ),
        tenant:tenant_id ( full_name, email )
      `)
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setRows((data ?? []) as any);
  }

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) { setError('Please sign in'); setLoading(false); return; }
      await load();
      setLoading(false);
    })();
  }, [supabase]);

  async function confirm(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token ?? '';
      const res = await fetch(`/api/payments/${id}/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `Confirm failed with ${res.status}`);
      }
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="p-6">Loading payments…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Payments</h1>
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Created</th>
              <th className="p-3">Tenant</th>
              <th className="p-3">Property/Unit</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3">
                  {r.tenant?.full_name ?? '—'}
                  <div className="text-xs opacity-70">{r.tenant?.email ?? ''}</div>
                </td>
                <td className="p-3">
                  {r.lease?.unit?.property?.name ?? '—'}
                  <div className="text-xs opacity-70">
                    {r.lease?.unit?.unit_number ? `Unit ${r.lease.unit.unit_number}` : ''}
                  </div>
                </td>
                <td className="p-3">{r.amount}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{r.reference ?? '—'}</td>
                <td className="p-3">
                  {r.status === 'PENDING' ? (
                    <button
                      onClick={() => confirm(r.id)}
                      disabled={busyId === r.id}
                      className="rounded-lg border px-3 py-1"
                    >
                      {busyId === r.id ? 'Confirming…' : 'Confirm'}
                    </button>
                  ) : (
                    <span className="opacity-60">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-3" colSpan={7}>No payments</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
