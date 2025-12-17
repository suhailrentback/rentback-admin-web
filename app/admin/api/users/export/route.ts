// app/admin/api/users/export/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const headers = {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="users.csv"',
  };

  // Safe empty CSV if service key missing
  if (!url || !service) {
    return new NextResponse('id,email,last_sign_in_at\n', { headers });
  }

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return new NextResponse('id,email,last_sign_in_at\n', { headers });
  }

  const rows =
    data?.users?.map(
      (u) =>
        `${u.id},${(u.email || '').replace(/[,"]/g, ' ')},${
          u.last_sign_in_at || ''
        }`
    ) ?? [];

  const csv = ['id,email,last_sign_in_at', ...rows].join('\n');
  return new NextResponse(csv, { headers });
}
