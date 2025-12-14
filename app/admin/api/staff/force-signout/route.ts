// app/admin/api/staff/force-signout/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

/**
 * POST /admin/api/staff/force-signout
 * Body: { user_id: string }  (JSON)  OR  form-data with user_id
 *
 * Behavior:
 *  - Verifies caller is STAFF or ADMIN (via public.profile.role)
 *  - Uses Supabase Admin REST to revoke all refresh tokens for the target user
 *  - Gracefully no-ops (200 with {skipped:true}) if service-role key or URL is missing
 */
export async function POST(req: Request) {
  const sb = createRouteSupabase(cookies);

  // AuthN
  const { data: userRes, error: userErr } = await sb.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // AuthZ: must be staff/admin
  const { data: actorProfile, error: profErr } = await sb
    .from("profile")
    .select("role")
    .eq("id", userRes.user.id)
    .single();

  if (profErr) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }
  if (actorProfile?.role !== "admin" && actorProfile?.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse body (JSON or form)
  let targetUserId: string | null = null;
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const j = await req.json().catch(() => null);
      targetUserId = (j?.user_id || j?.userId || "").toString().trim() || null;
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const fd = await req.formData().catch(() => null);
      const v = fd?.get("user_id") ?? fd?.get("userId");
      targetUserId = v ? String(v).trim() : null;
    }
  } catch {
    // fallthrough – handled below
  }

  if (!targetUserId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  // Admin REST call (service-role)
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Graceful no-op so builds stay green in envs without the key
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: "missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL",
    });
  }

  // GoTrue Admin: logout all sessions for a user
  // Endpoint: POST {SUPABASE_URL}/auth/v1/admin/users/{id}/logout
  const endpoint = `${url}/auth/v1/admin/users/${encodeURIComponent(targetUserId)}/logout`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "admin_api_failed", status: res.status, detail: text.slice(0, 500) },
      { status: 500 }
    );
  }

  // Success
  return NextResponse.json({ ok: true, user_id: targetUserId });
}
