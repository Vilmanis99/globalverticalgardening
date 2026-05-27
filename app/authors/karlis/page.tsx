import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllPosts } from "@/lib/posts";
import { getAllJournalEntries } from "@/lib/journal";

const SITE_URL = "https://globalverticalgardening.net";
const AUTHOR_NAME = "Karlis Vilmanis";

export const metadata: Metadata = {
  title: `${AUTHOR_NAME} — author`,
  description:
    "Karlis Vilmanis writes Vertical Gardening — a notebook of practical, tested gardening notes kept since 2019. Lives in the Latvian countryside.",
  alternates: { canonical: "/authors/karlis" },
};

export default function AuthorKarlisPage() {
  const posts = getAllPosts();
  const journal = getAllJournalEntries();
  const totalArticles = posts.length;
  const firstYear = 2019;
  const yearsActive = new Date().getFullYear() - firstYear;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/authors/karlis#person`,
    name: AUTHOR_NAME,
    url: `${SITE_URL}/authors/karlis`,
    description:
      "Home gardener and microgreens grower. Writing Vertical Gardening since 2019 — first from a Riga apartment, now from a small countryside garden in Latvia.",
    image: `${SITE_URL}/garden/2026/05/2026-04-03_153119.jpg`,
    jobTitle: "Independent garden writer",
    address: {
      "@type": "PostalAddress",
      addressCountry: "LV",
    },
    knowsAbout: [
      "Microgreens",
      "Indoor gardening",
      "Composting",
      "Hydroponics",
      "Vertical gardening",
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />

      <Breadcrumbs crumbs={[{ name: AUTHOR_NAME, href: "/authors/karlis" }]} />

      <header className="pt-6 pb-10 md:pt-8 md:pb-12">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
          Author · Latvia
        </p>
        <h1
          className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1.05]"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {AUTHOR_NAME}
        </h1>
        <p className="mt-4 text-lg text-fg-muted leading-relaxed max-w-2xl">
          I write Vertical Gardening — a notebook of practical, tested
          gardening notes that I&apos;ve kept since {firstYear}. {totalArticles}{" "}
          articles and counting.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 mb-12">
        <Stat label="Writing since" value={String(firstYear)} />
        <Stat
          label="Years active"
          value={`${yearsActive}+`}
          sub="(and counting)"
        />
        <Stat
          label="Published articles"
          value={String(totalArticles)}
        />
      </div>

      <section className="prose prose-vg prose-lg max-w-none">
        <h2>What I write about</h2>
        <p>
          The site is organised into six topic areas: microgreens (the most
          covered, since that&apos;s where I started), indoor gardening,
          composting, hydroponics, broader gardening, and herbs. The newest
          additions are short, dated entries in the{" "}
          <Link href="/journal">journal</Link>, which I started in 2026 when I
          moved out of the city.
        </p>

        <h2>Where I write from</h2>
        <p>
          I live in Latvia, in the Baltic countryside. Most of what I write is
          climate-neutral — microgreens, composting, indoor gardening — and
          applies wherever you are. The journal entries are specific to where I
          actually grow things, which means a USDA zone 5b–6a climate (similar
          to parts of New England, Scandinavia, and northern Scotland) with cold
          winters, late frosts, and short shoulder seasons.
        </p>

        <h2>How I work</h2>
        <p>
          I write what I&apos;ve actually done, including the failures. Product
          reviews include what I&apos;d skip. Affiliate links exist on some
          reviews — they support the site, and where you see one I genuinely
          use or have used the product. I will not recommend something I
          haven&apos;t tried.
        </p>

        <h2>Most-read articles</h2>
        <ul>
          {posts.slice(0, 5).map((p) => (
            <li key={p.slug}>
              <Link href={`/${p.category}/${p.slug}`}>{p.title}</Link>
            </li>
          ))}
        </ul>

        {journal.length > 0 && (
          <>
            <h2>Latest journal entry</h2>
            <ul>
              {journal.slice(0, 3).map((j) => (
                <li key={j.slug}>
                  <Link href={`/journal/${j.slug}`}>{j.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">
        {label}
      </p>
      <p
        className="mt-2 text-3xl tracking-tight"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-fg-muted">{sub}</p>}
    </div>
  );
}
