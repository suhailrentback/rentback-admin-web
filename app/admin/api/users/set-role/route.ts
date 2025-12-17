// app/admin/api/users/set-role/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Body: { user_id: string; role: "staff" | "user" }
 * Sets app_metadata.role to "staff" or "user" for a given user.
 */
export async function POST(req: Request) {
  try {
    const { user_id, role } = (await req.json()) as {
      user_id?: string;
      role?: "staff" | "user";
    };

    if (!user_id || !role) {
      return NextResponse.json(
        { ok: false, error: "Missing user_id or role." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
      return NextResponse.json(
        { ok: false, error: "Supabase env vars missing." },
        { status: 500 }
      );
    }

    const admin = createClient(url, serviceKey);

    // Read current app_metadata to preserve any other keys
    const { data: userRes, error: getErr } =
      await admin.auth.admin.getUserById(user_id);
    if (getErr || !userRes?.user) {
      return NextResponse.json(
        { ok: false, error: getErr?.message ?? "User not found." },
        { status: 404 }
      );
    }

    const currentMeta = userRes.user.app_metadata ?? {};
    const nextMeta = { ...currentMeta, role };

    const { error: updErr } = await admin.auth.admin.updateUserById(user_id, {
      app_metadata: nextMeta,
    });

    if (updErr) {
      return NextResponse.json(
        { ok: false, error: updErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, user_id, role });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
