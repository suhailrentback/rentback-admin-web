import { createServerSupabase } from "@/lib/supabase/server";
import { setUserRole } from "./actions";

type SearchParams = {
  q?: string;
  role?: string;
  page?: string;
  limit?: string;
};

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ?? {};
  const q = (sp.q ?? "").trim();
  const role = (sp.role ?? "").trim();
  const page = Math.max(Number(sp.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(sp.limit ?? 25), 1), 200);

  const sb = await createServerSupabase();

  // AuthZ: staff/admin only
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) throw new Error("Not authenticated");
  const { data: me } = await sb
    .from("profiles")
    .select("id, role")
    .eq("id", userRes.user.id)
    .single();
  if (!me || !["staff", "admin"].includes(String(me.role))) {
    throw new Error("Not permitted");
  }

  // Build query
  let query = sb
    .from("profiles")
    .select("id, email, full_name, role, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      [
        `email.ilike.%${q}%`,
        `full_name.ilike.%${q}%`,
        `id.ilike.%${q}%`,
      ].join(",")
    );
  }
  if (role) query = query.eq("role", role);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: rows = [], count = 0, error } = await query.range(from, to);
  if (error) throw error;

  const base = "/admin/staff";
  const search = new URLSearchParams({
    q,
    role,
    limit: String(limit),
  });

  const totalPages = Math.max(Math.ceil(count / limit), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff Management</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email / name / id"
            className="rounded-lg border px-3 py-2 bg-transparent"
          />
          <select
            name="role"
            defaultValue={role}
            className="rounded-lg border px-3 py-2 bg-transparent"
          >
            <option value="">All roles</option>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="number"
            min={1}
            max={200}
            name="limit"
            defaultValue={limit}
            className="w-24 rounded-lg border px-3 py-2 bg-transparent"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Created</th>
              <th className="py-2 pr-3">Updated</th>
              <th className="py-2 pr-3">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-2 pr-3">{r.full_name ?? "—"}</td>
                <td className="py-2 pr-3">{r.email ?? "—"}</td>
                <td className="py-2 pr-3 font-medium">{r.role}</td>
                <td className="py-2 pr-3">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                </td>
                <td className="py-2 pr-3">
                  {r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}
                </td>
                <td className="py-2 pr-3">
                  <form action={setUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={r.id} />
                    <select
                      name="role"
                      defaultValue={r.role}
                      className="rounded-lg border px-2 py-1 bg-transparent"
                    >
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="px-2 py-1 rounded-lg border text-xs hover:bg-gray-50 dark:hover:bg-neutral-900"
                    >
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm opacity-70">
                  No users found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`${base}?${new URLSearchParams({
            q,
            role,
            limit: String(limit),
            page: String(Math.max(page - 1, 1)),
          }).toString()}`}
          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
        >
          Prev
        </a>
        <span className="text-sm opacity-70">
          Page {page} / {totalPages}
        </span>
        <a
          href={`${base}?${new URLSearchParams({
            q,
            role,
            limit: String(limit),
            page: String(Math.min(page + 1, totalPages)),
          }).toString()}`}
          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
        >
          Next
        </a>
      </div>
    </div>
  );
}
