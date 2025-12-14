// app/admin/search/page.tsx
import { createServerSupabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SP = { q?: string };

async function searchProfiles(q: string) {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

async function searchInvoices(q: string) {
  try {
    const sb = createServerSupabase();
    // Look up by id direct hit or textual fields if present
    const orParts = [`id.eq.${q}`, `status.ilike.%${q}%`, `notes.ilike.%${q}%`, `reference.ilike.%${q}%`];
    const { data, error } = await sb
      .from("invoices")
      .select("id, status, amount_cents, tenant_id, landlord_id, created_at, due_date")
      .or(orParts.join(","))
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

async function searchReceipts(q: string) {
  try {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("receipts")
      .select("id, invoice_id, created_at, url")
      .or([`id.eq.${q}`, `invoice_id.eq.${q}`].join(","))
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminSearchPage({ searchParams }: { searchParams: SP }) {
  const q = (searchParams?.q ?? "").trim();

  const [profiles, invoices, receipts] = q
    ? await Promise.all([searchProfiles(q), searchInvoices(q), searchReceipts(q)])
    : [[], [], []];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Global Search</h1>

      <form method="GET" className="flex gap-3 mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, invoice/receipt ID, status…"
          className="w-full border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg border bg-black text-white dark:bg-white dark:text-black"
        >
          Search
        </button>
      </form>

      {!q && <p className="text-sm text-muted-foreground">Tip: try an email, a name, or a UUID.</p>}

      {q && (
        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-medium mb-3">Profiles</h2>
            {profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches.</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p: any) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2">{p.full_name ?? "—"}</td>
                        <td className="p-2">{p.email ?? "—"}</td>
                        <td className="p-2">{p.role ?? "—"}</td>
                        <td className="p-2 break-all">{p.id}</td>
                        <td className="p-2">{p.created_at ? new Date(p.created_at).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Invoices</h2>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches.</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Tenant</th>
                      <th className="text-left p-2">Landlord</th>
                      <th className="text-left p-2">Due</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((i: any) => (
                      <tr key={i.id} className="border-t">
                        <td className="p-2 break-all">{i.id}</td>
                        <td className="p-2">{i.status ?? "—"}</td>
                        <td className="p-2">{typeof i.amount_cents === "number" ? (i.amount_cents / 100).toFixed(2) : "—"}</td>
                        <td className="p-2 break-all">{i.tenant_id ?? "—"}</td>
                        <td className="p-2 break-all">{i.landlord_id ?? "—"}</td>
                        <td className="p-2">{i.due_date ? new Date(i.due_date).toLocaleDateString() : "—"}</td>
                        <td className="p-2">{i.created_at ? new Date(i.created_at).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Receipts</h2>
            {receipts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches.</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Invoice</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-left p-2">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((r: any) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-2 break-all">{r.id}</td>
                        <td className="p-2 break-all">{r.invoice_id ?? "—"}</td>
                        <td className="p-2">{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td>
                        <td className="p-2">
                          {r.url ? (
                            <Link className="underline" href={r.url} target="_blank">
                              Open
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
