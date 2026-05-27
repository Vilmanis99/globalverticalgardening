import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllJournalEntries } from "@/lib/journal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatDate, isoDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Garden journal",
  description:
    "Dated short-form notes from the garden — what's growing, what failed, what I'd do differently next year.",
  alternates: { canonical: "/journal" },
};

export default function JournalIndex() {
  const entries = getAllJournalEntries();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <Breadcrumbs crumbs={[{ name: "Journal", href: "/journal" }]} />

      <header className="pt-6 pb-10 md:pt-8 md:pb-14">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
          Garden journal
        </p>
        <h1
          className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1.05]"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          What&apos;s actually happening in the garden.
        </h1>
        <p className="mt-4 text-lg text-fg-muted leading-relaxed max-w-2xl">
          Short, dated notes from the real garden — beds going in, things going
          wrong, things going right. Written as it happens, not curated for
          search engines.
        </p>
      </header>

      <ol className="space-y-12 pb-20">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link href={`/journal/${e.slug}`} className="group block">
              {e.heroImage && (
                <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-border bg-accent-soft/30 mb-5">
                  <Image
                    src={e.heroImage}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 720px, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <p className="text-xs uppercase tracking-[0.18em] text-fg-muted">
                <time dateTime={isoDate(e.date)}>{formatDate(e.date)}</time>
                {e.location && (
                  <>
                    {" · "}
                    {e.location}
                  </>
                )}
              </p>
              <h2
                className="mt-2 text-2xl md:text-3xl tracking-tight leading-[1.15] group-hover:text-primary transition-colors"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {e.title}
              </h2>
              {e.excerpt && (
                <p className="mt-3 text-fg-muted leading-relaxed">{e.excerpt}</p>
              )}
            </Link>
          </li>
        ))}

        {entries.length === 0 && (
          <li className="text-fg-muted">
            No journal entries yet — first entries land in May 2026.
          </li>
        )}
      </ol>
    </div>
  );
}
