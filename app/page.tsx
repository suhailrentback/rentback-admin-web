// app/page.tsx
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getSessionUser } from '@/lib/auth/session';

export default async function AdminHome() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <section className="py-10">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
          <h1 className="text-xl font-bold">Please sign in</h1>
          <p className="mt-2 opacity-80">You need a staff account to access Admin.</p>
          <div className="mt-4">
            <Link href="/sign-in?next=/" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const email = user.email || '';
  const isStaffDomain = email.toLowerCase().endsWith('@rentback.app');
  if (!isStaffDomain) {
    return (
      <section className="py-10">
        <div className="rounded-2xl border border-amber-300/40 bg-amber-50 dark:bg-amber-900/20 p-6 text-amber-900 dark:text-amber-100">
          <h1 className="text-xl font-bold">Not authorized</h1>
          <p className="mt-2 opacity-90">Admin is restricted to @rentback.app addresses.</p>
          <form action="/auth/signout" method="post" className="mt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <h1 className="text-3xl font-extrabold">Admin</h1>
      <p className="mt-2 opacity-80">Welcome, {email}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
          <h3 className="font-semibold">Payouts</h3>
          <p className="opacity-70 text-sm mt-1">Manage settlement schedules and statements.</p>
        </div>
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
          <h3 className="font-semibold">Rewards</h3>
          <p className="opacity-70 text-sm mt-1">Configure partners, tiers, and promotions.</p>
        </div>
      </div>
    </section>
  );
}
