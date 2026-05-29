import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getPost } from "@/lib/posts";
import { categoryLabel } from "@/lib/categories";

// Pinterest optimal pin: 2:3 vertical, 1000×1500.
const WIDTH = 1000;
const HEIGHT = 1500;

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function font(file: string) {
  return fs.readFileSync(path.join(FONT_DIR, file));
}

// Re-encode + crop the hero through sharp into a clean 2:3 JPEG that Satori
// can always decode (fixes the old-JPEG-encoding failures from the migration).
async function backgroundDataUri(localPath: string): Promise<string | null> {
  const abs = path.join(PUBLIC_DIR, localPath.replace(/^\//, ""));
  if (!fs.existsSync(abs)) return null;
  try {
    const out = await sharp(abs)
      .rotate() // honour EXIF orientation
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  // Optional ?bg=/garden/... override to build a pin on a chosen photo.
  const bgOverride = new URL(req.url).searchParams.get("bg");
  const bgPath = bgOverride || post.heroImage || null;
  const bg = bgPath ? await backgroundDataUri(bgPath) : null;
  const category = categoryLabel(post.category).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "#1F3A2D",
          fontFamily: "Inter",
        }}
      >
        {/* Background photo */}
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg}
            width={WIDTH}
            height={HEIGHT}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: WIDTH,
              height: HEIGHT,
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark gradient overlay for text legibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            display: "flex",
            background:
              "linear-gradient(to bottom, rgba(20,28,20,0.15) 0%, rgba(20,28,20,0.15) 38%, rgba(20,28,20,0.82) 100%)",
          }}
        />

        {/* Top eyebrow — category + since */}
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 56,
            right: 56,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#B85C38",
              color: "#FAF8F3",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 3,
              padding: "12px 22px",
              borderRadius: 999,
            }}
          >
            {category}
          </div>
        </div>

        {/* Bottom content block */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: WIDTH,
            display: "flex",
            flexDirection: "column",
            padding: "0 56px 56px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontWeight: 600,
              fontSize: 76,
              lineHeight: 1.05,
              color: "#FFFFFF",
              letterSpacing: -1,
              marginBottom: 28,
            }}
          >
            {post.title}
          </div>

          {/* Brand bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 999,
                backgroundColor: "#FAF8F3",
                color: "#1F3A2D",
                fontFamily: "Fraunces",
                fontWeight: 600,
                fontSize: 34,
              }}
            >
              V
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Fraunces",
                  fontWeight: 500,
                  fontSize: 30,
                  color: "#FFFFFF",
                }}
              >
                Vertical Gardening
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "rgba(250,248,243,0.8)",
                  letterSpacing: 1,
                }}
              >
                globalverticalgardening.net
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Fraunces", data: font("Fraunces-600.woff"), weight: 600, style: "normal" },
        { name: "Fraunces", data: font("Fraunces-500.woff"), weight: 500, style: "normal" },
        { name: "Inter", data: font("Inter-400.woff"), weight: 400, style: "normal" },
        { name: "Inter", data: font("Inter-600.woff"), weight: 600, style: "normal" },
      ],
    }
  );
}
