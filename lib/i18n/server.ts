// lib/i18n/server.ts
import { cookies } from 'next/headers';
import type { Lang } from './index';

export async function getLangFromCookies(): Promise<Lang> {
  const v = cookies().get('lang')?.value;
  return v === 'ur' ? 'ur' : 'en';
}
