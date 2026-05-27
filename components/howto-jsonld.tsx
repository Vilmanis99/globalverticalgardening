import type { HowToStep } from "@/lib/posts";

interface HowToJsonLdProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTimeIso?: string; // ISO 8601 duration e.g. PT2H
  imageUrl?: string;
}

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTimeIso,
  imageUrl,
}: HowToJsonLdProps) {
  if (!steps?.length) return null;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  };
  if (totalTimeIso) data.totalTime = totalTimeIso;
  if (imageUrl) data.image = imageUrl;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
