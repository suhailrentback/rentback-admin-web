// lib/auth.ts
import { getSupabaseServer } from "./supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getUser(): Promise<User | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

/** Accepts either app_metadata.roles: ['admin'] or *_metadata.is_admin: true */
function isAdminUser(user: User): boolean {
  const roles = (user.app_metadata?.roles ?? []) as string[];
  return (
    roles.includes("admin") ||
    user.app_metadata?.is_admin === true ||
    (user.user_metadata as any)?.is_admin === true
  );
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!isAdminUser(user)) {
    throw new Error("Forbidden: admin only");
  }
  return user;
}
