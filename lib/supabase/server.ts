// lib/supabase/server.ts
// Unified Supabase helpers for Server Components & Route Handlers.
// Uses @supabase/auth-helpers-nextjs (present in this repo).

import { cookies as nextCookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

// If you have generated DB types, import them; otherwise keep `any`.
type Database = any;

// Type of Next's cookies() function
type CookiesFn = typeof nextCookies;

/** Server Components / Server Actions */
export function createServerSupabase(c?: CookiesFn) {
  const ck = c ?? nextCookies;
  return createServerComponentClient<Database>({ cookies: ck });
}

/** Route Handlers in app/api/* */
export function createRouteSupabase(c?: CookiesFn) {
  const ck = c ?? nextCookies;
  return createRouteHandlerClient<Database>({ cookies: ck });
}

/** Back-compat alias used across files */
export function createClient(c?: CookiesFn) {
  return createServerSupabase(c);
}

export default createServerSupabase;
