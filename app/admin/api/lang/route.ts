// app/admin/api/lang/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const langParam = url.searchParams.get("lang");
  const next = url.searchParams.get("next");
  const referer = req.headers.get("referer") || "/admin";

  const lang = langParam === "ur" ? "ur" : "en";
  const redirectTo = next || referer || "/admin";

  const res = NextResponse.redirect(redirectTo);
  res.cookies.set("lang", lang, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return res;
}
