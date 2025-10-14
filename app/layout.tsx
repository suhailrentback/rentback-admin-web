// app/layout.tsx
import type { Metadata } from 'next';
import { getLangFromCookies } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/index';
import FloatingLangSwitch from '@/components/FloatingLangSwitch';
import SkipLink from '@/components/SkipLink';

export const metadata: Metadata = {
  title: 'RentBack Admin',
  description: 'RentBack Admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLangFromCookies();
  const dir = lang === 'ur' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body>
        {/* Global focus ring */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }
            `,
          }}
        />
        <I18nProvider initialLang={lang}>
          <SkipLink />
          <FloatingLangSwitch />
          <main id="main">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
