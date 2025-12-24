// app/invoices/page.tsx
import AdminShell from "../../components/AdminShell";
import { requireAdmin } from "../../lib/auth";
import { getSupabaseServer } from "../../lib/supabase-server";

type Invoice = {
  id: string;
  number: string | null;
  status: "DRAFT" | "ISSUED" | "PAID" | "OVERDUE";
  due_at: string | null;
  total: number | null;
  currency: string | null;
  user_id: string | null;
  created_at: string | null;
};

export default async function AdminInvoicesPage() {
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

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, number, status, due_at, total, currency, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows: Invoice[] = data ?? [];

  return (
    <AdminShell>
      <div className="overflow-x-auto rounded-2xl border border-black/10">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-3">Number</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Due</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Currency</th>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-6" colSpan={7}>
                  No invoices.
                </td>
              </tr>
            ) : (
              rows.map((inv) => (
                <tr key={inv.id} className="border-top border-black/10">
                  <td className="p-3">{inv.number ?? "—"}</td>
                  <td className="p-3">{inv.status}</td>
                  <td className="p-3">
                    {inv.due_at ? new Date(inv.due_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {typeof inv.total === "number"
                      ? (inv.total / 100).toFixed(2)
                      : "—"}
                  </td>
                  <td className="p-3">{(inv.currency ?? "USD").toUpperCase()}</td>
                  <td className="p-3">{inv.user_id ?? "—"}</td>
                  <td className="p-3">
                    {inv.created_at
                      ? new Date(inv.created_at).toLocaleDateString()
                      : "—"}
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
