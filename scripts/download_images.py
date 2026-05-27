"""
Download every image referenced in content/_images.json to public/images/.
Idempotent: skips images that already exist locally with non-zero size.
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "content" / "_images.json"
OUT_DIR = ROOT / "public" / "images"

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
TIMEOUT = 30


def fetch(remote: str, local_path: Path) -> tuple[str, str]:
    if local_path.exists() and local_path.stat().st_size > 0:
        return ("skip", remote)
    local_path.parent.mkdir(parents=True, exist_ok=True)
    # Use curl — Python urllib is sandbox-blocked in this environment.
    try:
        res = subprocess.run(
            [
                "curl", "-sSL", "-A", UA,
                "--max-time", str(TIMEOUT),
                "--fail",
                "-o", str(local_path),
                remote,
            ],
            capture_output=True,
            text=True,
            timeout=TIMEOUT + 5,
        )
        if res.returncode != 0:
            if local_path.exists():
                local_path.unlink(missing_ok=True)
            return (f"err:curl{res.returncode}", remote)
        if not local_path.exists() or local_path.stat().st_size == 0:
            return ("empty", remote)
        return ("ok", remote)
    except subprocess.TimeoutExpired:
        return ("err:timeout", remote)
    except Exception as exc:  # noqa: BLE001
        return (f"err:{exc.__class__.__name__}", remote)


def main():
    if not MANIFEST.exists():
        sys.exit("Image manifest missing. Run extract_content.py first.")
    data = json.loads(MANIFEST.read_text())
    images = data["images"]
    print(f"Downloading {len(images)} images...")

    tasks = []
    for entry in images:
        remote = entry["remote"]
        # local path: /images/<slug>/<filename>  →  public/images/<slug>/<filename>
        rel = entry["local"].lstrip("/")  # "images/<slug>/<file>"
        local = ROOT / "public" / rel
        tasks.append((remote, local))

    results = {"ok": 0, "skip": 0, "empty": 0, "err": 0}
    errors: list[tuple[str, str]] = []
    start = time.time()

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch, r, l): r for r, l in tasks}
        for i, fut in enumerate(as_completed(futures), 1):
            status, remote = fut.result()
            key = status if status in results else "err"
            results[key] += 1
            if key == "err":
                errors.append((status, remote))
            if i % 25 == 0 or i == len(tasks):
                print(f"  [{i:>3d}/{len(tasks)}]  ok={results['ok']}  skip={results['skip']}  err={results['err']}")

    print(f"\nDone in {time.time()-start:.1f}s")
    print(f"  downloaded: {results['ok']}")
    print(f"  skipped (already cached): {results['skip']}")
    print(f"  empty responses: {results['empty']}")
    print(f"  errors: {results['err']}")
    if errors:
        print("\nFailures:")
        for code, url in errors[:20]:
            print(f"  {code}  {url}")
        if len(errors) > 20:
            print(f"  ... and {len(errors)-20} more")


if __name__ == "__main__":
    main()
