import type { ReactNode } from "react";

export interface TimelineEntry {
  /** "Day 0", "Day 3", "Week 1", etc. */
  label: string;
  /** Short heading for the entry */
  title: string;
  /** Body — can be plain text or include simple inline elements */
  body: ReactNode;
  /** Optional photo for this day */
  photo?: string;
  /** Optional alt text for the photo */
  photoAlt?: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
  /** Optional caption above the timeline */
  caption?: string;
}

/**
 * Used for day-by-day grow logs in microgreens articles.
 * Each entry is a vertical row with a label rail on the left.
 *
 * Usage in MDX:
 *
 *   <Timeline
 *     entries={[
 *       { label: "Day 0", title: "Sow", body: "Pre-soaked 12g of seeds overnight..." },
 *       { label: "Day 3", title: "Germination", body: "First white roots appearing.", photo: "/garden/.../day-3.jpg" },
 *     ]}
 *   />
 */
export function Timeline({ entries, caption }: TimelineProps) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  if (safeEntries.length === 0) {
    return (
      <figure className="not-prose my-10 rounded-card border border-border bg-surface p-6 text-fg-muted text-sm">
        Timeline data pending.
      </figure>
    );
  }
  return (
    <figure className="not-prose my-10">
      {caption && (
        <figcaption className="mb-4 text-xs uppercase tracking-[0.14em] text-fg-muted">
          {caption}
        </figcaption>
      )}
      <ol className="relative border-l-2 border-border ml-3 pl-6 space-y-7">
        {safeEntries.map((e, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[34px] top-1.5 inline-flex h-3 w-3 rounded-full bg-primary border-2 border-bg"
            />
            <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-medium">
              {e.label}
            </p>
            <h4
              className="mt-1 text-lg font-medium leading-tight"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {e.title}
            </h4>
            <div className="mt-2 text-sm text-fg leading-relaxed">{e.body}</div>
            {e.photo && (
              <div className="mt-3 overflow-hidden rounded-card border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.photo}
                  alt={e.photoAlt ?? e.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full max-h-72 object-cover"
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}
