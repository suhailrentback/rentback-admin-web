// app/admin/api/lang/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveLocale } from "@/lib/i18n";

function redirectTo(req: NextRequest) {
  const referer = req.headers.get("referer");
  const url = new URL(req.url);
  const next = url.searchParams.get("next");
  try {
    return new URL(
      next || referer || "/admin",
      process.env.NEXT_PUBLIC_SITE_URL || "https://admin.rentback.app"
    );
  } catch {
    return new URL("/admin", process.env.NEXT_PUBLIC_SITE_URL || "https://admin.rentback.app");
  }
}

function withLangCookie(res: NextResponse, lang: string) {
  res.cookies.set("lang", lang, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  res.headers.set("x-lang-set", lang);
  return res;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lang = resolveLocale(url.searchParams.get("lang"));
  const res = NextResponse.redirect(redirectTo(req));
  return withLangCookie(res, lang);
}

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const lang = resolveLocale(String(data.get("lang") || "en"));
  const res = NextResponse.redirect(redirectTo(req));
  return withLangCookie(res, lang);
}
