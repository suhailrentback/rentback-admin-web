"use server";

import { revalidatePath } from "next/cache";
import { createRouteSupabase } from "@/lib/supabase/server";

type Role = "tenant" | "landlord" | "staff" | "admin";

async function requireAdmin() {
  const sb = createRouteSupabase();
  const { data: ures, error: uerr } = await sb.auth.getUser();
  if (uerr || !ures?.user) throw new Error("Not authenticated");

  const { data: me, error: merr } = await sb
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", ures.user.id)
    .single();

  if (merr || !me) throw new Error("Profile not found");
  if (me.role !== "admin") throw new Error("Only admin can change roles");
  return { sb, me };
}

export async function setUserRole(formData: FormData): Promise<void> {
  const { sb, me } = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const newRole = String(formData.get("role") ?? "") as Role;

  const allowed: Role[] = ["tenant", "landlord", "staff", "admin"];
  if (!allowed.includes(newRole)) throw new Error("Invalid role");
  if (!userId) throw new Error("Missing userId");

  // Safety: don't let the current admin demote themselves by accident
  if (me.id === userId && newRole !== "admin") {
    throw new Error("Refusing to demote current admin (self)");
  }

  const { error: uerr } = await sb
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);
  if (uerr) throw uerr;

  // Audit trail
  await sb.from("audit_log").insert({
    actor_id: me.id,
    actor_email: me.email,
    actor_role: me.role,
    action: "staff:set_role",
    table_name: "profiles",
    row_id: userId,
    details: `role->${newRole}`,
  });

  // Refresh the table
  revalidatePath("/admin/staff");
}
