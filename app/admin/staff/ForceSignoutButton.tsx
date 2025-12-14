"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ForceSignoutButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  async function click() {
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/admin/api/staff/force-signout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setMsg("Signed out");
        router.refresh();
      } catch (e: any) {
        setMsg(e?.message || "Failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={click}
        disabled={pending}
        className="text-xs rounded bg-rose-600 text-white px-2 py-1 hover:bg-rose-700 disabled:opacity-50"
        title="Force sign out all sessions for this user"
      >
        {pending ? "Signing out..." : "Force sign-out"}
      </button>
      {msg && <span className="text-[10px] text-neutral-500">{msg}</span>}
    </div>
  );
}
