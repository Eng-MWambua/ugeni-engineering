#!/usr/bin/env python3
"""
build-post.py — scaffold a new blog post from _template.html.

The site is static by design (no build step in CI); this is an AUTHORING
convenience, run locally once per new post. It does not need to run again
afterwards — the generated HTML is the artifact.

Usage:
    python3 blog/build-post.py "My post title" my-post-slug

Then:
  1. Fill in the {{TOKENS}} in the generated file.
  2. Add a <article class="post-row"> block to blog/index.html
  3. Add the URL to sitemap.xml and feed.xml
"""

import re
import sys
import datetime
from pathlib import Path

BLOG = Path(__file__).resolve().parent
ROOT = BLOG.parent
TEMPLATE = BLOG / "_template.html"
INDEX = ROOT / "index.html"


def shell() -> tuple[str, str]:
    """Pull the header and footer out of the live homepage so posts can never
    drift from the real thing."""
    src = INDEX.read_text(encoding="utf-8")
    header = src[src.index('<a class="skip"'):src.index("</header>") + len("</header>")]
    footer = src[src.index("<footer>"):src.index("</footer>") + len("</footer>")]
    return header, footer


# Anchors that only exist on the homepage. Everything else (#main, #top)
# must stay local to the post.
HOME_ONLY_ANCHORS = {"services", "sectors", "approach", "accreditations", "about", "contact"}


def to_subdir(html: str) -> str:
    """Posts live in /blog/, so site-root-relative refs need one more level.

    Homepage-only anchors get "../#anchor". "blog/" becomes "../blog/" so the
    Insights nav item keeps working from inside the blog. Anchors that exist
    on every page (#main, #top) stay local.
    """
    html = html.replace('href="./"', 'href="../"')
    html = html.replace('href="blog/"', 'href="../blog/"')

    def anchor(m):
        name = m.group(1)
        return f'href="../#{name}"' if name in HOME_ONLY_ANCHORS else m.group(0)

    html = re.sub(r'href="#([a-zA-Z0-9_-]+)"', anchor, html)
    html = re.sub(r'src="assets/', 'src="../assets/', html)
    return html


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 1

    title, slug = sys.argv[1], sys.argv[2].strip().lower().replace(" ", "-")
    date = datetime.date.today()
    description = "TODO: 150-160 character description."

    header, footer = shell()
    html = TEMPLATE.read_text(encoding="utf-8")

    html = html.replace("{{HEADER}}", to_subdir(header))
    html = html.replace("{{FOOTER}}", to_subdir(footer))

    html = html.replace("{{TITLE}}", title)
    html = html.replace("{{SLUG}}", slug)
    html = html.replace("{{DESCRIPTION}}", description)
    html = html.replace("{{DATE}}", date.strftime("%-d %B %Y"))
    html = html.replace("{{YYYY-MM-DD}}", date.isoformat())

    out = BLOG / f"{date.isoformat()}-{slug}.html"
    out.write_text(html, encoding="utf-8")
    print(f"created {out.relative_to(ROOT)}")
    print(f"  next: fill the remaining {html.count('{{')} tokens,")
    print(f"        then add it to blog/index.html, sitemap.xml and feed.xml")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())