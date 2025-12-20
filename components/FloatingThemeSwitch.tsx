'use client';

import { useEffect, useState } from 'react';

export default function FloatingThemeSwitch() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize from document on mount
  useEffect(() => {
    const doc = document.documentElement;
    const isDark = doc.classList.contains('dark') || doc.dataset.theme === 'dark';
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Apply + persist whenever theme changes
  useEffect(() => {
    const doc = document.documentElement;
    if (theme === 'dark') {
      doc.classList.add('dark');
      doc.setAttribute('data-theme', 'dark');
    } else {
      doc.classList.remove('dark');
      doc.setAttribute('data-theme', 'light');
    }
    // cookie for SSR continuity
    document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed bottom-4 right-4 z-50 rounded-full border px-3 py-2 text-sm bg-white/80 dark:bg-black/40 backdrop-blur
                 hover:bg-black/5 dark:hover:bg-white/10"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
