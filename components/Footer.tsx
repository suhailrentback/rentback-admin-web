// components/Footer.tsx (server component)
import { getLang, getCopy } from "@/lib/i18n";

export default function Footer() {
  const lang = getLang();
  const t = getCopy(lang).common;
  const year = new Date().getFullYear();

  return (
    <footer className="py-10 text-xs opacity-70">
      <div className="mx-auto max-w-6xl px-4 flex flex-wrap items-center justify-between gap-3">
        <span>© {year} RentBack Technologies (Pvt) Ltd</span>
        <div className="flex gap-4">
          <a href="https://www.rentback.app/privacy" className="hover:opacity-100 opacity-80">{t.privacy}</a>
          <a href="mailto:help@rentback.app" className="hover:opacity-100 opacity-80">{t.contact}</a>
        </div>
      </div>
    </footer>
  );
}
