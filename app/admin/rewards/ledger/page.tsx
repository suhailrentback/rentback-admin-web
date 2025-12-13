import { Suspense } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

type SearchProps = {
  searchParams?: {
    q?: string;
    from?: string; // ISO date (YYYY-MM-DD)
    to?: string;   // ISO date (YYYY-MM-DD)
    type?: "earn" | "redeem" | "all";
    limit?: string;
  };
};

function isoEndOfDay(d: string) {
  try {
    const dt = new Date(d);
    dt.setHours(23, 59, 59, 999);
    return dt.toISOString();
  } catch {
    return d;
  }
}

export default async function Page({ searchParams }: SearchProps) {
  const q = (searchParams?.q ?? "").trim();
  const from = (searchParams?.from ?? "").trim();
  const to = (searchParams?.to ?? "").trim();
  const type = (searchParams?.type as "earn" | "redeem" | "all") ?? "all";
  const rawLimit = Number(searchParams?.limit ?? "200");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 2000 ? rawLimit : 200;

  const sb = createServerSupabase();

  // If searching by email/name, first resolve user IDs from profiles
  let userIds: string[] | null = null;
  if (q) {
    const { data: hits, error: pe } = await sb
      .from("profiles")
      .select("id,email,full_name")
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(2000);
    if (pe) {
      throw new Error(pe.message);
    }
    userIds = (hits ?? []).map((p) => p.id);
    if (userIds.length === 0) {
      return (
        <Shell>
          <Filters q={q} from={from} to={to} type={type} limit={String(limit)} />
          <Empty>No ledger rows match your filters.</Empty>
        </Shell>
      );
    }
  }

  let query = sb
    .from("reward_ledger")
    .select("id,user_id,delta_points,reason,payment_id,redemption_id,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userIds) query = query.in("user_id", userIds);
  if (from) query = query.gte("created_at", new Date(from).toISOString());
  if (to) query = query.lte("created_at", isoEndOfDay(to));
  if (type === "earn") query = query.gt("delta_points", 0);
  if (type === "redeem") query = query.lt("delta_points", 0);

  const { data: rows, error: re } = await query;
  if (re) throw new Error(re.message);
  const ledger = rows ?? [];

  // Load emails/names for the user_ids in this page
  const idSet = Array.from(new Set(ledger.map((r) => r.user_id)));
  let emailMap: Record<string, { email: string | null; full_name: string | null }> = {};
  if (idSet.length) {
    const { data: ps, error: pe2 } = await sb
      .from("profiles")
      .select("id,email,full_name")
      .in("id", idSet);
    if (pe2) throw new Error(pe2.message);
    for (const p of ps ?? []) {
      emailMap[p.id] = { email: p.email ?? null, full_name: p.full_name ?? null };
    }
  }

  return (
    <Shell>
      <Filters q={q} from={from} to={to} type={type} limit={String(limit)} />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm opacity-70">
          Showing <span className="font-medium">{ledger.length}</span> rows
        </div>
        <Link
          className="rounded-full border px-4 py-2 text-sm hover:shadow"
          href={`/admin/api/rewards/ledger/export?q=${encodeURIComponent(q)}&from=${encodeURIComponent(
            from
          )}&to=${encodeURIComponent(to)}&type=${encodeURIComponent(type)}&limit=${encodeURIComponent(
            String(limit)
          )}`}
          prefetch={false}
        >
          Export CSV
        </Link>
      </div>

      <div className="rounded-2xl border overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <Th>Time</Th>
              <Th>User</Th>
              <Th>Δ Points</Th>
              <Th>Reason</Th>
              <Th>Payment</Th>
              <Th>Redemption</Th>
              <Th>ID</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ledger.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-center opacity-70" colSpan={7}>
                  No ledger rows match your filters.
                </td>
              </tr>
            ) : (
              ledger.map((r) => {
                const info = emailMap[r.user_id] ?? { email: null, full_name: null };
                const signClass = r.delta_points >= 0 ? "text-emerald-700" : "text-amber-700";
                return (
                  <tr key={r.id}>
                    <Td nowrap>{fmt(r.created_at)}</Td>
                    <Td>
                      <div className="flex flex-col">
                        <span>{info.email ?? "—"}</span>
                        <span className="text-xs opacity-70">
                          {info.full_name ?? "No name"} • {r.user_id}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span className={`tabular-nums ${signClass}`}>
                        {r.delta_points >= 0 ? `+${r.delta_points}` : r.delta_points}
                      </span>
                    </Td>
                    <Td>{r.reason}</Td>
                    <Td className="text-xs break-all">{r.payment_id ?? "—"}</Td>
                    <Td className="text-xs break-all">{r.redemption_id ?? "—"}</Td>
                    <Td className="text-xs break-all">{r.id}</Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Rewards • Ledger</h1>
        <div className="text-sm opacity-70">Admin/Staff only • Append-only</div>
      </header>
      <Suspense>{children}</Suspense>
    </div>
  );
}

function Filters(props: { q: string; from: string; to: string; type: string; limit: string }) {
  return (
    <form className="rounded-2xl border p-4 shadow-sm grid gap-3 md:grid-cols-5" method="get">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Email / Name</label>
        <input
          name="q"
          defaultValue={props.q}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="tenant@example.com"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">From</label>
        <input name="from" type="date" defaultValue={props.from} className="w-full rounded-xl border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm mb-1">To</label>
        <input name="to" type="date" defaultValue={props.to} className="w-full rounded-xl border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm mb-1">Type</label>
        <select name="type" defaultValue={props.type} className="w-full rounded-xl border px-3 py-2 bg-white">
          <option value="all">All</option>
          <option value="earn">Earn (Δ &gt; 0)</option>
          <option value="redeem">Redeem (Δ &lt; 0)</option>
        </select>
      </div>
      <div className="md:col-span-5 flex items-center gap-2">
        <label className="text-sm">Limit</label>
        <input
          name="limit"
          defaultValue={props.limit}
          className="w-24 rounded-xl border px-3 py-2"
          inputMode="numeric"
        />
        <button className="ml-auto rounded-full border px-4 py-2 text-sm hover:shadow" type="submit">
          Apply
        </button>
      </div>
    </form>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">{children}</th>;
}

function Td({
  children,
  nowrap,
  className = "",
}: {
  children: React.ReactNode;
  nowrap?: boolean;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 align-top ${nowrap ? "whitespace-nowrap" : ""} ${className}`.trim()}>
      {children}
    </td>
  );
}

function fmt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border px-4 py-6 text-center opacity-70">{children}</div>;
}
