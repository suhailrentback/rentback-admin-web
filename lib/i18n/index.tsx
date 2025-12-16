// lib/i18n/index.tsx
"use client";

import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getCopy, dirFor, type Lang, type Theme } from "../i18n";

type I18nContextValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  copy: ReturnType<typeof getCopy>;
  t: (s: string) => string;
  setLang: (l: Lang) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

// Accept both 'lang' and legacy 'initialLang' prop to be backward-compatible
type Props = {
  lang?: Lang;
  initialLang?: Lang; // legacy
  theme?: Theme;
  children: ReactNode;
};

export function I18nProvider({ lang, initialLang, children }: Props) {
  const [currentLang, setCurrentLang] = useState<Lang>(lang ?? initialLang ?? "en");

  const value = useMemo<I18nContextValue>(() => {
    const copy = getCopy(currentLang);
    const dir = dirFor(currentLang);
    return {
      lang: currentLang,
      dir,
      copy,
      t: (s: string) => s,
      setLang: setCurrentLang,
    };
  }, [currentLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
