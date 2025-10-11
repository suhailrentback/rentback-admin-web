// app/page.tsx (admin)
// Polished admin landing with brand header/footer and no language toggle.
"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";

export default function AdminLanding() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // hydrate theme from localStorage
  useEffect(() => {
    try {
      const t = localStorage.getItem("rb-theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch {}
  }, []);

  // apply theme to <html> + persist
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem("rb-theme", theme);
    } catch {}
  }, [theme]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#0b0b0b] dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Brand />
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}
              className="px-3 py-2 text-sm rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="toggle theme"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <Link
              href="/sign-in"
              className="px-3 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-4">
        <section className="py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              RentBack <span className="text-emerald-600 dark:text-emerald-400">Admin</span>
            </h1>
            <p className="mt-4 text-lg opacity-80">
              Secure operations console for payouts, reconciliation, rewards, tenants, and staff roles.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-in"
                className="px-5 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Sign in to Admin
              </Link>
              <a
                href="https://www.rentback.app/"
                className="px-5 py-3 rounded-xl font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Go to Main Site
              </a>
            </div>

            <ul className="mt-8 space-y-2 text-sm opacity-80">
              <li>• Access is restricted to <strong>admin@rentback.app</strong> and approved staff.</li>
              <li>• Least-privilege roles, audit logs, and 2FA recommended.</li>
              <li>• Use a secure device and private network when accessing Admin.</li>
            </ul>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 blur-3xl opacity-30 hidden dark:block"
              style={{
                background:
                  "conic-gradient(from 90deg at 50% 50%, #059669, #10b981, #34d399)",
              }}
            />
            <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6">
              <AdminMock />
            </div>
            <p className="mt-3 text-xs opacity-70">Mock admin widgets for preview only.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-xs opacity-70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} RentBack Technologies (Pvt) Ltd</span>
            <div className="flex gap-4">
              <a href="https://www.rentback.app/privacy" className="hover:opacity-100 opacity-80">
                Privacy
              </a>
              <a href="mailto:help@rentback.app" className="hover:opacity-100 opacity-80">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function AdminMock() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg">
        <div className="text-sm opacity-90">Today</div>
        <div className="mt-2 text-2xl font-semibold">PKR 2,450,000</div>
        <div className="mt-1 text-sm opacity-90">Collected</div>
      </div>
      <div className="rounded-xl p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5">
        <div className="text-sm opacity-80">Open Tickets</div>
        <div className="mt-2 text-2xl font-semibold">7</div>
        <div className="mt-1 text-xs opacity-60">SLA &lt; 24h</div>
      </div>
      <div className="rounded-xl p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5">
        <div className="text-sm opacity-80">Pending Payouts</div>
        <div className="mt-2 text-2xl font-semibold">12</div>
        <div className="mt-1 text-xs opacity-60">Cutoff 6pm PKT</div>
      </div>
      <div className="rounded-xl p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5">
        <div className="text-sm opacity-80">Risk Flags</div>
        <div className="mt-2 text-2xl font-semibold">3</div>
        <div className="mt-1 text-xs opacity-60">Review queue</div>
      </div>
    </div>
  );
}
