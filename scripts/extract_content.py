"""
Convert the Squarespace→WordPress (WXR) export into clean MDX files for the
Next.js site.

Output:
  content/posts/<slug>.mdx     for each published post
  content/pages/<slug>.mdx     for each page
  content/_images.json         manifest of remote image URLs to download
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from html import unescape
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET

from bs4 import BeautifulSoup
from markdownify import markdownify as html_to_md

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Squarespace-Wordpress-Export-05-27-2026 (6).xml"
OUT_POSTS = ROOT / "content" / "posts"
OUT_PAGES = ROOT / "content" / "pages"
IMG_MANIFEST = ROOT / "content" / "_images.json"

NS = {
    "wp": "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "dc": "http://purl.org/dc/elements/1.1/",
}

CATEGORY_RULES = [
    # (category, keyword list) — checked in order; first match wins.
    ("microgreens", [
        "microgreen", "micro herb", "wheatgrass", "pea shoot",
        "broccoli micro", "mustard micro", "sunflower micro",
        "radish micro", "kale micro", "basil micro", "cress",
    ]),
    ("hydroponics", ["hydroponic", "garden tower"]),
    ("composting", ["compost"]),
    ("indoor-gardening", [
        "indoor", "houseplant", "terrarium", "aloe vera",
    ]),
    ("herbs", ["herb", "basil"]),
    ("gardening", []),  # fallback
]

# Posts we deliberately exclude (per user choice: published only, skip empties).
EXCLUDE_TITLE_PATTERNS = [
    r"^Copy of\b",
]


@dataclass
class Post:
    title: str
    slug: str
    date: str
    post_type: str
    status: str
    body_html: str
    body_md: str = ""
    excerpt: str = ""
    category: str = "gardening"
    images: list[str] = field(default_factory=list)
    word_count: int = 0


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_]+", "-", text)


def derive_category(title: str, body_text: str) -> str:
    haystack = f"{title}  {body_text[:600]}".lower()
    for category, keywords in CATEGORY_RULES:
        if not keywords:
            return category
        if any(k in haystack for k in keywords):
            return category
    return "gardening"


def clean_squarespace_html(html: str) -> str:
    """Strip Squarespace's div wrappers and tracking junk before MD conversion."""
    soup = BeautifulSoup(html, "lxml")

    # Drop scripts/styles outright.
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    # Unwrap Squarespace container divs.
    for div in soup.find_all("div"):
        cls = " ".join(div.get("class", []))
        if any(c in cls for c in ("sqs-block", "sqs-block-content", "sqs-row",
                                  "sqs-col", "image-block-wrapper",
                                  "intrinsic", "sqs-block-image",
                                  "row sqs-row", "col sqs-col")):
            div.unwrap()

    # Drop completely empty wrappers and figcaptions.
    for tag in soup.find_all(True):
        if tag.name in ("p", "div", "span") and not tag.text.strip() and not tag.find("img"):
            tag.decompose()

    # Strip empty class/id/data attrs to keep output tidy.
    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            if attr.startswith("data-") or attr in ("id", "class", "style"):
                del tag.attrs[attr]

    return str(soup)


def extract_images(html: str) -> list[str]:
    urls: list[str] = []
    for m in re.finditer(r'<img[^>]+src="([^"]+)"', html):
        url = m.group(1)
        if url.startswith("//"):
            url = "https:" + url
        if url.startswith("http"):
            urls.append(url)
    return urls


def rewrite_image_paths(html: str, slug: str, urls: list[str]) -> tuple[str, dict[str, str]]:
    """Replace remote image src/srcset with local /images/<slug>/<filename> paths."""
    mapping: dict[str, str] = {}
    for url in urls:
        parsed = urlparse(url)
        # Squarespace CDN paths are long; take the last segment as filename.
        name = Path(parsed.path).name or f"img-{len(mapping)+1}"
        # Strip query string artifacts from filename.
        name = re.sub(r"[^a-zA-Z0-9._-]", "-", name)
        local = f"/images/{slug}/{name}"
        mapping[url] = local
        html = html.replace(url, local)
    # Strip srcset (we only kept the canonical local file)
    html = re.sub(r'\s+srcset="[^"]*"', "", html)
    html = re.sub(r'\s+sizes="[^"]*"', "", html)
    return html, mapping


def word_count(md: str) -> int:
    text = re.sub(r"```.*?```", "", md, flags=re.DOTALL)
    text = re.sub(r"[#*_`>\[\]\(\)!\-]", " ", text)
    return len([w for w in text.split() if w.strip()])


def excerpt_from_md(md: str, limit: int = 180) -> str:
    text = re.sub(r"```.*?```", "", md, flags=re.DOTALL)
    text = re.sub(r"!\[[^\]]*\]\([^\)]*\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^\)]*\)", r"\1", text)
    text = re.sub(r"[#*_`>]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut + "…"


def yaml_quote(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def write_mdx(out_dir: Path, post: Post) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{post.slug}.mdx"
    front = [
        "---",
        f"title: {yaml_quote(post.title)}",
        f"slug: {yaml_quote(post.slug)}",
        f"date: {yaml_quote(post.date)}",
        f"category: {yaml_quote(post.category)}",
        f"excerpt: {yaml_quote(post.excerpt)}",
        f"wordCount: {post.word_count}",
        "---",
        "",
    ]
    path.write_text("\n".join(front) + post.body_md.strip() + "\n", encoding="utf-8")
    return path


def parse_export(xml_path: Path) -> tuple[list[Post], list[Post], dict[str, str]]:
    tree = ET.parse(xml_path)
    channel = tree.getroot().find("channel")
    if channel is None:
        raise RuntimeError("No <channel> in WXR file")

    posts: list[Post] = []
    pages: list[Post] = []
    global_images: dict[str, str] = {}

    for item in channel.findall("item"):
        ptype_el = item.find("wp:post_type", NS)
        status_el = item.find("wp:status", NS)
        if ptype_el is None or status_el is None:
            continue
        ptype = ptype_el.text or ""
        status = status_el.text or ""

        if ptype not in ("post", "page"):
            continue
        if status != "publish":
            continue

        title_el = item.find("title")
        title = (title_el.text or "").strip() if title_el is not None else ""
        if any(re.search(p, title) for p in EXCLUDE_TITLE_PATTERNS):
            continue

        body_el = item.find("content:encoded", NS)
        body_html = (body_el.text or "") if body_el is not None else ""
        if not body_html.strip():
            continue  # skip empty-body posts (one exists)

        slug_el = item.find("wp:post_name", NS)
        slug = (slug_el.text or "").strip() if slug_el is not None else ""
        if not slug:
            slug = slugify(title)

        date_el = item.find("wp:post_date", NS)
        date = (date_el.text or "").strip() if date_el is not None else ""

        # Extract images, clean HTML, rewrite paths, convert to MD.
        images = extract_images(body_html)
        cleaned = clean_squarespace_html(body_html)
        with_local_imgs, mapping = rewrite_image_paths(cleaned, slug, images)
        global_images.update(mapping)

        md = html_to_md(
            with_local_imgs,
            heading_style="ATX",
            bullets="-",
            strip=["script", "style"],
        )
        # Collapse 3+ blank lines.
        md = re.sub(r"\n{3,}", "\n\n", md).strip()
        wc = word_count(md)
        excerpt = excerpt_from_md(md)

        # Plain text first 600 chars for category detection.
        body_text = BeautifulSoup(body_html, "lxml").get_text(" ", strip=True)
        category = derive_category(title, body_text)

        post = Post(
            title=unescape(title),
            slug=slug,
            date=date,
            post_type=ptype,
            status=status,
            body_html=body_html,
            body_md=md,
            excerpt=excerpt,
            category=category,
            images=list(mapping.keys()),
            word_count=wc,
        )

        if ptype == "post":
            posts.append(post)
        else:
            pages.append(post)

    posts.sort(key=lambda p: p.date, reverse=True)
    pages.sort(key=lambda p: p.title)
    return posts, pages, global_images


def main():
    if not SRC.exists():
        sys.exit(f"Source not found: {SRC}")

    posts, pages, image_map = parse_export(SRC)

    OUT_POSTS.mkdir(parents=True, exist_ok=True)
    OUT_PAGES.mkdir(parents=True, exist_ok=True)
    # Clear stale files for idempotency.
    for f in list(OUT_POSTS.glob("*.mdx")) + list(OUT_PAGES.glob("*.mdx")):
        f.unlink()

    for p in posts:
        write_mdx(OUT_POSTS, p)
    for p in pages:
        write_mdx(OUT_PAGES, p)

    # Image manifest for the downloader.
    IMG_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    IMG_MANIFEST.write_text(
        json.dumps(
            {
                "count": len(image_map),
                "images": [{"remote": k, "local": v} for k, v in image_map.items()],
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    cat_counts = Counter(p.category for p in posts)
    print(f"Posts: {len(posts)}   Pages: {len(pages)}   Images: {len(image_map)}")
    print("Categories:")
    for cat, n in cat_counts.most_common():
        print(f"  {cat:20s} {n}")
    if posts:
        print(f"Date range: {posts[-1].date}  →  {posts[0].date}")


if __name__ == "__main__":
    main()
