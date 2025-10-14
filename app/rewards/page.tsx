// app/rewards/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type Offer = {
  id: string;
  name: string;
  points_cost: number;
  is_active: boolean;
  stock: number | null;
  expires_at: string | null;
  created_at: string;
};

type LedgerRow = {
  id: string;
  user_id: string;
  delta: number;
  reason: string | null;
  created_at: string;
  payment?: { id: string | null } | null;
  offer?: { name: string | null } | null;
  user?: { full_name: string | null; email: string | null } | null;
};

export default function AdminRewardsPage() {
  const supabase = getSupabaseBrowser();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  // Create form
  const [name, setName] = useState('');
  const [cost, setCost] = useState('100');
  const [stock, setStock] = useState<string>(''); // empty = unlimited
  const [expires, setExpires] = useState<string>(''); // empty = no expiry
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setError(null);
    const o = await supabase
      .from('reward_offer')
      .select('id, name, points_cost, is_active, stock, expires_at, created_at')
      .order('created_at', { ascending: false });
    if (o.error) { setError(o.error.message); return; }
    setOffers((o.data ?? []) as Offer[]);

    const l = await supabase
      .from('reward_ledger')
      .select(`
        id, user_id, delta, reason, created_at,
        payment:payment_id ( id ),
        offer:offer_id ( name ),
        user:user_id ( full_name, email )
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    if (l.error) { setError(l.error.message); return; }
    setLedger((l.data ?? []) as any);
  }

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) { setError('Please sign in'); setLoading(false); return; }
      await load();
      setLoading(false);
    })();
  }, [supabase]);

  async function createOffer(e: React.FormEvent) {
    e.preventDefault();
    setOk(null); setError(null);
    try {
      const payload: any = {
        name,
        points_cost: Number(cost),
        is_active: true,
      };
      if (stock !== '') payload.stock = Number(stock);
      if (expires) payload.expires_at = expires;
      const res = await supabase.from('reward_offer').insert(payload);
      if (res.error) throw res.error;
      setOk('Offer created');
      setName(''); setCost('100'); setStock(''); setExpires('');
      await load();
    } catch (e:any) {
      setError(e.message ?? 'Create failed');
    }
  }

  async function toggleActive(id: string, current: boolean) {
    setError(null);
    const res = await supabase.from('reward_offer').update({ is_active: !current }).eq('id', id);
    if (res.error) { setError(res.error.message); return; }
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Rewards</h1>

      {/* Create Offer */}
      <form onSubmit={createOffer} className="grid gap-3 max-w-xl rounded-2xl border p-4">
        <div className="text-lg font-medium">Create Offer</div>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full rounded-lg border px-3 py-2" required value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Points Cost</label>
          <input type="number" min="1" className="w-full rounded-lg border px-3 py-2" required value={cost} onChange={e => setCost(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Stock (optional)</label>
          <input type="number" min="0" className="w-full rounded-lg border px-3 py-2" placeholder="leave blank = unlimited" value={stock} onChange={e => setStock(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Expires (optional)</label>
          <input type="date" className="w-full rounded-lg border px-3 py-2" value={expires} onChange={e => setExpires(e.target.value)} />
        </div>
        <button type="submit" className="rounded-lg border px-4 py-2">Create</button>
        {ok && <div className="text-green-700 text-sm">{ok}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>

      {/* Offers list */}
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Created</th>
              <th className="p-3">Name</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Active</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id} className="border-b">
                <td className="p-3">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.points_cost}</td>
                <td className="p-3">{o.stock ?? '—'}</td>
                <td className="p-3">{o.expires_at ? new Date(o.expires_at).toLocaleDateString() : '—'}</td>
                <td className="p-3">{o.is_active ? 'Yes' : 'No'}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(o.id, o.is_active)} className="rounded-lg border px-3 py-1">
                    {o.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {!offers.length && <tr><td className="p-3" colSpan={7}>No offers</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Ledger */}
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Delta</th>
              <th className="p-3">Offer/Payment</th>
              <th className="p-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3">
                  {r.user?.full_name ?? r.user_id}
                  <div className="text-xs opacity-70">{r.user?.email ?? ''}</div>
                </td>
                <td className="p-3">{r.delta}</td>
                <td className="p-3">
                  {r.offer?.name ? `Offer: ${r.offer.name}` : r.payment?.id ? `Payment: ${r.payment.id}` : '—'}
                </td>
                <td className="p-3">{r.reason ?? '—'}</td>
              </tr>
            ))}
            {!ledger.length && <tr><td className="p-3" colSpan={5}>No ledger rows</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
