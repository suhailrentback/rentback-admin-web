// app/admin/api/users/force-signout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Json = Record<string, any>;

// --- Simple in-memory token bucket per IP (serverless best-effort) ---
const RATE_LIMIT_TOKENS = 5;       // 5 actions
const RATE_LIMIT_WINDOW_MS = 60_000; // per 60 seconds
const buckets = new Map<string, { tokens: number; updated: number }>();

function takeToken(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: RATE_LIMIT_TOKENS, updated: now };
  // refill
  const elapsed = now - b.updated;
  const refill = Math.floor(elapsed / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_TOKENS;
  const tokens = Math.min(RATE_LIMIT_TOKENS, b.tokens + refill);
  const updated = tokens === RATE_LIMIT_TOKENS ? now : b.updated;
  const next = { tokens, updated };
  if (next.tokens <= 0) {
    buckets.set(key, next);
    return false;
  }
  next.tokens -= 1;
  buckets.set(key, { ...next, updated: now });
  return true;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!takeToken(ip)) {
      return NextResponse.json(
        { ok: false, error: "Rate limited. Try again shortly." },
        { status: 429 }
      );
    }

    const { user_id } = (await req.json().catch(() => ({}))) as {
      user_id?: string;
    };
    if (!user_id) {
      return NextResponse.json(
        { ok: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
      return NextResponse.json(
        { ok: false, error: "Supabase env not configured" },
        { status: 500 }
      );
    }

    const admin = createClient(url, serviceKey);

    // Revoke all sessions for the target user via your RPC
    // (This assumes the `revoke_user_sessions(uid uuid)` function exists)
    const { error: revokeError } = await admin.rpc("revoke_user_sessions", {
      uid: user_id,
    });

    if (revokeError) {
      // Fallback attempt: use GoTrue admin if available in your version (optional)
      // const { error: altError } = await (admin as any).auth.admin.signOutUser({ user_id });
      // if (altError) { ... }
      return NextResponse.json(
        { ok: false, error: `Failed to revoke sessions: ${revokeError.message}` },
        { status: 500 }
      );
    }

    // Best-effort audit log (ignore failure). We avoid strict typing to not depend on generated types.
    try {
      const actor_ip = ip;
      const action = "FORCE_SIGN_OUT";
      const meta = { target_user_id: user_id, actor_ip };
      await (admin as any).from("audit_log").insert({
        action,
        actor_ip,
        target_user_id: user_id,
        metadata: meta,
        created_at: new Date().toISOString(),
      });
    } catch {
      // no-op
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
