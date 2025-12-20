// components/RoleToggleButton.tsx
"use client";

import { useState } from "react";

export default function RoleToggleButton({
  userId,
  isStaff,
  disabled,
  onDone,
}: {
  userId: string;
  isStaff: boolean;
  disabled?: boolean;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nextRole: "staff" | "user" = isStaff ? "user" : "staff";

  const run = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/admin/api/users/toggle-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: nextRole }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || "Failed");
      onDone?.();
    } catch (e: any) {
      setErr(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={!!disabled || loading}
      className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
      aria-disabled={!!disabled || loading}
      title="Toggle staff role"
    >
      {loading ? "Saving…" : isStaff ? "Make user" : "Make staff"}
      {err ? <span className="sr-only"> — {err}</span> : null}
    </button>
  );
}
