import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface JournalEntryMeta {
  title: string;
  slug: string;
  date: string; // YYYY-MM-DD
  location?: string;
  excerpt: string;
  heroImage?: string;
  tags?: string[];
}

export interface JournalEntry extends JournalEntryMeta {
  body: string;
  readingMinutes: number;
}

const JOURNAL_DIR = path.join(process.cwd(), "content", "journal");
const HERO_IMG_RE = /!\[[^\]]*\]\(([^\s)]+)/;
const READING_WPM = 220;

let _entries: JournalEntry[] | null = null;

export function getAllJournalEntries(): JournalEntry[] {
  if (_entries) return _entries;
  if (!fs.existsSync(JOURNAL_DIR)) {
    _entries = [];
    return _entries;
  }
  _entries = fs
    .readdirSync(JOURNAL_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(JOURNAL_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const hero = HERO_IMG_RE.exec(content)?.[1];
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      return {
        title: String(data.title ?? ""),
        slug: String(data.slug ?? file.replace(/\.mdx$/, "")),
        date: String(data.date ?? ""),
        location: data.location ? String(data.location) : undefined,
        excerpt: String(data.excerpt ?? ""),
        heroImage: hero,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
        body: content,
        readingMinutes: Math.max(1, Math.round(wordCount / READING_WPM)),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  return _entries;
}

export function getJournalEntry(slug: string): JournalEntry | undefined {
  return getAllJournalEntries().find((e) => e.slug === slug);
}
