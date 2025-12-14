// app/admin/staff/page.tsx
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { setUserRole } from "./actions";

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string; role?: string };
}) {
  const q = (searchParams?.q ?? "").trim();
  const role = (searchParams?.role ?? "").trim();

  const sb = await createServerSupabase(cookies);
  // AuthZ
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) throw new Error("Not authenticated");
  const { data: me } = await sb
    .from("profiles")
    .select("id, role, email")
    .eq("id", userRes.user.id)
    .single();
  if (!me || !["staff", "admin"].includes(String(me.role))) {
    throw new Error("Not permitted");
  }

  let query = sb
    .from("profiles")
    .select("id, email, full_name, role, last_sign_in_at")
    .order("last_sign_in_at", { ascending: false })
    .limit(2000);

  if (role) query = query.eq("role", role);
  if (q) {
    query = query.or(
      [`email.ilike.%${q}%`, `full_name.ilike.%${q}%`].join(",")
    );
  }

  const { data: users = [], error } = await query;
  if (error) throw error;

  const roles: Array<"tenant" | "landlord" | "staff" | "admin"> = [
    "tenant",
    "landlord",
    "staff",
    "admin",
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Staff Management</h1>

      <form className="flex flex-wrap gap-2">
        <input
          className="rounded-lg border px-3 py-2 bg-transparent"
          name="q"
          placeholder="Search by email or name"
          defaultValue={q}
        />
        <select
          className="rounded-lg border px-3 py-2 bg-transparent"
          name="role"
          defaultValue={role}
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900">
          Apply
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Last sign-in</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 pr-3">{u.full_name ?? "—"}</td>
                <td className="py-2 pr-3">{u.email}</td>
                <td className="py-2 pr-3">{u.role}</td>
                <td className="py-2 pr-3">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex flex-wrap gap-2">
                    {roles.map((r) => (
                      <form
                        key={r}
                        action={async () => {
                          "use server";
                          await setUserRole(u.id, r);
                        }}
                      >
                        <button
                          className="px-2 py-1 rounded-lg border text-xs hover:bg-gray-50 dark:hover:bg-neutral-900 disabled:opacity-50"
                          disabled={u.role === r}
                        >
                          Set {r}
                        </button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm opacity-70">
                  No users for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
