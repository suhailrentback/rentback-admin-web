// app/page.tsx — admin landing (no header/footer here)
import Link from "next/link";
import { getLang, getCopy } from "@/lib/i18n";

export default function AdminLanding() {
  const lang = getLang();
  const c = getCopy(lang).hero;

  return (
    <section className="py-16 grid lg:grid-cols-2 gap-10 items-start">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold">{c.title}</h1>
        <p className="mt-3 opacity-80">{c.sub}</p>

        <div className="mt-6 flex gap-3">
          <Link href="/sign-in" className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
            {c.cta}
          </Link>
          <a href="https://www.rentback.app" className="px-4 py-2 rounded-xl font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10">
            {c.goMain}
          </a>
        </div>

        <ul className="mt-6 space-y-2 text-sm opacity-80">
          {c.bullets.map((b, i) => <li key={i}>• {b}</li>)}
        </ul>
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Widget label="Today" value="PKR 2,450,000" sub="Collected" />
          <Widget label="Open Tickets" value="7" sub="SLA &lt; 24h" />
          <Widget label="Pending Payouts" value="12" sub="Cutoff 6pm PKT" />
          <Widget label="Risk Flags" value="3" sub="Review queue" />
        </div>
        <p className="mt-3 text-xs opacity-70">{c.mockNote}</p>
      </div>
    </section>
  );
}

function Widget({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-600/10 to-emerald-400/10 border border-emerald-600/20">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs opacity-70">{sub}</div>
    </div>
  );
}
