"use client";

import { useState } from "react";

export default function ForceSignOutButton({
  userId,
  onDone,
}: {
  userId: string;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const ok = window.confirm(
      "Force sign out this user from all devices? They will need to log in again."
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/admin/api/users/force-signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        alert(json?.error ?? "Failed to force sign out");
      } else {
        alert("User sessions revoked.");
        onDone?.();
      }
    } catch (e: any) {
      alert(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-1.5 rounded-md text-sm font-medium border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
      aria-label="Force sign out user"
      title="Force sign out user"
    >
      {loading ? "Revoking…" : "Force Sign Out"}
    </button>
  );
}
