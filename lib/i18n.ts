// lib/i18n.ts
import { cookies, headers } from "next/headers";

/** Languages */
export type Lang = "en" | "ur";
export const SUPPORTED_LANGS: readonly Lang[] = ["en", "ur"] as const;
export const DEFAULT_LANG: Lang = "en";

/** Theme (kept here because some routes import Theme from i18n) */
export type Theme = "light" | "dark" | "system";
export const DEFAULT_THEME: Theme = "light";

/** Normalize any string to a supported Lang */
export function resolveLocale(raw?: string | null): Lang {
  const l = (raw ?? "").toLowerCase();
  return (SUPPORTED_LANGS as readonly string[]).includes(l) ? (l as Lang) : DEFAULT_LANG;
}

/** Direction for <html dir=...> */
export function getDir(lang: Lang): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

/** Server helper: read lang from cookie, then Accept-Language, else default */
export function getLang(): Lang {
  const c = cookies().get("lang")?.value;
  if (c) return resolveLocale(c);

  const accept = headers().get("accept-language") || "";
  const first = accept.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
  return resolveLocale(first);
}

/** Minimal copy dictionaries (extend anytime) */
const COPIES: Record<Lang, Record<string, string>> = {
  en: {
    appName: "RentBack Admin",
    admin: "Admin",
    staff: "Staff",
    audit: "Audit Log",
    signOut: "Sign out",
    language: "Language",
    light: "Light",
    dark: "Dark",
    system: "System",
    save: "Save",
  },
  ur: {
    appName: "RentBack ایڈمن",
    admin: "ایڈمن",
    staff: "عملہ",
    audit: "آڈٹ لاگ",
    signOut: "سائن آؤٹ",
    language: "زبان",
    light: "لائٹ",
    dark: "ڈارک",
    system: "سسٹم",
    save: "محفوظ کریں",
  },
};

/** Get UI copy for a given language */
export function getCopy(lang: Lang): Record<string, string> {
  return COPIES[resolveLocale(lang)];
}
