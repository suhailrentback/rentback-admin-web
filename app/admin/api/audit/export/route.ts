// app/admin/api/audit/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

// very small CSV escaper
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

  // AuthZ: only staff/admin
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
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
  const actor = (url.searchParams.get("actor") ?? "").trim();
  const entity = (url.searchParams.get("entity") ?? "").trim();
  const action = (url.searchParams.get("action") ?? "").trim();
  const from = (url.searchParams.get("from") ?? "").trim(); // ISO date/time
  const to = (url.searchParams.get("to") ?? "").trim();     // ISO date/time
  const rawLimit = Number(url.searchParams.get("limit") ?? "");
  const limit =
    Number.isFinite(rawLimit) && rawLimit! > 0 && rawLimit! <= 10000
      ? rawLimit
      : 2000;

  let query = sb
    .from("audit_log")
    .select(
      "id, actor_id, actor_email, action, entity, entity_id, reason, ip, user_agent, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) {
    // free text across a few columns
    query = query.or(
      [
        `actor_email.ilike.%${q}%`,
        `action.ilike.%${q}%`,
        `entity.ilike.%${q}%`,
        `entity_id.ilike.%${q}%`,
        `reason.ilike.%${q}%`,
        `ip.ilike.%${q}%`,
      ].join(",")
    );
  }
  if (actor) query = query.eq("actor_email", actor);
  if (entity) query = query.eq("entity", entity);
  if (action) query = query.eq("action", action);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "id",
    "created_at",
    "actor_id",
    "actor_email",
    "action",
    "entity",
    "entity_id",
    "reason",
    "ip",
    "user_agent",
  ];
  const csv = toCSV(data ?? [], headers);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `audit-log_${stamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
