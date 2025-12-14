// app/admin/api/search/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

// csv helpers
function csvValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCSV(rows: any[], headers: string[]): string {
  const head = headers.join(",");
  const body = rows
    .map((r) => headers.map((h) => csvValue((r as any)[h])).join(","))
    .join("\n");
  return `${head}\n${body}\n`;
}

export async function GET(req: NextRequest) {
  const sb = createRouteSupabase(cookies);

  // AuthZ
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: me } = await sb
    .from("profiles")
    .select("id, role, email")
    .eq("id", auth.user.id)
    .single();
  if (!me || !["staff", "admin"].includes(me.role)) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(q);

  // Profiles
  const { data: profiles, error: pErr } = await sb
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
    .limit(1000);
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Domain ids (exact UUID only)
  let invoices: any[] = [];
  let payments: any[] = [];
  let receipts: any[] = [];
  if (isUUID) {
    const [{ data: invs }, { data: pays }, { data: recs }] = await Promise.all([
      sb
        .from("invoices")
        .select("id, status, amount_cents, due_date, tenant_id, created_at")
        .eq("id", q)
        .limit(1),
      sb
        .from("payments")
        .select("id, status, amount_cents, invoice_id, reference, created_at")
        .eq("id", q)
        .limit(1),
      sb
        .from("receipts")
        .select("id, invoice_id, pdf_url, created_at")
        .eq("id", q)
        .limit(1),
    ]);
    invoices = invs ?? [];
    payments = pays ?? [];
    receipts = recs ?? [];
  }

  // Flatten into one CSV with a `type` column
  type Row = Record<string, any>;
  const rows: Row[] = [];

  (profiles ?? []).forEach((r) =>
    rows.push({
      type: "profile",
      id: r.id,
      email: r.email,
      full_name: r.full_name,
      role: r.role,
      created_at: r.created_at,
      ref1: "",
      ref2: "",
      status: "",
      amount_cents: "",
      extra: "",
    })
  );
  (invoices ?? []).forEach((r) =>
    rows.push({
      type: "invoice",
      id: r.id,
      email: "",
      full_name: "",
      role: "",
      created_at: r.created_at,
      ref1: r.tenant_id,
      ref2: "",
      status: r.status,
      amount_cents: r.amount_cents,
      extra: `due=${r.due_date ?? ""}`,
    })
  );
  (payments ?? []).forEach((r) =>
    rows.push({
      type: "payment",
      id: r.id,
      email: "",
      full_name: "",
      role: "",
      created_at: r.created_at,
      ref1: r.invoice_id,
      ref2: r.reference ?? "",
      status: r.status,
      amount_cents: r.amount_cents,
      extra: "",
    })
  );
  (receipts ?? []).forEach((r) =>
    rows.push({
      type: "receipt",
      id: r.id,
      email: "",
      full_name: "",
      role: "",
      created_at: r.created_at,
      ref1: r.invoice_id,
      ref2: r.pdf_url ?? "",
      status: "",
      amount_cents: "",
      extra: "",
    })
  );

  const headers = [
    "type",
    "id",
    "email",
    "full_name",
    "role",
    "created_at",
    "ref1",
    "ref2",
    "status",
    "amount_cents",
    "extra",
  ];
  const csv = toCSV(rows, headers);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `search_${stamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
