// app/layout.tsx
import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n/server';
import FloatingLangSwitch from '@/components/FloatingLangSwitch';
import SkipLink from '@/components/SkipLink';

export const metadata: Metadata = { title: 'RentBack Admin' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLangFromCookies();
  const dir = lang === 'ur' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir}>
      <body>
        <I18nProvider lang={lang}>
          <SkipLink />
          <FloatingLangSwitch />
          <main id="main" role="main">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
