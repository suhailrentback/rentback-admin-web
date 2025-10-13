// ADMIN /lib/i18n.ts
"use client";

export type Lang = "en" | "ur";
export type Theme = "light" | "dark";

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem("rb-lang");
  return v === "ur" ? "ur" : "en";
}
export function setLang(lang: Lang) {
  try {
    window.localStorage.setItem("rb-lang", lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", getDir(lang));
  } catch {}
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem("rb-theme");
  return v === "dark" ? "dark" : "light";
}
export function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem("rb-theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch {}
}

export function getDir(lang?: Lang): "ltr" | "rtl" {
  const l = lang ?? getLang();
  return l === "ur" ? "rtl" : "ltr";
}

/* ===== Copy types ===== */
export type CommonCopy = {
  brand: "RentBack";
  signIn: string;
  admin: string;
  mainSite: string;
  langNames: { en: string; ur: string };
  themeNames: { light: string; dark: string };
  footer: { privacy: string; terms?: string; contact: string; copyright: string };
};

export type AdminLandingCopy = {
  title: string;
  subtitle: string;
  signInCta: string;
  goToMainSite: string;
  bullets: string[];
  finePrint: string;
};

export type Copy = {
  common: CommonCopy;
  adminLanding: AdminLandingCopy;
  auth: { signIn: { title: string } };
};

const copy: Record<Lang, Copy> = {
  en: {
    common: {
      brand: "RentBack",
      signIn: "Sign in",
      admin: "Admin",
      mainSite: "Go to Main Site",
      langNames: { en: "English", ur: "اردو" },
      themeNames: { light: "Light", dark: "Dark" },
      footer: {
        privacy: "Privacy",
        contact: "Contact",
        copyright: "© 2025 RentBack Technologies (Pvt) Ltd",
      },
    },
    adminLanding: {
      title: "RentBack Admin",
      subtitle:
        "Secure operations console for payouts, reconciliation, rewards, tenants, and staff roles.",
      signInCta: "Sign in to Admin",
      goToMainSite: "Go to Main Site",
      bullets: [
        "Access is restricted to admin@rentback.app and approved staff.",
        "Least-privilege roles, audit logs, and 2FA recommended.",
        "Use a secure device and private network when accessing Admin.",
      ],
      finePrint: "Mock admin widgets for preview only.",
    },
    auth: { signIn: { title: "Admin Sign In" } },
  },
  ur: {
    common: {
      brand: "RentBack",
      signIn: "سائن اِن",
      admin: "ایڈمن",
      mainSite: "مین سائٹ",
      langNames: { en: "English", ur: "اردو" },
      themeNames: { light: "لائٹ", dark: "ڈارک" },
      footer: {
        privacy: "پرائیویسی",
        contact: "رابطہ",
        copyright: "© 2025 RentBack Technologies (Pvt) Ltd",
      },
    },
    adminLanding: {
      title: "RentBack ایڈمن",
      subtitle:
        "محفوظ آپریشنز کنسول — پے آؤٹس، ریکنسلی ایشن، ریوارڈز، ٹیننٹس اور اسٹاف رولز۔",
      signInCta: "ایڈمن میں سائن اِن",
      goToMainSite: "مین سائٹ",
      bullets: [
        "رسائی صرف admin@rentback.app اور منظور شدہ اسٹاف کے لیے۔",
        "کم سے کم اختیارات، آڈٹ لاگز اور 2FA کی سفارش۔",
        "ایڈمن تک رسائی کے لیے محفوظ ڈیوائس/نیٹ ورک استعمال کریں۔",
      ],
      finePrint: "صرف پریویو کے لیے ماک ایڈمن وِجدٹس۔",
    },
    auth: { signIn: { title: "ایڈمن سائن اِن" } },
  },
};

export function getCopy(lang?: Lang): Copy {
  const l = lang ?? getLang();
  return copy[l];
}
