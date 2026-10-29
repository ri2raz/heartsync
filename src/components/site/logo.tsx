import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id="mm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--peach, #ffb48c)" />
          <stop offset="50%" stopColor="var(--rose, #e2405f)" />
          <stop offset="100%" stopColor="var(--lilac, #b7a2ff)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#mm-g)" />
      {/* Continuous Infinity Empathy Knot - Base Path */}
      <path
        d="M16 16C13.8 13.0 11.5 11.2 8.8 11.2C5.8 11.2 4.4 13.3 4.4 16C4.4 18.7 5.8 20.8 8.8 20.8C11.5 20.8 13.8 19.0 16 16C18.2 13.0 20.5 11.2 23.2 11.2C26.2 11.2 27.6 13.3 27.6 16C27.6 18.7 26.2 20.8 23.2 20.8C20.5 20.8 18.2 19.0 16 16Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Over-strand knot weave at intersection with background mask */}
      <path
        d="M13.8 13.0C14.7 14.2 15.4 15.1 16 16C16.6 16.9 17.3 17.8 18.2 19.0"
        fill="none"
        stroke="url(#mm-g)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M13.8 13.0C14.7 14.2 15.4 15.1 16 16C16.6 16.9 17.3 17.8 18.2 19.0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      {/* Two peer empathy nodes (Seeker and Mitr connected in trust) */}
      <circle cx="9.2" cy="16" r="1.3" fill="#ffffff" />
      <circle cx="22.8" cy="16" r="1.3" fill="#ffffff" />
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
