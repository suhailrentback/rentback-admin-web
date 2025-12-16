// lib/i18n/server.ts
import { cookies } from 'next/headers';
import type { Lang } from './index';

export function getLangFromCookies(): Lang {
  const val = cookies().get('lang')?.value || '';
  return val === 'ur' ? 'ur' : 'en';
}
