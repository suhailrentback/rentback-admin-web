// app/admin/staff/page.tsx
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import ForceSignoutButton from "./ForceSignoutButton";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type Role = "tenant" | "landlord" | "staff" | "admin";

export const metadata = {
  title: "Staff | RentBack Admin",
};

type Row = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

async function listUsers(): Promise<Row[]> {
  const sb = await createServerSupabase();
  const { data, error } = await sb
    .from("profile")
    .select("id, email, full_name, role")
    .order("email", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    email: String(r.email ?? ""),
    full_name: String(r.full_name ?? ""),
    role: (r.role ?? "tenant") as Role,
  }));
}

// Try to fetch last_sign_in_at from Supabase Admin API when service-role is present.
// Falls back to {} (no dates) if env is missing or any call fails.
async function getLastLoginMap(userIds: string[]): Promise<Record<string, string | null>> {
  const map: Record<string, string | null> = {};
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || userIds.length === 0) return map;

  const admin = createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch sequentially to be gentle with Admin API (lists are usually small)
  for (const id of userIds) {
    try {
      const { data } = await admin.auth.admin.getUserById(id);
      map[id] = data.user?.last_sign_in_at ?? null;
    } catch {
      map[id] = null;
    }
  }
  return map;
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

// ---- Server action: set user role ----
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

function prettyDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    // 2025-12-14 13:45 UTC
    return d.toISOString().replace("T", " ").replace(".000Z", " UTC");
  } catch {
    return "—";
  }
}

export default async function Page() {
  await requireStaffOrAdmin();
  const rows = await listUsers();
  const lastLoginMap = await getLastLoginMap(rows.map((r) => r.id));

  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Staff Management</h1>
        <a
          href="/admin/api/staff/export"
          className="rounded bg-neutral-700 text-white px-3 py-1.5 text-sm hover:bg-neutral-800"
          title="Download CSV of all users"
        >
          Export CSV
        </a>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr className="text-left">
              <th className="py-2 pl-4 pr-3">Name</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3 whitespace-nowrap">Last login</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="py-2 pl-4 pr-3">{r.full_name || "—"}</td>
                <td className="py-2 px-3 break-all">{r.email || "—"}</td>
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
                <td className="py-2 px-3 whitespace-nowrap">
                  {prettyDate(lastLoginMap[r.id])}
                </td>
                <td className="py-2 px-3">
                  <ForceSignoutButton userId={r.id} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="py-6 px-4 text-sm text-neutral-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        Last login shows Supabase <code>auth.users.last_sign_in_at</code> when a service key is configured; otherwise it’s blank.
      </p>
    </main>
  );
}
