import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostCard } from "@/components/post-card";
import { getFieldTestPosts } from "@/lib/posts";

const SITE_URL = "https://globalverticalgardening.net";

export const metadata: Metadata = {
  title: "Field Tests",
  description:
    "Products I bought, tested, and either kept using or wouldn't buy again. Honest reviews from a real garden in Latvia — with photos and dates.",
  alternates: { canonical: "/field-tests" },
};

export default function FieldTestsIndex() {
  const tests = getFieldTestPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Breadcrumbs crumbs={[{ name: "Field tests", href: "/field-tests" }]} />

      <header className="pt-6 pb-10 md:pt-8 md:pb-14 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
          Tested in a real garden
        </p>
        <h1
          className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1.05]"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          Field tests — products I actually bought and tried.
        </h1>
        <p className="mt-4 text-lg text-fg-muted leading-relaxed">
          Every article here is a product I paid for with my own money,
          applied to a real problem in my garden, and watched for long enough
          to have a verdict. Some worked. Some didn&apos;t. I tell you which.
        </p>
        <p className="mt-3 text-sm text-fg-muted">
          {tests.length} test{tests.length === 1 ? "" : "s"} on file.
        </p>
      </header>

      <section className="pb-20">
        {tests.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <p className="text-fg-muted">
            No field tests published yet. Check back soon — the first one is
            queued for May 2026.
          </p>
        )}
      </section>

      <section className="my-12 md:my-16">
        <div className="rounded-hero border border-border bg-surface p-6 md:p-10">
          <h2
            className="text-2xl md:text-3xl tracking-tight max-w-xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            How I write these
          </h2>
          <div className="mt-3 text-fg-muted max-w-2xl space-y-3">
            <p>
              Every field test follows the same structure: <em>the problem
              I had</em>, <em>what I bought</em>, <em>how I used it</em>,{" "}
              <em>what actually happened</em>, and{" "}
              <em>whether I&apos;d buy it again</em>. Photos of the actual
              thing, not stock images.
            </p>
            <p>
              When the exact product I used isn&apos;t available outside
              Latvia, I include the closest Amazon equivalent — and I label
              it clearly as <em>not tested by me</em>, with the same active
              ingredient or mechanism. If you&apos;re here from outside Latvia,
              that section is for you. If you&apos;re local, the original
              product is what I&apos;d recommend.
            </p>
            <p>
              Some links on these pages are affiliate links. Buying through
              them helps support the site at no extra cost to you. They never
              influence the verdict.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Build-time guarantee that this route exists.
export const dynamic = "force-static";

// Suppress unused warning if SITE_URL is referenced elsewhere in future
void SITE_URL;
