// app/admin/offers/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import getBrowserSupabase from '@/lib/supabase/browser';

type Offer = {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  is_active: boolean;
  stock: number | null;           // null = unlimited
  created_at: string;
  updated_at: string;
};

type Editing = {
  id: string;
  title: string;
  description: string;
  points_cost: string;            // input field
  stock: string;                  // input field; '' -> null
  is_active: boolean;
};

export default function AdminOffersPage() {
  const sb = useMemo(() => getBrowserSupabase(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [list, setList] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [nTitle, setNTitle] = useState('');
  const [nDesc, setNDesc] = useState('');
  const [nCost, setNCost] = useState('');
  const [nStock, setNStock] = useState('');
  const [nActive, setNActive] = useState(true);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Editing | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await sb
      .from('reward_offers')
      .select('id,title,description,points_cost,is_active,stock,created_at,updated_at')
      .order('updated_at', { ascending: false });
    if (error) {
      setError(error.message);
      setList([]);
    } else {
      setList((data ?? []) as Offer[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toIntOrThrow(v: string, field: string): number {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      throw new Error(`${field} must be a positive integer`);
    }
    return n;
  }

  function toNullableStock(v: string): number | null {
    const t = String(v ?? '').trim();
    if (t === '') return null;
    const n = Number(t);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      throw new Error(`Stock must be a non-negative integer or blank for unlimited`);
    }
    return n;
  }

  async function createOffer() {
    try {
      setSaving('create');
      setError(null);
      if (!nTitle.trim()) throw new Error('Title is required');
      const cost = toIntOrThrow(nCost, 'Cost');
      const stock = toNullableStock(nStock);

      const { error } = await sb.from('reward_offers').insert({
        title: nTitle.trim(),
        description: nDesc.trim() || null,
        points_cost: cost,
        stock,
        is_active: nActive,
        // updated_at auto-bumped by trigger in SQL
      });
      if (error) throw error;

      setNTitle(''); setNDesc(''); setNCost(''); setNStock(''); setNActive(true);
      await load();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(null);
    }
  }

  function startEdit(o: Offer) {
    setEditingId(o.id);
    setEdit({
      id: o.id,
      title: o.title,
      description: o.description ?? '',
      points_cost: String(o.points_cost),
      stock: o.stock == null ? '' : String(o.stock),
      is_active: o.is_active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit(null);
  }

  async function saveEdit() {
    if (!edit) return;
    try {
      setSaving(edit.id);
      setError(null);

      const cost = toIntOrThrow(edit.points_cost, 'Cost');
      const stock = toNullableStock(edit.stock);

      const { error } = await sb
        .from('reward_offers')
        .update({
          title: edit.title.trim(),
          description: edit.description.trim() || null,
          points_cost: cost,
          stock,
          is_active: edit.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', edit.id);

      if (error) throw error;
      cancelEdit();
      await load();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(null);
    }
  }

  async function toggleActive(o: Offer) {
    try {
      setSaving(`toggle:${o.id}`);
      setError(null);
      const { error } = await sb
        .from('reward_offers')
        .update({ is_active: !o.is_active, updated_at: new Date().toISOString() })
        .eq('id', o.id);
      if (error) throw error;
      await load();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(null);
    }
  }

  async function removeOffer(o: Offer) {
    try {
      setSaving(`delete:${o.id}`);
      setError(null);
      const { error } = await sb.from('reward_offers').delete().eq('id', o.id);
      if (error) throw error;
      await load();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Reward Offers</h1>
        <div className="text-sm opacity-70">Admin • CRUD</div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create */}
      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="text-lg font-medium">Create new offer</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="e.g., €5 Coffee Voucher"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full rounded-xl border px-3 py-2 min-h-[80px]"
              value={nDesc} onChange={(e) => setNDesc(e.target.value)} placeholder="Optional details"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Points cost</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              inputMode="numeric"
              value={nCost} onChange={(e) => setNCost(e.target.value)} placeholder="e.g., 500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Stock (blank = unlimited)</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              inputMode="numeric"
              value={nStock} onChange={(e) => setNStock(e.target.value)} placeholder=""
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="nActive" type="checkbox" checked={nActive} onChange={(e) => setNActive(e.target.checked)} />
            <label htmlFor="nActive" className="text-sm">Active</label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={createOffer}
            disabled={saving === 'create'}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${saving === 'create' ? 'opacity-40 cursor-not-allowed' : 'hover:shadow'}`}
          >
            {saving === 'create' ? 'Saving…' : 'Create offer'}
          </button>
        </div>
      </section>

      {/* List */}
      <section className="rounded-2xl border overflow-hidden">
        <div className="border-b px-4 py-3 font-medium flex items-center justify-between">
          <span>All offers</span>
          {loading && <span className="text-xs opacity-60">Loading…</span>}
        </div>

        {list.length === 0 ? (
          <div className="p-4 text-sm opacity-70">No offers yet.</div>
        ) : (
          <ul className="divide-y">
            {list.map((o) => {
              const isEditing = editingId === o.id;
              return (
                <li key={o.id} className="px-4 py-3">
                  {!isEditing ? (
                    <div className="grid gap-2 sm:grid-cols-12 sm:items-center">
                      <div className="sm:col-span-4 min-w-0">
                        <div className="font-medium truncate">{o.title}</div>
                        {o.description && <div className="text-sm opacity-70 truncate">{o.description}</div>}
                      </div>
                      <div className="sm:col-span-2 text-sm">
                        Cost: <span className="font-semibold tabular-nums">{o.points_cost}</span>
                      </div>
                      <div className="sm:col-span-2 text-sm">
                        {o.stock == null ? 'Unlimited' : <span className="tabular-nums">{o.stock} left</span>}
                      </div>
                      <div className="sm:col-span-2 text-sm">
                        <span className={`inline-flex items-center gap-2 ${o.is_active ? 'text-emerald-600' : 'text-amber-600'}`}>
                          <span className="h-2 w-2 rounded-full border" />
                          {o.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="sm:col-span-2 flex gap-2 justify-end">
                        <button
                          onClick={() => toggleActive(o)}
                          disabled={saving === `toggle:${o.id}`}
                          className={`rounded-full px-3 py-1.5 text-sm border ${saving === `toggle:${o.id}` ? 'opacity-40' : 'hover:shadow'}`}
                        >
                          {o.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => startEdit(o)}
                          className="rounded-full px-3 py-1.5 text-sm border hover:shadow"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeOffer(o)}
                          disabled={saving === `delete:${o.id}`}
                          className={`rounded-full px-3 py-1.5 text-sm border hover:shadow ${saving === `delete:${o.id}` ? 'opacity-40' : ''}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                      <div className="sm:col-span-4">
                        <label className="block text-xs mb-1">Title</label>
                        <input
                          className="w-full rounded-xl border px-3 py-2"
                          value={edit!.title}
                          onChange={(e) => setEdit(v => v ? { ...v, title: e.target.value } : v)}
                        />
                        <label className="block text-xs mt-3 mb-1">Description</label>
                        <textarea
                          className="w-full rounded-xl border px-3 py-2 min-h-[60px]"
                          value={edit!.description}
                          onChange={(e) => setEdit(v => v ? { ...v, description: e.target.value } : v)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs mb-1">Points cost</label>
                        <input
                          className="w-full rounded-xl border px-3 py-2"
                          inputMode="numeric"
                          value={edit!.points_cost}
                          onChange={(e) => setEdit(v => v ? { ...v, points_cost: e.target.value } : v)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs mb-1">Stock (blank = unlimited)</label>
                        <input
                          className="w-full rounded-xl border px-3 py-2"
                          inputMode="numeric"
                          value={edit!.stock}
                          onChange={(e) => setEdit(v => v ? { ...v, stock: e.target.value } : v)}
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          id={`active-${edit!.id}`}
                          type="checkbox"
                          checked={edit!.is_active}
                          onChange={(e) => setEdit(v => v ? { ...v, is_active: e.target.checked } : v)}
                        />
                        <label htmlFor={`active-${edit!.id}`} className="text-sm">Active</label>
                      </div>
                      <div className="sm:col-span-2 flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-full px-3 py-1.5 text-sm border hover:shadow"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={saving === edit!.id}
                          className={`rounded-full px-3 py-1.5 text-sm border ${saving === edit!.id ? 'opacity-40 cursor-not-allowed' : 'hover:shadow'}`}
                        >
                          {saving === edit!.id ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
