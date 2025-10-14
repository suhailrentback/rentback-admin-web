// admin: app/tenants/lease/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

type LeaseRow = {
  id: string;
  status: "ACTIVE" | "ENDED" | "PENDING";
  start_date: string | null;
  end_date: string | null;
  monthly_rent: number;
  tenant: {
    full_name: string | null;
    email: string | null;
  } | null;
  unit: {
    unit_number: string | null;
    property: {
      name: string | null;
      address: string | null;
    } | null;
  } | null;
};

export default function AdminTenantLeasesPage() {
  const supabase = getSupabaseBrowser();
  const [rows, setRows] = useState<LeaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) {
        setError("Please sign in");
        setLoading(false);
        return;
      }

      // Admin/Staff should see all (RLS allows)
      const { data, error } = await supabase
        .from("lease")
        .select(`
          id, status, start_date, end_date, monthly_rent,
          tenant:tenant_id ( full_name, email ),
          unit:unit_id (
            unit_number,
            property:property_id ( name, address )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setRows(((data ?? []) as unknown) as LeaseRow[]);
      setLoading(false);
    })();
  }, [supabase]);

  if (loading) return <div className="p-6">Loading leases…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Leases</h1>
      <div className="grid gap-3">
        {rows.length === 0 && (
          <div className="rounded-xl border p-4">No leases found.</div>
        )}
        {rows.map((lease) => {
          const unit = lease.unit;
          const prop = unit?.property;
          return (
            <div key={lease.id} className="rounded-xl border p-4">
              <div className="font-semibold">
                {(prop?.name ?? "Property")} — Unit {unit?.unit_number ?? "—"}
              </div>
              <div className="text-sm opacity-80">
                Tenant: {lease.tenant?.full_name ?? "—"}{" "}
                <span className="opacity-60">
                  {lease.tenant?.email ? `(${lease.tenant.email})` : ""}
                </span>
              </div>
              <div className="mt-2 grid gap-1 text-sm">
                <div>Status: {lease.status}</div>
                <div>Start: {lease.start_date ?? "—"}</div>
                <div>End: {lease.end_date ?? "—"}</div>
                <div>Monthly Rent: {lease.monthly_rent}</div>
                <div className="opacity-80">Lease ID: {lease.id}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
