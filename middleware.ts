import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Returns 410 Gone for content that existed on the old Squarespace site but
 * was lost in the migration (planting-zone calendar pages).
 * 410 is the correct signal to Google: "removed permanently, drop from index"
 * — vs 404 which means "maybe try again later".
 */
const GONE_PATTERNS: RegExp[] = [
  /^\/zone-\d+-planting-calendar\/?$/,
  /^\/vegetable-planting-zones\/?$/,
  /^\/new-folder-1\/?$/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  for (const re of GONE_PATTERNS) {
    if (re.test(pathname)) {
      return new NextResponse(
        `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Gone</title></head><body style="font-family:sans-serif;max-width:40rem;margin:5rem auto;padding:0 1.5rem;color:#1B1E1A"><h1 style="font-family:Georgia,serif">This page has moved on.</h1><p>The planting-calendar section was retired during the move to a new site. If you'd like a printable seasonal calendar for your area, the USDA Plant Hardiness Zone Map is the best source: <a href="https://planthardiness.ars.usda.gov/" rel="nofollow noopener">planthardiness.ars.usda.gov</a>.</p><p><a href="/">← Back to Vertical Gardening</a></p></body></html>`,
        {
          status: 410,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|images/|favicon|robots|sitemap).*)"],
};
