// lib/auth.ts
import { getSupabaseServer } from "./supabase-server";

export type AppRole = "ADMIN" | "STAFF" | "TENANT" | null;

export async function getSessionAndRole() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null as AppRole };

  const { data: prof } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  const role = (prof?.app_role ?? null) as AppRole;
  return { user, role };
}

export async function requireAdmin() {
  const { user, role } = await getSessionAndRole();
  const ok = !!user && (role === "ADMIN" || role === "STAFF");
  return { ok, user, role };
}
