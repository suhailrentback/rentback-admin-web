// app/admin/offers/page.tsx
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

type Offer = {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  is_active: boolean;
  stock: number | null;
  created_at: string;
  updated_at: string;
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = createServerSupabase();

  const { data: offers, error } = await sb
    .from("reward_offers")
    .select("id,title,description,points_cost,is_active,stock,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Rewards • Offers</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rewards/ledger"
            className="rounded-full border px-4 py-2 text-sm hover:shadow"
          >
            View Ledger
          </Link>
        </div>
      </header>

      {/* Create */}
      <section className="rounded-2xl border p-4 shadow-sm">
        <h2 className="font-medium mb-3">Create Offer</h2>
        <form method="post" action="/admin/api/offers" className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input name="title" required className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Points Cost</label>
            <input name="points_cost" required inputMode="numeric" className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea name="description" rows={2} className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Stock (blank = unlimited)</label>
            <input name="stock" inputMode="numeric" className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input id="is_active" name="is_active" type="checkbox" defaultChecked className="h-4 w-4" />
            <label htmlFor="is_active" className="text-sm">Active</label>
          </div>
          <div className="md:col-span-2">
            <button className="rounded-full border px-4 py-2 text-sm hover:shadow" type="submit">
              Create
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="rounded-2xl border overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <Th>Title</Th>
              <Th>Cost</Th>
              <Th>Stock</Th>
              <Th>Active</Th>
              <Th>Updated</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(offers ?? []).length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-center opacity-70" colSpan={6}>
                  No offers yet.
                </td>
              </tr>
            ) : (
              (offers as Offer[]).map((o) => (
                <tr key={o.id}>
                  <Td nowrap>
                    <div className="font-medium">{o.title}</div>
                    <div className="text-xs opacity-70">{o.description ?? "—"}</div>
                  </Td>
                  <Td nowrap className="tabular-nums">{o.points_cost}</Td>
                  <Td nowrap className="tabular-nums">{o.stock ?? "∞"}</Td>
                  <Td nowrap>{o.is_active ? "Yes" : "No"}</Td>
                  <Td nowrap className="text-xs">{fmt(o.updated_at)}</Td>
                  <Td>
                    <details>
                      <summary className="cursor-pointer select-none">Edit</summary>
                      <form method="post" action={`/admin/api/offers/${o.id}`} className="mt-2 grid gap-2">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="id" value={o.id} />
                        <label className="block">
                          <span className="text-xs mb-1 block">Title</span>
                          <input name="title" defaultValue={o.title} className="w-full rounded-xl border px-3 py-2" />
                        </label>
                        <label className="block">
                          <span className="text-xs mb-1 block">Description</span>
                          <textarea name="description" rows={2} defaultValue={o.description ?? ""} className="w-full rounded-xl border px-3 py-2" />
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <label className="block">
                            <span className="text-xs mb-1 block">Points</span>
                            <input name="points_cost" defaultValue={String(o.points_cost)} inputMode="numeric" className="w-full rounded-xl border px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs mb-1 block">Stock (blank = ∞)</span>
                            <input name="stock" defaultValue={o.stock ?? "" as any} inputMode="numeric" className="w-full rounded-xl border px-3 py-2" />
                          </label>
                          <label className="flex items-center gap-2">
                            <input name="is_active" type="checkbox" defaultChecked={o.is_active} className="h-4 w-4" />
                            <span className="text-sm">Active</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button className="rounded-full border px-3 py-1 text-sm hover:shadow" type="submit">
                            Save
                          </button>
                          <form method="post" action={`/admin/api/offers/${o.id}`}>
                            <input type="hidden" name="intent" value="delete" />
                            <button className="rounded-full border px-3 py-1 text-sm hover:shadow" type="submit">
                              Delete
                            </button>
                          </form>
                        </div>
                      </form>
                    </details>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
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
