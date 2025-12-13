'use client';

import { useEffect, useMemo, useState } from 'react';
import getBrowserSupabase from '@/lib/supabase/browser';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type LedgerRow = {
  id: string;
  user_id: string;
  delta_points: number;
  reason: string;
  payment_id: string | null;
  redemption_id: string | null;
  created_at: string;
};

export default function GrantPointsPage() {
  const sb = useMemo(() => getBrowserSupabase(), []);
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);

  const [balance, setBalance] = useState<number | null>(null);
  const [recent, setRecent] = useState<LedgerRow[]>([]);

  const [points, setPoints] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function search() {
    setError(null);
    setOk(null);
    setSearching(true);
    try {
      const term = q.trim();
      if (!term) {
        setResults([]);
        return;
      }
      // Staff/Admin RLS should allow listing profiles.
      const { data, error } = await sb
        .from('profiles')
        .select('id,email,full_name')
        .ilike('email', `%${term}%`)
        .order('email', { ascending: true })
        .limit(25);
      if (error) throw error;
      setResults((data ?? []) as Profile[]);
    } catch (e: any) {
      setError(e.message ?? String(e));
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function loadUserState(userId: string) {
    setError(null);
    setOk(null);
    // Balance (sum of deltas) – fetch up to 5000 rows and sum client-side.
    const MAX = 5000;
    const [{ data: deltas, error: e1 }, { data: recentRows, error: e2 }] = await Promise.all([
      sb
        .from('reward_ledger')
        .select('delta_points')
        .eq('user_id', userId)
        .limit(MAX),
      sb
        .from('reward_ledger')
        .select('id,user_id,delta_points,reason,payment_id,redemption_id,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (e1) {
      setError(e1.message);
      setBalance(null);
    } else {
      const sum = (deltas ?? []).reduce((acc: number, r: any) => acc + (r.delta_points as number), 0);
      setBalance(sum);
    }

    if (e2) {
      setError(e2.message);
      setRecent([]);
    } else {
      setRecent((recentRows ?? []) as LedgerRow[]);
    }
  }

  useEffect(() => {
    if (selected?.id) loadUserState(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  async function grant() {
    setError(null);
    setOk(null);

    if (!selected) {
      setError('Select a user first.');
      return;
    }
    const n = parseInt(points, 10);
    if (!Number.isFinite(n) || n === 0) {
      setError('Points must be a non-zero integer (positive for grant, negative for debit).');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required.');
      return;
    }

    const confirmMsg = [
      `Are you sure you want to ${n > 0 ? 'GRANT' : 'DEBIT'} ${Math.abs(n)} points?`,
      `User: ${selected.email ?? selected.id}`,
      `Reason: ${reason.trim()}`,
      `Note: Ledger is append-only.`,
    ].join('\n');

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      // Staff/Admin bypass guard is allowed by RLS (is_staff_or_admin()).
      const { error } = await sb.from('reward_ledger').insert({
        user_id: selected.id,
        delta_points: n,
        reason: reason.trim(),
      });
      if (error) throw error;

      setOk('Points recorded.');
      setPoints('');
      // keep reason in field for batch entries if desired
      await loadUserState(selected.id);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Rewards • Manual Grant/Debit</h1>
        <div className="text-sm opacity-70">Admin/Staff only • Append-only</div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {ok}
        </div>
      )}

      {/* User picker */}
      <section className="rounded-2xl border p-4 shadow-sm space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Search by email</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              placeholder="tenant@example.com"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
          </div>
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium border ${searching ? 'opacity-40 cursor-not-allowed' : 'hover:shadow'}`}
            onClick={search}
            disabled={searching}
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="rounded-xl border overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">User ID</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.email ?? '—'}</td>
                    <td className="px-3 py-2">{r.full_name ?? '—'}</td>
                    <td className="px-3 py-2 text-xs break-all">{r.id}</td>
                    <td className="px-3 py-2">
                      <button
                        className="rounded-full px-3 py-1.5 text-sm border hover:shadow"
                        onClick={() => setSelected(r)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Selected user & balance */}
      {selected && (
        <section className="rounded-2xl border p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm opacity-70">Selected user</div>
              <div className="font-medium">{selected.email ?? '—'}</div>
              <div className="text-xs opacity-70">{selected.full_name ?? 'No name'} • {selected.id}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70">Current balance</div>
              <div className="text-xl font-semibold tabular-nums">
                {balance === null ? '…' : balance}
              </div>
            </div>
          </div>

          {/* Grant/debit form */}
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm mb-1">Points</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="e.g., 100 or -50"
                inputMode="numeric"
              />
              <p className="text-xs opacity-70 mt-1">Positive = grant, Negative = debit</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Reason</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., bonus:welcome, adjust:manual"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={grant}
              className={`rounded-full px-4 py-2 text-sm font-medium border ${submitting ? 'opacity-40 cursor-not-allowed' : 'hover:shadow'}`}
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Record entry'}
            </button>
            <button
              onClick={() => { setPoints(''); /* keep reason */ }}
              className="rounded-full px-4 py-2 text-sm font-medium border hover:shadow"
              type="button"
            >
              Clear points
            </button>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border overflow-hidden">
            <div className="border-b px-4 py-2 text-sm font-medium">Recent ledger entries</div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Δ Points</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Redemption</th>
                  <th className="px-3 py-2">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.length === 0 ? (
                  <tr><td className="px-3 py-3 text-center opacity-70" colSpan={6}>No entries</td></tr>
                ) : recent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 whitespace-nowrap">{fmt(r.created_at)}</td>
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
        </section>
      )}
    </div>
  );
}

function fmt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
