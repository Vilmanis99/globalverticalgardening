import type { FaqItem } from "@/lib/posts";

interface FaqJsonLdProps {
  faq: FaqItem[];
}

export function FaqJsonLd({ faq }: FaqJsonLdProps) {
  if (!faq?.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
