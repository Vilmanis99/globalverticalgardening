import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { categoryLabel, getCategory } from "@/lib/categories";
import { formatDate, isoDate } from "@/lib/format";
import { mdxComponents } from "@/components/mdx-components";
import { ArticleJsonLd } from "@/components/article-jsonld";
import { ReadingProgress } from "@/components/reading-progress";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqJsonLd } from "@/components/faq-jsonld";
import { HowToJsonLd } from "@/components/howto-jsonld";

const SITE_URL = "https://globalverticalgardening.net";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.category, post: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; post: string }>;
}): Promise<Metadata> {
  const { slug, post: postSlug } = await params;
  const post = getPost(postSlug);
  if (!post || post.category !== slug) return {};
  const canonical = `/${post.category}/${post.slug}`;
  const ogImage = post.heroImage
    ? `${SITE_URL}${post.heroImage}`
    : `${SITE_URL}/opengraph-default.png`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${SITE_URL}${canonical}`,
      publishedTime: isoDate(post.date),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string; post: string }>;
}) {
  const { slug: categorySlug, post: postSlug } = await params;
  const post = getPost(postSlug);
  if (!post) notFound();
  if (post.category !== categorySlug) notFound();
  if (!getCategory(categorySlug)) notFound();

  const related = getRelatedPosts(post);

  // Strip the lead image from the body — we render it as the hero instead.
  const bodyWithoutHero = post.heroImage
    ? post.body.replace(/^!\[[^\]]*\]\([^)]*\)\s*/m, "")
    : post.body;

  return (
    <article>
      <ReadingProgress />
      <ArticleJsonLd post={post} siteUrl={SITE_URL} />
      {post.faq && <FaqJsonLd faq={post.faq} />}
      {post.howto && (
        <HowToJsonLd
          name={post.title}
          description={post.excerpt}
          steps={post.howto}
          imageUrl={post.heroImage ? `${SITE_URL}${post.heroImage}` : undefined}
        />
      )}
      <Breadcrumbs
        crumbs={[
          { name: categoryLabel(post.category), href: `/${post.category}` },
          { name: post.title, href: `/${post.category}/${post.slug}` },
        ]}
      />

      <header className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 md:pt-8 text-center">
        <div className="flex items-center justify-center gap-3">
          {post.fieldTest && (
            <Link
              href="/field-tests"
              className="inline-flex items-center text-[10px] font-medium uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-primary text-primary-fg hover:opacity-90 transition-opacity"
            >
              Field test
            </Link>
          )}
          <Link
            href={`/${post.category}`}
            className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-accent hover:text-primary transition-colors"
          >
            {categoryLabel(post.category)}
          </Link>
        </div>

        <h1
          className="mt-4 text-3xl md:text-5xl tracking-tight leading-[1.1] text-fg"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {post.title}
        </h1>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-fg-muted">
          <time dateTime={isoDate(post.date)}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>Notes from a working garden</span>
        </div>
      </header>

      {post.heroImage && (
        <figure className="mx-auto max-w-4xl mt-10 md:mt-12 px-4 sm:px-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-hero bg-accent-soft/40">
            <Image
              src={post.heroImage}
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
        <div
          aria-hidden="true"
          className="text-center mt-16 text-accent/40 tracking-[1em] text-2xl select-none"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          ✦
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-surface border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
            <p className="text-xs uppercase tracking-[0.18em] text-fg-muted font-medium">
              Keep reading
            </p>
            <h2
              className="mt-2 text-3xl md:text-4xl tracking-tight mb-8"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              More on {categoryLabel(post.category).toLowerCase()}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
