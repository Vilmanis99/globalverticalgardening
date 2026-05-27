import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 md:py-28 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
        404 · Not found
      </p>
      <h1
        className="mt-4 text-4xl md:text-5xl tracking-tight leading-[1.1]"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        This path didn&apos;t grow.
      </h1>
      <p className="mt-5 text-lg text-fg-muted leading-relaxed">
        The page you&apos;re looking for has moved, been retired, or never
        existed. Try one of the categories below, or head back home.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-fg hover:border-primary hover:text-primary transition-colors"
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:translate-x-0.5 transition-transform"
        >
          ← Back to Vertical Gardening
        </Link>
      </div>
    </div>
  );
}
