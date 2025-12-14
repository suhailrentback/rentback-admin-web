"use client";

import { useState } from "react";

/**
 * Minimal language toggle to POST to /admin/api/lang
 * You’ll place this in Step 7.2 (topbar/settings). Safe to add now.
 */
export default function LanguageToggle({ current = "en" }: { current?: "en" | "ur" }) {
  const [lang, setLang] = useState<"en" | "ur">(current);

  return (
    <form method="POST" action="/admin/api/lang" className="flex items-center gap-2">
      <input type="hidden" name="lang" value={lang} />
      <span className="text-sm">{lang === "ur" ? "زبان" : "Language"}:</span>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-md border px-2 py-1 text-sm ${lang === "en" ? "bg-gray-100" : ""}`}
        aria-pressed={lang === "en"}
      >
        {lang === "ur" ? "انگریزی" : "English"}
      </button>
      <button
        type="submit"
        onClick={() => setLang("ur")}
        className={`rounded-md border px-2 py-1 text-sm ${lang === "ur" ? "bg-gray-100" : ""}`}
        aria-pressed={lang === "ur"}
      >
        {lang === "ur" ? "اردو" : "Urdu"}
      </button>
    </form>
  );
}
