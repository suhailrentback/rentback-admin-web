// components/FloatingThemeSwitch.tsx
'use client';

import { useEffect, useState } from 'react';

export default function FloatingThemeSwitch() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Infer initial theme from <html> attributes/classes
    const html = document.documentElement;
    const attr = (html.getAttribute('data-theme') as 'light' | 'dark') || undefined;
    const isDarkClass = html.classList.contains('dark');
    const inferred: 'light' | 'dark' = attr ?? (isDarkClass ? 'dark' : 'light');
    setTheme(inferred);
  }, []);

  function applyTheme(next: 'light' | 'dark') {
    const html = document.documentElement;
    // keep both data-theme and class in sync
    html.setAttribute('data-theme', next);
    html.classList.toggle('dark', next === 'dark');
    // simple cookie (1 year)
    document.cookie = `theme=${next}; Max-Age=31536000; Path=/; SameSite=Lax`;
  }

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-40 rounded-2xl px-3 py-2 text-sm font-medium shadow-md border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur hover:bg-white dark:hover:bg-zinc-900"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
