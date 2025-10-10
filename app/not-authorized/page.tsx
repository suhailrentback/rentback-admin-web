// app/not-authorized/page.tsx
import Link from 'next/link';

export default function NotAuthorized() {
  return (
    <div className="min-h-screen grid place-items-center bg-white text-slate-900">
      <div className="max-w-md text-center space-y-4 p-6">
        <h1 className="text-2xl font-bold">Not authorized</h1>
        <p className="opacity-80">
          Your account doesn’t have access to the Admin console. If you believe this is an error,
          ask an ADMIN to grant your role.
        </p>
        <div className="flex justify-center gap-3">
          <Link className="px-4 py-2 rounded border" href="/sign-in">Sign in</Link>
          <Link className="px-4 py-2 rounded bg-emerald-600 text-white" href="/">Go home</Link>
        </div>
      </div>
    </div>
  );
}
