// rentback-admin-web/app/leases/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type LeaseRow = {
  id: string;
  status: 'ACTIVE'|'ENDED'|'PENDING';
  start_date: string | null;
  end_date: string | null;
  monthly_rent: number;
  tenant: { full_name: string | null; email: string | null } | null;
  unit: { unit_number: string; property: { name: string | null; address: string | null } | null } | null;
};

export default function LeasesPage() {
  const supabase = getSupabaseBrowser();
  const [rows, setRows] = useState<LeaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) { setError('Please sign in'); setLoading(false); return; }

      const { data, error } = await supabase
        .from('lease')
        .select(`
          id, status, start_date, end_date, monthly_rent,
          tenant:tenant_id ( full_name, email ),
          unit:unit_id (
            unit_number,
            property:property_id ( name, address )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) setError(error.message);
      else setRows((data ?? []) as unknown as LeaseRow[]);
      setLoading(false);
    })();
  }, [supabase]);

  if (loading) return <div className="p-6">Loading leases…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Leases</h1>
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Tenant</th>
              <th className="p-3">Property / Unit</th>
              <th className="p-3">Status</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Monthly Rent</th>
              <th className="p-3">Lease ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.tenant?.full_name ?? '—'}<div className="text-xs opacity-70">{r.tenant?.email ?? ''}</div></td>
                <td className="p-3">
                  {r.unit?.property?.name ?? '—'}<div className="text-xs opacity-70">{r.unit?.unit_number ?? ''}</div>
                </td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{r.start_date ?? '—'}</td>
                <td className="p-3">{r.end_date ?? '—'}</td>
                <td className="p-3">{r.monthly_rent}</td>
                <td className="p-3">{r.id}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-3" colSpan={7}>No leases yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
