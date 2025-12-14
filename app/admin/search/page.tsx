// app/admin/search/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim();

  const sb = await createServerSupabase(cookies);

  // AuthZ
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

  const results: {
    profiles: any[];
    invoices: any[];
    payments: any[];
    redemptions: any[];
  } = { profiles: [], invoices: [], payments: [], redemptions: [] };

  if (q) {
    // Profiles (by email/name)
    {
      const { data } = await sb
        .from("profiles")
        .select("id, email, full_name, role")
        .or([`email.ilike.%${q}%`, `full_name.ilike.%${q}%`].join(","))
        .limit(25);
      results.profiles = data ?? [];
    }

    // Invoices (by id / status)
    {
      const { data } = await sb
        .from("invoices")
        .select("id, tenant_id, amount_cents, status, due_date")
        .or([`id.ilike.%${q}%`, `status.ilike.%${q}%`].join(","))
        .limit(25);
      results.invoices = data ?? [];
    }

    // Payments (by id / status)
    {
      const { data } = await sb
        .from("payments")
        .select("id, invoice_id, amount_cents, status, created_at")
        .or([`id.ilike.%${q}%`, `status.ilike.%${q}%`].join(","))
        .limit(25);
      results.payments = data ?? [];
    }

    // Rewards redemptions (by id / voucher)
    {
      const { data } = await sb
        .from("reward_redemptions")
        .select("id, user_id, offer_id, voucher_code, created_at")
        .or([`id.ilike.%${q}%`, `voucher_code.ilike.%${q}%`].join(","))
        .limit(25);
      results.redemptions = data ?? [];
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Global Search</h1>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search users, invoices, payments, vouchers..."
          className="rounded-lg border px-3 py-2 bg-transparent w-full"
        />
        <button className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-neutral-900">
          Search
        </button>
      </form>

      {!q && (
        <p className="text-sm opacity-70">Type above and hit Search.</p>
      )}

      {q && (
        <div className="space-y-8">
          <section>
            <h2 className="font-medium mb-2">Profiles</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="text-left border-b">
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">ID</th>
                </tr></thead>
                <tbody>
                  {results.profiles.map((p: any) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 pr-3">{p.email}</td>
                      <td className="py-2 pr-3">{p.full_name ?? "—"}</td>
                      <td className="py-2 pr-3">{p.role}</td>
                      <td className="py-2 pr-3 break-all">{p.id}</td>
                    </tr>
                  ))}
                  {results.profiles.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-sm opacity-70">No matches.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-2">Invoices</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="text-left border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Tenant</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Due</th>
                </tr></thead>
                <tbody>
                  {results.invoices.map((i: any) => (
                    <tr key={i.id} className="border-b">
                      <td className="py-2 pr-3 break-all">{i.id}</td>
                      <td className="py-2 pr-3">{i.tenant_id}</td>
                      <td className="py-2 pr-3">{(i.amount_cents ?? 0) / 100}</td>
                      <td className="py-2 pr-3">{i.status}</td>
                      <td className="py-2 pr-3">{i.due_date ? new Date(i.due_date).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                  {results.invoices.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-sm opacity-70">No matches.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-2">Payments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="text-left border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Invoice</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Created</th>
                </tr></thead>
                <tbody>
                  {results.payments.map((p: any) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 pr-3 break-all">{p.id}</td>
                      <td className="py-2 pr-3 break-all">{p.invoice_id}</td>
                      <td className="py-2 pr-3">{(p.amount_cents ?? 0) / 100}</td>
                      <td className="py-2 pr-3">{p.status}</td>
                      <td className="py-2 pr-3">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {results.payments.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-sm opacity-70">No matches.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-2">Reward Redemptions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="text-left border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Offer</th>
                  <th className="py-2 pr-3">Voucher</th>
                  <th className="py-2 pr-3">Time</th>
                </tr></thead>
                <tbody>
                  {results.redemptions.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-3 break-all">{r.id}</td>
                      <td className="py-2 pr-3 break-all">{r.user_id}</td>
                      <td className="py-2 pr-3 break-all">{r.offer_id}</td>
                      <td className="py-2 pr-3 break-all">{r.voucher_code ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {results.redemptions.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-sm opacity-70">No matches.</td></tr>
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
