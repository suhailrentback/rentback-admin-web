// lib/supabase/server.ts
// Unified Supabase helpers for Server Components & Route Handlers.
// Works with @supabase/auth-helpers-nextjs and accepts either
// a cookies() function OR a ReadonlyRequestCookies instance.

import { cookies as nextCookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

// If you have generated types, replace `any` with your Database type.
type Database = any;

// Accept either: () => ReadonlyRequestCookies OR ReadonlyRequestCookies
type CookiesArg =
  | ReturnType<typeof nextCookies>
  | typeof nextCookies
  | undefined;

function asCookiesProvider(arg?: CookiesArg) {
  if (!arg) return nextCookies;
  if (typeof arg === "function") {
    // already a provider
    return arg as typeof nextCookies;
  }
  // wrap the instance into a provider
  return () => arg as ReturnType<typeof nextCookies>;
}

/** For Server Components / Server Actions */
export function createServerSupabase(arg?: CookiesArg) {
  return createServerComponentClient<Database>({
    cookies: asCookiesProvider(arg),
  });
}

/** For Route Handlers in app/api/* */
export function createRouteSupabase(arg?: CookiesArg) {
  return createRouteHandlerClient<Database>({
    cookies: asCookiesProvider(arg),
  });
}

/** Back-compat alias used across files */
export function createClient(arg?: CookiesArg) {
  return createServerSupabase(arg);
}

export default createServerSupabase;
