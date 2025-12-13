import { NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/supabase/server";

function isoEndOfDay(d: string) {
  try {
    const dt = new Date(d);
    dt.setHours(23, 59, 59, 999);
    return dt.toISOString();
  } catch {
    return d;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const from = (searchParams.get("from") ?? "").trim();
  const to = (searchParams.get("to") ?? "").trim();
  const type = (searchParams.get("type") as "earn" | "redeem" | "all") ?? "all";
  const rawLimit = Number(searchParams.get("limit") ?? "2000");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 10000 ? rawLimit : 2000;

  const sb = createRouteSupabase();

  let userIds: string[] | null = null;
  if (q) {
    const { data: hits, error: pe } = await sb
      .from("profiles")
      .select("id,email,full_name")
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(10000);
    if (pe) {
      return NextResponse.json({ error: pe.message }, { status: 400 });
    }
    userIds = (hits ?? []).map((p) => p.id);
    if (userIds.length === 0) {
      return makeCSV([], []);
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
  if (re) return NextResponse.json({ error: re.message }, { status: 400 });
  const ledger = rows ?? [];

  // Map emails
  const ids = Array.from(new Set(ledger.map((r) => r.user_id)));
  let profiles: { id: string; email: string | null; full_name: string | null }[] = [];
  if (ids.length) {
    const { data: ps, error: pe2 } = await sb
      .from("profiles")
      .select("id,email,full_name")
      .in("id", ids);
    if (pe2) return NextResponse.json({ error: pe2.message }, { status: 400 });
    profiles = ps ?? [];
  }

  return makeCSV(ledger, profiles);
}

function makeCSV(
  ledger: { id: string; user_id: string; delta_points: number; reason: string; payment_id: string | null; redemption_id: string | null; created_at: string; }[],
  profiles: { id: string; email: string | null; full_name: string | null; }[]
) {
  const pmap = new Map(profiles.map((p) => [p.id, p]));
  const header = [
    "created_at",
    "user_id",
    "email",
    "full_name",
    "delta_points",
    "reason",
    "payment_id",
    "redemption_id",
    "ledger_id",
  ];

  const rows = ledger.map((r) => {
    const p = pmap.get(r.user_id);
    const cols = [
      r.created_at,
      r.user_id,
      p?.email ?? "",
      p?.full_name ?? "",
      String(r.delta_points),
      r.reason ?? "",
      r.payment_id ?? "",
      r.redemption_id ?? "",
      r.id,
    ];
    return cols.map(csvEscape).join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");
  const enc = new TextEncoder().encode(csv);
  return new NextResponse(enc, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reward_ledger.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(s: string) {
  if (s == null) return "";
  const needs = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needs ? `"${escaped}"` : escaped;
}
