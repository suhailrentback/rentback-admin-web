export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/supabase/server";

function isUuid(maybe: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    maybe
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 2000), 1), 10000);

  const sb = createRouteSupabase();

  // AuthZ: staff/admin only
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { data: me } = await sb
    .from("profiles")
    .select("id, role, email")
    .eq("id", userRes.user.id)
    .single();
  if (!me || !["staff", "admin"].includes(String(me.role))) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  const rows: Array<{
    entity: string;
    id: string;
    primary: string;
    secondary: string;
    created_at: string;
  }> = [];

  // PROFILES
  if (isUuid(q)) {
    const { data } = await sb
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .eq("id", q)
      .limit(limit);
    (data ?? []).forEach((p: any) =>
      rows.push({
        entity: "profile",
        id: String(p.id),
        primary: String(p.email ?? ""),
        secondary: `${p.full_name ?? ""} | role=${p.role ?? ""}`,
        created_at: p.created_at ?? "",
      })
    );
  } else {
    const { data } = await sb
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(limit);
    (data ?? []).forEach((p: any) =>
      rows.push({
        entity: "profile",
        id: String(p.id),
        primary: String(p.email ?? ""),
        secondary: `${p.full_name ?? ""} | role=${p.role ?? ""}`,
        created_at: p.created_at ?? "",
      })
    );
  }

  // INVOICES
  if (isUuid(q)) {
    const { data } = await sb.from("invoices").select("*").eq("id", q).limit(limit);
    (data ?? []).forEach((r: any) =>
      rows.push({
        entity: "invoice",
        id: String(r.id),
        primary: String(r.status ?? ""),
        secondary:
          "amount_cents" in r && typeof r.amount_cents === "number"
            ? `amount=${(r.amount_cents / 100).toFixed(2)}`
            : "",
        created_at: r.created_at ?? "",
      })
    );
  } else {
    const { data } = await sb
      .from("invoices")
      .select("*")
      .ilike("status", `%${q}%`)
      .limit(limit);
    (data ?? []).forEach((r: any) =>
      rows.push({
        entity: "invoice",
        id: String(r.id),
        primary: String(r.status ?? ""),
        secondary:
          "amount_cents" in r && typeof r.amount_cents === "number"
            ? `amount=${(r.amount_cents / 100).toFixed(2)}`
            : "",
        created_at: r.created_at ?? "",
      })
    );
  }

  // PAYMENTS
  if (isUuid(q)) {
    const { data } = await sb.from("payments").select("*").eq("id", q).limit(limit);
    (data ?? []).forEach((r: any) =>
      rows.push({
        entity: "payment",
        id: String(r.id),
        primary: String(r.status ?? ""),
        secondary:
          "amount_cents" in r && typeof r.amount_cents === "number"
            ? `amount=${(r.amount_cents / 100).toFixed(2)}`
            : "",
        created_at: r.created_at ?? "",
      })
    );
  } else {
    const { data } = await sb
      .from("payments")
      .select("*")
      .ilike("status", `%${q}%`)
      .limit(limit);
    (data ?? []).forEach((r: any) =>
      rows.push({
        entity: "payment",
        id: String(r.id),
        primary: String(r.status ?? ""),
        secondary:
          "amount_cents" in r && typeof r.amount_cents === "number"
            ? `amount=${(r.amount_cents / 100).toFixed(2)}`
            : "",
        created_at: r.created_at ?? "",
      })
    );
  }

  // RECEIPTS
  if (isUuid(q)) {
    const { data } = await sb.from("receipts").select("*").eq("id", q).limit(limit);
    (data ?? []).forEach((r: any) =>
      rows.push({
        entity: "receipt",
        id: String(r.id),
        primary: String(r.invoice_id ?? ""),
        secondary: `payment=${r.payment_id ?? ""}`,
        created_at: r.created_at ?? "",
      })
    );
  }

  // REWARD REDEMPTIONS
  if (isUuid(q)) {
    const { data } = await sb
      .from("reward_redemptions")
      .select("*")
      .eq("id", q)
      .limit(limit);
    (data ?? []).forEach((r: any) =>
      rows.push({
        entity: "reward_redemption",
        id: String(r.id),
        primary: String(r.voucher_code ?? ""),
        secondary: `user=${r.user_id ?? ""} | offer=${r.offer_id ?? ""} | pts=${r.points_cost ?? ""}`,
        created_at: r.created_at ?? "",
      })
    );
  } else {
    const { data } = await sb
      .from("reward_redemptions")
      .select("*")
      .ilike("voucher_code", `%${q}%`)
      .limit(limit);
    (data ?? []).forEach((r: any) =>
      rows.push({
        entity: "reward_redemption",
        id: String(r.id),
        primary: String(r.voucher_code ?? ""),
        secondary: `user=${r.user_id ?? ""} | offer=${r.offer_id ?? ""} | pts=${r.points_cost ?? ""}`,
        created_at: r.created_at ?? "",
      })
    );
  }

  const header = "entity,id,primary,secondary,created_at";
  const csvLines = rows.map((r) =>
    [
      r.entity,
      r.id,
      r.primary?.toString().replaceAll(",", " "),
      r.secondary?.toString().replaceAll(",", " "),
      r.created_at,
    ].join(",")
  );
  const csv = [header, ...csvLines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="search-${encodeURIComponent(q)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
