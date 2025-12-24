// app/audit-log/page.tsx
import AdminShell from "../../components/AdminShell";
import { requireAdmin } from "../../lib/auth";
import { getSupabaseServer } from "../../lib/supabase-server";

type Row = {
  id: number;
  created_at: string;
  entity: string | null;
  action: string | null;
  row_id: string | null;
  actor_id: string | null;
  table_name: string | null;
  occurred_at: string | null;
  details: any | null;
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { ok } = await requireAdmin();
  if (!ok) {
    return (
      <div className="p-6">
        <div className="rounded-xl border p-6">
          <div className="font-medium">Forbidden</div>
          <div className="text-sm opacity-70">Admins only.</div>
        </div>
      </div>
    );
  }

  const entity = (Array.isArray(searchParams?.entity)
    ? searchParams?.entity[0]
    : searchParams?.entity) as string | undefined;

  const action = (Array.isArray(searchParams?.action)
    ? searchParams?.action[0]
    : searchParams?.action) as string | undefined;

  const supabase = getSupabaseServer();

  let query = supabase
    .from("audit_log_readable")
    .select(
      "id, created_at, entity, action, row_id, actor_id, table_name, occurred_at, details"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (entity && entity.trim()) query = query.eq("entity", entity.trim());
  if (action && action.trim()) query = query.eq("action", action.trim());

  const { data, error } = await query;
  const rows: Row[] = data ?? [];

  return (
    <AdminShell>
      <div className="flex items-end gap-3">
        <form className="flex gap-2">
          <input
            name="entity"
            defaultValue={entity ?? ""}
            placeholder="entity"
            className="border rounded px-2 py-1 text-sm"
          />
          <input
            name="action"
            defaultValue={action ?? ""}
            placeholder="action"
            className="border rounded px-2 py-1 text-sm"
          />
          <button className="border rounded px-3 py-1.5 text-sm">Filter</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-3">Time</th>
              <th className="text-left p-3">Entity</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Row</th>
              <th className="text-left p-3">Actor</th>
              <th className="text-left p-3">Preview</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-6" colSpan={6}>
                  No audit entries.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-black/10">
                  <td className="p-3">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">{r.entity ?? "—"}</td>
                  <td className="p-3">{r.action ?? "—"}</td>
                  <td className="p-3">{r.row_id ?? "—"}</td>
                  <td className="p-3">{r.actor_id ?? "—"}</td>
                  <td className="p-3 text-xs max-w-[32rem] overflow-hidden text-ellipsis whitespace-nowrap">
                    {r.details ? JSON.stringify(r.details) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
