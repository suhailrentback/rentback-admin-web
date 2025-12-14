// lib/i18n.ts (shared-only; safe for client and server imports)

/** Languages & Theme */
export type Lang = 'en' | 'ur';
export type Theme = 'light' | 'dark' | 'system';

/** Map arbitrary locale strings to our supported Langs */
export function resolveLocale(input?: string | null): Lang {
  const val = (input || '').toLowerCase();
  if (val.startsWith('ur')) return 'ur';
  return 'en';
}

/** RTL/LTR helpers */
export function getDir(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ur' ? 'rtl' : 'ltr';
}

/** Minimal copy dictionary (extend as needed) */
const copy = {
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
  return copy[lang] || copy.en;
}
