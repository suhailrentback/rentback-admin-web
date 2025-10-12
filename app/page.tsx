// app/page.tsx
import Link from "next/link";
import { getLang, getCopy } from "@/lib/i18n";

export default function AdminLanding() {
  const lang = getLang();
  const c = getCopy(lang).adminLanding; // AdminLandingCopy
  const t = getCopy(lang).common;       // CommonCopy for button labels like sign in, mainSite

  return (
    <section className="py-16 grid lg:grid-cols-2 gap-10 items-start">
      {/* Left: hero copy */}
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          {c.title}
        </h1>

        <p className="text-lg text-neutral-600 dark:text-neutral-300">
          {c.subtitle}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="px-5 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {c.signInAdmin ?? t.signIn}
          </Link>

          <a
            href="https://www.rentback.app"
            className="px-5 py-3 rounded-xl font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/10"
          >
            {c.goToMain ?? t.mainSite}
          </a>
        </div>

        {Array.isArray(c.notes) && c.notes.length > 0 && (
          <ul className="mt-6 space-y-2 text-neutral-700 dark:text-neutral-300">
            {c.notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: sample dashboard tiles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="text-sm opacity-70">
            {c.dashboardSample?.collectedToday}
          </div>
          <div className="mt-2 text-2xl font-bold">PKR 2,450,000</div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="text-sm opacity-70">
            {c.dashboardSample?.openTickets}
          </div>
          <div className="mt-2 text-2xl font-bold">7</div>
          <div className="text-xs opacity-70">SLA &lt; 24h</div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="text-sm opacity-70">
            {c.dashboardSample?.pendingPayouts}
          </div>
          <div className="mt-2 text-2xl font-bold">12</div>
          <div className="text-xs opacity-70">Cutoff 6pm PKT</div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="text-sm opacity-70">
            {c.dashboardSample?.riskFlags}
          </div>
          <div className="mt-2 text-2xl font-bold">3</div>
          <div className="text-xs opacity-70">{c.dashboardSample?.tagPreview}</div>
        </div>
      </div>
    </section>
  );
}
