// app/admin/api/users/force-signout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = { user_id?: string };

export async function POST(req: Request) {
  const { user_id }: Body = await req.json().catch(() => ({} as Body));

  if (!user_id) {
    return NextResponse.json(
      { ok: false, error: "Missing 'user_id' in body" },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Server env missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  // Admin client (service role) — server only
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Call secure RPC to revoke all sessions/tokens for this user
  const { error } = await admin.rpc("revoke_user_sessions", { uid: user_id });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
