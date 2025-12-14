// app/admin/search/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase";

type Props = { searchParams?: { q?: string } };

export const dynamic = "force-dynamic";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="rounded-xl border p-3 overflow-x-auto">{children}</div>
  </section>
);

const Cell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-2 py-1 text-sm align-top">{children}</td>
);

export default async function Page({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim();

  // Auth
  const sb = await createServerSupabase();
  const { data: me } = await sb.auth.getUser();
  if (!me?.user) {
    return <div className="p-6">Not authenticated.</div>;
  }
  const { data: myProfile, error: profErr } = await sb
    .from("profiles")
    .select("role, full_name")
    .eq("id", me.user.id)
    .single();
  if (profErr) {
    return <div className="p-6 text-red-600">Profile error: {profErr.message}</div>;
  }
  if (!myProfile || !["staff", "admin"].includes(myProfile.role)) {
    return <div className="p-6">Not permitted.</div>;
  }

  let tenants: any[] = [];
  let landlords: any[] = [];
  let invoices: any[] = [];
  let receipts: any[] = [];

  if (q) {
    // Tenants
    const tRes = await sb
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("role", "tenant")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(25);
    tenants = tRes.data ?? [];

    // Landlords
    const lRes = await sb
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("role", "landlord")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(25);
    landlords = lRes.data ?? [];

    // Invoices (status/number/reference; keep loose so it won't break if some cols are missing)
    const iRes = await sb
      .from("invoices")
      .select(
        "id, status, amount_cents, due_date, created_at, tenant_id, landlord_id, number, reference",
      )
      .or(`status.ilike.%${q}%,number.ilike.%${q}%,reference.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(25);
    invoices = iRes.data ?? [];

    // Receipts (id/number/reference/invoice)
    const rRes = await sb
      .from("receipts")
      .select("id, invoice_id, created_at, number, reference")
      .or(`id.eq.${q},number.ilike.%${q}%,reference.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(25);
    receipts = rRes.data ?? [];
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Global Search</h1>

      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search tenants, landlords, invoices, receipts…"
          className="w-full max-w-xl rounded-xl border px-3 py-2"
        />
        <button className="rounded-xl border px-4 py-2">Search</button>
      </form>

      {!q ? (
        <p className="text-sm text-gray-500">
          Type a name, email, invoice number, reference, or status keyword.
        </p>
      ) : (
        <>
          <Section title={`Tenants (${tenants.length})`}>
            {tenants.length === 0 ? (
              <div className="text-sm text-gray-500">No matches.</div>
            ) : (
              <table className="min-w-[640px] w-full">
                <thead>
                  <tr className="text-left text-xs">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Email</th>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <Cell>{r.full_name ?? "—"}</Cell>
                      <Cell>{r.email ?? "—"}</Cell>
                      <Cell>
                        <code className="text-[10px] break-all">{r.id}</code>
                      </Cell>
                      <Cell>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : "—"}
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title={`Landlords (${landlords.length})`}>
            {landlords.length === 0 ? (
              <div className="text-sm text-gray-500">No matches.</div>
            ) : (
              <table className="min-w-[640px] w-full">
                <thead>
                  <tr className="text-left text-xs">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Email</th>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {landlords.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <Cell>{r.full_name ?? "—"}</Cell>
                      <Cell>{r.email ?? "—"}</Cell>
                      <Cell>
                        <code className="text-[10px] break-all">{r.id}</code>
                      </Cell>
                      <Cell>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : "—"}
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title={`Invoices (${invoices.length})`}>
            {invoices.length === 0 ? (
              <div className="text-sm text-gray-500">No matches.</div>
            ) : (
              <table className="min-w-[800px] w-full">
                <thead>
                  <tr className="text-left text-xs">
                    <th className="px-2 py-1">Number</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Amount</th>
                    <th className="px-2 py-1">Due</th>
                    <th className="px-2 py-1">Tenant</th>
                    <th className="px-2 py-1">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <Cell>{r.number ?? r.reference ?? "—"}</Cell>
                      <Cell>{r.status ?? "—"}</Cell>
                      <Cell>
                        {typeof r.amount_cents === "number"
                          ? (r.amount_cents / 100).toFixed(2)
                          : "—"}
                      </Cell>
                      <Cell>
                        {r.due_date
                          ? new Date(r.due_date).toLocaleDateString()
                          : "—"}
                      </Cell>
                      <Cell>
                        <code className="text-[10px] break-all">
                          {r.tenant_id ?? "—"}
                        </code>
                      </Cell>
                      <Cell>
                        <code className="text-[10px] break-all">{r.id}</code>
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title={`Receipts (${receipts.length})`}>
            {receipts.length === 0 ? (
              <div className="text-sm text-gray-500">No matches.</div>
            ) : (
              <table className="min-w-[640px] w-full">
                <thead>
                  <tr className="text-left text-xs">
                    <th className="px-2 py-1">Number</th>
                    <th className="px-2 py-1">Invoice</th>
                    <th className="px-2 py-1">Created</th>
                    <th className="px-2 py-1">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <Cell>{r.number ?? r.reference ?? "—"}</Cell>
                      <Cell>
                        <code className="text-[10px] break-all">
                          {r.invoice_id ?? "—"}
                        </code>
                      </Cell>
                      <Cell>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : "—"}
                      </Cell>
                      <Cell>
                        <code className="text-[10px] break-all">{r.id}</code>
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
