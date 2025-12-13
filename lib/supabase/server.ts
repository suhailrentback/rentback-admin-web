// lib/supabase/server.ts
import { cookies as nextCookies, type ReadonlyRequestCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

function makeCookieAdapter(getStore: () => ReadonlyRequestCookies) {
  return {
    get(name: string) {
      return getStore().get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      // Next.js server cookie setter (maxAge in seconds)
      // @ts-expect-error set supports this shape in App Router
      getStore().set({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      // @ts-expect-error set supports this shape in App Router
      getStore().set({ name, value: "", ...options, maxAge: 0 });
    },
  };
}

/** For Server Components / Pages */
export function createServerSupabase(): SupabaseClient {
  const adapter = makeCookieAdapter(() => nextCookies());
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: adapter }
  );
}

/** For Route Handlers (pass a getter: () => cookies()) */
export function createRouteSupabase(getCookies: () => ReadonlyRequestCookies): SupabaseClient {
  const adapter = makeCookieAdapter(getCookies);
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: adapter }
  );
}
