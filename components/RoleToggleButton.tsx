"use client";

import { useState } from "react";

export default function RoleToggleButton({
  userId,
  isStaff,
  disabled = false,
  onDone,
}: {
  userId: string;
  isStaff: boolean;
  disabled?: boolean;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (disabled || loading) return;

    const targetRole = isStaff ? "user" : "staff";
    const ok = window.confirm(
      `${isStaff ? "Remove" : "Grant"} Staff role for this user?`
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/admin/api/users/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: targetRole }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        alert(json?.error ?? "Failed to update role");
      } else {
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
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
      title={isStaff ? "Demote to User" : "Promote to Staff"}
    >
      {loading ? "Saving…" : isStaff ? "Remove Staff" : "Make Staff"}
    </button>
  );
}
