import Link from "next/link";

const SITE_URL = "https://globalverticalgardening.net";

export interface Crumb {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      ...crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: c.name,
        item: `${SITE_URL}${c.href}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 md:pt-10 text-xs text-fg-muted"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-fg-muted/50">
                  /
                </span>
                {isLast ? (
                  <span className="text-fg-muted/80" aria-current="page">
                    {c.name}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="hover:text-primary transition-colors"
                  >
                    {c.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
