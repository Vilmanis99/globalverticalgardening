import type { Content } from "@/lib/posts";
import { isoDate } from "@/lib/format";

interface ArticleJsonLdProps {
  post: Content;
  siteUrl: string;
}

export function ArticleJsonLd({ post, siteUrl }: ArticleJsonLdProps) {
  const url = `${siteUrl}/${post.category}/${post.slug}`;
  const image = post.heroImage
    ? `${siteUrl}${post.heroImage}`
    : `${siteUrl}/opengraph-default.png`;

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [image],
    datePublished: isoDate(post.date),
    dateModified: post.lastUpdated || isoDate(post.date),
    author: {
      "@type": "Person",
      name: "Karlis Vilmanis",
      url: `${siteUrl}/authors/karlis`,
    },
    publisher: {
      "@type": "Organization",
      name: "Vertical Gardening",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    wordCount: post.wordCount,
    articleSection: post.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
