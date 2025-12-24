import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

export type AdminCheck = { ok: boolean; user: User | null; reason?: string };

/**
 * Returns { ok, user, reason } so callers can do:
 *   const { ok } = await requireAdmin(); if (!ok) { ... }
 */
export async function requireAdmin(): Promise<AdminCheck> {
  const sb = getSupabaseServer();
  const { data, error } = await sb.auth.getUser();

  if (error || !data?.user) {
    return { ok: false, user: null, reason: error?.message ?? "No user" };
    // Page can render a friendly "not authorized" message.
  }

  const u = data.user;
  // Merge app/user metadata (covers various setups)
  const meta: any = { ...(u.app_metadata ?? {}), ...(u.user_metadata ?? {}) };

  const roles: string[] = [
    ...(Array.isArray(meta.roles) ? meta.roles : []),
    ...(Array.isArray(meta.role) ? meta.role : []),
  ].map((r) => String(r).toLowerCase());

  const singleRole = String(meta.role ?? "").toLowerCase();

  const isAdmin =
    Boolean(meta.is_admin) ||
    Boolean(meta.admin) ||
    Boolean(meta.is_staff) ||
    Boolean(meta.staff) ||
    roles.includes("admin") ||
    roles.includes("staff") ||
    singleRole === "admin" ||
    singleRole === "staff";

  return { ok: isAdmin, user: u, reason: isAdmin ? undefined : "Not admin/staff" };
}

/** Optional helper if you need just the user elsewhere */
export async function getSessionUser(): Promise<User | null> {
  const sb = getSupabaseServer();
  const { data } = await sb.auth.getUser();
  return data?.user ?? null;
}
