import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p
            className="text-lg font-medium tracking-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Vertical Gardening
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            Notes from a working garden · Since 2019
          </p>
          <p className="mt-4 text-sm text-fg-muted leading-relaxed max-w-xs">
            What began as a single tray of microgreens on a windowsill in 2019
            is now a small countryside garden. Practical notes, honest reviews,
            and what we&apos;d skip.
          </p>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-fg-muted font-medium">
            Categories
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-fg-muted font-medium">
            Site
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/best" className="hover:text-primary transition-colors">
                Start here
              </Link>
            </li>
            <li>
              <Link href="/journal" className="hover:text-primary transition-colors">
                Journal
              </Link>
            </li>
            <li>
              <Link href="/field-tests" className="hover:text-primary transition-colors">
                Field tests
              </Link>
            </li>
            <li>
              <Link href="/about-me" className="hover:text-primary transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="hover:text-primary transition-colors">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 text-xs text-fg-muted flex flex-col md:flex-row gap-2 justify-between">
          <p>© {year} Vertical Gardening. All rights reserved.</p>
          <p>Written from Latvia · Since 2019</p>
        </div>
      </div>
    </footer>
  );
}
