import "./globals.css";
import type { Metadata } from "next";
import { getLangFromCookies } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/index";
import { dirFor } from "@/lib/i18n";
import FloatingLangSwitch from "@/components/FloatingLangSwitch";
import SkipLink from "@/components/SkipLink";

export const metadata: Metadata = {
  title: "RentBack Admin",
  description: "Admin console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLangFromCookies();
  const dir = dirFor(lang);

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <I18nProvider lang={lang}>
          <SkipLink />
          <FloatingLangSwitch />
          <main id="main" role="main">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
