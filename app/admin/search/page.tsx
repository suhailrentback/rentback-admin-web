export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase/server";

type SearchParams = { q?: string; limit?: string };

function isUuid(maybe: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    maybe
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ?? {};
  const q = (sp.q ?? "").trim();
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

  let profiles: any[] = [];
  let invoices: any[] = [];
  let payments: any[] = [];
  let receipts: any[] = [];
  let redemptions: any[] = [];

  if (q) {
    // PROFILES
    if (isUuid(q)) {
      const { data } = await sb
        .from("profiles")
        .select("id, email, full_name, role, created_at, updated_at")
        .eq("id", q)
        .limit(limit);
      profiles = data ?? [];
    } else {
      const { data } = await sb
        .from("profiles")
        .select("id, email, full_name, role, created_at, updated_at")
        .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(limit);
      profiles = data ?? [];
    }

    // INVOICES — search by id (uuid) or by status text
    if (isUuid(q)) {
      const { data } = await sb.from("invoices").select("*").eq("id", q).limit(limit);
      invoices = data ?? [];
    } else {
      const { data } = await sb
        .from("invoices")
        .select("*")
        .ilike("status", `%${q}%`)
        .limit(limit);
      invoices = data ?? [];
    }

    // PAYMENTS — search by id (uuid) or status
    if (isUuid(q)) {
      const { data } = await sb.from("payments").select("*").eq("id", q).limit(limit);
      payments = data ?? [];
    } else {
      const { data } = await sb
        .from("payments")
        .select("*")
        .ilike("status", `%${q}%`)
        .limit(limit);
      payments = data ?? [];
    }

    // RECEIPTS — primarily by id
    if (isUuid(q)) {
      const { data } = await sb.from("receipts").select("*").eq("id", q).limit(limit);
      receipts = data ?? [];
    } else {
      receipts = []; // no safe text columns to search broadly
    }

    // REWARD REDEMPTIONS — by id or voucher_code
    if (isUuid(q)) {
      const { data } = await sb
        .from("reward_redemptions")
        .select("*")
        .eq("id", q)
        .limit(limit);
      redemptions = data ?? [];
    } else {
      const { data } = await sb
        .from("reward_redemptions")
        .select("*")
        .ilike("voucher_code", `%${q}%`)
        .limit(limit);
      redemptions = data ?? [];
    }
  }

  const count = (arr: any[]) => (Array.isArray(arr) ? arr.length : 0);

  const exportUrl = `/admin/api/search/csv?${new URLSearchParams({
    q,
    limit: String(limit),
  }).toString()}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Global Search</h1>
        <form className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="ID, email, voucher…"
            className="rounded-lg border px-3 py-2 bg-transparent min-w-72"
          />
          <input
            type="number"
            name="limit"
            min={1}
            max={200}
            defaultValue={limit}
            className="w-24 rounded-lg border px-3 py-2 bg-transparent"
            title="Max rows per section"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            Search
          </button>
          {q && (
            <a
              href={exportUrl}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
            >
              Export CSV
            </a>
          )}
        </form>
      </div>

      {!q && (
        <div className="text-sm opacity-70">
          Tip: paste a UUID (invoice/payment/receipt/redemption ID), an email/name, a{" "}
          <code>voucher_code</code>, or a status like <code>PAID</code> /{" "}
          <code>OVERDUE</code>.
        </div>
      )}

      {q && (
        <div className="space-y-8">
          {/* Profiles */}
          <section>
            <h2 className="text-lg font-medium">
              Profiles <span className="opacity-60">({count(profiles)})</span>
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p: any) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 pr-3">{p.full_name ?? "—"}</td>
                      <td className="py-2 pr-3">{p.email ?? "—"}</td>
                      <td className="py-2 pr-3">{p.role ?? "—"}</td>
                      <td className="py-2 pr-3 text-xs break-all">{p.id}</td>
                      <td className="py-2 pr-3">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center opacity-70">
                        No matches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Invoices */}
          <section>
            <h2 className="text-lg font-medium">
              Invoices <span className="opacity-60">({count(invoices)})</span>
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Tenant</th>
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-3">{r.status ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {"amount_cents" in r && typeof r.amount_cents === "number"
                          ? (r.amount_cents / 100).toFixed(2)
                          : "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs break-all">{r.tenant_id ?? "—"}</td>
                      <td className="py-2 pr-3 text-xs break-all">{r.id}</td>
                      <td className="py-2 pr-3">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center opacity-70">
                        No matches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payments */}
          <section>
            <h2 className="text-lg font-medium">
              Payments <span className="opacity-60">({count(payments)})</span>
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Invoice</th>
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-3">{r.status ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {"amount_cents" in r && typeof r.amount_cents === "number"
                          ? (r.amount_cents / 100).toFixed(2)
                          : "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs break-all">{r.invoice_id ?? "—"}</td>
                      <td className="py-2 pr-3 text-xs break-all">{r.id}</td>
                      <td className="py-2 pr-3">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center opacity-70">
                        No matches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Receipts */}
          <section>
            <h2 className="text-lg font-medium">
              Receipts <span className="opacity-60">({count(receipts)})</span>
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Invoice</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-3 text-xs break-all">{r.invoice_id ?? "—"}</td>
                      <td className="py-2 pr-3 text-xs break-all">{r.payment_id ?? "—"}</td>
                      <td className="py-2 pr-3 text-xs break-all">{r.id}</td>
                      <td className="py-2 pr-3">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {receipts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center opacity-70">
                        No matches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reward redemptions */}
          <section>
            <h2 className="text-lg font-medium">
              Reward Redemptions <span className="opacity-60">({count(redemptions)})</span>
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Offer</th>
                    <th className="py-2 pr-3">Voucher</th>
                    <th className="py-2 pr-3">Points</th>
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-3 text-xs break-all">{r.user_id ?? "—"}</td>
                      <td className="py-2 pr-3 text-xs break-all">{r.offer_id ?? "—"}</td>
                      <td className="py-2 pr-3">{r.voucher_code ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {"points_cost" in r ? r.points_cost : "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs break-all">{r.id}</td>
                      <td className="py-2 pr-3">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {redemptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center opacity-70">
                        No matches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
