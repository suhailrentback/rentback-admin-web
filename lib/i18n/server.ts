// Server-only helpers
import { cookies, headers } from 'next/headers';
import { resolveLocale } from '../i18n';
import type { Lang } from '../i18n';

/** Read preferred lang from cookie; fallback to Accept-Language; default 'en' */
export function getLangFromCookies(): Lang {
  const c = cookies().get('lang')?.value;
  if (c) return resolveLocale(c);

  const accept = headers().get('accept-language') || '';
  const first = accept.split(',')[0]?.split('-')[0]?.trim().toLowerCase();
  return resolveLocale(first);
}

/** Helper you can call from a route/action to set the lang cookie */
export function setLangCookie(lang: Lang) {
  // Note: cookies().set must be called within a server action or route handler.
  cookies().set({
    name: 'lang',
    value: resolveLocale(lang),
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
