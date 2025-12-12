// lib/supabase/server.ts
// Unified Supabase helpers for Server Components, Server Actions, and Route Handlers.
// Exports: createClient, createServerSupabase, createRouteSupabase

import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// If you have generated DB types, import them here.
// import type { Database } from "@/lib/supabase/types";
type Database = any;

function hasEnv(url?: string, key?: string) {
  return !!url && !!key;
}

function makeClient(cookiesStore = nextCookies()) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasEnv(supabaseUrl, supabaseKey)) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment."
    );
  }

  return createServerClient<Database>(supabaseUrl!, supabaseKey!, {
    cookies: {
      get(name: string) {
        try {
          return cookiesStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookiesStore.set({ name, value, ...options });
        } catch {
          // Some edge contexts may restrict writing cookies; ignore.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookiesStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          // Ignore if restricted.
        }
      },
    },
  });
}

/** Back-compat alias used by pages/components */
export function createClient(cookiesStore = nextCookies()) {
  return makeClient(cookiesStore);
}

/** For Server Components / server actions */
export function createServerSupabase() {
  return makeClient(nextCookies());
}

/** For Route Handlers in app/api/* */
export function createRouteSupabase(cookiesStore = nextCookies()) {
  return makeClient(cookiesStore);
}

export default createServerSupabase;
