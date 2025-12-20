// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/admin"]; // add "/staff" here too if you want

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const guarded = PROTECTED_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  );
  if (!guarded) return NextResponse.next();

  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) {
    return redirectTo("/", req);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  try {
    const resp = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey },
      cache: "no-store",
    });
    if (!resp.ok) return redirectTo("/", req);
    const user = await resp.json();

    const role =
      (user?.app_metadata && user.app_metadata.role) ? user.app_metadata.role : "user";
    if (role !== "staff") {
      return redirectTo("/", req);
    }
  } catch {
    return redirectTo("/", req);
  }

  return NextResponse.next();
}

function redirectTo(path: string, req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  url.searchParams.set("m", "forbidden");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"], // keep tight, add "/staff/:path*" if needed
};
