// app/admin/audit-logs/page.tsx
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type LogRow = {
  id: string;
  action: string;
  actor_user_id: string | null;
  target_user_id: string | null;
  meta: any | null;
  created_at: string;
};

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const q = str(searchParams?.q);
  const action = str(searchParams?.action);
  const from = str(searchParams?.from);
  const to = str(searchParams?.to);
  const page = clampInt(str(searchParams?.page) || "1", 1, 999_999);
  const perPage = clampInt(str(searchParams?.perPage) || "50", 10, 100);
  const offset = (page - 1) * perPage;

  let rows: LogRow[] = [];
  let total = 0;
  let noService = false;

  if (url && service) {
    const admin = createClient(url, service, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Base query
    let query = admin
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Filters
    if (action) query = query.eq("action", action);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);
    if (q) {
      // Match against common text columns
      query = query.or(
        [
          `action.ilike.%${q}%`,
          `actor_user_id.ilike.%${q}%`,
          `target_user_id.ilike.%${q}%`,
        ].join(",")
      );
    }

    // Pagination
    const { data, count, error } = await query.range(
      offset,
      offset + perPage - 1
    );

    if (!error && data) {
      rows = data as LogRow[];
      total = count ?? 0;
    }
  } else {
    noService = true;
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <section className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm opacity-70">
            Read-only log of administrative actions.
          </p>
        </div>
        <Link
          href="/admin/audit-logs"
          className="rounded-xl px-3 py-2 border text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          Reset Filters
        </Link>
      </header>

      {/* Filters */}
      <form className="grid gap-3 md:grid-cols-5 items-end">
        <div className="grid gap-1">
          <label className="text-xs opacity-70">Action</label>
          <input
            type="text"
            name="action"
            defaultValue={action}
            placeholder='e.g. "role.change" or "invoice.issue"'
            className="rounded-xl px-3 py-2 border bg-transparent"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs opacity-70">Search</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="action / actor id / target id"
            className="rounded-xl px-3 py-2 border bg-transparent"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs opacity-70">From (ISO)</label>
          <input
            type="datetime-local"
            name="from"
            defaultValue={from}
            className="rounded-xl px-3 py-2 border bg-transparent"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs opacity-70">To (ISO)</label>
          <input
            type="datetime-local"
            name="to"
            defaultValue={to}
            className="rounded-xl px-3 py-2 border bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl px-3 py-2 border text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            Apply
          </button>
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="perPage" value={perPage} />
        </div>
      </form>

      {noService ? (
        <p className="text-sm opacity-70">
          Service role key not configured — cannot load logs on server.
        </p>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="text-left p-3 font-medium">When</th>
              <th className="text-left p-3 font-medium">Action</th>
              <th className="text-left p-3 font-medium">Actor</th>
              <th className="text-left p-3 font-medium">Target</th>
              <th className="text-left p-3 font-medium">Meta</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  No logs.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-black/5 dark:border-white/10 align-top"
                >
                  <td className="p-3 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">{r.action}</td>
                  <td className="p-3">
                    <code className="text-xs">
                      {r.actor_user_id ?? "—"}
                    </code>
                  </td>
                  <td className="p-3">
                    <code className="text-xs">
                      {r.target_user_id ?? "—"}
                    </code>
                  </td>
                  <td className="p-3">
                    {r.meta ? (
                      <pre className="text-xs overflow-x-auto max-w-[36rem]">
                        {JSON.stringify(r.meta, null, 2)}
                      </pre>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div className="flex items-center justify-between">
        <span className="text-xs opacity-70">
          Page {page} / {totalPages} · {total} row{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          <PagerLink
            disabled={page <= 1}
            label="Prev"
            page={page - 1}
            q={q}
            action={action}
            from={from}
            to={to}
            perPage={perPage}
          />
          <PagerLink
            disabled={page >= totalPages}
            label="Next"
            page={page + 1}
            q={q}
            action={action}
            from={from}
            to={to}
            perPage={perPage}
          />
        </div>
      </div>
    </section>
  );
}

function PagerLink(props: {
  disabled: boolean;
  label: string;
  page: number;
  q: string;
  action: string;
  from: string;
  to: string;
  perPage: number;
}) {
  const { disabled, label, page, q, action, from, to, perPage } = props;
  if (disabled) {
    return (
      <span className="rounded-xl px-3 py-2 border text-sm opacity-50">
        {label}
      </span>
    );
  }
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (action) sp.set("action", action);
  if (from) sp.set("from", from);
  if (to) sp.set("to", to);
  sp.set("page", String(page));
  sp.set("perPage", String(perPage));
  return (
    <Link
      href={`/admin/audit-logs?${sp.toString()}`}
      className="rounded-xl px-3 py-2 border text-sm hover:bg-black/5 dark:hover:bg-white/10"
    >
      {label}
    </Link>
  );
}

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

function clampInt(v: string, min: number, max: number) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
