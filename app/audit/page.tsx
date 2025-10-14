// app/audit/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type AuditRow = {
  id?: string;
  created_at?: string;
  actor_id?: string | null;
  table_name?: string | null;
  operation?: string | null;
  record_pk?: string | null;
  old_data?: any | null;
  new_data?: any | null;
  -- // Note: if your audit schema differs, we safely ignore missing fields at runtime
};

export default function AuditPage() {
  const supabase = getSupabaseBrowser();
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState<string>('');
  const [actorFilter, setActorFilter] = useState<string>('');

  async function load() {
    setError(null);
    // Fetch latest 200 audit entries; adapt to your audit_log shape
    let query = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200) as any;
    const { data, error } = await query;
    if (error) { setError(error.message); return; }
    setRows(data || []);
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
    return rows.filter(r => {
      const okTable = tableFilter ? (String(r.table_name || '').toLowerCase().includes(tableFilter.toLowerCase())) : true;
      const okActor = actorFilter ? (String(r.actor_id || '').toLowerCase().includes(actorFilter.toLowerCase())) : true;
      return okTable && okActor;
    });
  }, [rows, tableFilter, actorFilter]);

  function toCsv(d: any[]): string {
    const header = ['created_at','table_name','operation','actor_id','record_pk'];
    const esc = (s: any) => String(s ?? '').replace(/"/g, '""');
    const body = d.map(r => header.map(h => `"${esc(r[h])}"`).join(',')).join('\n');
    return header.join(',') + '\n' + body + '\n';
  }

  function exportCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'audit_export.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (loading) return <div className="p-6">Loading audit…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">Table<br/>
          <input className="rounded-lg border px-3 py-2" value={tableFilter} onChange={e=>setTableFilter(e.target.value)} />
        </label>
        <label className="text-sm">Actor ID<br/>
          <input className="rounded-lg border px-3 py-2" value={actorFilter} onChange={e=>setActorFilter(e.target.value)} />
        </label>
        <button onClick={exportCsv} className="rounded-lg border px-4 py-2">Export CSV</button>
      </div>

      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Time</th>
              <th className="p-3">Table</th>
              <th className="p-3">Op</th>
              <th className="p-3">Actor</th>
              <th className="p-3">PK</th>
              <th className="p-3">Changes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id ?? `${r.created_at}-${r.record_pk}`}>
                <td className="p-3">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                <td className="p-3">{r.table_name ?? '—'}</td>
                <td className="p-3">{r.operation ?? '—'}</td>
                <td className="p-3">{r.actor_id ?? '—'}</td>
                <td className="p-3">{r.record_pk ?? '—'}</td>
                <td className="p-3">
                  <details>
                    <summary className="cursor-pointer">View</summary>
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify({ old: r.old_data, @new: r.new_data }, null, 2)}</pre>
                  </details>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td className="p-3" colSpan={6}>No audit rows</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
