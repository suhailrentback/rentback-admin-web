// app/admin/api/offers/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function back(ok?: string, err?: string) {
  const url = new globalThis.URL("/admin/offers", process.env.SITE_URL);
  if (ok) url.searchParams.set("ok", ok);
  if (err) url.searchParams.set("err", err);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const method = (await req.formData()).get("_method");
  if (String(method).toUpperCase() === "DELETE") {
    return DELETE(req, { params });
  }
  return PUT(req, { params });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim() || null;
    const points_cost = Number(form.get("points_cost") || 0);
    const stockRaw = form.get("stock");
    const is_active = !!form.get("is_active");

    if (!id || !title || points_cost < 1) return back(undefined, "invalid_input");

    const stock =
      stockRaw === null || String(stockRaw).trim() === "" ? null : Math.max(0, Number(stockRaw));

    const sb = await createClient(cookies());
    const { error } = await sb
      .from("reward_offers")
      .update({ title, description, points_cost, stock, is_active, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return back(undefined, error.message.slice(0, 120));
    return back("Offer updated");
  } catch (e: any) {
    return back(undefined, (e?.message || "unknown_error").slice(0, 120));
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return back(undefined, "missing_id");
    const sb = await createClient(cookies());
    const { error } = await sb.from("reward_offers").delete().eq("id", id);
    if (error) return back(undefined, error.message.slice(0, 120));
    return back("Offer deleted");
  } catch (e: any) {
    return back(undefined, (e?.message || "unknown_error").slice(0, 120));
  }
}
