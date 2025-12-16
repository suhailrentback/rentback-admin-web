// lib/i18n/server.ts
import { cookies, headers } from "next/headers";
import { resolveLocale, type Lang } from "../i18n";

// Reads from cookie ("lang") or Accept-Language; defaults to "en"
export function getLangFromCookies(): Lang {
  try {
    const c = cookies().get("lang")?.value;
    if (c) return resolveLocale(c);
  } catch {}
  try {
    const h = headers().get("accept-language");
    if (h?.toLowerCase().startsWith("ur")) return "ur";
  } catch {}
  return "en";
}
