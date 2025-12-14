import en from "./dictionaries/en";
import ur from "./dictionaries/ur";

export type Locale = "en" | "ur";
export type Dictionary = typeof en;

export const SUPPORTED_LOCALES: Locale[] = ["en", "ur"];
export const DEFAULT_LOCALE: Locale = "en";

export function resolveLocale(raw?: string | null): Locale {
  const l = (raw ?? "").toLowerCase();
  return (SUPPORTED_LOCALES as string[]).includes(l) ? (l as Locale) : DEFAULT_LOCALE;
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return locale === "ur" ? ur : en;
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ur" ? "rtl" : "ltr";
}
