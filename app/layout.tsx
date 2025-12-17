// app/layout.tsx
import "./globals.css";
import FloatingLangSwitch from "@/components/FloatingLangSwitch";
import FloatingThemeSwitch from "@/components/FloatingThemeSwitch";
import type { Metadata } from "next";
import { getLangFromCookies } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/index";
import { dirFor } from "@/lib/i18n";
import { getThemeFromCookies } from "@/lib/theme/server";
import SkipLink from "@/components/SkipLink";

export const metadata: Metadata = {
  title: "RentBack Admin",
  description: "Admin console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLangFromCookies();
  const dir = dirFor(lang);
  const theme = getThemeFromCookies(); // "light" | "dark"

  return (
    <html
      lang={lang}
      dir={dir}
      className={theme === "dark" ? "dark" : ""}
      data-theme={theme}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <I18nProvider lang={lang}>
          <SkipLink />
          <FloatingLangSwitch />
          <FloatingThemeSwitch />
          <main id="main" role="main">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
