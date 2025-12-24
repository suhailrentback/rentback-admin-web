// components/AdminShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/invoices", label: "Invoices" },
    { href: "/audit-log", label: "Audit Log" },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">RentBack Admin</h1>
        <nav className="flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={clsx(
                "px-3 py-1.5 rounded-xl border text-sm",
                pathname === t.href
                  ? "bg-black/5 dark:bg-white/10"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
