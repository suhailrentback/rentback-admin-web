'use client';

import React, { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import type { Lang, Theme } from '../i18n';
import { getDir } from '../i18n';

type I18nCtx = {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  theme?: Theme;
};

const I18nContext = createContext<I18nCtx>({ lang: 'en', dir: 'ltr' });

export function I18nProvider(
  { lang, theme, children }: PropsWithChildren<{ lang: Lang; theme?: Theme }>
) {
  const value = useMemo(() => ({ lang, dir: getDir(lang), theme }), [lang, theme]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

// Re-export handy helpers if you want to import them from '@/lib/i18n/index'
export { getDir } from '../i18n';
export type { Lang, Theme } from '../i18n';
