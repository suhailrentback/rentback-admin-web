// app/sign-out/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Pass a cookies getter as required by the helper signature
  const supabase = createRouteSupabase(() => cookies());

  try {
    await supabase.auth.signOut();
  } catch {
    // ignore signout errors; proceed to redirect
  }

  // Redirect to admin home after signout
  const target = new URL("/", process.env.SITE_URL ?? "https://admin.rentback.app");
  return NextResponse.redirect(target);
}
