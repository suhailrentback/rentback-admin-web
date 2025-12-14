// lib/i18n.ts

export type Locale = "en" | "ur";
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "ur"] as const;
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Normalize any input (query/cookie) to a supported Locale.
 */
export function resolveLocale(raw?: string | null): Locale {
  const l = (raw ?? "").toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(l)
    ? (l as Locale)
    : DEFAULT_LOCALE;
}

/**
 * Direction for <html dir=...>
 */
export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ur" ? "rtl" : "ltr";
}
