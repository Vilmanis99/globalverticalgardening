interface YieldRow {
  variety: string;
  daysToHarvest?: number | string;
  /** Wet weight at harvest, grams */
  wetGrams?: number | string;
  /** Seed weight used, grams */
  seedGrams?: number | string;
  /** Notes from Karlis' grow log */
  notes?: string;
  /** When data is missing, render the row as a placeholder */
  pending?: boolean;
}

interface YieldTableProps {
  rows: YieldRow[];
  /** Optional caption — e.g. tray size / soil / light conditions */
  caption?: string;
}

/**
 * Used to display first-party microgreen yield data (per-tray gram weights).
 * Rows with `pending: true` render greyed out to flag missing data.
 *
 * Usage in MDX:
 *
 *   <YieldTable
 *     caption="1020 trays, 4 inches deep, 200 PPFD LED, 18°C ambient"
 *     rows={[
 *       { variety: "Broccoli", daysToHarvest: 10, wetGrams: 195, seedGrams: 12 },
 *       { variety: "Pea shoots", daysToHarvest: 12, wetGrams: 320, seedGrams: 95 },
 *     ]}
 *   />
 */
export function YieldTable({ rows, caption }: YieldTableProps) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (safeRows.length === 0) {
    return (
      <figure className="not-prose my-10 rounded-card border border-border bg-surface p-6 text-fg-muted text-sm">
        Data pending — Karlis hasn&apos;t added the measured rows yet.
      </figure>
    );
  }
  return (
    <figure className="not-prose my-10 overflow-hidden rounded-card border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg/40">
              <th className="px-4 py-3 text-left font-medium text-fg">
                Variety
              </th>
              <th className="px-4 py-3 text-right font-medium text-fg whitespace-nowrap">
                Days to harvest
              </th>
              <th className="px-4 py-3 text-right font-medium text-fg whitespace-nowrap">
                Seed used (g)
              </th>
              <th className="px-4 py-3 text-right font-medium text-fg whitespace-nowrap">
                Wet harvest (g)
              </th>
              <th className="px-4 py-3 text-right font-medium text-fg whitespace-nowrap">
                Yield ratio
              </th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((r) => {
              const seed =
                typeof r.seedGrams === "number" ? r.seedGrams : undefined;
              const wet =
                typeof r.wetGrams === "number" ? r.wetGrams : undefined;
              const ratio =
                seed && wet ? `${(wet / seed).toFixed(1)}×` : "—";
              return (
                <tr
                  key={r.variety}
                  className={`border-b border-border/60 last:border-0 ${
                    r.pending ? "text-fg-muted/60 italic" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium">
                    {r.variety}
                    {r.notes && (
                      <span className="block text-xs text-fg-muted font-normal mt-0.5">
                        {r.notes}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.daysToHarvest ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.seedGrams ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.wetGrams ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {ratio}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="px-4 py-3 text-xs text-fg-muted border-t border-border bg-bg/30">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
