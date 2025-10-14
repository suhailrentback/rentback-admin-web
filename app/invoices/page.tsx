// app/invoices/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type LeaseRow = { id: string; tenant: { full_name: string | null } | null; unit: { unit_number: string | null } | null };
type InvoiceRow = { id: string; lease_id: string; amount_due: number; due_date: string; status: 'DRAFT'|'ISSUED'|'PAID'|'OVERDUE' };

export default function AdminInvoicesPage() {
  const supabase = getSupabaseBrowser();
  const [leases, setLeases] = useState<LeaseRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [leaseId, setLeaseId] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const [dueDate, setDueDate] = useState<string>('');
  const [error, setError] = useState<string|null>(null);
  const [ok, setOk] = useState<string|null>(null);

  async function load() {
    const [l, inv] = await Promise.all([
      supabase.from('lease').select(`id, tenant:tenant_id(full_name), unit:unit_id(unit_number)`).order('created_at', { ascending: false }),
      supabase.from('invoice').select(`id, lease_id, amount_due, due_date, status`).order('created_at', { ascending: false }),
    ]);
    if (l.error) setError(l.error.message); else {
      const rows = (l.data ?? []) as unknown as LeaseRow[];
      setLeases(rows);
      if (!leaseId && rows[0]?.id) setLeaseId(rows[0].id);
    }
    if (inv.error) setError(inv.error.message); else setInvoices((inv.data ?? []) as any);
  }

  useEffect(() => { (async () => { await load(); })(); }, []);

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOk(null);
    const amt = Number(amount);
    if (!(amt > 0)) { setError('Amount must be > 0'); return; }
    if (!dueDate) { setError('Pick a due date'); return; }

    const { error } = await supabase.from('invoice').insert({
      lease_id: leaseId,
      amount_due: amt,
      due_date: dueDate,
      status: 'ISSUED',
    });
    if (error) setError(error.message);
    else {
      setOk('Invoice issued.');
      setAmount('0');
      await load();
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Invoices</h1>

      <form onSubmit={createInvoice} className="grid gap-3 max-w-xl rounded-2xl border p-4">
        <div>
          <label className="block text-sm mb-1">Lease</label>
          <select className="w-full rounded-lg border px-3 py-2" value={leaseId} onChange={(e) => setLeaseId(e.target.value)}>
            {leases.map(l => (
              <option key={l.id} value={l.id}>
                {l.tenant?.full_name ?? 'Tenant'} — Unit {l.unit?.unit_number ?? '—'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Amount due</label>
          <input type="number" step="0.01" className="w-full rounded-lg border px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Due date</label>
          <input type="date" className="w-full rounded-lg border px-3 py-2" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <button type="submit" className="rounded-lg border px-4 py-2">Issue Invoice</button>
        {ok && <div className="text-green-600 text-sm">{ok}</div>}
        {/* errors rendered below if any */}
      </form>

      {invoices.length > 0 && (
        <div className="rounded-2xl border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Lease</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Due</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(i => (
                <tr key={i.id} className="border-b">
                  <td className="p-3">{i.id}</td>
                  <td className="p-3">{i.lease_id}</td>
                  <td className="p-3">{i.amount_due}</td>
                  <td className="p-3">{i.due_date}</td>
                  <td className="p-3">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
}
