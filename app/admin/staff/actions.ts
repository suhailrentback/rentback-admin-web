// app/admin/staff/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase";

export async function setUserRole(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim().toLowerCase();

  if (!userId) return;
  if (!["tenant", "landlord", "staff", "admin"].includes(role)) return;

  const sb = createServerSupabase();

  // Require current user to be staff/admin
  const { data: me } = await sb.auth.getUser();
  if (!me?.user) return;

  const { data: meProfile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", me.user.id)
    .single();

  if (!meProfile || !["staff", "admin"].includes(meProfile.role)) return;

  // Update role
  await sb.from("profiles").update({ role }).eq("id", userId);

  // Optional: audit log
  await sb.from("audit_log").insert({
    action: "staff:set-role",
    entity: "profile",
    record_id: userId,
    summary: `role -> ${role}`,
  });

  revalidatePath("/admin/staff");
}
