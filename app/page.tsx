// USE IN ADMIN REPO ONLY: rentback-admin-web
// app/page.tsx
import Link from "next/link";
import { getLang, getCopy } from "@/lib/i18n";

export default function AdminLanding() {
  const lang = getLang();
  const c = getCopy(lang).adminLanding!;

  return (
    <section className="py-16 grid lg:grid-cols-2 gap-10 items-start">
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{c.title}</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300">{c.subtitle}</p>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-5 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Sign in to Admin
          </Link>
          <a
            href="https://www.rentback.app"
            className="px-5 py-3 rounded-xl font-semibold border border-black/10 dark:border-white/10"
          >
            Go to Main Site
          </a>
        </div>

        <ul className="mt-6 space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
          {c.notes.map((n, i) => (
            <li key={i}>• {n}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {c.kpis.map((k, i) => (
          <div key={i} className="rounded-2xl p-5 border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/40">
            <div className="text-sm opacity-70">{k.label}</div>
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-xs opacity-70">{k.sub}</div>
          </div>
        ))}
        <div className="col-span-2 text-sm opacity-70">{c.mockNote}</div>
      </div>
    </section>
  );
}
