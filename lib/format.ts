const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(iso: string): string {
  // input format from WXR: "2025-04-22 14:07:00"
  const [datePart] = iso.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

export function isoDate(iso: string): string {
  return iso.split(" ")[0] ?? iso;
}
