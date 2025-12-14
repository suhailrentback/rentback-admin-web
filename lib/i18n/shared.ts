// lib/i18n/shared.ts
export type Lang = 'en' | 'ur';
export type Theme = 'light' | 'dark';

export const getDir = (lang: Lang): 'ltr' | 'rtl' => (lang === 'ur' ? 'rtl' : 'ltr');
