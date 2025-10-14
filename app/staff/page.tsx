// app/staff/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18n/index';

type UserRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: 'TENANT'|'LANDLORD'|'STAFF'|'ADMIN';
  last_login: string | null;
};

export default function StaffPage() {
  const supabase = getSupabaseBrowser();
  const { t } = useI18n();

  const [staff, setStaff] = useState<UserRow[]>([]);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<UserRow[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function loadStaff() {
    setError(null);
    const res = await supabase
      .from('profile')
      .select('user_id, full_name, email, role, last_login')
      .in('role', ['STAFF','ADMIN'])
      .order('role', { ascending: false })
      .order('last_login', { ascending: false, nullsFirst: true });
    if (res.error) { setError(res.error.message); return; }
    setStaff((res.data ?? []) as any);
  }

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) { setError(t('common.signInRequired')); return; }
      await loadStaff();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search() {
    setError(null);
    const res = await supabase
      .from('profile')
      .select('user_id, full_name, email, role, last_login')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);
    if (res.error) { setError(res.error.message); return; }
    setFound((res.data ?? []) as any);
  }

  async function call(path: string, userId: string) {
    setBusy(userId); setError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token ?? '';
      const res = await fetch(path.replace(':userId', userId), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json().catch(()=>({}));
      if (!res.ok || (j && j.error)) throw new Error(j.error || 'Action failed');
      await loadStaff();
      await search();
    } catch (e:any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('staff.title')}</h1>

      <div className="rounded-2xl border p-4 space-y-3 max-w-2xl">
        <div className="font-medium">{t('staff.findUser')}</div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-2"
            placeholder={t('staff.searchPlaceholder')}
            value={query}
            onChange={e=>setQuery(e.target.value)}
          />
          <button onClick={search} className="rounded-lg border px-4 py-2">
            {t('staff.search')}
          </button>
        </div>

        {!!found.length && (
          <div className="rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-3">{t('staff.user')}</th>
                  <th className="p-3">{t('staff.role')}</th>
                  <th className="p-3">{t('staff.lastLogin')}</th>
                  <th className="p-3">{t('staff.actions')}</th>
                </tr>
              </thead>
              <tbody>
              {found.map(u=>(
                <tr key={u.user_id} className="border-b">
                  <td className="p-3">
                    {u.full_name ?? u.email ?? u.user_id}
                    <div className="text-xs opacity-70">{u.email ?? ''}</div>
                  </td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {u.role === 'STAFF' || u.role === 'ADMIN' ? (
                        <button
                          disabled={busy===u.user_id}
                          onClick={()=>call('/api/staff/:userId/demote', u.user_id)}
                          className="rounded-lg border px-3 py-1"
                        >
                          {busy===u.user_id ? t('staff.working') : t('staff.demote')}
                        </button>
                      ) : (
                        <button
                          disabled={busy===u.user_id}
                          onClick={()=>call('/api/staff/:userId/promote', u.user_id)}
                          className="rounded-lg border px-3 py-1"
                        >
                          {busy===u.user_id ? t('staff.working') : t('staff.promote')}
                        </button>
                      )}
                      <button
                        disabled={busy===u.user_id}
                        onClick={()=>call('/api/staff/:userId/signout', u.user_id)}
                        className="rounded-lg border px-3 py-1"
                      >
                        {t('staff.forceSignOut')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border overflow-x-auto">
        <div className="p-3 font-medium">{t('staff.currentStaff')}</div>
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">{t('staff.user')}</th>
              <th className="p-3">{t('staff.user')}</th>
              <th className="p-3">{t('staff.role')}</th>
              <th className="p-3">{t('staff.lastLogin')}</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(u=>(
              <tr key={u.user_id} className="border-b">
                <td className="p-3">{u.full_name ?? '—'}</td>
                <td className="p-3">{u.email ?? '—'}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
              </tr>
            ))}
            {!staff.length && <tr><td className="p-3" colSpan={4}>{t('staff.noStaff')}</td></tr>}
          </tbody>
        </table>
      </div>

      {error && <div className="text-red-600 text-sm">{t('common.error')}: {error}</div>}
    </div>
  );
}
