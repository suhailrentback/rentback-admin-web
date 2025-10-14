// components/AuthForm.tsx
"use client";

import React, { useState } from "react";
import supabaseClient from "@/lib/supabase/client";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback";

      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin / Staff Sign-In</h1>

      {sent ? (
        <div className="rounded-xl border p-4 bg-green-50">
          Check your inbox for a sign-in link.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border px-4 py-2"
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
      )}
    </div>
  );
}
