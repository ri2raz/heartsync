import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id="hs-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--peach)" />
          <stop offset="0.5" stopColor="var(--rose)" />
          <stop offset="1" stopColor="var(--lilac)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#hs-g)" />
      <path
        d="M16 23.5s-6.5-3.9-6.5-8.6A3.6 3.6 0 0 1 16 12.6a3.6 3.6 0 0 1 6.5 2.3c0 4.7-6.5 8.6-6.5 8.6Z"
        fill="#fff"
      />
      <path d="M6.5 16h3.2l1.3-2.2 1.6 4.2 1.2-2h2" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${APP_NAME} home`}>
      <LogoMark />
      <span className="font-serif text-2xl leading-none tracking-tight">{APP_NAME}</span>
    </Link>
  );
}
