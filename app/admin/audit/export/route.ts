// app/admin/audit/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase";

function toCsv(rows: any[]): string {
  const headers = [
    "id",
    "created_at",
    "actor_id",
    "action",
    "entity",
    "record_id",
    "summary",
    "ip",
    "ua",
  ];

  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
    // Always quote to be safe (commas/newlines)
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc((r as any)[h])).join(",")),
  ];

  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  // ✅ Expect a cookies function, not NextRequest
  const sb = createRouteSupabase(cookies);

  // AuthN
  const { data: me } = await sb.auth.getUser();
  if (!me?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // AuthZ: staff/admin only
  const { data: myProfile, error: profileErr } = await sb
    .from("profiles")
    .select("role")
    .eq("id", me.user.id)
    .single();

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }
  if (!myProfile || !["staff", "admin"].includes(myProfile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Filters
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const rawLimit = Number(url.searchParams.get("limit") ?? "2000");
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 20000
      ? rawLimit
      : 2000;

  let query = sb
    .from("audit_log")
    .select(
      "id,created_at,actor_id,action,entity,record_id,summary,ip,ua",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) {
    // Simple text search across action/summary
    query = query.or(`action.ilike.%${q}%,summary.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv(data ?? []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="audit-export-${
        new Date().toISOString().slice(0, 10)
      }.csv"`,
      "cache-control": "no-store",
    },
  });
}
