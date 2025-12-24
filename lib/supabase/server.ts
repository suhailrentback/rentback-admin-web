import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

/** Core factory used everywhere */
export function getSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          /* no-op on server */
        },
        remove() {
          /* no-op on server */
        },
      },
      headers: {
        get(name: string) {
          return headers().get(name) ?? undefined;
        },
      },
    }
  );
}

/**
 * Back-compat shims:
 * Old code calls createRouteSupabase(cookies) / createServerSupabase(cookies).
 * Accept optional args and ignore them to satisfy call sites.
 */
export function createRouteSupabase(_maybeCookies?: unknown) {
  return getSupabaseServer();
}
export function createServerSupabase(_maybeCookies?: unknown) {
  return getSupabaseServer();
}

// Also export aliases some files re-export from "./index"
export const supabaseServer = getSupabaseServer;
export const supabaseRoute = getSupabaseServer;
