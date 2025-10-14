// app/payouts/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type PayoutRow = {
  id: string;
  landlord_id: string;
  amount: number;
  status: 'REQUESTED'|'APPROVED'|'DENIED';
  note: string | null;
  requested_at: string;
  approved_at: string | null;
  denied_at: string | null;
  landlord?: { full_name: string | null; email: string | null } | null;
};

export default function AdminPayoutsPage() {
  const supabase = getSupabaseBrowser();
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL'|PayoutRow['status']>('ALL');
  const [busy, setBusy] = useState<string | null>(null);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  async function load() {
    const { data, error } = await supabase
      .from('payout')
      .select(`
        id, landlord_id, amount, status, note, requested_at, approved_at, denied_at,
        landlord:landlord_id ( full_name, email )
      `)
      .order('requested_at', { ascending: false });

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

  const filtered = useMemo(() => {
    return rows.filter(r => statusFilter === 'ALL' ? true : r.status === statusFilter);
  }, [rows, statusFilter]);

  async function act(id: string, action: 'approve'|'deny') {
    setBusy(id); setError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token ?? '';
      const res = await fetch(`/api/payouts/${id}/${action}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `${action} failed`);
      }
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function exportCsv() {
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token ?? '';
      const url = new URL('/api/payouts/export', window.location.origin);
      if (start) url.searchParams.set('start', start);
      if (end) url.searchParams.set('end', end);
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `payouts_${start || 'all'}_${end || 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) return <div className="p-6">Loading payouts…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Payouts</h1>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Status<br/>
          <select className="rounded-lg border px-3 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
            <option value="ALL">All</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="DENIED">Denied</option>
          </select>
        </label>
        <label className="text-sm">
          Start (approved)<br/>
          <input type="date" className="rounded-lg border px-3 py-2" value={start} onChange={e => setStart(e.target.value)} />
        </label>
        <label className="text-sm">
          End (approved)<br/>
          <input type="date" className="rounded-lg border px-3 py-2" value={end} onChange={e => setEnd(e.target.value)} />
        </label>
        <button onClick={exportCsv} className="rounded-lg border px-4 py-2">Export CSV</button>
      </div>

      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Requested</th>
              <th className="p-3">Landlord</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Approved/Denied</th>
              <th className="p-3">Note</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{new Date(r.requested_at).toLocaleString()}</td>
                <td className="p-3">
                  {r.landlord?.full_name ?? r.landlord_id}
                  <div className="text-xs opacity-70">{r.landlord?.email ?? ''}</div>
                </td>
                <td className="p-3">{r.amount}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{r.approved_at ?? r.denied_at ?? '—'}</td>
                <td className="p-3">{r.note ?? '—'}</td>
                <td className="p-3">
                  {r.status === 'REQUESTED' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(r.id, 'approve')}
                        disabled={busy === r.id}
                        className="rounded-lg border px-3 py-1"
                      >
                        {busy === r.id ? 'Working…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => act(r.id, 'deny')}
                        disabled={busy === r.id}
                        className="rounded-lg border px-3 py-1"
                      >
                        Deny
                      </button>
                    </div>
                  ) : <span className="opacity-60">—</span>}
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td className="p-3" colSpan={7}>No payouts</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
