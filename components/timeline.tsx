import type { ReactNode } from "react";
import { TIMELINE_DATA } from "@/lib/data/timeline-data";

export interface TimelineEntry {
  label: string;
  title: string;
  body: ReactNode;
  photo?: string;
  photoAlt?: string;
}

interface TimelineProps {
  /** Lookup key into lib/data/timeline-data.ts. Preferred — MDX-safe. */
  dataKey?: string;
  /** Inline alternative — used from regular TSX, not from MDX. */
  entries?: TimelineEntry[];
  caption?: string;
}

export function Timeline({ dataKey, entries, caption }: TimelineProps) {
  let resolvedEntries: TimelineEntry[] | undefined = entries;
  let resolvedCaption: string | undefined = caption;
  if (dataKey && TIMELINE_DATA[dataKey]) {
    const data = TIMELINE_DATA[dataKey];
    resolvedEntries = data.entries;
    resolvedCaption = caption ?? data.caption;
  }
  const safeEntries = Array.isArray(resolvedEntries) ? resolvedEntries : [];
  if (safeEntries.length === 0) {
    return (
      <figure className="not-prose my-10 rounded-card border border-border bg-surface p-6 text-fg-muted text-sm">
        Timeline data pending.
      </figure>
    );
  }
  return (
    <figure className="not-prose my-10">
      {resolvedCaption && (
        <figcaption className="mb-4 text-xs uppercase tracking-[0.14em] text-fg-muted">
          {resolvedCaption}
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
