"use client";

import { useEffect, useState, useTransition } from "react";

type Theme = "light" | "dark";

export default function FloatingThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isPending, startTransition] = useTransition();

  // Detect initial theme from document or OS preference
  useEffect(() => {
    const html = document.documentElement;
    const hasDarkClass = html.classList.contains("dark");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setTheme(hasDarkClass || prefersDark ? "dark" : "light");
  }, []);

  function applyTheme(next: Theme) {
    const html = document.documentElement;
    if (next === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    html.setAttribute("data-theme", next); // harmless if unused
  }

  async function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);

    // Persist preference (cookie via /api/prefs). Safe to ignore failure.
    try {
      await fetch("/api/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
    } catch {}

    // Refresh so any server components re-read cookies
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
