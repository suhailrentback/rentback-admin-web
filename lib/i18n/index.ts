'use client';

import React, { createContext, useContext, useMemo } from 'react';

export type Lang = 'en' | 'ur';
export type Theme = 'light' | 'dark';

export function getDir(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ur' ? 'rtl' : 'ltr';
}

/** ---- Copy types ---- **/
type AdminLandingCopy = {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  manageProperties: string;
  manageTenants: string;
  manageInvoices: string;
  manageRewards: string;
} & Record<string, string>;

type Copy = {
  language: string;
  english: string;
  urdu: string;
  adminLanding: AdminLandingCopy;
};

/** ---- Actual copy ---- **/
const COPIES: Record<Lang, Copy> = {
  en: {
    language: 'Language',
    english: 'English',
    urdu: 'Urdu',
    adminLanding: {
      title: 'RentBack Admin',
      subtitle: 'Operate your portfolio: properties, tenants, invoices, payments & rewards.',
      ctaPrimary: 'Go to Dashboard',
      ctaSecondary: 'View Docs',
      manageProperties: 'Manage Properties',
      manageTenants: 'Manage Tenants',
      manageInvoices: 'Invoices & Payments',
      manageRewards: 'Rewards & Offers',
    },
  },
  ur: {
    language: 'زبان',
    english: 'انگریزی',
    urdu: 'اردو',
    adminLanding: {
      title: 'RentBack ایڈمن',
      subtitle: 'اپنے پورٹ فولیو کو چلائیں: جائیدادیں، کرایہ دار، انوائسز، ادائیگیاں اور انعامات۔',
      ctaPrimary: 'ڈیش بورڈ پر جائیں',
      ctaSecondary: 'دستاویزات دیکھیں',
      manageProperties: 'جائیدادیں',
      manageTenants: 'کرایہ دار',
      manageInvoices: 'انوائسز اور ادائیگیاں',
      manageRewards: 'انعامات اور آفرز',
    },
  },
};

/** Helper to read copy on either side */
export function getCopy(lang: Lang): Copy {
  return COPIES[lang] ?? COPIES.en;
}

/**
 * Safe client util for server or client components that don’t want to
 * pull cookies. On the server it will just return the default.
 */
export function getLang(defaultLang: Lang = 'en'): Lang {
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.getAttribute('lang');
    return htmlLang === 'ur' ? 'ur' : 'en';
  }
  return defaultLang;
}

/** ---- Context for client components ---- **/
type I18nCtx = {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  copy: Copy;
  t: <T = any>(selector: (c: Copy) => T) => T;
};

const I18nContext = createContext<I18nCtx>({
  lang: 'en',
  dir: 'ltr',
  copy: COPIES.en,
  t: (sel) => sel(COPIES.en),
});

export function I18nProvider({
  lang,
  theme, // reserved if you want to thread theme later
  children,
}: {
  lang: Lang;
  theme?: Theme;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nCtx>(() => {
    const copy = getCopy(lang);
    const dir = getDir(lang);
    const t = <T,>(selector: (c: Copy) => T) => selector(copy);
    return { lang, dir, copy, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
