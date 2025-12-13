// app/admin/api/offers/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = createRouteSupabase(() => cookies());
  const { data, error } = await sb
    .from("reward_offers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const form = await req.formData();
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

  const sb = createRouteSupabase(() => cookies());
  const { error } = await sb.from("reward_offers").insert({
    title,
    description,
    points_cost: Math.floor(points),
    stock,
    is_active,
  });

  if (error) return back(null, error.message);
  return back("Offer created");
}

function back(ok?: string | null, err?: string | null) {
  const url = new URL("/admin/offers", process.env.SITE_URL);
  if (ok) url.searchParams.set("ok", ok);
  if (err) url.searchParams.set("err", err);
  return NextResponse.redirect(url, { status: 303 });
}
