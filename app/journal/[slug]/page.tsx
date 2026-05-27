import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getAllJournalEntries, getJournalEntry } from "@/lib/journal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ReadingProgress } from "@/components/reading-progress";
import { mdxComponents } from "@/components/mdx-components";
import { formatDate, isoDate } from "@/lib/format";

const SITE_URL = "https://globalverticalgardening.net";

export function generateStaticParams() {
  return getAllJournalEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getJournalEntry(slug);
  if (!entry) return {};
  const canonical = `/journal/${entry.slug}`;
  const ogImage = entry.heroImage
    ? `${SITE_URL}${entry.heroImage}`
    : `${SITE_URL}/opengraph-default.png`;
  return {
    title: entry.title,
    description: entry.excerpt,
    alternates: { canonical },
    openGraph: {
      title: entry.title,
      description: entry.excerpt,
      type: "article",
      url: `${SITE_URL}${canonical}`,
      publishedTime: isoDate(entry.date),
      images: [{ url: ogImage, width: 1200, height: 630, alt: entry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.excerpt,
      images: [ogImage],
    },
  };
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getJournalEntry(slug);
  if (!entry) notFound();

  const bodyWithoutHero = entry.heroImage
    ? entry.body.replace(/^!\[[^\]]*\]\([^)]*\)\s*/m, "")
    : entry.body;

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: entry.excerpt,
    image: entry.heroImage ? [`${SITE_URL}${entry.heroImage}`] : undefined,
    datePublished: isoDate(entry.date),
    dateModified: isoDate(entry.date),
    author: {
      "@type": "Person",
      name: "Karlis Vilmanis",
      url: `${SITE_URL}/authors/karlis`,
    },
    publisher: {
      "@type": "Organization",
      name: "Vertical Gardening",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/journal/${entry.slug}`,
    },
  };

  return (
    <article>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <Breadcrumbs
        crumbs={[
          { name: "Journal", href: "/journal" },
          { name: entry.title, href: `/journal/${entry.slug}` },
        ]}
      />

      <header className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 md:pt-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
          <time dateTime={isoDate(entry.date)}>{formatDate(entry.date)}</time>
          {entry.location && (
            <>
              {" · "}
              {entry.location}
            </>
          )}
        </p>
        <h1
          className="mt-4 text-3xl md:text-5xl tracking-tight leading-[1.1]"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {entry.title}
        </h1>
        <p className="mt-4 text-sm text-fg-muted">
          {entry.readingMinutes} min read
        </p>
      </header>

      {entry.heroImage && (
        <figure className="mx-auto max-w-4xl mt-10 md:mt-12 px-4 sm:px-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-hero bg-accent-soft/40">
            <Image
              src={entry.heroImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-cover"
            />
          </div>
        </figure>
      )}

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 md:py-16 prose prose-vg prose-lg max-w-none">
        <MDXRemote
          source={bodyWithoutHero}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug],
            },
          }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:translate-x-0.5 transition-transform"
        >
          ← All journal entries
        </Link>
      </div>
    </article>
  );
}
