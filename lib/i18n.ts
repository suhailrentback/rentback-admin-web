// ADMIN: place in rentback-admin-web/lib/i18n.ts
import { cookies } from "next/headers";

export type Lang = "en" | "ur";
export type Theme = "light" | "dark";

type CommonCopy = {
  signIn: string;
  mainSite: string;
  privacy: string;
  contact: string;
};

type AdminLandingCopy = {
  title: string;
  subtitle: string;
  bullets: string[];
  signInCta: string;
};

export type Copy = {
  common: CommonCopy;
  adminLanding: AdminLandingCopy;
};

export function getLang(): Lang {
  const c = cookies().get("rb_lang")?.value;
  return c === "ur" ? "ur" : "en";
}

export function getTheme(): Theme {
  const c = cookies().get("rb_theme")?.value;
  return c === "dark" ? "dark" : "light";
}

export function getDir(lang?: Lang): "ltr" | "rtl" {
  const l = lang ?? getLang();
  return l === "ur" ? "rtl" : "ltr";
}

export function getCopy(lang: Lang): Copy {
  const en: Copy = {
    common: {
      signIn: "Sign in",
      mainSite: "Main Site",
      privacy: "Privacy",
      contact: "Contact",
    },
    adminLanding: {
      title: "RentBack Admin",
      subtitle:
        "Secure operations console for payouts, reconciliation, rewards, tenants, and staff roles.",
      bullets: [
        "Access is restricted to admin@rentback.app and approved staff.",
        "Least-privilege roles, audit logs, and 2FA recommended.",
        "Use a secure device and private network when accessing Admin.",
      ],
      signInCta: "Sign in to Admin",
    },
  };

  const ur: Copy = {
    common: {
      signIn: "سائن اِن",
      mainSite: "مین سائٹ",
      privacy: "پرائیویسی",
      contact: "رابطہ",
    },
    adminLanding: {
      title: "RentBack ایڈمن",
      subtitle:
        "پے آؤٹس، ریکنسلیئیشن، رِیواردز، ٹیننٹس اور اسٹاف رولز کے لیے محفوظ کنسول۔",
      bullets: [
        "رسائی صرف admin@rentback.app اور منظور شدہ اسٹاف تک محدود ہے۔",
        "کم سے کم اختیارات والے رولز، آڈٹ لاگز، اور 2FA کی سفارش کی جاتی ہے۔",
        "ایڈمن تک رسائی کے لیے محفوظ ڈیوائس اور نجی نیٹ ورک استعمال کریں۔",
      ],
      signInCta: "ایڈمن میں سائن اِن",
    },
  };

  return lang === "ur" ? ur : en;
}
