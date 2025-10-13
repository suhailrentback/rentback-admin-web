// middleware.ts
// Admin gate: allow only ADMIN or STAFF past this point.
// Non-authenticated users and non-staff are redirected to /sign-in.
// No visual changes. No matcher regex (we exclude paths in-code).

import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/** Public paths that must remain open */
const PUBLIC_PATHS = new Set<string>([
  "/sign-in",
  "/auth/callback",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image", // if present
]);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

function isStaticOrAsset(pathname: string) {
  if (pathname.startsWith("/_next/")) return true;    // Next assets
  if (pathname.startsWith("/static/")) return true;   // conventional static
  if (pathname.startsWith("/images/")) return true;   // conventional images
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  if (pathname.startsWith("/opengraph-image")) return true;
  if (pathname.startsWith("/icon")) return true;
  if (pathname.startsWith("/apple-icon")) return true;
  // Basic extension check to skip heavy work on images
  if (/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/.test(pathname)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip assets and known-public paths
  if (isStaticOrAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // Supabase session (Edge-safe helper).
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not signed in → send to sign-in (preserve intended destination)
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Try role from cookie first to avoid DB on every hit.
  let role = req.cookies.get("rb_role")?.value;

  // Fallback: fetch profile.role from DB (and set cookie for next time)
  if (!role) {
    const { data } = await supabase
      .from("Profile")
      .select("role")
      .eq("id", session.user.id)
      .single();
    role = (data as { role?: string } | null)?.role ?? undefined;
    if (role) {
      res.cookies.set("rb_role", role, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  const isStaff = role === "ADMIN" || role === "STAFF";
  if (!isStaff) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("reason", "forbidden");
    return NextResponse.redirect(url);
  }

  return res;
}

// NOTE: No `export const config = { matcher: ... }` on purpose.
// We exclude paths inside the middleware to avoid Next.js regex restrictions.
