// USE IN ADMIN REPO ONLY: rentback-admin-web
// app/sign-in/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Brand from "@/components/Brand"; // ✅ default import

export default function AdminSignInPage() {
  const sp = useSearchParams();
  const error = sp.get("error");

  return (
    <section className="mx-auto max-w-lg py-16 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Brand />
        <span className="text-sm opacity-70">/ Admin</span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">Sign in to Admin</h1>

      {error ? (
        <div className="rounded-lg border border-red-300/40 bg-red-500/10 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Access is restricted to approved staff. Use a secure device and network.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
        >
          Admin Home
        </Link>
        <a
          href="https://www.rentback.app"
          className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
        >
          Main Site
        </a>
      </div>
    </section>
  );
}
