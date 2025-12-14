export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase/server";

type SearchParams = {
  actor?: string;
  entity?: string;
  action?: string;
  from?: string; // ISO date (YYYY-MM-DD)
  to?: string;   // ISO date (YYYY-MM-DD)
  limit?: string;
};

function isUuid(x: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
}

export default async function Page({ searchParams }: { searchParams?: SearchParams }) {
  const sp = searchParams ?? {};
  const actor = (sp.actor ?? "").trim();
  const entity = (sp.entity ?? "").trim();
  const action = (sp.action ?? "").trim();
  const from = (sp.from ?? "").trim();
  const to = (sp.to ?? "").trim();
  const limit = Math.min(Math.max(Number(sp.limit ?? 100), 1), 2000);

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

  let q = sb.from("audit_log")
    .select("id, actor_id, entity, action, row_id, created_at, meta")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (actor) {
    q = isUuid(actor) ? q.eq("actor_id", actor) : q;
  }
  if (entity) q = q.ilike("entity", `%${entity}%`);
  if (action) q = q.ilike("action", `%${action}%`);
  if (from) q = q.gte("created_at", new Date(from).toISOString());
  if (to)   q = q.lte("created_at", new Date(to + "T23:59:59.999Z").toISOString());

  const { data: rows = [] } = await q;

  const exportUrl = `/admin/audit/export?${new URLSearchParams({
    actor,
    entity,
    action,
    from,
    to,
    limit: String(limit),
  }).toString()}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <form className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs opacity-70">Actor (UUID)</label>
            <input
              name="actor"
              defaultValue={actor}
              placeholder="user-id…"
              className="rounded-lg border px-3 py-2 bg-transparent min-w-56"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs opacity-70">Entity</label>
            <input
              name="entity"
              defaultValue={entity}
              placeholder="invoice / payment / profile…"
              className="rounded-lg border px-3 py-2 bg-transparent min-w-44"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs opacity-70">Action</label>
            <input
              name="action"
              defaultValue={action}
              placeholder="create / update / confirm…"
              className="rounded-lg border px-3 py-2 bg-transparent min-w-44"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs opacity-70">From</label>
            <input type="date" name="from" defaultValue={from} className="rounded-lg border px-3 py-2 bg-transparent" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs opacity-70">To</label>
            <input type="date" name="to" defaultValue={to} className="rounded-lg border px-3 py-2 bg-transparent" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs opacity-70">Limit</label>
            <input
              type="number"
              name="limit"
              min={1}
              max={2000}
              defaultValue={limit}
              className="rounded-lg border px-3 py-2 bg-transparent w-28"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            Apply
          </button>
          <a
            href={exportUrl}
            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            Export CSV
          </a>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pr-3">Actor</th>
              <th className="py-2 pr-3">Entity</th>
              <th className="py-2 pr-3">Action</th>
              <th className="py-2 pr-3">Row ID</th>
              <th className="py-2 pr-3">Meta</th>
              <th className="py-2 pr-3">Audit ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-b align-top">
                <td className="py-2 pr-3">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                </td>
                <td className="py-2 pr-3 text-xs break-all">{r.actor_id ?? "—"}</td>
                <td className="py-2 pr-3">{r.entity ?? "—"}</td>
                <td className="py-2 pr-3">{r.action ?? "—"}</td>
                <td className="py-2 pr-3 text-xs break-all">{r.row_id ?? "—"}</td>
                <td className="py-2 pr-3 text-xs">
                  {r.meta ? (() => { try { return JSON.stringify(r.meta); } catch { return String(r.meta); } })() : "—"}
                </td>
                <td className="py-2 pr-3 text-xs break-all">{r.id}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center opacity-70">
                  No audit rows match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
