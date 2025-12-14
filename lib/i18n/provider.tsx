'use client';
// lib/i18n/provider.tsx
import React, { createContext, useContext, useMemo } from 'react';
import type { Lang, Theme } from './shared';
import { getDir } from './shared';

type I18nCtx = { lang: Lang; theme: Theme; dir: 'ltr' | 'rtl' };

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({
  lang,
  theme = 'light',
  children,
}: {
  lang: Lang;
  theme?: Theme;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ lang, theme, dir: getDir(lang) }), [lang, theme]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
