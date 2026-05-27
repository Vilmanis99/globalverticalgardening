"""
Targeted: extract FAQ Q/A pairs from `frequently-asked-questions-microgreens-faq.mdx`,
write them into the post's frontmatter as a `faq:` array, and clean up the
Squarespace heading-bullet artifacts (`## ·         **Q**` → `## Q`).
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("/Users/karlis/Documents/gardening")
TARGET = ROOT / "content" / "posts" / "frequently-asked-questions-microgreens-faq.mdx"

FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
HEADING_BULLET_RE = re.compile(r"^(#{2,6})\s*[·•]\s*\**(.+?)\**\s*$", re.MULTILINE)


def parse_frontmatter(text: str):
    m = FM_RE.match(text)
    if not m:
        return {}, "", text
    raw = m.group(1)
    body = text[m.end():]
    data = {}
    for line in raw.split("\n"):
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip()
        if v.startswith('"') and v.endswith('"'):
            v = v[1:-1]
        data[k.strip()] = v
    return data, raw, body


def yaml_dq(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    if not TARGET.exists():
        raise SystemExit(f"missing: {TARGET}")

    text = TARGET.read_text(encoding="utf-8")
    data, _, body = parse_frontmatter(text)

    # 1) Clean up bullet+bold heading artifacts
    body = HEADING_BULLET_RE.sub(lambda m: f"{m.group(1)} {m.group(2).strip()}", body)

    # 2) Extract Q/A pairs: H2 = question, following paragraph(s) = answer
    sections = re.split(r"\n(?=## )", body)
    faq: list[tuple[str, str]] = []
    for sec in sections:
        m = re.match(r"^## (.+?)\n+(.*)", sec, re.DOTALL)
        if not m:
            continue
        q = m.group(1).strip().rstrip("?") + "?"
        # Take only the FIRST paragraph as answer (FAQ schema prefers a concise A)
        answer_block = m.group(2).strip()
        if not answer_block:
            continue
        # Strip lines after the first blank line
        first_para = answer_block.split("\n\n", 1)[0].strip()
        # Collapse internal newlines to single spaces
        first_para = re.sub(r"\s+", " ", first_para)
        # Strip a tag (sometimes Squarespace produces *italic* etc.)
        if len(first_para) < 30:
            continue
        faq.append((q, first_para))

    # 3) Rebuild frontmatter with the faq array appended in correct YAML
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
        if key in data:
            if key == "wordCount":
                lines.append(f"{key}: {data[key]}")
            else:
                lines.append(f"{key}: {yaml_dq(str(data[key]))}")
    for key, val in data.items():
        if key not in order and key != "faq":
            lines.append(f"{key}: {yaml_dq(str(val))}")
    lines.append("faq:")
    for q, a in faq:
        lines.append(f"  - q: {yaml_dq(q)}")
        lines.append(f"    a: {yaml_dq(a)}")
    lines.append("---")
    lines.append("")

    new_text = "\n".join(lines) + body.lstrip("\n")
    TARGET.write_text(new_text, encoding="utf-8")
    print(f"Wrote {len(faq)} FAQ pairs and cleaned heading bullets in {TARGET.name}")


if __name__ == "__main__":
    main()
