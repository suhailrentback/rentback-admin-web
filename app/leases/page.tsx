// ADMIN /app/leases/page.tsx
import { createServerSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function LeasesList() {
  const supabase = createServerSupabase()
  const { data: me } = await supabase.auth.getUser()
  if (!me?.user) {
    return <div className="max-w-3xl mx-auto py-12">Please sign in.</div>
  }

  const { data: leases } = await supabase
    .from('lease')
    .select(`
      id, start_date, end_date, rent_amount, status, created_at,
      tenant:tenant_id ( email ),
      unit:unit_id ( unit_number, property:property_id ( name ) )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <section className="max-w-6xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Leases</h1>
      <div className="rounded-xl border overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-3">Property</th>
              <th className="text-left p-3">Unit</th>
              <th className="text-left p-3">Tenant</th>
              <th className="text-left p-3">Rent</th>
              <th className="text-left p-3">Dates</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(leases ?? []).map((l:any) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.unit?.property?.name}</td>
                <td className="p-3">{l.unit?.unit_number}</td>
                <td className="p-3">{l.tenant?.email}</td>
                <td className="p-3">Rs {Number(l.rent_amount).toLocaleString()}</td>
                <td className="p-3">{l.start_date} → {l.end_date ?? '—'}</td>
                <td className="p-3">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
