import Brand from '@/components/Brand';

export default function AdminSignInPlaceholder() {
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <Brand />
        <h1 className="text-2xl font-bold">Admin sign in</h1>
      </div>
      <p className="mt-4 opacity-80">
        Placeholder. We’ll wire a separate auth instance for admin in later steps.
      </p>
    </div>
  );
}
