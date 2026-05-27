"""
Backfill missing alt text on every Markdown image in content/posts/*.mdx and
content/pages/*.mdx.

Strategy:
  1. If alt is already non-empty, leave it alone (idempotent).
  2. Otherwise, build an alt from:
     - For affiliate-image-link patterns [![](img)](amzn.to/...) — derive from
       surrounding context (preceding heading/paragraph) since the image
       represents a product
     - For inline images — combine the post title with a humanized filename
       segment (strip `sq_NNNNxNNNN`, hash IDs, file extensions, kebab/camel)
     - Fall back to "{post-title} — illustration"

Skips images that already have alt text.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("/Users/karlis/Documents/gardening")
POSTS = ROOT / "content" / "posts"
PAGES = ROOT / "content" / "pages"

# Capture: optional bang for image, alt text, then (path)
# We match standalone images and bracketed [![](path)](link)
IMG_RE = re.compile(r"(!\[)([^\]]*)(\]\()([^)\s]+)(\))")

FILENAME_NOISE = [
    re.compile(r"^sq_\d+x\d+[-_]*"),
    re.compile(r"^liela_bildes_sq[-_]*"),
    re.compile(r"^image-asset"),
    re.compile(r"^61[A-Za-z0-9_-]+L"),   # Amazon ASIN-prefixed names
    re.compile(r"^[0-9]{6,}[a-zA-Z0-9_-]*"),  # leading long numeric ids
    re.compile(r"[-_](29|28|amp)+$", re.IGNORECASE),
    re.compile(r"[-_]?[0-9]{1,3}$"),
    re.compile(r"\.[a-zA-Z0-9]+$"),  # extension last
]


def humanize_filename(filename: str) -> str:
    name = filename
    # Strip extension first
    if "." in name:
        name = name.rsplit(".", 1)[0]
    for r in FILENAME_NOISE:
        name = r.sub("", name)
    # kebab + underscore to spaces
    name = re.sub(r"[-_]+", " ", name).strip()
    # camelCase split
    name = re.sub(r"([a-z])([A-Z])", r"\1 \2", name)
    # collapse spaces
    name = re.sub(r"\s+", " ", name).strip()
    if not name:
        return ""
    return name.lower()


def parse_frontmatter(text: str) -> tuple[dict, str, str]:
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not m:
        return {}, "", text
    data = {}
    for line in m.group(1).split("\n"):
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip()
        if (v.startswith('"') and v.endswith('"')):
            v = v[1:-1]
        data[k.strip()] = v
    return data, m.group(0), text[m.end():]


def alt_for_image(
    post_title: str,
    img_path: str,
    is_first: bool,
    index: int,
    is_affiliate_child: bool,
) -> str:
    filename = img_path.rsplit("/", 1)[-1]
    human = humanize_filename(filename)

    if is_affiliate_child:
        # Affiliate cards: the product name often appears nearby; we can't see
        # context perfectly here, so use a generic-but-specific alt.
        return f"Product photo — {post_title}"

    if is_first:
        return f"{post_title}"
    if human and len(human) > 4 and not human.replace(" ", "").isdigit():
        return human
    return f"{post_title} — illustration {index}"


FILENAME_ALT_RE = re.compile(
    r"^[0-9a-z][0-9a-z\s+_.\-]{3,}$"
)  # mostly alphanumeric/space gibberish; no proper-noun caps


def looks_like_filename_garbage(alt: str) -> bool:
    """True if the alt is clearly auto-derived from a filename hash (e.g.,
    Amazon ASIN-style)."""
    s = alt.strip()
    if not s or len(s) < 4:
        return False
    if not FILENAME_ALT_RE.match(s):
        return False
    # If it contains a digit AND no word ≥ 4 letters that's purely alphabetic,
    # it's garbage.
    words = s.split()
    has_digit = any(c.isdigit() for c in s)
    has_real_word = any(w.isalpha() and len(w) >= 4 for w in words)
    return has_digit and not has_real_word


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    fm, fm_raw, body = parse_frontmatter(text)
    post_title = fm.get("title", path.stem)

    # Pre-scan: which image indices are inside an affiliate link wrapper?
    # Pattern: [![](path)](url) — the inner img starts where the inner `!` sits.
    affiliate_spans = set()
    for m in re.finditer(
        r"\[(!\[[^\]]*\]\(([^)\s]+)\))\]\((https?://[^)]+)\)", body
    ):
        affiliate_spans.add(m.start(1))  # position of the inner `!`

    rewrites = 0
    out: list[str] = []
    cursor = 0
    image_index = 0
    seen_first = False

    for m in IMG_RE.finditer(body):
        out.append(body[cursor:m.start()])
        bang_open, alt, mid, src, close = m.groups()
        image_index += 1
        is_affiliate = m.start() in affiliate_spans

        # Keep alts that are already non-empty AND not filename garbage.
        # If they're garbage (e.g. "51wyfjt x50l"), re-derive.
        if alt.strip() and not looks_like_filename_garbage(alt):
            out.append(m.group(0))
            cursor = m.end()
            if not seen_first:
                seen_first = True
            continue

        is_first = not seen_first
        seen_first = True
        new_alt = alt_for_image(
            post_title=post_title,
            img_path=src,
            is_first=is_first,
            index=image_index,
            is_affiliate_child=is_affiliate,
        )
        # Escape brackets so they don't break the markdown
        new_alt = new_alt.replace("[", "(").replace("]", ")")
        out.append(f"{bang_open}{new_alt}{mid}{src}{close}")
        cursor = m.end()
        rewrites += 1

    out.append(body[cursor:])
    new_body = "".join(out)
    if rewrites > 0:
        path.write_text(fm_raw + new_body, encoding="utf-8")
    return rewrites


def main():
    total = 0
    files_touched = 0
    for d in (POSTS, PAGES):
        if not d.exists():
            continue
        for f in sorted(d.glob("*.mdx")):
            n = process_file(f)
            if n:
                files_touched += 1
                total += n

    print(f"Alt-text added: {total} images across {files_touched} files")


if __name__ == "__main__":
    main()
