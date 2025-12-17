// components/ForceSignOutButton.tsx
'use client';

import { useState } from 'react';

export default function ForceSignOutButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (disabled || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/admin/api/users/force-signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || 'Error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={disabled || busy || done}
        title={
          disabled
            ? 'No service role key configured — this will no-op.'
            : 'Force invalidate sessions for this user'
        }
        className="px-3 py-1 rounded-lg border text-xs hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
      >
        {done ? 'Signed out' : busy ? 'Working…' : 'Force sign-out'}
      </button>
      {err ? <span className="text-xs text-red-600">{err}</span> : null}
    </div>
  );
}
