// lib/supabase/server.ts
import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

/**
 * For Server Components / Pages
 * Usage: const supabase = createServerSupabase();
 */
export function createServerSupabase() {
  const store = cookies();
  return createServerComponentClient({ cookies: () => store });
}

/**
 * For Route Handlers (app/.../route.ts)
 * Usage:
 *   const sb = createRouteSupabase();                // auto uses cookies()
 *   // or
 *   const sb = createRouteSupabase(() => cookies()); // explicit
 */
export function createRouteSupabase(
  getCookies?: () => ReturnType<typeof cookies>
) {
  const store = getCookies ? getCookies() : cookies();
  return createRouteHandlerClient({ cookies: () => store });
}

/** Back-compat aliases */
export const supabaseServer = createServerSupabase;
export const supabaseRoute = createRouteSupabase;
