"""
Idempotent normalization pass over content/posts/*.mdx and content/pages/*.mdx.

Fixes these Squarespace-export-induced issues identified by analysis:
  1. Trailing whitespace and orphan leading spaces (creates spurious <br> + indents)
  2. Empty heading stubs ("## " with no text) — produce phantom anchors
  3. Headings wrapped in bold (## **Foo**) → strip the **
  4. Bold pseudo-headings on their own line (**Pros**) → promote to ####
  5. Squarespace [caption] shortcode → unwrap
  6. UPPERCASE headings with trailing colons (## LOCATION:) → "Location"
  7. Middle-dot bullet impostors (·  text) → "- text"
  8. HTML entities in titles (&amp;amp; → &)
  9. Slug renames for -amp- (returns a redirect plan for stream A)

Re-runnable; produces a slug-rename report at content/_slug_renames.json.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "content" / "posts"
PAGES = ROOT / "content" / "pages"
RENAMES_PATH = ROOT / "content" / "_slug_renames.json"

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
BOLD_ONLY_LINE_RE = re.compile(r"^\*\*([^*\n]+?)\*\*\s*$")
HEADING_WRAPPED_BOLD_RE = re.compile(r"^(#{1,6})\s+\*\*(.+?)\*\*\s*$")
EMPTY_HEADING_RE = re.compile(r"^#{1,6}\s*$")
CAPTION_OPEN_RE = re.compile(r"\[caption[^\]]*\]")
CAPTION_CLOSE_RE = re.compile(r"\[/caption\]")
MIDDLE_DOT_BULLET_RE = re.compile(r"^[·•]\s+")
LEADING_SINGLE_SPACE_RE = re.compile(r"^ (\S)")
# A "title-case word" heuristic for uppercase detection: 80%+ uppercase chars
UPPER_RATIO_THRESHOLD = 0.8


def is_mostly_uppercase(s: str) -> bool:
    letters = [c for c in s if c.isalpha()]
    if not letters:
        return False
    upper = sum(1 for c in letters if c.isupper())
    return upper / len(letters) >= UPPER_RATIO_THRESHOLD


def normalize_heading_case(text: str) -> str:
    """Title-case an all-uppercase heading without breaking known abbreviations."""
    abbreviations = {"FAQ", "DIY", "LED", "USA", "UK", "USDA", "EPA", "PH"}
    words = text.split()
    out = []
    for w in words:
        bare = re.sub(r"[^A-Za-z]", "", w)
        if bare.upper() in abbreviations:
            out.append(w.upper() if bare == bare.upper() else w)
        else:
            # First letter upper, rest lower (preserves trailing punctuation)
            out.append(w[:1].upper() + w[1:].lower() if w else w)
    return " ".join(out)


def parse_frontmatter(text: str) -> tuple[dict, str, str]:
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}, "", text
    raw = m.group(1)
    body = text[m.end():]
    data: dict[str, str] = {}
    for line in raw.split("\n"):
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip()
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        data[k.strip()] = v
    return data, raw, body


def dump_frontmatter(data: dict[str, str]) -> str:
    """Re-emit frontmatter preserving the original key order we care about."""
    order = [
        "title",
        "slug",
        "date",
        "lastUpdated",
        "category",
        "excerpt",
        "wordCount",
    ]
    lines = ["---"]
    for key in order:
        if key not in data:
            continue
        val = data[key]
        if key == "wordCount":
            lines.append(f"{key}: {val}")
        else:
            escaped = str(val).replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'{key}: "{escaped}"')
    # Append any unknown keys at the end
    for key, val in data.items():
        if key not in order:
            escaped = str(val).replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'{key}: "{escaped}"')
    lines.append("---")
    lines.append("")
    return "\n".join(lines)


def normalize_body(body: str) -> str:
    lines = body.split("\n")
    out: list[str] = []
    for raw_line in lines:
        line = raw_line.rstrip()  # rule 1: trailing whitespace

        # rule 5: strip caption shortcodes wherever they appear
        line = CAPTION_OPEN_RE.sub("", line)
        line = CAPTION_CLOSE_RE.sub("", line)

        # rule 1b: orphan single-space leading char (Squarespace bug)
        # Only strip if it's clearly an orphan continuation paragraph, not an indented list
        if LEADING_SINGLE_SPACE_RE.match(line) and not line.lstrip().startswith(("-", "*", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.")):
            line = line[1:]

        # rule 2: drop empty heading stubs
        if EMPTY_HEADING_RE.match(line):
            continue

        # rule 3: ## **Foo** → ## Foo
        m = HEADING_WRAPPED_BOLD_RE.match(line)
        if m:
            hashes, inner = m.group(1), m.group(2)
            line = f"{hashes} {inner}"

        # rule 6: UPPERCASE: heading → Case
        m = HEADING_RE.match(line)
        if m:
            hashes, text = m.group(1), m.group(2)
            # strip trailing colon
            text = text.rstrip(":").strip()
            if is_mostly_uppercase(text):
                text = normalize_heading_case(text)
            line = f"{hashes} {text}"

        # rule 4: **Foo** on its own line → #### Foo
        m = BOLD_ONLY_LINE_RE.match(line)
        if m:
            line = f"#### {m.group(1).strip()}"

        # rule 7: middle-dot pseudo-bullets → real bullets
        line = MIDDLE_DOT_BULLET_RE.sub("- ", line)

        out.append(line)

    # Collapse 3+ blank lines
    result: list[str] = []
    blank_run = 0
    for line in out:
        if not line.strip():
            blank_run += 1
            if blank_run <= 2:
                result.append(line)
        else:
            blank_run = 0
            result.append(line)
    text = "\n".join(result).rstrip() + "\n"
    return text


def slug_from_filename(path: Path) -> str:
    return path.stem


def normalize_slug(slug: str) -> str:
    # Replace "-amp-" with "-and-"
    return re.sub(r"-amp-", "-and-", slug)


def process_file(path: Path, slug_renames: list[dict]) -> Path:
    text = path.read_text(encoding="utf-8")
    data, _, body = parse_frontmatter(text)

    # rule 8: decode HTML entities in title (double-encoded too)
    if "title" in data:
        title = data["title"]
        decoded = html.unescape(title)
        # Sometimes double-encoded
        decoded = html.unescape(decoded)
        data["title"] = decoded

    if "excerpt" in data:
        data["excerpt"] = html.unescape(html.unescape(data["excerpt"]))

    # rule 9: slug rename
    old_slug = data.get("slug") or slug_from_filename(path)
    new_slug = normalize_slug(old_slug)
    rename_path = path
    if new_slug != old_slug:
        data["slug"] = new_slug
        rename_path = path.with_name(new_slug + ".mdx")
        slug_renames.append({
            "old": old_slug,
            "new": new_slug,
            "category": data.get("category", "gardening"),
        })

    new_body = normalize_body(body)
    new_text = dump_frontmatter(data) + new_body

    if rename_path != path:
        path.unlink()
    rename_path.write_text(new_text, encoding="utf-8")
    return rename_path


def main():
    if not POSTS.exists():
        sys.exit("content/posts not found — run extract first")

    slug_renames: list[dict] = []
    counts = {"posts": 0, "pages": 0}

    for path in sorted(POSTS.glob("*.mdx")):
        process_file(path, slug_renames)
        counts["posts"] += 1
    for path in sorted(PAGES.glob("*.mdx")):
        process_file(path, slug_renames)
        counts["pages"] += 1

    RENAMES_PATH.write_text(json.dumps(slug_renames, indent=2), encoding="utf-8")

    print(f"Normalized: posts={counts['posts']}  pages={counts['pages']}")
    if slug_renames:
        print(f"Slug renames ({len(slug_renames)}):")
        for r in slug_renames:
            print(f"  {r['category']}: {r['old']}  →  {r['new']}")
    else:
        print("No slug renames needed.")


if __name__ == "__main__":
    main()
