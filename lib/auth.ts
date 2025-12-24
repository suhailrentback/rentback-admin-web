// lib/auth.ts
import { getSupabaseServer } from "./supabase/server";

export async function getUser() {
  const supabase = getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
