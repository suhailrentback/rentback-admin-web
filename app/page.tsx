import Link from "next/link";
import { getCopy, getLang } from "@/lib/i18n";

export default function AdminLanding() {
  const lang = getLang();
  const c = getCopy(lang).adminLanding;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="py-16 grid lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {c.title}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            {c.subtitle}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/sign-in"
              className="px-5 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {c.signInCta}
            </Link>
            <a
              href="https://www.rentback.app/"
              className="px-5 py-3 rounded-xl font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {c.goMainSite}
            </a>
          </div>

          <ul className="mt-6 space-y-1 text-sm text-neutral-500 dark:text-neutral-400">
            {c.notes.map((n, i) => (
              <li key={i}>• {n}</li>
            ))}
          </ul>
        </div>

        {/* KPIs preview */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            {c.kpis.map((k, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
              >
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {k.label}
                </div>
                <div className="mt-1 text-2xl font-bold">{k.value}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {k.sub}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {c.mockNote}
          </p>
        </div>
      </section>
    </div>
  );
}
