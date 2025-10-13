// ADMIN /app/tenants/page.tsx
import { createServerSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TenantsList() {
  const supabase = createServerSupabase()
  const { data: me } = await supabase.auth.getUser()
  if (!me?.user) {
    return <div className="max-w-3xl mx-auto py-12">Please sign in.</div>
  }

  // Minimal read-only list of tenant profiles
  const { data: tenants } = await supabase
    .from('profile')
    .select('user_id, email, role, created_at')
    .eq('role', 'TENANT')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <section className="max-w-5xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Tenants</h1>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(tenants ?? []).map((t:any) => (
              <tr key={t.user_id} className="border-t">
                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.role}</td>
                <td className="p-3">{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
