// app/admin/audit/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/supabase";

// Simple CSV escaper
function toCsvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : typeof v === "object" ? JSON.stringify(v) : String(v);
  const needsQuotes = /[",\n]/.test(s);
  return needsQuotes ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const sb = createRouteSupabase(req);

  // Auth check (must be staff or admin)
  const { data: me } = await sb.auth.getUser();
  if (!me?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: prof, error: profErr } = await sb
    .from("profiles")
    .select("role,email")
    .eq("id", me.user.id)
    .maybeSingle();

  if (profErr || !prof || !["staff", "admin"].includes(String(prof.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse filters
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const actor = (url.searchParams.get("actor") ?? "").trim();
  const entity = (url.searchParams.get("entity") ?? "").trim();
  const from = (url.searchParams.get("from") ?? "").trim(); // ISO date
  const to = (url.searchParams.get("to") ?? "").trim();     // ISO date
  const rawLimit = Number(url.searchParams.get("limit") ?? "5000");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 20000 ? rawLimit : 5000;

  // Build query (be liberal; columns may vary — we stick to safe ones)
  let query = sb
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) {
    // Try to match across common text columns
    // (If some columns don't exist, server will ignore them due to PostgREST 'or' over ilike on present columns)
    query = query.or(
      [
        `action.ilike.%${q}%`,
        `entity.ilike.%${q}%`,
        `actor_email.ilike.%${q}%`,
        `summary.ilike.%${q}%`,
        `meta::text.ilike.%${q}%`,
        `id.eq.${q}`, // allow direct id paste
      ].join(",")
    );
  }
  if (actor) {
    query = query.or(
      [`actor_email.ilike.%${actor}%`, `actor_id.eq.${actor}`].join(",")
    );
  }
  if (entity) {
    query = query.ilike("entity", `%${entity}%`);
  }
  if (from) {
    query = query.gte("created_at", from);
  }
  if (to) {
    query = query.lte("created_at", to);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Map to CSV
  const headers = [
    "created_at",
    "actor_id",
    "actor_email",
    "action",
    "entity",
    "record_id",
    "summary",
    "meta",
    "id",
  ];

  const lines = [
    headers.join(","),
    ...(Array.isArray(data) ? data : []).map((row: any) =>
      [
        row?.created_at ?? "",
        row?.actor_id ?? "",
        row?.actor_email ?? "",
        row?.action ?? "",
        row?.entity ?? "",
        row?.record_id ?? row?.row_id ?? "",
        row?.summary ?? "",
        row?.meta ?? "",
        row?.id ?? "",
      ]
        .map(toCsvCell)
        .join(",")
    ),
  ];

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-log-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
