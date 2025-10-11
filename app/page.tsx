// app/page.tsx
import { supabaseServer } from '../lib/supabase/server';

export default async function AdminHome() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Admin</h1>
      {user ? (
        <p className="mt-2 opacity-80 text-sm">Signed in as <strong>{user.email}</strong>.</p>
      ) : (
        <p className="mt-2 opacity-80 text-sm">You are signed out.</p>
      )}
    </div>
  );
}
