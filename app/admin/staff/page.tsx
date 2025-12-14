// app/admin/staff/page.tsx
import { createServerSupabase } from "@/lib/supabase";
import { setUserRole } from "./actions";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "tenant" | "landlord" | "staff" | "admin";
  last_login?: string | null;
  created_at?: string | null;
};

export default async function StaffPage() {
  const sb = createServerSupabase();

  // AuthZ gate: only staff/admin may view
  const { data: me } = await sb.auth.getUser();
  if (!me?.user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Staff</h1>
        <p className="text-sm text-red-600">You must be signed in.</p>
      </div>
    );
  }

  const { data: meProfile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", me.user.id)
    .single();

  if (!meProfile || !["staff", "admin"].includes(meProfile.role)) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2">Staff</h1>
        <p className="text-sm text-red-600">Not permitted.</p>
      </div>
    );
  }

  const { data: rows, error } = await sb
    .from("profiles")
    .select("id,email,full_name,role,last_login,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Staff</h1>
      </div>

      {error ? (
        <p className="text-sm text-red-600">Failed to load users: {error.message}</p>
      ) : !rows || rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Last login</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(rows as ProfileRow[]).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.full_name ?? "—"}</td>
                  <td className="p-2">{r.email ?? "—"}</td>
                  <td className="p-2">{r.role}</td>
                  <td className="p-2">
                    {r.last_login ? new Date(r.last_login).toLocaleString() : "—"}
                  </td>
                  <td className="p-2">
                    <form action={setUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={r.id} />
                      <select
                        name="role"
                        defaultValue={r.role}
                        className="border rounded-md px-2 py-1"
                      >
                        <option value="tenant">tenant</option>
                        <option value="landlord">landlord</option>
                        <option value="staff">staff</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-md border bg-black text-white dark:bg-white dark:text-black"
                      >
                        Set
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
