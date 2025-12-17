// app/admin/api/users/force-signout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Safe no-op if service key is missing
  if (!url || !service) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const { user_id } = await req.json().catch(() => ({}));
  if (!user_id) {
    return NextResponse.json(
      { ok: false, error: 'user_id required' },
      { status: 400 }
    );
  }

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.signOutUser({ user_id });
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
