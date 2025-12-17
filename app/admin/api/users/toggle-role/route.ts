// app/admin/api/users/toggle-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { userId, makeStaff } = (await req.json().catch(() => ({}))) as {
    userId?: string;
    makeStaff?: boolean;
  };

  if (!userId || typeof makeStaff !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ ok: false, error: 'Missing Supabase env' }, { status: 500 });
  }

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Update app_metadata.role -> 'staff' | 'user'
  const { error } = await admin.auth.admin.updateUserById(userId, {
    // cast to any to avoid TS friction on app_metadata
    app_metadata: { role: makeStaff ? 'staff' : 'user' } as any,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId, role: makeStaff ? 'staff' : 'user' });
}
