// ADMIN: /app/auth/callback/page.tsx
// Same confirmation page as web. Guards/allow-list will be added in Wave 1.1.

'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminAuthCallbackPage() {
  const [state, setState] = React.useState<'checking' | 'ok' | 'no-session'>('checking');
  const [email, setEmail] = React.useState<string>('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data?.user?.email) {
        setEmail(data.user.email);
        setState('ok');
      } else {
        setState('no-session');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-16 max-w-md mx-auto px-4">
      <h1 className="text-2xl font-bold">Admin Sign-in Status</h1>
      <div className="mt-4 text-sm">
        {state === 'checking' && 'Checking your session...'}
        {state === 'ok' && (
          <div className="space-y-2">
            <div className="text-emerald-600">You’re signed in.</div>
            <div className="text-neutral-600 dark:text-neutral-300">Email: {email}</div>
          </div>
        )}
        {state === 'no-session' && (
          <div className="text-red-600">
            No active session was found. Please request a new magic link.
          </div>
        )}
      </div>
    </section>
  );
}
