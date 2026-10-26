"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-rose/10 p-4 text-rose">
        <AlertCircle className="size-10" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-muted text-sm sm:text-base">
        We encountered a temporary issue while loading this page. This often happens if database services or environment variables are still initializing.
      </p>

      {error?.digest && (
        <p className="mt-2 text-xs font-mono text-muted/80">
          Error Digest: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
        >
          <RefreshCw className="size-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-2"
        >
          <Home className="size-4" /> Go to home
        </Link>
      </div>
    </div>
  );
}
