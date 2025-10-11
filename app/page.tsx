// rentback-admin-web/app/page.tsx
// Admin landing (no header/footer here; layout provides them)
"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function AdminLanding() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          RentBack <span className="text-emerald-600 dark:text-emerald-400">Admin</span>
        </h1>
        <p className="mt-3 text-lg opacity-80">
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

        <ul className="mt-6 space-y-1 text-sm opacity-75">
          <li>• Access is restricted to <b>admin@rentback.app</b> and approved staff.</li>
          <li>• Least-privilege roles, audit logs, and 2FA recommended.</li>
          <li>• Use a secure device and private network when accessing Admin.</li>
        </ul>
      </section>

      {/* Mock admin widgets (preview only) */}
      <section className="grid md:grid-cols-4 gap-4">
        <Card title="Today" subtitle="PKR 2,450,000" foot="Collected" />
        <Card title="Open Tickets" subtitle="7" foot="SLA &lt; 24h" />
        <Card title="Pending Payouts" subtitle="12" foot="Cutoff 6pm PKT" />
        <Card title="Risk Flags" subtitle="3" foot="Review queue" />
      </section>

      <p className="mt-4 text-xs opacity-70">Mock admin widgets for preview only.</p>
    </main>
  );
}

function Card({ title, subtitle, foot }: { title: string; subtitle: string; foot: string }) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-white/5">
      <div className="text-xs opacity-70">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{subtitle}</div>
      <div className="mt-1 text-sm opacity-70">{foot}</div>
    </div>
  );
}
