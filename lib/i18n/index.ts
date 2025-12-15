'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type Lang = 'en' | 'ur';
export type Theme = 'light' | 'dark';

type Copy = {
  language: string;
  english: string;
  urdu: string;
  adminLanding: {
    title: string;
    subtitle: string;
  };
};

const en: Copy = {
  language: 'Language',
  english: 'English',
  urdu: 'Urdu',
  adminLanding: {
    title: 'RentBack Admin',
    subtitle: 'Manage staff, tenants, invoices, and audit logs.',
  },
};

const ur: Copy = {
  language: 'زبان',
  english: 'انگریزی',
  urdu: 'اردو',
  adminLanding: {
    title: 'رینٹ بیک ایڈمن',
    subtitle: 'اسٹاف، کرایہ دار، انوائسز اور آڈٹ لاگز منظم کریں۔',
  },
};

export const translations: Record<Lang, Copy> = { en, ur };

export function getCopy(lang: Lang): Copy {
  return translations[lang] ?? en;
}

export function getLang(value?: string | null): Lang {
  const v = (value ?? '').toLowerCase();
  return v === 'ur' ? 'ur' : 'en';
}

type Ctx = {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  copy: Copy;
  t: <K extends keyof Copy>(k: K) => Copy[K];
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  lang,
  theme, // reserved for future
  children,
}: {
  lang: Lang;
  theme?: Theme;
  children: ReactNode;
}) {
  const value = useMemo<Ctx>(() => {
    const dir = lang === 'ur' ? 'rtl' : 'ltr';
    const copy = getCopy(lang);
    const t = <K extends keyof Copy>(k: K) => copy[k];
    return { lang, dir, copy, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
