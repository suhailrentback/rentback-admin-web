// lib/supabase/server.ts
import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import type { ReadonlyRequestCookies } from "next/dist/server/app-render";

/**
 * For Server Components / Pages
 * Usage: const supabase = createServerSupabase();
 */
export function createServerSupabase() {
  const store = cookies();
  // auth-helpers reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createServerComponentClient({ cookies: () => store });
}

/**
 * For Route Handlers (app/.../route.ts)
 * Usage: const supabase = createRouteSupabase(() => cookies());
 */
export function createRouteSupabase(getCookies: () => ReadonlyRequestCookies) {
  return createRouteHandlerClient({ cookies: getCookies });
}

/** Backwards-compat aliases */
export const supabaseServer = createServerSupabase;
export const supabaseRoute = createRouteSupabase;
