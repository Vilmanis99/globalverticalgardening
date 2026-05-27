/**
 * Timeline-data registry. Same reason as yield-data: MDX 6 doesn't reliably
 * pass complex array-of-objects props through, so we keep the data in TS
 * and reference by `dataKey` in MDX.
 */

interface TimelineEntry {
  label: string;
  title: string;
  body: string;
  photo?: string;
  photoAlt?: string;
}

interface TimelineDataset {
  caption?: string;
  entries: TimelineEntry[];
}

export const TIMELINE_DATA: Record<string, TimelineDataset> = {
  "fenugreek-grow-log": {
    caption: "Fenugreek microgreens — 1020 tray, indoor ambient ~20°C",
    entries: [
      {
        label: "Day 0",
        title: "Soak and sow",
        body: "Pre-soak fenugreek seeds for 6–8 hours in room-temperature water — they swell to about double their size. Drain. Spread evenly across the tray surface (density placeholder — see notes). Cover with another inverted tray to keep them dark and humid.",
      },
      {
        label: "Day 2",
        title: "Germination",
        body: "First white roots appearing. Keep the cover on. Mist if the surface is drying.",
      },
      {
        label: "Day 4",
        title: "First leaves emerging",
        body: "Cotyledons unfold under the cover. Move to light at this point.",
      },
      {
        label: "Day 7",
        title: "Standing tall",
        body: "Plants are 6–8 cm. Cotyledons fully open. Watering daily from below.",
      },
      {
        label: "Day 9–10",
        title: "Harvest",
        body: "Cut with scissors above the medium when most plants have full cotyledons. True leaves are just starting to appear in some — that's the sign to harvest. Past day 12 the flavour gets noticeably more bitter.",
      },
    ],
  },
  "ant-control-may-2026": {
    caption: "What happened over the two weeks after application",
    entries: [
      {
        label: "Day 0",
        title: "Application",
        body: "Powder laid down along the foundation and on the visible mounds. Within an hour ants were already walking through it — pyrethroid powders work on contact, so this was the part where the workers carry it back to the colony on their bodies.",
      },
      {
        label: "Day 3",
        title: "Mounds still active",
        body: "Visible activity reduced but not gone. The two original mounds were quieter; the line on the kitchen step was thinner. I'd expected this — even a contact poison needs the workers to walk through it repeatedly and carry it home.",
      },
      {
        label: "Day 7",
        title: "Most activity gone",
        body: "The two original mounds were inactive. No new ants on the kitchen step in three days. Granules still visible in places — the colony is clearly down significantly but I can see they haven't all stopped.",
      },
      {
        label: "Day 14",
        title: "Holding",
        body: "Ants are not gone — I still see one or two on the patio occasionally — but the mounds are gone, the trails are gone, and they're no longer coming into the kitchen step. From swarm to ones-and-twos in two weeks.",
      },
    ],
  },
};
