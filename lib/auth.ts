import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "./supabase/server";

/**
 * Simple guard used by admin pages. Returns { ok, user }.
 * We treat either user_metadata.role === 'admin' OR user_metadata.is_staff === true as admin.
 */
export async function requireAdmin(): Promise<{ ok: boolean; user: User | null }> {
  const sb = getSupabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data?.user ?? null;

  const isAdmin =
    !!user &&
    (
      (user.user_metadata && (user.user_metadata.role === "admin" || user.user_metadata.is_staff === true)) ||
      (user.app_metadata && (user.app_metadata.role === "admin"))
    );

  return { ok: isAdmin, user };
}
