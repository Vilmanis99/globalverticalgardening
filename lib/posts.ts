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
        body: content,
      };
    });
}

let _posts: Content[] | null = null;
let _pages: Content[] | null = null;

export function getAllPosts(): Content[] {
  if (_posts) return _posts;
  _posts = readDir(POSTS_DIR, "post").sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return _posts;
}

export function getAllPages(): Content[] {
  if (_pages) return _pages;
  _pages = readDir(PAGES_DIR, "page").sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  return _pages;
}

export function getPost(slug: string): Content | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPage(slug: string): Content | undefined {
  return getAllPages().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): Content[] {
  return getAllPosts().filter((p) => p.category === category);
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
