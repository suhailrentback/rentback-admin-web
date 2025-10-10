// app/(protected)/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseServer();

  // 1) Must be signed in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // 2) Must be ADMIN (or STAFF)
  const { data: profile, error } = await supabase
    .from('Profile')
    .select('role,email')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    // If profile not found for some reason, treat as unauthorized
    redirect('/not-authorized');
  }

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'STAFF')) {
    redirect('/not-authorized');
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Simple admin header (can style later) */}
      <header className="border-b">
        <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
          <span className="font-bold">RentBack Admin</span>
          <nav className="text-sm opacity-80">{profile.email}</nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
