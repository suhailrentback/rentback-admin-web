// app/admin/staff/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createRouteSupabase } from "@/lib/supabase/server";

type Role = "tenant" | "landlord" | "staff" | "admin";

async function assertStaff() {
  const sb = await createRouteSupabase(cookies);
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) throw new Error("unauthenticated");
  const { data: me, error } = await sb
    .from("profiles")
    .select("id, role, email")
    .eq("id", userRes.user.id)
    .single();
  if (error) throw error;
  if (!me || !["staff", "admin"].includes(String(me.role))) throw new Error("forbidden");
  return { sb, me };
}

export async function setUserRole(userId: string, role: Role) {
  const { sb, me } = await assertStaff();

  // Prevent accidentally locking out all admins:
  if (role !== "admin") {
    // if demoting an admin, ensure at least one other admin remains
    const { data: target } = await sb.from("profiles").select("id, role").eq("id", userId).single();
    if (target?.role === "admin") {
      const { count } = await sb
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        throw new Error("Cannot demote the last admin");
      }
    }
  }

  const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
  if (error) throw error;

  // Optional: write audit row if you have a function/trigger
  // (DB RLS ideally logs this)

  revalidatePath("/admin/staff");
  return { ok: true };
}
