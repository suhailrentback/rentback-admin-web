// app/admin/search/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Global Search · Admin" };

type SearchParams = { q?: string };

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = (searchParams?.q ?? "").trim();
  const sb = await createServerSupabase();

  // AuthZ: staff/admin only (middleware should already block, this is just a guard)
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Not authenticated</h1>
      </main>
    );
  }
  const { data: me } = await sb
    .from("profiles")
    .select("id, role, email, full_name")
    .eq("id", userRes.user.id)
    .single();

  if (!me || !["staff", "admin"].includes(me.role)) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Not permitted</h1>
      </main>
    );
  }

  // Results
  let profiles: any[] = [];
  let invoices: any[] = [];
  let payments: any[] = [];
  let receipts: any[] = [];

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    q
  );

  if (q) {
    // Profiles: search by email / full_name (case-insensitive)
    const { data: profs } = await sb
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(25);
    profiles = profs ?? [];

    // For domain tables we only search by exact UUID id to avoid text/uuid casting issues
    if (isUUID) {
      const invSel =
        "id, status, amount_cents, due_date, tenant_id, landlord_id, created_at";
      const paySel =
        "id, status, amount_cents, invoice_id, created_at, reference";
      const recSel = "id, invoice_id, created_at, pdf_url";

      const [{ data: invs }, { data: pays }, { data: recs }] = await Promise.all(
        [
          sb.from("invoices").select(invSel as any).eq("id", q).limit(1),
          sb.from("payments").select(paySel as any).eq("id", q).limit(1),
          sb.from("receipts").select(recSel as any).eq("id", q).limit(1),
        ]
      );
      invoices = invs ?? [];
      payments = pays ?? [];
      receipts = recs ?? [];
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Global Search</h1>
        <Link
          href="/admin"
          className="text-sm underline underline-offset-4 hover:opacity-80"
        >
          ← Back to Admin
        </Link>
      </header>

      {/* Search Form */}
      <form method="get" className="flex gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search email/name — or paste a UUID id"
          className="w-full rounded-xl border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-xl border px-4 py-2 hover:bg-black/5"
        >
          Search
        </button>
      </form>

      {!q ? (
        <section className="text-sm text-gray-600">
          <p className="mb-2">
            Tips:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Search <b>profiles</b> by email or full name.</li>
            <li>
              Paste an <b>exact UUID</b> to fetch a specific Invoice / Payment / Receipt by <code>id</code>.
            </li>
          </ul>
        </section>
      ) : (
        <>
          {/* Profiles */}
          <section>
            <h2 className="text-lg font-semibold mb-2">
              Profiles <span className="text-gray-500">({profiles.length})</span>
            </h2>
            {profiles.length === 0 ? (
              <div className="text-sm text-gray-600">No profiles.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2">{p.full_name ?? "—"}</td>
                        <td className="p-2">{p.email ?? "—"}</td>
                        <td className="p-2">{p.role ?? "—"}</td>
                        <td className="p-2 break-all">{p.id}</td>
                        <td className="p-2">
                          {p.created_at
                            ? new Date(p.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Invoices */}
          <section>
            <h2 className="text-lg font-semibold mb-2">
              Invoices <span className="text-gray-500">({invoices.length})</span>
            </h2>
            {invoices.length === 0 ? (
              <div className="text-sm text-gray-600">
                {isUUID ? "No invoices for that id." : "Paste a UUID id to search invoices."}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Due</th>
                      <th className="text-left p-2">Tenant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((r) => (
                      <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2 break-all">{r.id}</td>
                        <td className="p-2">{r.status ?? "—"}</td>
                        <td className="p-2">
                          {typeof r.amount_cents === "number"
                            ? (r.amount_cents / 100).toFixed(2)
                            : "—"}
                        </td>
                        <td className="p-2">
                          {r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-2 break-all">{r.tenant_id ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Payments */}
          <section>
            <h2 className="text-lg font-semibold mb-2">
              Payments <span className="text-gray-500">({payments.length})</span>
            </h2>
            {payments.length === 0 ? (
              <div className="text-sm text-gray-600">
                {isUUID ? "No payments for that id." : "Paste a UUID id to search payments."}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Invoice</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((r) => (
                      <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2 break-all">{r.id}</td>
                        <td className="p-2">{r.status ?? "—"}</td>
                        <td className="p-2">
                          {typeof r.amount_cents === "number"
                            ? (r.amount_cents / 100).toFixed(2)
                            : "—"}
                        </td>
                        <td className="p-2 break-all">{r.invoice_id ?? "—"}</td>
                        <td className="p-2">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Receipts */}
          <section>
            <h2 className="text-lg font-semibold mb-2">
              Receipts <span className="text-gray-500">({receipts.length})</span>
            </h2>
            {receipts.length === 0 ? (
              <div className="text-sm text-gray-600">
                {isUUID ? "No receipts for that id." : "Paste a UUID id to search receipts."}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Invoice</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-left p-2">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((r) => (
                      <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2 break-all">{r.id}</td>
                        <td className="p-2 break-all">{r.invoice_id ?? "—"}</td>
                        <td className="p-2">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="p-2">
                          {r.pdf_url ? (
                            <a
                              href={r.pdf_url}
                              className="underline underline-offset-4"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
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
        </>
      )}
    </main>
  );
}
