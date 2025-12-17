// app/staff/page.tsx
import { createClient } from '@supabase/supabase-js';
import ForceSignOutButton from '@/components/ForceSignOutButton';

type Row = { id: string; email: string; last_sign_in_at: string | null };

{/* at the top */}
import RoleToggleButton from "@/components/RoleToggleButton";

{/* in the row */}
<RoleToggleButton
  userId={u.id}
  isStaff={u?.app_metadata?.role === "staff"}
  disabled={noService}
/>

export default async function StaffPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let users: Row[] = [];
  let noService = false;

  if (url && service) {
    const admin = createClient(url, service, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (!error) {
      users =
        data?.users?.map((u) => ({
          id: u.id,
          email: u.email ?? '',
          last_sign_in_at: u.last_sign_in_at ?? null,
        })) ?? [];
    }
  } else {
    noService = true;
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Staff</h1>
        <a
          href="/admin/api/users/export"
          className="rounded-xl px-3 py-2 border text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          Export CSV
        </a>
      </div>

      {noService ? (
        <p className="text-sm opacity-70">
          Service role key not configured — listing disabled. Buttons will no-op
          gracefully.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Last login</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={3}>
                  No users to display.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="p-3">{u.email || '—'}</td>
                  <td className="p-3">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="p-3">
                    <ForceSignOutButton userId={u.id} disabled={noService} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
