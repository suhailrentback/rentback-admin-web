// app/layout.tsx
import type { Metadata } from 'next';
import { getLangFromCookies } from '@/lib/i18n/server';
import { I18nProvider, getDir } from '@/lib/i18n/index';
import FloatingLangSwitch from '@/components/FloatingLangSwitch';
import SkipLink from '@/components/SkipLink';

export const metadata: Metadata = {
  title: 'RentBack Admin',
  description: 'Admin console for RentBack',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // determine language from cookies (server-side)
  const lang = await getLangFromCookies();
  const dir = getDir(lang);

  return (
    <html lang={lang} dir={dir}>
      <body>
        {/* App-wide i18n context */}
        <I18nProvider lang={lang}>
          <SkipLink />
          <FloatingLangSwitch />
          <main id="main" role="main">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
