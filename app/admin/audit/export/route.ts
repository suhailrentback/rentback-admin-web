export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/supabase/server";

function isUuid(x: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const actor = (url.searchParams.get("actor") ?? "").trim();
  const entity = (url.searchParams.get("entity") ?? "").trim();
  const action = (url.searchParams.get("action") ?? "").trim();
  const from = (url.searchParams.get("from") ?? "").trim();
  const to = (url.searchParams.get("to") ?? "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 2000), 1), 20000);

  const sb = createRouteSupabase();

  // AuthZ: staff/admin only
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data: me } = await sb
    .from("profiles")
    .select("id, role")
    .eq("id", userRes.user.id)
    .single();
  if (!me || !["staff", "admin"].includes(String(me.role))) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  let q = sb.from("audit_log")
    .select("id, actor_id, entity, action, row_id, created_at, meta")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (actor && isUuid(actor)) q = q.eq("actor_id", actor);
  if (entity) q = q.ilike("entity", `%${entity}%`);
  if (action) q = q.ilike("action", `%${action}%`);
  if (from) q = q.gte("created_at", new Date(from).toISOString());
  if (to)   q = q.lte("created_at", new Date(to + "T23:59:59.999Z").toISOString());

  const { data: rows = [] } = await q;

  const header = "created_at,actor_id,entity,action,row_id,meta,id";
  const lines = rows.map((r: any) => {
    const meta = r.meta
      ? (() => { try { return JSON.stringify(r.meta).replaceAll(",", " "); } catch { return String(r.meta).replaceAll(",", " "); } })()
      : "";
    return [
      r.created_at ?? "",
      r.actor_id ?? "",
      r.entity ?? "",
      r.action ?? "",
      r.row_id ?? "",
      meta,
      r.id ?? "",
    ].join(",");
  });

  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="audit-export.csv"`,
      "cache-control": "no-store",
    },
  });
}
