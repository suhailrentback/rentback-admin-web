"use client";

import { useTransition } from "react";

/** Small fixed button to toggle light/dark via /api/prefs */
export default function FloatingThemeSwitch() {
  const [isPending, start] = useTransition();

  const toggle = async () => {
    // Toggle current <html class="dark"> locally first for instant feedback
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");

    // Persist server-side so first paint is correct after navigation
    await fetch("/api/prefs", {
      method: "POST",
      body: JSON.stringify({ theme: next }),
      headers: { "Content-Type": "application/json" },
    }).catch(() => { /* no-op */ });

    start(() => {
      // Hard reload to let server render the correct class on <html>
      window.location.reload();
    });
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-16 px-3 py-2 rounded-xl border text-sm backdrop-blur bg-white/70 dark:bg-black/30"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isPending ? "…" : "Theme"}
    </button>
  );
}
