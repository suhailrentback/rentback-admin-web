import Link from 'next/link';
import { Brand } from '@/components/Brand';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur">
        <div className="mx-auto max-w-5xl h-14 flex items-center justify-between px-4">
          <Brand />
          <Link href="/api/health" className="text-sm underline">Health</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold">RentBack App — Baseline OK</h1>
        <p className="opacity-70 mt-2">
          If you see this, the build is green. Next step will add auth & theming.
        </p>
      </main>
    </div>
  );
}
