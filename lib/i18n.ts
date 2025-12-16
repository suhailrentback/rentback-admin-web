// lib/i18n.ts
// Shared i18n surface: types, copy, and re-exports. Safe for client & server.

export type Lang = "en" | "ur";
export type Theme = "light" | "dark";

export type AdminLandingCopy = {
  title: string;
  subtitle: string;
  signInCta: string;
  bullets: string[];
};

// ---- Copy ----
export function getCopy(lang: Lang): AdminLandingCopy {
  if (lang === "ur") {
    return {
      title: "RentBack Admin",
      subtitle: "چلتی ڈیمو • سادہ UI • تیز رفتار ورک فلو",
      signInCta: "سائن ان کریں",
      bullets: ["لائٹ / ڈارک تھیم", "انگلش / اردو (RTL) سوئچ", "ڈیمو موڈ آن"],
    };
  }
  return {
    title: "RentBack Admin",
    subtitle: "Live demo • Minimal UI • Fast workflows",
    signInCta: "Sign in",
    bullets: ["Light / Dark theme", "English / Urdu (RTL) toggle", "Demo mode enabled"],
  };
}

// Minimal lang getter used by server pages that previously called getLang()
// (We default to English; server-aware cookie version lives in lib/i18n/server.ts)
export function getLang(): Lang {
  return "en";
}

// For routes that called resolveLocale(langParam)
export function resolveLocale(input?: string | null): Lang {
  return input === "ur" ? "ur" : "en";
}

// Direction helper (optional)
export function dirFor(lang: Lang): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

// Re-export the client provider & hook so imports from "@/lib/i18n" keep working
export { I18nProvider, useI18n } from "./i18n/index";
