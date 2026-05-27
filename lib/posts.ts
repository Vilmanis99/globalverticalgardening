import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ContentKind = "post" | "page";

export interface FaqItem {
  q: string;
  a: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface ContentMeta {
  title: string;
  slug: string;
  date: string; // YYYY-MM-DD HH:MM:SS
  lastUpdated?: string; // YYYY-MM-DD
  category: string;
  excerpt: string;
  wordCount: number;
  readingMinutes: number;
  kind: ContentKind;
  heroImage?: string;
  faq?: FaqItem[];
  howto?: HowToStep[];
  /**
   * True if this post is a "Field Test" — an article documenting a product
   * Karlis bought + tested himself. Surfaces a FIELD TEST badge and lists the
   * post on /field-tests.
   */
  fieldTest?: boolean;
  /**
   * True if this post is still being written / details pending. Drafts are
   * excluded from public discovery (sitemap, homepage, category pages,
   * /field-tests, RSS, /best) but remain accessible at their direct URL for
   * preview. A "Work in progress" banner is shown on the page itself, plus
   * `<meta name="robots" content="noindex">` so search engines don't index it.
   */
  draft?: boolean;
}

export interface Content extends ContentMeta {
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const PAGES_DIR = path.join(CONTENT_DIR, "pages");

const READING_WPM = 220;

const HERO_IMG_RE = /!\[[^\]]*\]\(([^\s)]+)/;

function readDir(dir: string, kind: ContentKind): Content[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const hero = HERO_IMG_RE.exec(content)?.[1];
      const wordCount =
        typeof data.wordCount === "number"
          ? data.wordCount
          : content.split(/\s+/).filter(Boolean).length;
      const lastUpdatedRaw = data.lastUpdated ?? data.lastupdated;
      return {
        title: String(data.title ?? ""),
        slug: String(data.slug ?? file.replace(/\.mdx$/, "")),
        date: String(data.date ?? ""),
        lastUpdated: lastUpdatedRaw ? String(lastUpdatedRaw) : undefined,
        category: String(data.category ?? "gardening"),
        excerpt: String(data.excerpt ?? ""),
        wordCount,
        readingMinutes: Math.max(1, Math.round(wordCount / READING_WPM)),
        kind,
        heroImage: hero,
        faq: Array.isArray(data.faq) ? (data.faq as FaqItem[]) : undefined,
        howto: Array.isArray(data.howto) ? (data.howto as HowToStep[]) : undefined,
        fieldTest: data.fieldTest === true,
        draft: data.draft === true,
        body: content,
      };
    });
}

let _posts: Content[] | null = null;
let _pages: Content[] | null = null;

/**
 * Returns all posts, EXCLUDING drafts.
 * Use this for listings (homepage, category pages, sitemap, RSS, /field-tests, etc.)
 */
export function getAllPosts(): Content[] {
  if (_posts) {
    return _posts.filter((p) => !p.draft);
  }
  _posts = readDir(POSTS_DIR, "post").sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return _posts.filter((p) => !p.draft);
}

/** Returns ALL posts including drafts — used only for the direct URL route. */
export function getAllPostsIncludingDrafts(): Content[] {
  if (!_posts) {
    _posts = readDir(POSTS_DIR, "post").sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }
  return _posts;
}

export function getAllPages(): Content[] {
  if (_pages) return _pages;
  _pages = readDir(PAGES_DIR, "page").sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  return _pages;
}

/** Looks up a post by slug. Returns drafts too — the route shows them with a banner + noindex. */
export function getPost(slug: string): Content | undefined {
  return getAllPostsIncludingDrafts().find((p) => p.slug === slug);
}

export function getPage(slug: string): Content | undefined {
  return getAllPages().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): Content[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getFieldTestPosts(): Content[] {
  return getAllPosts().filter((p) => p.fieldTest === true);
}

export function getRelatedPosts(post: Content, limit = 3): Content[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, limit);
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of getAllPosts()) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  return counts;
}
