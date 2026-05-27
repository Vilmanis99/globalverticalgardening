export interface CategoryMeta {
  slug: string;
  label: string;
  blurb: string;
}

// Canonical category order (also dictates nav order).
export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "microgreens",
    label: "Microgreens",
    blurb: "Growing guides, nutrition, lighting and harvest tips.",
  },
  {
    slug: "indoor-gardening",
    label: "Indoor Gardening",
    blurb: "Houseplants, terrariums and apartment-friendly setups.",
  },
  {
    slug: "composting",
    label: "Composting",
    blurb: "Bin reviews, recipes and step-by-step composting.",
  },
  {
    slug: "hydroponics",
    label: "Hydroponics",
    blurb: "Soil-free systems, kits and nutrient guides.",
  },
  {
    slug: "gardening",
    label: "Gardening",
    blurb: "Outdoor beds, tools, vegetables and seasonal know-how.",
  },
  {
    slug: "herbs",
    label: "Herbs",
    blurb: "Kitchen herbs grown indoors and out.",
  },
];

export function getCategory(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string): string {
  return getCategory(slug)?.label ?? slug;
}
