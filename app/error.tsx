"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side logs already captured the trace; this is for client errors.
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 md:py-28 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
        Something went wrong
      </p>
      <h1
        className="mt-4 text-4xl md:text-5xl tracking-tight leading-[1.1]"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        A page failed to load.
      </h1>
      <p className="mt-5 text-lg text-fg-muted leading-relaxed">
        Sorry about that. The site logged the issue. You can try again, or head
        back to the homepage.
      </p>

      <div className="mt-10 flex justify-center gap-3 flex-wrap">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-full bg-primary text-primary-fg px-5 py-2.5 text-sm font-medium hover:opacity-95 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg hover:border-primary hover:text-primary transition-colors"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
