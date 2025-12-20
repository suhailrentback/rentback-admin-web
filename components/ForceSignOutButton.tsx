// components/ForceSignOutButton.tsx
"use client";

import { useState } from "react";

export default function ForceSignOutButton({
  userId,
  disabled,
  onDone,
}: {
  userId: string;
  disabled?: boolean;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const doIt = async () => {
    setLoading(true);
    setErr(null);
    setOk(false);
    try {
      const r = await fetch("/admin/api/users/force-signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || "Failed");
      setOk(true);
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
      onClick={doIt}
      disabled={!!disabled || loading}
      className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
      aria-disabled={!!disabled || loading}
      title="Revoke refresh tokens so the user must sign in again"
    >
      {loading ? "Revoking…" : ok ? "Revoked" : "Force sign-out"}
      {err ? <span className="sr-only"> — {err}</span> : null}
    </button>
  );
}
