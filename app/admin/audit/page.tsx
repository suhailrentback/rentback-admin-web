// app/admin/audit/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SP = {
  q?: string;
  actor?: string;
  entity?: string;
  from?: string; // ISO date
  to?: string;   // ISO date
  limit?: string;
};

function toParams(sp: SP) {
  const p = new URLSearchParams();
  if (sp.q?.trim()) p.set("q", sp.q.trim());
  if (sp.actor?.trim()) p.set("actor", sp.actor.trim());
  if (sp.entity?.trim()) p.set("entity", sp.entity.trim());
  if (sp.from?.trim()) p.set("from", sp.from.trim());
  if (sp.to?.trim()) p.set("to", sp.to.trim());
  if (sp.limit?.trim()) p.set("limit", sp.limit.trim());
  return p;
}

export default async function AdminAuditPage({ searchParams }: { searchParams: SP }) {
  const q = (searchParams?.q ?? "").trim();
  const actor = (searchParams?.actor ?? "").trim();
  const entity = (searchParams?.entity ?? "").trim();
  const from = (searchParams?.from ?? "").trim();
  const to = (searchParams?.to ?? "").trim();

  const rawLimit = Number(searchParams?.limit ?? "100");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 1000 ? rawLimit : 100;

  const sb = createServerSupabase();

  // Optional: auth gate (RLS will still protect, this just gives a nicer failure)
  const { data: me } = await sb.auth.getUser();
  if (!me?.user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Audit Log</h1>
        <p className="text-sm text-red-600">You must be signed in to view this page.</p>
      </div>
    );
  }

  // Build query
  let query = sb
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) {
    query = query.or(
      [
        `action.ilike.%${q}%`,
        `entity.ilike.%${q}%`,
        `actor_email.ilike.%${q}%`,
        `summary.ilike.%${q}%`,
        `meta::text.ilike.%${q}%`,
        `id.eq.${q}`, // allow direct id paste
      ].join(",")
    );
  }
  if (actor) {
    query = query.or([`actor_email.ilike.%${actor}%`, `actor_id.eq.${actor}`].join(","));
  }
  if (entity) {
    query = query.ilike("entity", `%${entity}%`);
  }
  if (from) {
    query = query.gte("created_at", from);
  }
  if (to) {
    query = query.lte("created_at", to);
  }

  const { data: rows, error } = await query;

  const exportHref = `/admin/audit/export?${toParams({
    ...searchParams,
    // for export we allow larger cap; keeps your current filters
    limit: searchParams?.limit ?? "5000",
  }).toString()}`;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <Link
          href={exportHref}
          className="px-3 py-2 rounded-lg border bg-black text-white dark:bg-white dark:text-black"
        >
          Export CSV
        </Link>
      </div>

      <form method="GET" className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        <input
          className="border rounded-lg px-3 py-2 md:col-span-2"
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search text (action, summary, meta…) "
        />
        <input
          className="border rounded-lg px-3 py-2"
          type="text"
          name="actor"
          defaultValue={actor}
          placeholder="Actor (email or user id)"
        />
        <input
          className="border rounded-lg px-3 py-2"
          type="text"
          name="entity"
          defaultValue={entity}
          placeholder="Entity (e.g. invoice, payment)"
        />
        <input className="border rounded-lg px-3 py-2" type="datetime-local" name="from" defaultValue={from} />
        <input className="border rounded-lg px-3 py-2" type="datetime-local" name="to" defaultValue={to} />
        <div className="flex items-center gap-2">
          <input
            className="border rounded-lg px-3 py-2 w-24"
            type="number"
            name="limit"
            min={1}
            max={1000}
            defaultValue={String(limit)}
            placeholder="Limit"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border bg-black text-white dark:bg-white dark:text-black"
          >
            Apply
          </button>
        </div>
      </form>

      {error ? (
        <p className="text-sm text-red-600">Failed to load audit log: {error.message}</p>
      ) : !rows || rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit events found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Actor</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Entity</th>
                <th className="text-left p-2">Record</th>
                <th className="text-left p-2">Summary</th>
                <th className="text-left p-2">Meta</th>
                <th className="text-left p-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {(rows as any[]).map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-2 whitespace-nowrap">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{r.actor_email ?? "—"}</span>
                      <span className="text-xs text-muted-foreground break-all">{r.actor_id ?? "—"}</span>
                    </div>
                  </td>
                  <td className="p-2">{r.action ?? "—"}</td>
                  <td className="p-2">{r.entity ?? "—"}</td>
                  <td className="p-2 break-all">{r.record_id ?? r.row_id ?? "—"}</td>
                  <td className="p-2">{r.summary ?? "—"}</td>
                  <td className="p-2 text-xs break-all">
                    {typeof r.meta === "object" ? JSON.stringify(r.meta) : r.meta ?? "—"}
                  </td>
                  <td className="p-2 text-xs break-all">{r.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
