// app/admin/api/audit/export/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const actor = (url.searchParams.get("actor") ?? "").trim();
  const entity = (url.searchParams.get("entity") ?? "").trim();
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;
  const rawLimit = Number(url.searchParams.get("limit") ?? 5000);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20000) : 5000;

  const sb = await createRouteSupabase(cookies);

  // Staff/Admin only
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await sb
    .from("profiles")
    .select("id, role")
    .eq("id", userRes.user.id)
    .single();
  if (!me || !["staff", "admin"].includes(String(me.role))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let query = sb
    .from("audit_log")
    .select(
      "id, created_at, actor_id, actor_email, actor_role, action, table_name, row_id, details"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (from) query = query.gte("created_at", new Date(from).toISOString());
  if (to) {
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    query = query.lte("created_at", t.toISOString());
  }
  if (actor) query = query.ilike("actor_email", `%${actor}%`);
  if (entity) query = query.ilike("table_name", `%${entity}%`);
  if (q) {
    query = query.or(
      [
        `action.ilike.%${q}%`,
        `details.ilike.%${q}%`,
        `row_id.ilike.%${q}%`,
        `actor_email.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data = [], error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headings = [
    "created_at",
    "actor_email",
    "actor_role",
    "action",
    "table_name",
    "row_id",
    "details",
    "id",
  ];
  const csv = [
    headings.join(","),
    ...data.map((r: any) =>
      [
        r.created_at,
        r.actor_email ?? "",
        r.actor_role ?? "",
        r.action ?? "",
        r.table_name ?? "",
        (r.row_id ?? "").toString().replaceAll(",", " "),
        JSON.stringify(r.details ?? "").replaceAll(",", ";"),
        r.id,
      ]
        .map((v) => `"${String(v).replaceAll(`"`, `""`)}"`)
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="audit_export.csv"`,
    },
  });
}
