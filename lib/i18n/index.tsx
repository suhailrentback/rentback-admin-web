"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Lang, Theme } from "../i18n";
import { getCopy, dirFor } from "../i18n";

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  theme?: Theme;
  copy: ReturnType<typeof getCopy>;
  t: (path: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  lang,
  theme,
  children,
}: {
  lang: Lang;
  theme?: Theme;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const copy = getCopy(lang);
    const t = (path: string) => {
      const parts = path.split(".");
      let cur: any = copy;
      for (const p of parts) cur = cur?.[p];
      return typeof cur === "string" ? cur : "";
    };
    return { lang, dir: dirFor(lang), theme, copy, t };
  }, [lang, theme]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
