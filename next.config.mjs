import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Build a slug→category map by reading frontmatter from content/posts/*.mdx.
// We do this at config-eval time so the redirect list is fully static.
function loadSlugCategoryMap() {
  const dir = path.join(__dirname, "content", "posts");
  const map = new Map();
  if (!fs.existsSync(dir)) return map;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".mdx")) continue;
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    const fm = /---\n([\s\S]*?)\n---/.exec(src);
    if (!fm) continue;
    const slug = /^slug:\s*"?([^"\n]+?)"?\s*$/m.exec(fm[1])?.[1];
    const category = /^category:\s*"?([^"\n]+?)"?\s*$/m.exec(fm[1])?.[1];
    if (slug && category) map.set(slug, category);
  }
  return map;
}

const slugCategory = loadSlugCategoryMap();

// Wildcard category-rename redirects (old Squarespace category slugs)
const CATEGORY_RENAMES = [
  { from: "indoor-gardening-blog", to: "indoor-gardening" },
  { from: "organicgardening", to: "gardening" },
];

// Old prefixes whose posts need lookup-based redirection
const OLD_PREFIXES_TO_LOOKUP = [
  "blog",
  "product-review-1",
  "posts", // our previous internal pattern
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    mdxRs: false,
  },
  async redirects() {
    const r = [];

    // Wildcard renames for category slugs
    for (const { from, to } of CATEGORY_RENAMES) {
      r.push({ source: `/${from}`, destination: `/${to}`, permanent: true });
      r.push({
        source: `/${from}/:slug`,
        destination: `/${to}/:slug`,
        permanent: true,
      });
    }

    // Per-post: old prefix → correct category from slug map
    for (const [slug, category] of slugCategory.entries()) {
      for (const prefix of OLD_PREFIXES_TO_LOOKUP) {
        r.push({
          source: `/${prefix}/${slug}`,
          destination: `/${category}/${slug}`,
          permanent: true,
        });
      }
      // Cross-category corrections — if someone hits /microgreens/<a-composting-slug>
      // we'd ideally redirect, but enumerating every wrong-category permutation is
      // overkill; the 404 page is acceptable for unmapped variants.
    }

    // Slug rename from -amp- normalization
    r.push({
      source: "/composting/best-compost-tea-brewers-reviews-amp-buying-guide",
      destination:
        "/composting/best-compost-tea-brewers-reviews-and-buying-guide",
      permanent: true,
    });

    // Old static-page slugs
    r.push({ source: "/about-1", destination: "/about-me", permanent: true });

    // /home was the Squarespace section name; we are the home now.
    r.push({ source: "/home", destination: "/", permanent: true });

    return r;
  },
};

export default nextConfig;
