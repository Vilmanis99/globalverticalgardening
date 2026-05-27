import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { CATEGORIES, getCategory } from "@/lib/categories";
import {
  getAllPages,
  getCategoryCounts,
  getPage,
  getPostsByCategory,
} from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { CategoryPills } from "@/components/category-pills";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { mdxComponents } from "@/components/mdx-components";

const STATIC_BLOCKED = new Set(["zone"]); // reserved root-level paths

export function generateStaticParams() {
  const params = CATEGORIES.map((c) => ({ slug: c.slug }));
  for (const p of getAllPages()) {
    params.push({ slug: p.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (cat) {
    return {
      title: cat.label,
      description: cat.blurb,
      alternates: { canonical: `/${cat.slug}` },
    };
  }
  const page = getPage(slug);
  if (page) {
    return {
      title: page.title,
      description: page.excerpt,
      alternates: { canonical: `/${page.slug}` },
    };
  }
  return {};
}

export default async function CategoryOrPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (STATIC_BLOCKED.has(slug)) notFound();

  const category = getCategory(slug);
  if (category) {
    const posts = getPostsByCategory(category.slug);
    const counts = getCategoryCounts();
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumbs
          crumbs={[{ name: category.label, href: `/${category.slug}` }]}
        />
        <header className="pt-6 pb-8 md:pt-8 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
            Category
          </p>
          <h1
            className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1.05]"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {category.label}
          </h1>
          <p className="mt-4 text-lg text-fg-muted leading-relaxed">
            {category.blurb}
          </p>
          <p className="mt-3 text-sm text-fg-muted">
            {posts.length} article{posts.length === 1 ? "" : "s"}
          </p>
        </header>

        <section className="pb-6">
          <CategoryPills active={category.slug} counts={counts} />
        </section>

        <section className="py-8 pb-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  const page = getPage(slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 pb-12 md:pb-16">
      <Breadcrumbs crumbs={[{ name: page.title, href: `/${page.slug}` }]} />
      <header className="mt-6 mb-10 text-center">
        <h1
          className="text-3xl md:text-5xl tracking-tight leading-[1.1]"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {page.title}
        </h1>
      </header>
      <div className="prose prose-vg prose-lg max-w-none">
        <MDXRemote
          source={page.body}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug],
            },
          }}
        />
      </div>
    </article>
  );
}
