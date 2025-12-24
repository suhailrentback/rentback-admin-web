// lib/supabase-server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function getEnv(key: string) {
  const v = process.env[key];
  if (!v) {
    // Keep it runtime-safe on Vercel, but fail loudly in logs if missing
    console.warn(`[supabase] Missing env: ${key}`);
  }
  return v ?? "";
}

/**
 * Server-side Supabase client for App Router (RSC).
 * Works in Route Handlers and Server Components.
 */
export function getServerSupabase(): SupabaseClient {
  const cookieStore = cookies();

  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        try {
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      // No-ops on the server during render/build; Next handles write in responses.
      set() {},
      remove() {},
    },
  });
}

// Common aliases so any import style in your codebase works.
export const createServerSupabaseClient = getServerSupabase;
export const getSupabaseServerClient = getServerSupabase;
const defaultExport = getServerSupabase;
export default defaultExport;

/** Convenience helpers (optional, but handy) */
export async function getAuthUser() {
  const supabase = getServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
