// app/admin/api/users/export/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Row = { email: string; last_login: string; role: string };

export async function GET() {
  const admin = createAdminClient();

  // Pull up to 10k users (adjust if you need more)
  const pageSize = 1000;
  let page = 1;
  const rows: Row[] = [];

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    const batch = (data?.users ?? []).map((u) => ({
      email: u.email ?? "",
      last_login: u.last_sign_in_at ?? "",
      role: (u.app_metadata as any)?.role ?? "user",
    }));
    rows.push(...batch);
    if (!data || data.users.length < pageSize) break;
    page += 1;
  }

  const header = "email,last_login,role";
  const body = rows
    .map((r) =>
      [
        safeCsv(r.email),
        safeCsv(r.last_login),
        safeCsv(r.role),
      ].join(",")
    )
    .join("\n");

  const csv = [header, body].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function safeCsv(val: string) {
  if (val == null) return "";
  // Quote if contains comma/quote/newline
  if (/[",\n]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
