// app/admin/users/page.tsx
import { createClient } from "@supabase/supabase-js";
import ForceSignOutButton from "@/components/ForceSignOutButton";

// Server component — fetch first 50 users via service role for admin use
export default async function AdminUsersPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-red-600 mt-2">
          Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
        </p>
      </div>
    );
  }

  const admin = createClient(url, serviceKey);
  const { data, error } = await (admin as any).auth.admin.listUsers({
    page: 1,
    perPage: 50,
  });
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }
  const users = (data?.users ?? []) as Array<{
    id: string;
    email?: string | null;
    phone?: string | null;
    last_sign_in_at?: string | null;
    created_at?: string;
  }>;

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">User ID</th>
              <th className="text-left p-3 font-semibold">Last sign-in</th>
              <th className="text-left p-3 font-semibold">Created</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
                <td className="p-3">{u.email ?? u.phone ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{u.id}</td>
                <td className="p-3">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <ForceSignOutButton userId={u.id} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="p-6 text-center text-sm text-black/60 dark:text-white/60" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
