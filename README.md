# Vertical Gardening

A Next.js 15 + MDX rewrite of [globalverticalgardening.net](https://globalverticalgardening.net) — a gardening blog kept since 2019, migrated from Squarespace.

77 published articles, 6 categories, a dated journal section, and the SEO infrastructure to recover the site's pre-migration ranking signals.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** + **@tailwindcss/typography**
- **MDX** via `next-mdx-remote` (file-based content in `content/`)
- **Google Fonts**: Fraunces (display) + Inter (body)
- Deploys to **Vercel** out-of-the-box

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build — verifies all 95 static pages
```

## Project layout

```
app/
  page.tsx              homepage
  [slug]/page.tsx       category landings + static pages (about-me, disclaimer)
  [slug]/[post]/page.tsx article detail
  journal/              dated short-form notes
  authors/karlis/       author profile (E-E-A-T entity)
  sitemap.ts            dynamic /sitemap.xml
  robots.ts             /robots.txt
  rss.xml/route.ts      RSS feed
  globals.css           design tokens + prose styles
components/             header, footer, post-card, MDX components, JSON-LD generators
content/
  posts/*.mdx           77 published articles
  journal/*.mdx         dated journal entries
  pages/*.mdx           static pages (about-me, disclaimer)
lib/                    content loaders, categories, formatting, image-dimension manifest
middleware.ts           410 Gone responses for retired pages
next.config.mjs         301 redirects from old Squarespace URLs
public/
  images/<slug>/        post images (329 files, ~78 MB)
  garden/2026/05/       real photos from the actual garden
scripts/                one-shot migration utilities (Python)
```

## Content authoring

### New regular post

Drop a `.mdx` file in `content/posts/` with this frontmatter:

```yaml
---
title: "Your title"
slug: "your-title"
date: "2026-06-01 10:00:00"
category: "microgreens"     # one of: microgreens, indoor-gardening, composting, gardening, hydroponics, herbs
excerpt: "1–2 sentence summary."
wordCount: 1234              # optional, computed on load if omitted
lastUpdated: "2026-06-15"    # optional, drives schema.org dateModified
faq:                          # optional, enables FAQ schema
  - q: "Question?"
    a: "Answer text."
howto:                        # optional, enables HowTo schema
  - name: "Step name"
    text: "Step description"
---
Body in Markdown / MDX.
```

### New journal entry

Drop a `.mdx` file in `content/journal/` with this frontmatter:

```yaml
---
title: "Entry title"
slug: "2026-06-something-happened"
date: "2026-06-15"
location: "Latvia"
excerpt: "1–2 sentence hook."
tags: ["raised-beds", "harvest"]
---
Body in Markdown.
```

## SEO surface

- `BlogPosting` JSON-LD on every article
- `Organization` + `WebSite` (with `SearchAction`) JSON-LD site-wide
- `BreadcrumbList` JSON-LD on category and post pages
- `FAQPage` JSON-LD when a post has a `faq:` array
- `HowTo` JSON-LD when a post has a `howto:` array
- `Person` JSON-LD on `/authors/karlis`
- `/sitemap.xml`, `/robots.txt`, `/rss.xml`
- 301 redirects from old Squarespace URL patterns (`/blog/*`, `/indoor-gardening-blog/*`, `/organicgardening/*`, `/product-review-1/*`, `/about-1`, `/home`)
- 410 Gone for retired pages (`/zone-N-planting-calendar`, `/vegetable-planting-zones`)
- Per-post canonical, OG image, Twitter card
- Real lastModified support via `lastUpdated:` frontmatter

## Migration scripts

These were used once to bootstrap the content from a Squarespace WXR export. They're kept for re-runs:

- `scripts/extract_content.py` — WXR → MDX
- `scripts/download_images.py` — pull images from Squarespace CDN
- `scripts/normalize_content.py` — clean Squarespace-export artifacts
- `scripts/add_alt_text.py` — bulk image alt backfill
- `scripts/extract_faq.py` — populate FAQ frontmatter from FAQ-style posts

Run from repo root with Python 3.10+.

## Deployment

The site is designed for Vercel:

1. Connect this GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `npm run build` (default).
4. Output directory: `.next` (default).
5. Add the custom domain `globalverticalgardening.net` once it's re-acquired.
6. Submit `https://globalverticalgardening.net/sitemap.xml` to Google Search Console.

No environment variables are required.

## License

Content (text + images): all rights reserved.
Source code: MIT — feel free to use the migration patterns for your own Squarespace-to-Next.js move.
