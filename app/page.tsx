// ADMIN: place in rentback-admin-web/app/page.tsx
import Link from "next/link";
import { getLang, getCopy } from "@/lib/i18n";

export default function AdminLanding() {
  const lang = getLang();
  const c = getCopy(lang).adminLanding;

  return (
    <section className="py-16 grid lg:grid-cols-2 gap-10 items-start">
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{c.title}</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300">{c.subtitle}</p>
        <Link
          href="/sign-in"
          className="inline-block px-5 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {c.signInCta}
        </Link>
        <ul className="mt-4 grid gap-2">
          {c.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-[6px] h-2 w-2 rounded-full bg-emerald-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-black/5 dark:border-white/10 p-6">
        <div className="text-sm opacity-70 mb-2">Mock admin widgets for preview only.</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
            <div className="text-sm opacity-70">Today</div>
            <div className="text-2xl font-bold">PKR 2,450,000</div>
            <div className="text-sm opacity-70 mt-1">Collected</div>
          </div>
          <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
            <div className="text-sm opacity-70">Open Tickets</div>
            <div className="text-2xl font-bold">7</div>
            <div className="text-sm opacity-70 mt-1">SLA &lt; 24h</div>
          </div>
          <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
            <div className="text-sm opacity-70">Pending Payouts</div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm opacity-70 mt-1">Cutoff 6pm PKT</div>
          </div>
          <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
            <div className="text-sm opacity-70">Risk Flags</div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm opacity-70 mt-1">Review queue</div>
          </div>
        </div>
      </div>
    </section>
  );
}
