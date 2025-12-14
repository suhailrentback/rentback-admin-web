// lib/i18n/server.ts  (server-only)
import { cookies, headers } from 'next/headers';
import { resolveLocale, type Lang, type Theme } from '../i18n';

export function getLangFromCookies(): Lang {
  const c = cookies();
  const langCookie = c.get('lang')?.value || c.get('rb_lang')?.value;
  if (langCookie) return resolveLocale(langCookie);

  const accept = headers().get('accept-language') || '';
  return resolveLocale(accept);
}

export function getThemeFromCookies(): Theme {
  const c = cookies();
  const raw = (c.get('theme')?.value || c.get('rb_theme')?.value || 'light').toLowerCase();
  return (['light', 'dark', 'system'].includes(raw) ? raw : 'light') as Theme;
}
