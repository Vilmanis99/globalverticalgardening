interface YouTubeEmbedProps {
  /** YouTube video ID (the part after v= in the URL) — e.g. "dQw4w9WgXcQ" */
  id: string;
  /** Title for accessibility + schema */
  title: string;
  /** Optional caption shown below the video */
  caption?: string;
  /**
   * When true, emits VideoObject JSON-LD with the video metadata so Google can
   * surface the video in the SERP video carousel.
   */
  emitSchema?: boolean;
  /** ISO 8601 duration string (e.g. "PT2M30S" for 2 min 30 sec) — for schema */
  duration?: string;
  /** Date video was published, YYYY-MM-DD — for schema */
  uploadDate?: string;
  /** Short description — for schema */
  description?: string;
}

/**
 * Lazy-loaded YouTube embed that doesn't load the YouTube player JS until the
 * user clicks Play. Saves ~600KB on page load. Optionally emits VideoObject
 * JSON-LD so Google can show the video in the SERP video carousel.
 *
 * Usage in MDX:
 *
 *   <YouTubeEmbed
 *     id="abc123XYZ"
 *     title="Sowing fenugreek microgreens — 60 seconds"
 *     caption="From sow to first leaf, sped up 30x."
 *     emitSchema={true}
 *     duration="PT0M58S"
 *     uploadDate="2026-06-15"
 *     description="A 60-second time-lapse of fenugreek microgreens germinating in a 1020 tray."
 *   />
 */
export function YouTubeEmbed({
  id,
  title,
  caption,
  emitSchema,
  duration,
  uploadDate,
  description,
}: YouTubeEmbedProps) {
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;

  const schema =
    emitSchema && uploadDate
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: title,
          description: description ?? title,
          thumbnailUrl: [thumbnail],
          uploadDate,
          contentUrl: watchUrl,
          embedUrl: `https://www.youtube.com/embed/${id}`,
          ...(duration ? { duration } : {}),
        }
      : null;

  return (
    <figure className="not-prose my-10">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <div className="relative aspect-video overflow-hidden rounded-card border border-border bg-bg/50">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-fg-muted italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
