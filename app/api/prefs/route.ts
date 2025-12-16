import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { lang, theme } = (await req.json().catch(() => ({}))) as {
    lang?: "en" | "ur";
    theme?: "light" | "dark";
  };

  const res = new NextResponse(null, { status: 204 });

  if (lang) {
    res.cookies.set("lang", lang, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  if (theme) {
    res.cookies.set("theme", theme, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}
