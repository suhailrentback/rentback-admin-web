// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function env(key: string) {
  const v = process.env[key];
  if (!v) console.warn(`[supabase] Missing env: ${key}`);
  return v ?? "";
}

/** One canonical server client (usable in RSC + route handlers). */
export function getSupabaseServer(): SupabaseClient {
  const cookieStore = cookies();
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(url, anon, {
    cookies: {
      get: (name: string) => {
        try {
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set() {},
      remove() {},
    },
  });
}

/** Aliases for existing imports in the repo */
export const createServerSupabase = getSupabaseServer;
export const createRouteSupabase = getSupabaseServer;
export const supabaseServer = getSupabaseServer;
export const supabaseRoute = getSupabaseServer;

export default getSupabaseServer;
