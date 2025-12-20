// app/admin/api/users/toggle-role/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Payload = { user_id?: string; role?: "staff" | "user" };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  const user_id = body.user_id;
  const role = body.role;

  if (!user_id || (role !== "staff" && role !== "user")) {
    return NextResponse.json(
      { ok: false, error: "Provide user_id and role ('staff' | 'user')." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Update role in app_metadata
  const { data: updated, error } = await admin.auth.admin.updateUserById(
    user_id,
    { app_metadata: { role } }
  );

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  // Figure out actor (the admin who performed the change)
  const actor = await getActorUserIdFromCookies();
  // Write audit log (best effort)
  try {
    await admin.from("audit_logs").insert({
      action: "role_change",
      actor_user_id: actor,
      target_user_id: user_id,
      details: { new_role: role },
    } as any);
  } catch {
    // non-fatal if table missing
  }

  return NextResponse.json({ ok: true, user: updated?.user ?? null });
}

async function getActorUserIdFromCookies(): Promise<string | null> {
  try {
    const token = cookies().get("sb-access-token")?.value;
    if (!token) return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const json = await r.json();
    return json?.id ?? null;
  } catch {
    return null;
  }
}
