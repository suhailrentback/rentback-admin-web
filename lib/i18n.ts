// lib/i18n.ts  (shared-only; safe in client & server)

export type Lang = 'en' | 'ur';
export type Theme = 'light' | 'dark' | 'system';

/** Normalize arbitrary locale -> our supported langs */
export function resolveLocale(input?: string | null): Lang {
  const v = (input || '').toLowerCase();
  if (v.startsWith('ur')) return 'ur';
  return 'en';
}

/** Back-compat alias some code expects */
export function getLang(input?: string | null): Lang {
  return resolveLocale(input);
}

/** Text direction helper */
export function getDir(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ur' ? 'rtl' : 'ltr';
}

/** Minimal copy dictionary (extend as needed) */
const dict = {
  en: {
    language: 'Language',
    english: 'English',
    urdu: 'Urdu',
  },
  ur: {
    language: 'زبان',
    english: 'انگریزی',
    urdu: 'اردو',
  },
} satisfies Record<Lang, Record<string, string>>;

export function getCopy(lang: Lang) {
  return dict[lang] || dict.en;
}
