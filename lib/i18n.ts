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

// Footer/headers/etc. may grab arbitrary keys off `common`,
// so we give it a broad index signature to avoid TS errors
// if a component reads a key we didn’t enumerate yet.
export type CommonCopy = Record<string, string>;

// Return both flat fields (for new code) AND a nested `adminLanding`
// (for older code that still calls getCopy(lang).adminLanding)
export type CopyRoot = AdminLandingCopy & {
  adminLanding: AdminLandingCopy;
  common: CommonCopy;
};

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
          bullets: ["Light/Dark theme", "English/Urdu (RTL) toggle", "Demo mode enabled"],
        };

  const common: CommonCopy =
    lang === "ur"
      ? {
          appName: "RentBack",
          rights: `© ${new Date().getFullYear()} RentBack. جملہ حقوق محفوظ ہیں۔`,
          madeWithLove: "محبت کے ساتھ بنایا گیا",
          language: "زبان",
          theme: "تھیم",
          light: "لائٹ",
          dark: "ڈارک",
          contact: "help@rentback.app",
          privacy: "پرائیویسی",
          terms: "شرائط",
        }
      : {
          appName: "RentBack",
          rights: `© ${new Date().getFullYear()} RentBack. All rights reserved.`,
          madeWithLove: "Made with love",
          language: "Language",
          theme: "Theme",
          light: "Light",
          dark: "Dark",
          contact: "help@rentback.app",
          privacy: "Privacy",
          terms: "Terms",
        };

  return { ...base, adminLanding: base, common };
}

// Minimal no-deps helpers (server-aware versions can live in lib/i18n/server.ts)
export function getLang(): Lang {
  return "en";
}

export function resolveLocale(input?: string | null): Lang {
  return input === "ur" ? "ur" : "en";
}

export function dirFor(lang: Lang): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

// Re-export client provider & hook so imports from "@/lib/i18n" keep working
export { I18nProvider, useI18n } from "./i18n/index";
