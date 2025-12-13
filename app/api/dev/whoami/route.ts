// app/api/dev/whoami/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Pass a cookies getter to satisfy the signature
  const supabase = createRouteSupabase(() => cookies());

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user });
}
