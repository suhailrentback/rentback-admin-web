import Brand from '@/components/Brand';

export default function AdminHome() {
  return (
    <section className="py-12">
      <div className="flex items-center gap-3">
        <Brand />
        <h1 className="text-3xl font-extrabold">Admin Console</h1>
      </div>
      <p className="mt-4 opacity-80">
        Minimal admin shell is live. We’ll add protected routes, role checks, and SBP tooling next.
      </p>
    </section>
  );
}
