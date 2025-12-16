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

// To keep old imports working, we return both the flat fields AND a nested `adminLanding`
export type CopyRoot = AdminLandingCopy & { adminLanding: AdminLandingCopy };

// ---- Copy ----
export function getCopy(lang: Lang): CopyRoot {
  const base: AdminLandingCopy =
    lang === "ur"
      ? {
          title: "RentBack Admin",
          subtitle: "چلتی ڈیمو • سادہ UI • تیز رفتار ورک فلو",
          signInCta: "سائن ان کریں",
          bullets: ["لائٹ / ڈارک تھیم", "انگلش / اردو (RTL) سوئچ", "ڈیمو موڈ آن"],
        }
      : {
          title: "RentBack Admin",
          subtitle: "Live demo • Minimal UI • Fast workflows",
          signInCta: "Sign in",
          bullets: ["Light / Dark theme", "English / Urdu (RTL) toggle", "Demo mode enabled"],
        };

  // Return both flat fields and a nested alias for backward compatibility
  return { ...base, adminLanding: base };
}

// Minimal lang getter (server-aware version lives in lib/i18n/server.ts)
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
