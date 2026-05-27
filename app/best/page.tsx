import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";
import { CATEGORIES } from "@/lib/categories";

const SITE_URL = "https://globalverticalgardening.net";

export const metadata: Metadata = {
  title: "Best of Vertical Gardening",
  description:
    "A hand-picked guide to the most useful articles on the site, organised by topic. Start here if you're new.",
  alternates: { canonical: "/best" },
};

// Curated picks per category. Slugs reference real posts. Edit these as the
// archive evolves — top-traffic data from Search Console will inform changes.
const PICKS: Record<string, string[]> = {
  microgreens: [
    "microgreens-what-you-need-to-know",
    "how-much-microgreens-to-eat-per-day",
    "ph-water-for-microgreens",
    "best-lighting-for-microgreens",
    "common-microgreen-farming-problems-and-solutions",
    "best-growing-mediums-for-microgreens",
  ],
  "indoor-gardening": [
    "indoor-gardening-tips-and-tricks",
    "top-6-indoor-plants-that-are-hard-to-kill",
    "best-rooting-hormone-2023",
    "what-is-the-best-soil-test-kit",
  ],
  composting: [
    "composting-for-beginners",
    "what-is-composting",
    "best-compost-spreaders",
    "best-compost-tea-brewers-reviews-and-buying-guide",
  ],
  hydroponics: [
    "11-reasons-why-you-should-be-gardening-using-hydroponics",
    "garden-tower-2-assembly-instructions",
  ],
  gardening: [
    "best-gardening-pruning-shears",
    "buyers-guide-top-5-best-greenhouses",
  ],
  herbs: ["top-indoor-herb-gardening-kits-2019-review"],
};

export default function BestPage() {
  const posts = getAllPosts();
  const slugToPost = new Map(posts.map((p) => [p.slug, p]));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best of Vertical Gardening",
    itemListElement: Object.values(PICKS)
      .flat()
      .map((slug, i) => {
        const p = slugToPost.get(slug);
        if (!p) return null;
        return {
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/${p.category}/${p.slug}`,
          name: p.title,
        };
      })
      .filter(Boolean),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Breadcrumbs crumbs={[{ name: "Best of", href: "/best" }]} />

      <header className="pt-6 pb-10 md:pt-8 md:pb-14 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
          Curated · Start here
        </p>
        <h1
          className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1.05]"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          The best of Vertical Gardening, by topic.
        </h1>
        <p className="mt-4 text-lg text-fg-muted leading-relaxed">
          A hand-picked path through six years of articles, sorted by what
          you&apos;re trying to grow. Six categories, the most useful piece in
          each. If you&apos;re here for the first time, this is the page to
          start on.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const slugs = PICKS[cat.slug] ?? [];
        const picks = slugs
          .map((s) => slugToPost.get(s))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));
        if (picks.length === 0) return null;
        return (
          <section key={cat.slug} className="pb-14">
            <div className="flex items-baseline justify-between mb-6">
              <h2
                className="text-2xl md:text-3xl tracking-tight"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                <Link
                  href={`/${cat.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {cat.label}
                </Link>
              </h2>
              <Link
                href={`/${cat.slug}`}
                className="text-sm text-fg-muted hover:text-primary transition-colors"
              >
                All {cat.label.toLowerCase()} articles →
              </Link>
            </div>
            <p className="mb-6 max-w-2xl text-fg-muted">{cat.blurb}</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="my-12 md:my-16">
        <div className="rounded-hero border border-border bg-surface p-6 md:p-10">
          <h2
            className="text-2xl md:text-3xl tracking-tight max-w-xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Looking for something specific?
          </h2>
          <p className="mt-3 text-fg-muted max-w-2xl">
            The full archive lives under the six category pages, or you can
            follow the dated{" "}
            <Link href="/journal" className="text-primary underline">
              journal
            </Link>{" "}
            for what&apos;s happening in the garden right now.
          </p>
        </div>
      </section>
    </div>
  );
}
