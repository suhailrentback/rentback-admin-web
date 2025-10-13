// ADMIN: place in rentback-admin-web/components/Brand.tsx
import Link from "next/link";
import Image from "next/image";
import React from "react";

type Props = {
  href?: string;
  className?: string;
  size?: number;
};

export default function Brand({ href, className, size = 28 }: Props) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Image src="/rentback-logo.svg" alt="RentBack" width={size} height={size} priority />
      <span className="font-bold tracking-tight">RentBack</span>
    </span>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
