import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

interface CategoryPillsProps {
  active?: string;
  counts?: Record<string, number>;
}

export function CategoryPills({ active, counts }: CategoryPillsProps) {
  return (
    <nav aria-label="Categories" className="-mx-4 sm:mx-0">
      <ul
        className="flex gap-2 overflow-x-auto px-4 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <li>
          <Link
            href="/"
            className={pillClass(active === undefined)}
            aria-current={active === undefined ? "page" : undefined}
          >
            All
          </Link>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${c.slug}`}
              className={pillClass(active === c.slug)}
              aria-current={active === c.slug ? "page" : undefined}
            >
              {c.label}
              {counts?.[c.slug] !== undefined && (
                <span className="ml-1.5 text-fg-muted/70 text-[11px]">
                  {counts[c.slug]}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function pillClass(isActive: boolean): string {
  const base =
    "inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors";
  return isActive
    ? `${base} border-primary bg-primary text-primary-fg`
    : `${base} border-border bg-surface text-fg hover:border-primary hover:text-primary`;
}
