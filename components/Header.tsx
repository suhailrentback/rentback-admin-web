// components/Header.tsx (ADMIN)
import Link from "next/link";
import Brand from "@/components/Brand";
import ThemeLangToggle from "@/components/ThemeLangToggle";
import { getLang, getTheme, getCopy } from "@/lib/i18n";

export default function Header() {
  const lang = getLang();
  const theme = getTheme();
  const t = getCopy(lang).common;

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60 border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="inline-flex items-center gap-3">
          <Brand />
          <span className="text-sm opacity-70">/ {t.admin ?? "Admin"}</span>
        </div>
        <nav className="flex items-center gap-3">
          <a
            href="https://www.rentback.app"
            className="px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            {t.mainSite ?? "Main Site"}
          </a>
          <Link
            href="/sign-in"
            className="px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            {t.signIn}
          </Link>
          <ThemeLangToggle initialLang={lang} initialTheme={theme} />
        </nav>
      </div>
    </header>
  );
}
