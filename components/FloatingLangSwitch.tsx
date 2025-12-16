"use client";

import { useI18n } from "@/lib/i18n/index";
import { useTransition } from "react";

export default function FloatingLangSwitch() {
  const { lang } = useI18n();
  const [isPending, startTransition] = useTransition();

  const toggle = async () => {
    const next = lang === "en" ? "ur" : "en";
    await fetch("/api/prefs", {
      method: "POST",
      body: JSON.stringify({ lang: next }),
    });
    startTransition(() => {
      window.location.reload();
    });
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-4 px-3 py-2 rounded-xl border text-sm backdrop-blur"
      aria-label="Toggle language"
    >
      {isPending ? "…" : lang.toUpperCase()}
    </button>
  );
}
