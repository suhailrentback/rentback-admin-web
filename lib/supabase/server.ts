// lib/supabase/server.ts
// Unified Supabase helpers for Server Components & Route Handlers.
// Uses @supabase/auth-helpers-nextjs (already in this repo).

import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
  type CookieOptions,
} from "@supabase/auth-helpers-nextjs";

// If you have generated DB types, import them; otherwise keep `any`.
type Database = any;

/** Server Components / Server Actions */
export function createServerSupabase() {
  // cookies() comes from next/headers and is compatible with the helpers
  return createServerComponentClient<Database>({ cookies });
}

/** Route Handlers in app/api/* */
export function createRouteSupabase() {
  return createRouteHandlerClient<Database>({ cookies });
}

/** Back-compat alias some files import */
export function createClient() {
  return createServerSupabase();
}

export default createServerSupabase;
