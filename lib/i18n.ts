// lib/i18n.ts
import { cookies } from "next/headers";

export type Lang = "en" | "ur";
export type Theme = "light" | "dark";

export function getLang(): Lang {
  const v = cookies().get("rb-lang")?.value as Lang | undefined;
  return v === "ur" ? "ur" : "en";
}
export function getTheme(): Theme {
  const v = cookies().get("rb-theme")?.value as Theme | undefined;
  return v === "dark" ? "dark" : "light";
}
export function getDir(lang: Lang): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

export function getCopy(lang: Lang) {
  const common = {
    brand: "RentBack",
    admin: lang === "ur" ? "ایڈمن" : "Admin",
    signIn: lang === "ur" ? "سائن اِن" : "Sign in",
    signOut: lang === "ur" ? "لاگ آؤٹ" : "Sign out",
    privacy: lang === "ur" ? "پرائیویسی" : "Privacy",
    terms: lang === "ur" ? "شرائط" : "Terms",
    contact: lang === "ur" ? "رابطہ" : "Contact",
    mainSite: lang === "ur" ? "مین سائٹ" : "Main Site",
  };

  const hero = {
    title: lang === "ur" ? "RentBack ایڈمن" : "RentBack Admin",
    sub:
      lang === "ur"
        ? "پے آؤٹس، ری کنسیلی ایشن، ریوارڈز، کرایہ دار اور اسٹاف رولز کے لیے محفوظ کنسول۔"
        : "Secure operations console for payouts, reconciliation, rewards, tenants, and staff roles.",
    cta: lang === "ur" ? "ایڈمن میں سائن اِن" : "Sign in to Admin",
    goMain: lang === "ur" ? "مین سائٹ پر جائیں" : "Go to Main Site",
    bullets: [
      lang === "ur"
        ? "رسائی صرف admin@rentback.app اور منظور شدہ اسٹاف تک محدود ہے۔"
        : "Access is restricted to admin@rentback.app and approved staff.",
      lang === "ur"
        ? "کم سے کم اختیارات، آڈٹ لاگز، اور 2FA کی سفارش کی جاتی ہے۔"
        : "Least-privilege roles, audit logs, and 2FA recommended.",
      lang === "ur"
        ? "ایڈمن تک رسائی کے لیے محفوظ ڈیوائس اور نجی نیٹ ورک استعمال کریں۔"
        : "Use a secure device and private network when accessing Admin.",
    ],
    mockNote:
      lang === "ur" ? "پیش نظارہ کے لیے صرف ماک ویجیٹس۔" : "Mock admin widgets for preview only.",
  };

  return { common, hero } as const;
}
