// app/auth/signout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  // Pass a cookies getter as required by the helper signature
  const supabase = createRouteSupabase(() => cookies());

  try {
    await supabase.auth.signOut();
  } catch {
    // ignore signout errors; proceed to redirect
  }

  // Send user to admin home after signout
  const target = new URL("/", process.env.SITE_URL);
  return NextResponse.redirect(target);
}
