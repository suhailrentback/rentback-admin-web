import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Core factory: SSR-safe Supabase client using Next cookies */
export function getSupabaseServer(): SupabaseClient {
  const store = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return store.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        set(name: string, value: string, options?: CookieOptions) {
          try {
            store.set({ name, value, ...options });
          } catch {
            // can only set in server actions / route handlers
          }
        },
        remove(name: string, options?: CookieOptions) {
          try {
            store.set({ name, value: "", ...options });
          } catch {
            // same note as above
          }
        },
      },
    }
  );
}

/** Back-compat aliases — accept and ignore any arguments */
export function createServerSupabase(..._args: any[]): SupabaseClient {
  return getSupabaseServer();
}
export function createRouteSupabase(..._args: any[]): SupabaseClient {
  return getSupabaseServer();
}

export default getSupabaseServer;
