// app/admin/api/offers/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const form = await req.formData();
  const intent = String(form.get("intent") ?? "update");

  const sb = createRouteSupabase(() => cookies());

  if (intent === "delete") {
    const { error } = await sb.from("reward_offers").delete().eq("id", id);
    if (error) return back("","Failed to delete: " + error.message);
    return back("Offer deleted");
  }

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim() || null;
  const points = Number(form.get("points_cost") ?? "0");
  const stockRaw = form.get("stock");
  const stock =
    stockRaw === null || String(stockRaw).trim() === "" ? null : Math.max(0, Number(stockRaw));
  const is_active = !!form.get("is_active");

  if (!title || !Number.isFinite(points) || points <= 0) {
    return back(null, "Invalid title/points");
  }

  const { error } = await sb
    .from("reward_offers")
    .update({
      title,
      description,
      points_cost: Math.floor(points),
      stock,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return back(null, error.message);
  return back("Offer updated");
}

function back(ok?: string | null, err?: string | null) {
  const url = new URL("/admin/offers", process.env.SITE_URL);
  if (ok) url.searchParams.set("ok", ok);
  if (err) url.searchParams.set("err", err);
  return NextResponse.redirect(url, { status: 303 });
}
