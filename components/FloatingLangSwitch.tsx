"use client";

import { useEffect, useState, useTransition } from "react";

type Lang = "en" | "ur";

export default function FloatingLangSwitch() {
  const [lang, setLang] = useState<Lang>("en");
  const [isPending, startTransition] = useTransition();

  // Read current <html lang="..."> set by the server
  useEffect(() => {
    const current = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    setLang(current === "ur" ? "ur" : "en");
  }, []);

  async function toggleLang() {
    const next: Lang = lang === "en" ? "ur" : "en";
    setLang(next);

    // Persist preference (cookie via /api/prefs). Ignore failures safely.
    try {
      await fetch("/api/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      });
    } catch {}

    // Refresh so server components pick up the new cookie
    startTransition(() => {
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label="Toggle language"
      title="Toggle language"
      className="fixed bottom-16 right-4 z-40 rounded-xl border px-3 py-2 text-sm backdrop-blur
                 bg-white/70 border-black/10 text-black
                 dark:bg-black/30 dark:border-white/10 dark:text-white"
    >
      {isPending ? "…" : lang.toUpperCase()}
    </button>
  );
}
