// app/admin/api/rewards/ledger/export/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const rawLimit = Number(sp.get("limit") ?? "2000");
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 10000 ? rawLimit : 2000;

  const from = sp.get("from"); // ISO string optional
  const to = sp.get("to");     // ISO string optional

  // ✅ Pass a getter function for cookies()
  const sb = createRouteSupabase(() => cookies());

  let q = sb
    .from("reward_ledger")
    .select("id,user_id,delta_points,reason,payment_id,redemption_id,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (from) q = q.gte("created_at", from);
  if (to) q = q.lte("created_at", to);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = (data ?? []).map((r) => [
    r.id,
    r.user_id,
    r.delta_points,
    r.reason,
    r.payment_id ?? "",
    r.redemption_id ?? "",
    new Date(r.created_at).toISOString(),
  ]);

  const csv = toCSV(
    ["id", "user_id", "delta_points", "reason", "payment_id", "redemption_id", "created_at"],
    rows
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rewards_ledger_${Date.now()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    // escape quotes and wrap with quotes if needed
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const head = headers.map(esc).join(",");
  const body = rows.map((r) => r.map(esc).join(",")).join("\n");
  return `${head}\n${body}\n`;
}
