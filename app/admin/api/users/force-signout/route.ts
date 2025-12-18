// app/admin/api/users/force-signout/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { user_id } = (await req.json().catch(() => ({}))) as {
    user_id?: string;
  };
  if (!user_id) {
    return NextResponse.json(
      { ok: false, error: "Missing user_id" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Try official SDK first (some versions expose signOutUser)
  try {
    const anyAdmin = admin.auth.admin as any;
    if (typeof anyAdmin.signOutUser === "function") {
      const { error } = await anyAdmin.signOutUser({ user_id });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
  } catch (e: any) {
    // fall through to REST approach
  }

  // Fallback: call GoTrue Admin REST "logout" endpoint (supported on modern GoTrue)
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const resp = await fetch(
      `${url}/auth/v1/admin/users/${encodeURIComponent(user_id)}/logout`,
      {
        method: "POST",
        headers: {
          apikey,
          Authorization: `Bearer ${service}`,
        },
      }
    );

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: txt || `HTTP ${resp.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Logout failed" },
      { status: 500 }
    );
  }
}
