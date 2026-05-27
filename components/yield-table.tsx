import { YIELD_DATA } from "@/lib/data/yield-data";

interface YieldRow {
  variety: string;
  daysToHarvest?: number | string;
  wetGrams?: number | string;
  seedGrams?: number | string;
  notes?: string;
  pending?: boolean;
}

interface YieldTableProps {
  /** Lookup key into lib/data/yield-data.ts. Preferred — MDX-safe. */
  dataKey?: string;
  /** Inline alternative — used when called from regular TSX, not from MDX. */
  rows?: YieldRow[];
  caption?: string;
}

export function YieldTable({ dataKey, rows, caption }: YieldTableProps) {
  let resolvedRows: YieldRow[] | undefined = rows;
  let resolvedCaption: string | undefined = caption;
  if (dataKey && YIELD_DATA[dataKey]) {
    const data = YIELD_DATA[dataKey];
    resolvedRows = data.rows;
    resolvedCaption = caption ?? data.caption;
  }
  const safeRows = Array.isArray(resolvedRows) ? resolvedRows : [];
  if (safeRows.length === 0) {
    return (
      <figure className="not-prose my-10 rounded-card border border-border bg-surface p-6 text-fg-muted text-sm">
        Data pending — measurements haven&apos;t landed yet.
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
      {resolvedCaption && (
        <figcaption className="px-4 py-3 text-xs text-fg-muted border-t border-border bg-bg/30">
          {resolvedCaption}
        </figcaption>
      )}
    </figure>
  );
}
