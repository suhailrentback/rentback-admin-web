// app/admin/offers/page.tsx
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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

export const metadata = { title: "Admin · Reward Offers — RentBack" };

async function getOffers(q: string) {
  const sb = await createClient(cookies());
  let query = sb.from("reward_offers").select("*").order("created_at", { ascending: false });
  if (q) {
    // simple case-insensitive filter
    query = query.ilike("title", `%${q}%`);
  }
  const { data, error } = await query;
  return error ? [] : ((data as any) ?? []);
}

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: { q?: string; ok?: string; err?: string };
}) {
  const q = searchParams?.q || "";
  const ok = searchParams?.ok || "";
  const err = searchParams?.err || "";

  const offers: Offer[] = await getOffers(q);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reward Offers</h1>

      <form className="flex items-center gap-2" action="/admin/offers">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title…"
          className="border rounded-lg px-3 py-1.5 text-sm w-64"
        />
        <button className="border rounded-lg px-3 py-1.5 text-sm">Search</button>
      </form>

      {ok && <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-900/20 text-sm">{ok}</div>}
      {err && <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-900/20 text-sm">{err}</div>}

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Create new offer</h2>
        <form method="post" action="/admin/api/offers" className="grid md:grid-cols-6 gap-3">
          <input name="title" placeholder="Title" required className="border rounded-lg px-3 py-1.5 text-sm col-span-2" />
          <input name="description" placeholder="Description" className="border rounded-lg px-3 py-1.5 text-sm col-span-2" />
          <input name="points_cost" type="number" min={1} placeholder="Points cost" required className="border rounded-lg px-3 py-1.5 text-sm" />
          <input name="stock" type="number" min={0} placeholder="Stock (blank=∞)" className="border rounded-lg px-3 py-1.5 text-sm" />
          <div className="md:col-span-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4" />
              Active
            </label>
          </div>
          <div className="md:col-span-6">
            <button className="border rounded-lg px-3 py-1.5 text-sm">Create</button>
          </div>
        </form>
      </section>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Cost</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Active</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 opacity-60">No offers yet.</td>
              </tr>
            )}
            {offers.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="p-3">
                  <div className="font-medium">{o.title}</div>
                  {o.description && <div className="opacity-60 text-xs mt-0.5">{o.description}</div>}
                </td>
                <td className="p-3">{o.points_cost} pts</td>
                <td className="p-3">{o.stock === null ? "∞" : o.stock}</td>
                <td className="p-3">{o.is_active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <form
                    method="post"
                    action={`/admin/api/offers/${o.id}`}
                    className="grid grid-cols-2 gap-2 justify-items-end"
                  >
                    <input type="hidden" name="_method" value="PUT" />
                    <input name="title" defaultValue={o.title} className="border rounded px-2 py-1 text-xs col-span-2" />
                    <input name="description" defaultValue={o.description ?? ""} className="border rounded px-2 py-1 text-xs col-span-2" />
                    <input name="points_cost" type="number" min={1} defaultValue={o.points_cost} className="border rounded px-2 py-1 text-xs" />
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={o.stock ?? undefined}
                      placeholder="∞"
                      className="border rounded px-2 py-1 text-xs"
                    />
                    <label className="text-xs inline-flex items-center gap-2">
                      <input type="checkbox" name="is_active" defaultChecked={o.is_active} className="h-3 w-3" />
                      Active
                    </label>
                    <div className="col-span-2 flex gap-2 justify-end">
                      <button className="border rounded px-2 py-1 text-xs">Save</button>
                      <form method="post" action={`/admin/api/offers/${o.id}`}>
                        <input type="hidden" name="_method" value="DELETE" />
                        <button className="border rounded px-2 py-1 text-xs" formAction={`/admin/api/offers/${o.id}`}>
                          Delete
                        </button>
                      </form>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
