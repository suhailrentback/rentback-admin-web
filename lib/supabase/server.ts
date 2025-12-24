import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Single factory for server-side Supabase client (App Router).
 * No arguments needed; it reads/sets cookies via next/headers.
 */
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
            // Can only set inside Server Actions / Route Handlers
          }
        },
        remove(name: string, options?: CookieOptions) {
          try {
            store.set({ name, value: "", ...options });
          } catch {
            // Same note as above
          }
        },
      },
    }
  );
}
