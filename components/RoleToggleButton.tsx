'use client';

import { useState } from 'react';

type Props = {
  userId: string;
  isStaff: boolean;
  disabled?: boolean;
  onDone?: () => void;
};

export default function RoleToggleButton({ userId, isStaff, disabled, onDone }: Props) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/admin/api/users/toggle-role', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, makeStaff: !isStaff }),
      });
      if (!res.ok) throw new Error(await res.text());
      onDone?.() ?? window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to toggle role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={disabled || loading}
      className={`rounded-xl px-3 py-2 text-sm border
        ${disabled || loading ? 'opacity-50 pointer-events-none' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
      aria-label={isStaff ? 'Demote to user' : 'Promote to staff'}
      title={isStaff ? 'Demote to user' : 'Promote to staff'}
    >
      {loading ? 'Working…' : isStaff ? 'Demote' : 'Promote'}
    </button>
  );
}
