// app/admin/staff/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import ForceSignoutButton from "./ForceSignoutButton";

type Role = "tenant" | "landlord" | "staff" | "admin";

export const metadata = {
  title: "Staff | RentBack Admin",
};

async function listUsers() {
  const sb = await createServerSupabase();
  const { data, error } = await sb
    .from("profile")
    .select("id, email, full_name, role")
    .order("email", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    email: (r.email ?? "") as string,
    full_name: (r.full_name ?? "") as string,
    role: (r.role ?? "tenant") as Role,
  }));
}

async function requireStaffOrAdmin() {
  const sb = await createServerSupabase();
  const { data: userRes, error } = await sb.auth.getUser();
  if (error || !userRes?.user) throw new Error("Unauthorized");

  const { data: me, error: profErr } = await sb
    .from("profile")
    .select("role")
    .eq("id", userRes.user.id)
    .single();

  if (profErr) throw new Error("Profile not found");
  if (me?.role !== "admin" && me?.role !== "staff") throw new Error("Forbidden");
}

// ---- Server actions ----
export async function setUserRole(formData: FormData): Promise<void> {
  "use server";
  await requireStaffOrAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as Role;

  if (!userId) return;
  const allowed: Role[] = ["tenant", "landlord", "staff", "admin"];
  if (!allowed.includes(role)) return;

  const sb = await createServerSupabase();
  const { error } = await sb.from("profile").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/staff");
}

// ---- Page ----
export default async function Page() {
  await requireStaffOrAdmin();
  const rows = await listUsers();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Staff Management</h1>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr className="text-left">
              <th className="py-2 pl-4 pr-3">Name</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="py-2 pl-4 pr-3">{r.full_name || "—"}</td>
                <td className="py-2 px-3">{r.email || "—"}</td>
                <td className="py-2 px-3">
                  <form action={setUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={r.id} />
                    <select
                      name="role"
                      defaultValue={r.role}
                      className="border rounded px-2 py-1 text-xs bg-white dark:bg-neutral-950"
                    >
                      <option value="tenant">tenant</option>
                      <option value="landlord">landlord</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs rounded bg-neutral-700 text-white px-2 py-1 hover:bg-neutral-800"
                      title="Update role"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="py-2 px-3">
                  <ForceSignoutButton userId={r.id} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="py-6 px-4 text-sm text-neutral-500" colSpan={4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
