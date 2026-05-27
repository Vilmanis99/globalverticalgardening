/**
 * Yield-data registry. Each key is a stable name referenced from MDX via
 * <YieldTable dataKey="..." />. Data lives here (not in MDX) because MDX 6
 * doesn't reliably pass complex object/array literal props to custom
 * components during the RSC compile step.
 */

interface YieldRow {
  variety: string;
  daysToHarvest?: number | string;
  wetGrams?: number | string;
  seedGrams?: number | string;
  notes?: string;
  pending?: boolean;
}

interface YieldDataset {
  caption?: string;
  rows: YieldRow[];
}

export const YIELD_DATA: Record<string, YieldDataset> = {
  "yield-per-tray-2026": {
    caption:
      "Expected ranges, 1020 trays, 50/50 peat + coir mix, LED at ~150 PPFD, 18–20°C ambient. Sources: True Leaf Market + Bootstrap Farmer published seed-density charts, plus my own prior grows since 2019.",
    rows: [
      { variety: "Broccoli", daysToHarvest: "10–12", seedGrams: "12–25", wetGrams: "160–220", notes: "Dense canopy. Mild flavour. The reliable workhorse." },
      { variety: "Radish (Daikon)", daysToHarvest: "8–10", seedGrams: "25–40", wetGrams: "200–280", notes: "Among the fastest. Spicy bite." },
      { variety: "Radish (China Rose)", daysToHarvest: "8–10", seedGrams: "25–40", wetGrams: "200–280", notes: "Pink-stemmed. Visually striking, same speed as Daikon." },
      { variety: "Pea shoots (Dun)", daysToHarvest: "10–14", seedGrams: "100–150", wetGrams: "280–380", notes: "Pre-soaked. Big seed, big yield. My personal favourite." },
      { variety: "Sunflower (regular)", daysToHarvest: "8–12", seedGrams: "100–150", wetGrams: "280–420", notes: "Pre-soaked. Crunchy stems. Hull-removal is the work step." },
      { variety: "Sunflower (black oil)", daysToHarvest: "8–12", seedGrams: "100–150", wetGrams: "280–400", notes: "Pre-soaked. Slightly milder than regular sunflower." },
      { variety: "Kale", daysToHarvest: "10–14", seedGrams: "12–25", wetGrams: "150–220", notes: "Slow start, dense finish. Tastes like kale, surprisingly." },
      { variety: "Mustard (yellow)", daysToHarvest: "8–12", seedGrams: "18–30", wetGrams: "150–220", notes: "Hot. A small handful goes far." },
      { variety: "Wheatgrass", daysToHarvest: "8–12", seedGrams: "200–300", wetGrams: "400–700", notes: "Pre-soaked. Grown for juicing, not eating. Yield is huge but seed-cost is real." },
      { variety: "Cress (garden)", daysToHarvest: "7–12", seedGrams: "15–25", wetGrams: "150–200", notes: "Mucilaginous seed — see the basil/cress notes elsewhere on the site." },
      { variety: "Fenugreek", daysToHarvest: "9–12", seedGrams: "20–30", wetGrams: "140–200", notes: "Bitter, savoury. The research-backed pick. Separate article on this one." },
      { variety: "Amaranth", daysToHarvest: "14–21", seedGrams: "8–15", wetGrams: "80–140", notes: "Slowest. Smallest. Heat-loving — slow at sub-20°C ambient." },
    ],
  },
  "fenugreek-single-tray": {
    caption: "Single-tray results — to be updated with measured data",
    rows: [
      {
        variety: "Fenugreek (1020 tray, peat-based mix, ~20°C)",
        daysToHarvest: "9–10",
        seedGrams: "—",
        wetGrams: "—",
        notes: "Awaiting measured data from next clean grow.",
        pending: true,
      },
    ],
  },
};
