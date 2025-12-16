"use client";

import { useTransition } from "react";

export default function FloatingThemeSwitch() {
  const [isPending, start] = useTransition();

  const toggle = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    await fetch("/api/prefs", {
      method: "POST",
      body: JSON.stringify({ theme: next }),
    });
    start(() => {
      // reload so the server applies <html class="dark"> on first paint
      window.location.reload();
    });
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-16 px-3 py-2 rounded-xl border text-sm backdrop-blur"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isPending ? "…" : "Theme"}
    </button>
  );
}
