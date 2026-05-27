import { getAllPosts } from "@/lib/posts";
import { getAllJournalEntries } from "@/lib/journal";
import { isoDate } from "@/lib/format";

const SITE_URL = "https://globalverticalgardening.net";
const SITE_NAME = "Vertical Gardening";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc2822(dateStr: string): string {
  const d = new Date(isoDate(dateStr));
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export async function GET() {
  const posts = getAllPosts();
  const journal = getAllJournalEntries();

  type Entry = {
    title: string;
    url: string;
    date: string;
    excerpt: string;
    category: string;
  };

  const entries: Entry[] = [
    ...posts.map((p) => ({
      title: p.title,
      url: `${SITE_URL}/${p.category}/${p.slug}`,
      date: p.date,
      excerpt: p.excerpt,
      category: p.category,
    })),
    ...journal.map((j) => ({
      title: j.title,
      url: `${SITE_URL}/journal/${j.slug}`,
      date: j.date,
      excerpt: j.excerpt,
      category: "journal",
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50);

  const items = entries
    .map(
      (e) => `  <item>
    <title>${escapeXml(e.title)}</title>
    <link>${e.url}</link>
    <guid isPermaLink="true">${e.url}</guid>
    <pubDate>${rfc2822(e.date)}</pubDate>
    <category>${escapeXml(e.category)}</category>
    <description>${escapeXml(e.excerpt)}</description>
  </item>`,
    )
    .join("\n");

  const lastBuild = entries[0]?.date
    ? rfc2822(entries[0].date)
    : new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${SITE_URL}</link>
  <description>Notes from a working garden — microgreens, composting, indoor gardening and hydroponics, since 2019.</description>
  <language>en</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
