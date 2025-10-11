'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Brand } from '@/components/Brand';

type Mode = 'magic' | 'otp';
type Lang = 'en' | 'ur';

const copy: Record<Lang, {
  title: string; subtitle: string; email: string;
  getLink: string; or: string; tryOtp: string; otpLabel: string; verify: string;
  backToMagic: string; adminNote: string; privacy: string; toastStub: string; signIn: string;
}> = {
  en: {
    title: 'Admin Sign in',
    subtitle: 'Operations & controls — restricted access',
    email: 'Work email',
    getLink: 'Send magic link',
    or: 'or',
    tryOtp: 'Use OTP instead',
    otpLabel: '6-digit code',
    verify: 'Verify & enter Admin',
    backToMagic: 'Back to Magic Link',
    adminNote: 'Only authorized staff may sign in. Activity is logged.',
    privacy: 'By continuing you agree to internal policies.',
    toastStub: 'UI-only for now. Auth wiring is next.',
    signIn: 'Sign in',
  },
  ur: {
    title: 'ایڈمن سائن اِن',
    subtitle: 'آپریشنز اور کنٹرول — صرف مجاز رسائی',
    email: 'کاروباری ای میل',
    getLink: 'میجک لنک بھیجیں',
    or: 'یا',
    tryOtp: 'او ٹی پی استعمال کریں',
    otpLabel: '6 ہندسوں کا کوڈ',
    verify: 'تصدیق کریں اور ایڈمن میں جائیں',
    backToMagic: 'واپس میجک لنک پر',
    adminNote: 'صرف مجاز اسٹاف سائن اِن کر سکتا ہے۔ تمام سرگرمی لاگ ہوتی ہے۔',
    privacy: 'جاری رکھتے ہوئے آپ داخلی پالیسیز سے متفق ہیں۔',
    toastStub: 'فی الحال صرف UI ہے۔ اگلے مرحلے میں auth جوڑیں گے۔',
    signIn: 'سائن اِن',
  },
};

export default function AdminSignInPage() {
  return (
    <Suspense fallback={null}>
      <AdminSignInInner />
    </Suspense>
  );
}

function AdminSignInInner() {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    try {
      const l = localStorage.getItem('rb-lang');
      if (l === 'en' || l === 'ur') setLang(l);
    } catch {}
  }, []);
  const t = copy[lang];

  const sp = useSearchParams();
  const errorFromUrl = sp.get('error');

  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const dir = useMemo(() => (lang === 'ur' ? 'rtl' : 'ltr'), [lang]);

  function stub(e: React.FormEvent) {
    e.preventDefault();
    alert(t.toastStub);
  }

  return (
    <div className="min-h-[70vh] grid place-items-center" style={{ direction: dir }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brand />
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                Admin
              </span>
            </div>
            <span className="text-xs opacity-70">{t.signIn}</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold">{t.title}</h1>
          <p className="mt-1 text-sm opacity-80">{t.subtitle}</p>

          {errorFromUrl && (
            <div className="mt-4 rounded-lg border border-red-300/40 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 px-3 py-2 text-sm">
              {decodeURIComponent(errorFromUrl)}
            </div>
          )}

          <div className="mt-3 text-xs opacity-70">{t.adminNote}</div>

          {mode === 'magic' ? (
            <form onSubmit={stub} className="mt-6 space-y-4">
              <label className="block text-sm">
                <span className="block mb-1">{t.email}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="name@rentback.app"
                />
              </label>

              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {t.getLink}
              </button>

              <div className="text-center text-xs opacity-70">
                {t.or}{' '}
                <button
                  type="button"
                  onClick={() => setMode('otp')}
                  className="underline underline-offset-4 hover:opacity-100"
                >
                  {t.tryOtp}
                </button>
              </div>

              <p className="text-xs opacity-70">{t.privacy}</p>
            </form>
          ) : (
            <form onSubmit={stub} className="mt-6 space-y-4">
              <label className="block text-sm">
                <span className="block mb-1">{t.email}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="name@rentback.app"
                />
              </label>

              <label className="block text-sm">
                <span className="block mb-1">{t.otpLabel}</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 outline-none tracking-widest text-center focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="••••••"
                />
              </label>

              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {t.verify}
              </button>

              <div className="text-center text-xs">
                <button
                  type="button"
                  onClick={() => setMode('magic')}
                  className="underline underline-offset-4 hover:opacity-100 opacity-80"
                >
                  {t.backToMagic}
                </button>
              </div>

              <p className="text-xs opacity-70">{t.privacy}</p>
            </form>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end text-xs opacity-70">
          <Link href="/help" className="hover:opacity-100">
            Help
          </Link>
        </div>
      </div>
    </div>
  );
}
