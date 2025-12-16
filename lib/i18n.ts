// lib/i18n.ts
// Safe for both server and client: no next/headers imports here.

export type Lang = "en" | "ur";

export type AdminLandingCopy = {
  title: string;
  subtitle: string;
  signInCta: string;
  bullets: string[];
};

type Copy = AdminLandingCopy;

/**
 * getCopy
 * Returns the flat copy shape used by app/page.tsx:
 * { title, subtitle, signInCta, bullets }
 *
 * If you later prefer a namespaced shape (e.g., { adminLanding: {...} }),
 * you can keep this function as a convenience alias to that sub-object.
 */
export function getCopy(lang: Lang): Copy {
  if (lang === "ur") {
    return {
      title: "RentBack Admin",
      subtitle: "چلتی ڈیمو • سادہ UI • تیز رفتار ورک فلو",
      signInCta: "سائن ان کریں",
      bullets: [
        "لائٹ / ڈارک تھیم",
        "انگلش / اردو (RTL) سوئچ",
        "ڈیمو موڈ آن",
      ],
    };
  }

  // English (default)
  return {
    title: "RentBack Admin",
    subtitle: "Live demo • Minimal UI • Fast workflows",
    signInCta: "Sign in",
    bullets: [
      "Light / Dark theme",
      "English / Urdu (RTL) toggle",
      "Demo mode enabled",
    ],
  };
}

/**
 * Optional: if some parts of the app already call getAdminLandingCopy,
 * keep this alias so both usages compile.
 */
export const getAdminLandingCopy = (lang: Lang): AdminLandingCopy => getCopy(lang);
