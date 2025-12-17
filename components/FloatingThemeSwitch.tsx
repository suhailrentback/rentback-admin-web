"use client";

import { useEffect, useState, useTransition } from "react";

type Theme = "light" | "dark";

export default function FloatingThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  async function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);

    const html = document.documentElement;
    if (next === "dark") html.classList.add("dark");
    else html.classList.remove("dark");

    try {
      await fetch("/api/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
    } catch {}

    startTransition(() => {
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="fixed bottom-4 right-4 z-40 rounded-xl border px-3 py-2 text-sm backdrop-blur
                 bg-white/70 border-black/10 text-black
                 dark:bg-black/30 dark:border-white/10 dark:text-white"
    >
      {isPending ? "…" : theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
