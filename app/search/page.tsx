// app/search/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18n/index';

type Row = { kind: string; id: string; title: string; subtitle: string; created_at: string; };

export default function AdminSearchPage() {
  const supabase = getSupabaseBrowser();
  const { t } = useI18n();

  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) setError(t('common.signInRequired'));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_search', { q });
      if (error) throw error;
      setRows((data ?? []) as any);
    } catch (e:any) {
      setError(e.message ?? 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{t('search.title')}</h1>
      <form onSubmit={runSearch} className="flex gap-2 max-w-2xl">
        <input
          className="flex-1 rounded-lg border px-3 py-2"
          placeholder={t('search.placeholder')}
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button className="rounded-lg border px-4 py-2">
          {loading ? t('search.searching') : t('search.search')}
        </button>
      </form>

      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">{t('search.when')}</th>
              <th className="p-3">{t('search.kind')}</th>
              <th className="p-3">{t('search.titleCol')}</th>
              <th className="p-3">{t('search.subtitle')}</th>
              <th className="p-3">{t('search.id')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={`${r.kind}-${r.id}`} className="border-b">
                <td className="p-3">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                <td className="p-3">{r.kind}</td>
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.subtitle}</td>
                <td className="p-3">{r.id}</td>
              </tr>
            ))}
            {!rows.length && <tr><td className="p-3" colSpan={5}>{t('search.noResults')}</td></tr>}
          </tbody>
        </table>
      </div>

      {error && <div className="text-red-600 text-sm">{t('common.error')}: {error}</div>}
    </div>
  );
}
