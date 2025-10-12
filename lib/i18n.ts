// rentback-admin-web/lib/i18n.ts
// Typed, cookie-aware i18n helpers for Admin app

export type Lang = "en" | "ur";
export type Theme = "light" | "dark";

type CommonCopy = {
  brand: string;
  admin: string;           // ← new: used in Header to show “/ Admin”
  signIn: string;
  demoMode: string;
  privacy: string;
  terms: string;
  contact: string;
  light: string;
  dark: string;
};

type AdminKPI = { label: string; value: string; sub: string };
type AdminLandingCopy = {
  title: string;
  subtitle: string;
  signInCta: string;
  goMainSite: string;
  notes: string[];
  kpis: AdminKPI[];
  mockNote: string;
};

export type Copy = {
  common: CommonCopy;
  adminLanding: AdminLandingCopy;
};

// ---------- cookie readers that work on server and client ----------
function readCookie(name: string): string | undefined {
  if (typeof window !== "undefined") {
    const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : undefined;
  }
  // dynamic require avoids bundling next/headers in client code
  const nh = require("next/headers");
  const val = nh.cookies().get(name)?.value as string | undefined;
  return val;
}

export function getLang(): Lang {
  const c = readCookie("rb_lang");
  return c === "ur" ? "ur" : "en";
}

export function getTheme(): Theme {
  const c = readCookie("rb_theme");
  return c === "dark" ? "dark" : "light";
}

export function getDir(lang?: Lang): "ltr" | "rtl" {
  const l = lang ?? getLang();
  return l === "ur" ? "rtl" : "ltr";
}

// ---------- dictionaries ----------
const copy: Record<Lang, Copy> = {
  en: {
    common: {
      brand: "RentBack",
      admin: "Admin",
      signIn: "Sign in",
      demoMode: "Demo Mode",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
      light: "Light",
      dark: "Dark",
    },
    adminLanding: {
      title: "RentBack Admin",
      subtitle:
        "Secure operations console for payouts, reconciliation, rewards, tenants, and staff roles.",
      signInCta: "Sign in to Admin",
      goMainSite: "Go to Main Site",
      notes: [
        "Access is restricted to admin@rentback.app and approved staff.",
        "Least-privilege roles, audit logs, and 2FA recommended.",
        "Use a secure device and private network when accessing Admin.",
      ],
      kpis: [
        { label: "Today", value: "PKR 2,450,000", sub: "Collected" },
        { label: "Open Tickets", value: "7", sub: "SLA < 24h" },
        { label: "Pending Payouts", value: "12", sub: "Cutoff 6pm PKT" },
        { label: "Risk Flags", value: "3", sub: "Review queue" },
      ],
      mockNote: "Mock admin widgets for preview only.",
    },
  },
  ur: {
    common: {
      brand: "رینٹ بیک",
      admin: "ایڈمن",
      signIn: "سائن اِن",
      demoMode: "ڈیمو موڈ",
      privacy: "پرائیویسی",
      terms: "شرائط",
      contact: "رابطہ",
      light: "لائٹ",
      dark: "ڈارک",
    },
    adminLanding: {
      title: "رینٹ بیک ایڈمن",
      subtitle:
        "محفوظ آپریشنز کنسول — پے آؤٹس، ریکنسلی ایشن، ریوارڈز، کرایہ داران اور اسٹاف رولز۔",
      signInCta: "ایڈمن میں سائن اِن کریں",
      goMainSite: "مین سائٹ پر جائیں",
      notes: [
        "رسائی صرف admin@rentback.app اور منظور شدہ اسٹاف کے لیے ہے۔",
        "کم سے کم اختیارات، آڈٹ لاگز اور 2FA کی سفارش کی جاتی ہے۔",
        "ایڈمن تک رسائی کے لیے محفوظ ڈیوائس اور نجی نیٹ ورک استعمال کریں۔",
      ],
      kpis: [
        { label: "آج", value: "PKR 2,450,000", sub: "اکٹھا" },
        { label: "کھلے ٹکٹس", value: "7", sub: "SLA < 24گھنٹے" },
        { label: "زیر التواء پے آؤٹس", value: "12", sub: "کٹ آف 6pm PKT" },
        { label: "رسک فلیگز", value: "3", sub: "جائزہ درکار" },
      ],
      mockNote: "صرف پیش نظارہ کے لیے فرضی ویجٹس۔",
    },
  },
};

export function getCopy(lang: Lang): Copy {
  return copy[lang];
}
