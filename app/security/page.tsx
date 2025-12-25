// app/security/page.tsx
export const dynamic = "force-dynamic";

export default function SecurityPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Security & Responsible Disclosure</h1>
      <p>
        For security reports, please contact{" "}
        <a className="underline" href="mailto:security@rentback.app">security@rentback.app</a>.
      </p>
      <p className="text-sm text-gray-500">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
    </main>
  );
}
