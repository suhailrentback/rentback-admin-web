// app/audit/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

interface AuditRow {
  id?: string;
  created_at?: string;
  actor_id?: string | null;
  table_name?: string | null;
  operation?: string | null;
  record_pk?: string | null;
  old_data?: any | null;
  new_data?: any | null;
}

export default function AuditPage() {
  const supabase = getSupabaseBrowser();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  async function load() {
    setError(null);
    // Pull latest 200 rows; if your audit table has different columns, we still render safely.
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) { setError(error.message); return; }
    setRows((data ?? []) as AuditRow[]);
  }

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) { setError('Please sign in'); setLoading(false); return; }
      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const tab = tableFilter.trim().toLowerCase();
    const act = actorFilter.trim().toLowerCase();
    return rows.filter(r => {
      const okTable = tab ? String(r.table_name ?? '').toLowerCase().includes(tab) : true;
      const okActor = act ? String(r.actor_id ?? '').toLowerCase().includes(act) : true;
      return okTable && okActor;
    });
  }, [rows, tableFilter, actorFilter]);

  function toCsv(d: AuditRow[]): string {
    const header = ['created_at','table_name','operation','actor_id','record_pk'];
    const esc = (s: any) => String(s ?? '').replace(/"/g, '""');
    const body = d.map(r => header.map(h => `"${(esc as any)( (r as any)[h] )}"`).join(',')).join('\n');
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
          <input
            className="rounded-lg border px-3 py-2"
            value={tableFilter}
            onChange={e=>setTableFilter(e.target.value)}
          />
        </label>
        <label className="text-sm">Actor ID<br/>
          <input
            className="rounded-lg border px-3 py-2"
            value={actorFilter}
            onChange={e=>setActorFilter(e.target.value)}
          />
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
            {filtered.map((r, idx) => (
              <tr key={r.id ?? `${r.created_at}-${r.record_pk}-${idx}`} className="border-b">
                <td className="p-3">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                <td className="p-3">{r.table_name ?? '—'}</td>
                <td className="p-3">{r.operation ?? '—'}</td>
                <td className="p-3">{r.actor_id ?? '—'}</td>
                <td className="p-3">{r.record_pk ?? '—'}</td>
                <td className="p-3">
                  <details>
                    <summary className="cursor-pointer">View</summary>
                    <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify({ old: (r as any).old_data, new: (r as any).new_data }, null, 2)}
                    </pre>
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
