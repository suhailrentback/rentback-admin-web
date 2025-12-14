import { NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type Role = "tenant" | "landlord" | "staff" | "admin";

function csvEscape(v: string): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function prettyDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace("T", " ").replace(".000Z", " UTC");
  } catch {
    return "";
  }
}

export async function GET() {
  // Auth via route helper (reads cookies); requires staff/admin
  const sb = await createRouteSupabase();

  const { data: userRes, error: userErr } = await sb.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: me, error: meErr } = await sb
    .from("profile")
    .select("role")
    .eq("id", userRes.user.id)
    .single();

  if (meErr || !me || (me.role !== "admin" && me.role !== "staff")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Base rows from profile
  const { data, error } = await sb
    .from("profile")
    .select("id, email, full_name, role")
    .order("email", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((r: any) => ({
    id: String(r.id),
    email: String(r.email ?? ""),
    full_name: String(r.full_name ?? ""),
    role: String(r.role ?? "tenant") as Role,
  }));

  // Enrich with last_sign_in_at if service key is present
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const lastMap: Record<string, string | null> = {};

  if (url && serviceKey && rows.length) {
    const admin = createAdminClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const r of rows) {
      try {
        const { data: u } = await admin.auth.admin.getUserById(r.id);
        lastMap[r.id] = u.user?.last_sign_in_at ?? null;
      } catch {
        lastMap[r.id] = null;
      }
    }
  }

  const header = ["id", "full_name", "email", "role", "last_login"].join(",");
  const body = rows
    .map((r) =>
      [
        csvEscape(r.id),
        csvEscape(r.full_name),
        csvEscape(r.email),
        csvEscape(r.role),
        csvEscape(prettyDate(lastMap[r.id])),
      ].join(",")
    )
    .join("\n");

  const csv = `${header}\n${body}\n`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="staff_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
