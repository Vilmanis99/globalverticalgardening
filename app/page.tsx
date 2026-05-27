import Image from "next/image";
import Link from "next/link";
import { getAllPosts, getCategoryCounts } from "@/lib/posts";
import { getAllJournalEntries } from "@/lib/journal";
import { PostCard } from "@/components/post-card";
import { CategoryPills } from "@/components/category-pills";
import { formatDate, isoDate } from "@/lib/format";

export default function HomePage() {
  const posts = getAllPosts();
  const counts = getCategoryCounts();
  const journal = getAllJournalEntries();
  const latestJournal = journal[0];
  const [hero, ...rest] = posts;
  const recent = rest.slice(0, 11);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pt-12 pb-8 md:pt-20 md:pb-12 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
          Notes from a working garden · Since 2019
        </p>
        <h1
          className="mt-4 text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-fg"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          From an apartment microgreen tray to a{" "}
          <span className="text-primary">small countryside garden.</span>
        </h1>
        <p className="mt-6 text-lg text-fg-muted leading-relaxed max-w-2xl">
          Six years of hands-on notes on microgreens, composting, indoor
          gardening and hydroponics — honest reviews, what to skip, and what
          actually grew.
        </p>
      </section>

      <section className="pb-6">
        <CategoryPills counts={counts} />
      </section>

      {hero && (
        <section className="py-6">
          <h2 className="sr-only">Featured article</h2>
          <PostCard post={hero} size="feature" priority />
        </section>
      )}

      {latestJournal && (
        <section className="my-12 md:my-16">
          <Link
            href={`/journal/${latestJournal.slug}`}
            className="group block overflow-hidden rounded-hero border border-border bg-surface card-lift no-underline"
          >
            <div className="grid md:grid-cols-[3fr_2fr]">
              {latestJournal.heroImage && (
                <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] overflow-hidden bg-accent-soft/30">
                  <Image
                    src={latestJournal.heroImage}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
                  From the journal ·{" "}
                  <time dateTime={isoDate(latestJournal.date)}>
                    {formatDate(latestJournal.date)}
                  </time>
                </p>
                <h2
                  className="mt-3 text-2xl md:text-3xl tracking-tight leading-[1.15] group-hover:text-primary transition-colors"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {latestJournal.title}
                </h2>
                <p className="mt-3 text-fg-muted leading-relaxed">
                  {latestJournal.excerpt}
                </p>
                <span className="mt-5 text-sm font-medium text-primary">
                  Read the entry →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2
            className="text-2xl tracking-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Recent articles
          </h2>
          <p className="text-sm text-fg-muted">{posts.length} in total</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="my-12 md:my-16">
        <div className="rounded-hero border border-border bg-surface p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
            About this site
          </p>
          <h2
            className="mt-3 text-2xl md:text-3xl tracking-tight max-w-xl leading-[1.15]"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Real gardening, written honestly.
          </h2>
          <p className="mt-4 max-w-2xl text-fg-muted leading-relaxed">
            This started in 2019 as a blog about apartment-friendly indoor
            growing — single trays of microgreens, vertical setups, hydroponic
            kits. Today it&apos;s written from a small countryside garden, where
            most of these techniques get tested in real conditions. Reviews
            include what we&apos;d skip. Photos are real where we can make them
            real.
          </p>
        </div>
      </section>
    </div>
  );
}
