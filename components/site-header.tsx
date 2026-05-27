import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Vertical Gardening home"
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-fg font-semibold"
            aria-hidden="true"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            V
          </span>
          <span className="flex flex-col leading-none">
            <span
              className="text-base font-medium tracking-tight text-fg group-hover:text-primary transition-colors"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Vertical Gardening
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-fg-muted">
              Since 2019
            </span>
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="hidden items-center gap-6 text-sm md:flex">
            {CATEGORIES.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="text-fg-muted hover:text-fg transition-colors"
                >
                  {c.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/journal"
                className="text-fg hover:text-primary transition-colors font-medium"
              >
                Journal
              </Link>
            </li>
            <li>
              <Link
                href="/about-me"
                className="text-fg-muted hover:text-fg transition-colors"
              >
                About
              </Link>
            </li>
          </ul>

          {/* Mobile — single link to the busiest category */}
          <Link
            href="/microgreens"
            className="md:hidden text-sm text-fg-muted hover:text-fg"
          >
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}
