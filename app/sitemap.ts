import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getAllPages, getAllPosts } from "@/lib/posts";
import { getAllJournalEntries } from "@/lib/journal";
import { isoDate } from "@/lib/format";

const SITE_URL = "https://globalverticalgardening.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0];
  const entries: MetadataRoute.Sitemap = [];

  entries.push({
    url: `${SITE_URL}/`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 1.0,
  });

  for (const c of CATEGORIES) {
    entries.push({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const p of getAllPosts()) {
    entries.push({
      url: `${SITE_URL}/${p.category}/${p.slug}`,
      lastModified: p.lastUpdated || isoDate(p.date) || today,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  entries.push({
    url: `${SITE_URL}/journal`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.9,
  });

  entries.push({
    url: `${SITE_URL}/best`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.9,
  });

  entries.push({
    url: `${SITE_URL}/field-tests`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.9,
  });

  entries.push({
    url: `${SITE_URL}/authors/karlis`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.5,
  });

  for (const j of getAllJournalEntries()) {
    entries.push({
      url: `${SITE_URL}/journal/${j.slug}`,
      lastModified: j.date || today,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  for (const p of getAllPages()) {
    entries.push({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.4,
    });
  }

  return entries;
}
