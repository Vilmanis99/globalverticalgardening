"""
Auto-extract HowTo step lists from how-to posts and write them into MDX
frontmatter as `howto:`. The post page already consumes that field via
`components/howto-jsonld.tsx`, so any post with `howto:` set will emit
Google-ready HowTo JSON-LD on next build.

Strategy (conservative — false positives are worse than false negatives):
  Tier 1 (auto-extract):
    - Post body contains H2/H3 headings matching numbered patterns:
        ## 1. Foo / ## 1- Foo / ## 1.- Foo / ## Step 1 / ## Step 1: Foo
        ### 1. Foo etc.
    - At least 3 such headings in the post
  Tier 2 (auto-extract with H1 hint):
    - H1 begins with "Steps to", "How to", or contains "step by step"
    - At least 4 H2 sections that look like process phases (non-question,
      non-meta) AND each section's first paragraph is short (<400 chars)

Step text: first non-empty paragraph after the heading, truncated to ~280
characters (Google's recommended limit for HowTo step.text).

Step image: first local image URL found in the section, if any.

Idempotent: if a post already has `howto:` in frontmatter, skip it.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path("/Users/karlis/Documents/gardening")
POSTS = ROOT / "content" / "posts"

# Posts the plan explicitly targets. We try Tier 1 first on all, then Tier 2.
CANDIDATES = [
    "how-to-make-compost-at-home-step-by-step",
    "garden-tower-2-assembly-instructions",
    "how-to-build-microgreen-greenhouse",
    "how-to-grow-basil-in-a-pot",
    "how-to-grow-edible-flowers",
    "how-to-plant-grass",
    "how-to-store-apples-for-better-taste",
    "how-to-keep-your-succulents-from-drowning",
    "microgreens-what-you-need-to-know",
    "have-you-ever-wanted-to-start-seeds-indoor",
]

FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
NUMBERED_HEADING_RE = re.compile(
    r"^(#{2,4})\s+(?:Step\s*)?(\d+)\s*[.\-:]+\s*(.+?)\s*$",
    re.MULTILINE,
)
PLAIN_HEADING_RE = re.compile(r"^(#{2,3})\s+(.+?)\s*$", re.MULTILINE)
H1_RE = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)
LOCAL_IMG_RE = re.compile(r"!\[[^\]]*\]\((/[^)\s]+)\)")
QUESTION_HEADING_HINT = re.compile(
    r"^(what|why|how|when|where|which|can|should|are|is|do|does)\b",
    re.IGNORECASE,
)
MAX_STEP_TEXT = 280


def parse_frontmatter(text: str) -> tuple[dict[str, str], str, str]:
    m = FM_RE.match(text)
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
        if (v.startswith('"') and v.endswith('"')):
            v = v[1:-1]
        data[k.strip()] = v
    return data, raw, body


def has_howto_already(raw_frontmatter: str) -> bool:
    return re.search(r"^howto:\s*$", raw_frontmatter, re.MULTILINE) is not None


def yaml_dq(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def clean_step_name(s: str) -> str:
    # Strip markdown emphasis and link wrappers
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
    s = re.sub(r"\*(.+?)\*", r"\1", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    s = re.sub(r"\s+", " ", s).strip()
    # Strip leading bullet/number residue
    s = re.sub(r"^[\-\.:\s]+", "", s)
    s = s.rstrip(":").rstrip("-").rstrip(".").strip()
    return s


def first_paragraph(text: str) -> str:
    # Take everything before the next blank-line break (or end)
    para = text.lstrip().split("\n\n", 1)[0].strip()
    # Strip markdown image-only lines (we capture image separately)
    if re.match(r"^!\[", para):
        return ""
    # Collapse internal whitespace
    para = re.sub(r"\s+", " ", para)
    # Strip markdown link syntax to plain text
    para = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", para)
    # Strip bold/italic
    para = re.sub(r"\*\*(.+?)\*\*", r"\1", para)
    para = re.sub(r"\*(.+?)\*", r"\1", para)
    if len(para) > MAX_STEP_TEXT:
        para = para[: MAX_STEP_TEXT - 1].rsplit(" ", 1)[0] + "…"
    return para


def first_image_in(text: str) -> str | None:
    m = LOCAL_IMG_RE.search(text)
    return m.group(1) if m else None


def extract_sections(body: str, heading_pattern: re.Pattern[str]):
    """Yield (heading_text, section_body) tuples for each match of heading_pattern."""
    matches = list(heading_pattern.finditer(body))
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        yield m, body[start:end]


def try_tier1(body: str) -> list[tuple[str, str, str | None]] | None:
    sections = list(extract_sections(body, NUMBERED_HEADING_RE))
    if len(sections) < 3:
        return None
    steps: list[tuple[str, str, str | None]] = []
    for m, section in sections:
        name = clean_step_name(m.group(3))
        text = first_paragraph(section)
        if not text:
            continue
        img = first_image_in(section)
        steps.append((name, text, img))
    return steps if len(steps) >= 3 else None


def try_tier2(body: str) -> list[tuple[str, str, str | None]] | None:
    # Need an H1 hint
    h1 = H1_RE.search(body)
    if h1:
        h1_text = h1.group(1).lower()
        h1_ok = (
            h1_text.startswith("steps to")
            or h1_text.startswith("how to")
            or "step by step" in h1_text
        )
    else:
        h1_ok = False
    if not h1_ok:
        return None

    sections = list(extract_sections(body, PLAIN_HEADING_RE))
    # Filter out question-style headings (FAQ-ish)
    process_sections = []
    for m, section in sections:
        heading = clean_step_name(m.group(2))
        if QUESTION_HEADING_HINT.match(heading):
            continue
        # Section paragraph should be short-ish (process step, not deep dive)
        para = first_paragraph(section)
        if not para or len(para) > 600:
            continue
        process_sections.append((heading, para, first_image_in(section)))

    return process_sections if len(process_sections) >= 4 else None


def rewrite_frontmatter(
    raw_fm: str, steps: list[tuple[str, str, str | None]]
) -> str:
    """Re-emit frontmatter preserving order, append howto: array."""
    order = [
        "title",
        "slug",
        "date",
        "lastUpdated",
        "category",
        "excerpt",
        "wordCount",
        "faq",
    ]
    # Parse existing keys, preserving order
    lines_in = raw_fm.split("\n")
    parsed: dict[str, list[str]] = {}
    current_key: str | None = None
    for line in lines_in:
        if re.match(r"^[a-zA-Z][a-zA-Z0-9]*:", line):
            current_key = line.split(":", 1)[0]
            parsed.setdefault(current_key, []).append(line)
        elif current_key:
            parsed[current_key].append(line)

    out: list[str] = ["---"]
    for key in order:
        if key in parsed:
            out.extend(parsed[key])
    # Append unknown keys (other than howto, which we replace)
    for key, vals in parsed.items():
        if key not in order and key != "howto":
            out.extend(vals)
    # Append howto
    out.append("howto:")
    for name, text, image in steps:
        out.append(f"  - name: {yaml_dq(name)}")
        out.append(f"    text: {yaml_dq(text)}")
        if image:
            out.append(f"    image: {yaml_dq(image)}")
    out.append("---")
    return "\n".join(out)


def process(slug: str) -> str:
    path = POSTS / f"{slug}.mdx"
    if not path.exists():
        return f"  MISSING  {slug}"
    text = path.read_text(encoding="utf-8")
    data, raw, body = parse_frontmatter(text)
    if has_howto_already(raw):
        return f"  SKIP     {slug}  (already has howto)"

    steps = try_tier1(body)
    tier = 1
    if not steps:
        steps = try_tier2(body)
        tier = 2
    if not steps:
        return f"  NO-MATCH {slug}  (manual seeding needed)"

    new_fm = rewrite_frontmatter(raw, steps)
    new_text = new_fm + "\n" + body
    path.write_text(new_text, encoding="utf-8")
    return f"  OK       {slug}  ({len(steps)} steps, tier{tier})"


def main():
    print("Extracting HowTo step lists into frontmatter:")
    print()
    for slug in CANDIDATES:
        print(process(slug))


if __name__ == "__main__":
    main()
