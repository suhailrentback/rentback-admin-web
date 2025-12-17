"use client";

import { useTransition } from "react";

export default function FloatingThemeSwitch() {
  const [isPending, startTransition] = useTransition();

  async function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const next = isDark ? "light" : "dark";

    // Flip class instantly for snappy UX
    root.classList.toggle("dark", next === "dark");

    // Persist preference (server will set cookie)
    try {
      await fetch("/api/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
    } catch {
      // no-op if offline
    }

    // Make sure components that read cookies on the server re-render
    startTransition(() => {
      // safe: only refresh the page content
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
      {isPending ? "…" : "Theme"}
    </button>
  );
}
