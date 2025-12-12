// app/admin/api/offers/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function back(ok?: string, err?: string) {
  const url = new globalThis.URL("/admin/offers", process.env.SITE_URL);
  if (ok) url.searchParams.set("ok", ok);
  if (err) url.searchParams.set("err", err);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim() || null;
    const points_cost = Number(form.get("points_cost") || 0);
    const stockRaw = form.get("stock");
    const is_active = !!form.get("is_active");

    if (!title || points_cost < 1) return back(undefined, "invalid_input");

    const stock =
      stockRaw === null || String(stockRaw).trim() === "" ? null : Math.max(0, Number(stockRaw));

    const sb = await createClient(cookies());
    const { error } = await sb.from("reward_offers").insert({
      title,
      description,
      points_cost,
      is_active,
      stock,
    });

    if (error) return back(undefined, error.message.slice(0, 120));
    return back("Offer created");
  } catch (e: any) {
    return back(undefined, (e?.message || "unknown_error").slice(0, 120));
  }
}
