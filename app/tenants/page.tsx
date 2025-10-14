// rentback-admin-web/app/tenants/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type TenantRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: 'TENANT'|'LANDLORD'|'STAFF'|'ADMIN';
  created_at: string;
};

export default function TenantsPage() {
  const supabase = getSupabaseBrowser();
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) { setError('Please sign in'); setLoading(false); return; }

      const { data, error } = await supabase
        .from('profile')
        .select('user_id, full_name, email, role, created_at')
        .in('role', ['TENANT']);

      if (error) setError(error.message);
      else setRows((data ?? []) as unknown as TenantRow[]);
      setLoading(false);
    })();
  }, [supabase]);

  if (loading) return <div className="p-6">Loading tenants…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tenants</h1>
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Joined</th>
              <th className="p-3">User ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.user_id} className="border-b">
                <td className="p-3">{r.full_name ?? '—'}</td>
                <td className="p-3">{r.email ?? '—'}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3">{r.user_id}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-3" colSpan={4}>No tenants yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
