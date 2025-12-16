export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 bg-white/90 dark:bg-zinc-900/90 border rounded px-3 py-2"
    >
      Skip to content
    </a>
  );
}
