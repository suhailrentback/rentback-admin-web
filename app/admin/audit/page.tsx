// app/admin/audit/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

type SearchParams = {
  q?: string;
  actor?: string;
  entity?: string;
  from?: string; // ISO date (inclusive)
  to?: string;   // ISO date (exclusive, or inclusive day-end)
  limit?: string;
  page?: string;
};

function toISOEndOfDay(d: string) {
  try {
    const dt = new Date(d);
    dt.setHours(23, 59, 59, 999);
    return dt.toISOString();
  } catch {
    return undefined;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ?? {};
  const limit = Math.min(Math.max(Number(sp.limit ?? 50), 1), 500);
  const page = Math.max(Number(sp.page ?? 1), 1);
  const from = sp.from ? new Date(sp.from).toISOString() : undefined;
  const to = sp.to ? toISOEndOfDay(sp.to) : undefined;
  const q = (sp.q ?? "").trim();
  const actor = (sp.actor ?? "").trim();
  const entity = (sp.entity ?? "").trim();

  const sb = await createServerSupabase(cookies);
  // AuthZ: ensure staff/admin
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) throw new Error("Not authenticated");
  const { data: me } = await sb
    .from("profiles")
    .select("id, role, email, full_name")
    .eq("id", userRes.user.id)
    .single();
  if (!me || !["staff", "admin"].includes(String(me.role))) {
    throw new Error("Not permitted");
  }

  let query = sb
    .from("audit_log")
    .select(
      "id, created_at, actor_id, actor_email, actor_role, action, table_name, row_id, details"
    )
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (actor) query = query.ilike("actor_email", `%${actor}%`);
  if (entity) query = query.ilike("table_name", `%${entity}%`);
  if (q) {
    // fuzzy on action / details / row_id
    query = query.or(
      [
        `action.ilike.%${q}%`,
        `details.ilike.%${q}%`,
        `row_id.ilike.%${q}%`,
        `actor_email.ilike.%${q}%`,
      ].join(",")
    );
  }

  const fromIdx = (page - 1) * limit;
  const toIdx = fromIdx + limit - 1;

  const { data: rows = [], error } = await query.range(fromIdx, toIdx);
  if (error) throw error;

  const base = "/admin/audit";
  const exportHref = `/admin/api/audit/export?` +
    new URLSearchParams({
      q,
      actor,
      entity,
      from: sp.from ?? "",
      to: sp.to ?? "",
      limit: String(limit),
    }).toString();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <a
          href={exportHref}
          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
        >
          Export CSV
        </a>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search (action / details / id / email)"
          className="md:col-span-2 rounded-lg border px-3 py-2 bg-transparent"
        />
        <input
          name="actor"
          defaultValue={actor}
          placeholder="Actor email"
          className="rounded-lg border px-3 py-2 bg-transparent"
        />
        <input
          name="entity"
          defaultValue={entity}
          placeholder="Entity (table)"
          className="rounded-lg border px-3 py-2 bg-transparent"
        />
        <input
          type="date"
          name="from"
          defaultValue={sp.from ?? ""}
          className="rounded-lg border px-3 py-2 bg-transparent"
        />
        <input
          type="date"
          name="to"
          defaultValue={sp.to ?? ""}
          className="rounded-lg border px-3 py-2 bg-transparent"
        />
        <div className="flex gap-2">
          <input
            type="number"
            name="limit"
            min={1}
            max={500}
            defaultValue={limit}
            className="w-28 rounded-lg border px-3 py-2 bg-transparent"
          />
          <button
            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
            type="submit"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Actor</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Action</th>
              <th className="py-2 pr-3">Entity</th>
              <th className="py-2 pr-3">Row</th>
              <th className="py-2 pr-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-2 pr-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="py-2 pr-3">{r.actor_email ?? r.actor_id}</td>
                <td className="py-2 pr-3">{r.actor_role}</td>
                <td className="py-2 pr-3">{r.action}</td>
                <td className="py-2 pr-3">{r.table_name}</td>
                <td className="py-2 pr-3 break-all">{r.row_id ?? "—"}</td>
                <td className="py-2 pr-3 break-all">
                  <code className="text-xs">{r.details ?? "—"}</code>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm opacity-70">
                  No audit rows for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`${base}?${new URLSearchParams({
            ...sp,
            page: String(Math.max(page - 1, 1)),
            limit: String(limit),
          }).toString()}`}
          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
        >
          Prev
        </Link>
        <span className="text-sm opacity-70">Page {page}</span>
        <Link
          href={`${base}?${new URLSearchParams({
            ...sp,
            page: String(page + 1),
            limit: String(limit),
          }).toString()}`}
          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
        >
          Next
        </Link>
      </div>
    </div>
  );
}
