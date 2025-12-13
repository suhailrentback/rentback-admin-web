'use client';

import { useEffect, useMemo, useState } from 'react';
import getBrowserSupabase from '@/lib/supabase/browser';

type Row = {
  id: string;
  user_id: string;
  delta_points: number;
  reason: string;
  payment_id: string | null;
  redemption_id: string | null;
  created_at: string;
  profiles: { id: string; full_name: string | null; email: string | null } | null;
};

const PAGE_SIZE = 50;

export default function RewardLedgerPage() {
  const sb = useMemo(() => getBrowserSupabase(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [qEmail, setQEmail] = useState('');
  const [qReason, setQReason] = useState('');
  const [fromDate, setFromDate] = useState<string>(''); // yyyy-mm-dd
  const [toDate, setToDate] = useState<string>('');     // yyyy-mm-dd

  // Data
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number>(0);

  function resetAndLoad() {
    setPage(1);
    load(1);
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function load(targetPage = 1) {
    setLoading(true);
    setError(null);
    try {
      const rangeFrom = (targetPage - 1) * PAGE_SIZE;
      const rangeTo = rangeFrom + PAGE_SIZE - 1;

      let query = sb
        .from('reward_ledger')
        .select(
          `
            id,
            user_id,
            delta_points,
            reason,
            payment_id,
            redemption_id,
            created_at,
            profiles:profiles(id,full_name,email)
          `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo);

      if (qEmail.trim()) {
        // filter via related profile email ilike
        query = query.ilike('profiles.email', `%${qEmail.trim()}%`);
      }
      if (qReason.trim()) {
        query = query.ilike('reason', `%${qReason.trim()}%`);
      }
      if (fromDate) {
        query = query.gte('created_at', new Date(fromDate + 'T00:00:00.000Z').toISOString());
      }
      if (toDate) {
        // inclusive end-of-day
        query = query.lte('created_at', new Date(toDate + 'T23:59:59.999Z').toISOString());
      }

      const { data, error, count } = await query as any;
      if (error) throw error;
      setRows((data ?? []) as Row[]);
      setTotal(count ?? 0);
    } catch (e: any) {
      setError(e.message ?? String(e));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function exportCSV() {
    setLoading(true);
    setError(null);
    try {
      // Pull up to 5000 matching rows for export (adjust if needed)
      const MAX = 5000;
      let query = sb
        .from('reward_ledger')
        .select(
          `
            id,
            user_id,
            delta_points,
            reason,
            payment_id,
            redemption_id,
            created_at,
            profiles:profiles(id,full_name,email)
          `
        )
        .order('created_at', { ascending: false })
        .limit(MAX);

      if (qEmail.trim()) {
        query = query.ilike('profiles.email', `%${qEmail.trim()}%`);
      }
      if (qReason.trim()) {
        query = query.ilike('reason', `%${qReason.trim()}%`);
      }
      if (fromDate) {
        query = query.gte('created_at', new Date(fromDate + 'T00:00:00.000Z').toISOString());
      }
      if (toDate) {
        query = query.lte('created_at', new Date(toDate + 'T23:59:59.999Z').toISOString());
      }

      const { data, error } = await query as any;
      if (error) throw error;

      const rows: Row[] = (data ?? []) as Row[];
      const header = [
        'ledger_id',
        'created_at',
        'user_id',
        'user_email',
        'user_name',
        'delta_points',
        'reason',
        'payment_id',
        'redemption_id',
      ];

      const lines = [header.join(',')];
      for (const r of rows) {
        const csvRow = [
          r.id,
          r.created_at,
          r.user_id,
          stringifyCSV(r.profiles?.email ?? ''),
          stringifyCSV(r.profiles?.full_name ?? ''),
          String(r.delta_points),
          stringifyCSV(r.reason),
          r.payment_id ?? '',
          r.redemption_id ?? '',
        ];
        lines.push(csvRow.join(','));
      }

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.download = `reward_ledger_${stamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Reward Ledger</h1>
        <div className="text-sm opacity-70">Admin • Read-only • CSV export</div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Tenant email contains</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={qEmail}
              onChange={(e) => setQEmail(e.target.value)}
              placeholder="e.g., user@domain.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Reason contains</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={qReason}
              onChange={(e) => setQReason(e.target.value)}
              placeholder="e.g., redeem:offer or earn:payment"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">From date</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">To date</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={resetAndLoad}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${loading ? 'opacity-40 cursor-not-allowed' : 'hover:shadow'}`}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Apply filters'}
          </button>
          <button
            onClick={exportCSV}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${loading ? 'opacity-40 cursor-not-allowed' : 'hover:shadow'}`}
            disabled={loading}
          >
            Export CSV
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border overflow-hidden">
        <div className="border-b px-4 py-3 font-medium flex items-center justify-between">
          <span>Results {total ? `(${total.toLocaleString()})` : ''}</span>
          {loading && <span className="text-xs opacity-60">Loading…</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Δ Points</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Payment</th>
                <th className="px-3 py-2">Redemption</th>
                <th className="px-3 py-2">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 ? (
                <tr><td className="px-3 py-3 text-center opacity-70" colSpan={8}>No data</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDT(r.created_at)}</td>
                  <td className="px-3 py-2 break-all">{r.profiles?.email ?? '—'}</td>
                  <td className="px-3 py-2">{r.profiles?.full_name ?? '—'}</td>
                  <td className={`px-3 py-2 tabular-nums ${r.delta_points >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {r.delta_points >= 0 ? `+${r.delta_points}` : r.delta_points}
                  </td>
                  <td className="px-3 py-2">{r.reason}</td>
                  <td className="px-3 py-2 text-xs break-all">{r.payment_id ?? '—'}</td>
                  <td className="px-3 py-2 text-xs break-all">{r.redemption_id ?? '—'}</td>
                  <td className="px-3 py-2 text-xs break-all">{r.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pager */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-xs opacity-70">
            Page {page} of {totalPages} • {PAGE_SIZE} per page
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-full px-3 py-1.5 text-sm border hover:shadow disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Prev
            </button>
            <button
              className="rounded-full px-3 py-1.5 text-sm border hover:shadow disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/** CSV escape: wrap if needed and escape quotes */
function stringifyCSV(value: string) {
  const needsWrap = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsWrap ? `"${escaped}"` : escaped;
}

function formatDT(iso: string) {
  try {
    const d = new Date(iso);
    // Local date & time without seconds
    return d.toLocaleString(undefined, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return iso;
  }
}
