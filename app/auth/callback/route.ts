// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  // Pass a cookies getter to satisfy the required signature
  const supabase = createRouteSupabase(() => cookies());

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const errUrl = new URL("/auth/error", process.env.SITE_URL);
      errUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(errUrl);
    }
  }

  // Redirect to target (absolute URL for Vercel/Next)
  const target = new URL(next, process.env.SITE_URL);
  return NextResponse.redirect(target);
}
