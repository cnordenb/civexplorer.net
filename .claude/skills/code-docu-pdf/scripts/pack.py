import html as H
import re
import sys

import pikepdf

if len(sys.argv) not in (4, 5):
    sys.exit("usage: python pack.py <printed.pdf> <page.html> <out.pdf> [document title]")
src, page, dst = sys.argv[1:4]
title = sys.argv[4] if len(sys.argv) == 5 else "AoE2 Civ Explorer: Code documentation"
doc = open(page, encoding="utf8").read()


def clean(s):
    return H.unescape(re.sub(r"<[^>]+>", "", s)).strip()


titles = []
for level, inner in re.findall(r"<h([123])\b[^>]*>(.*?)</h\1>", doc, re.S):
    num = re.search(r'<span class="num">(.*?)</span>', inner)
    if level == "3":
        name = clean(re.search(r'<span class="sig[^"]*">(.*?)</span>', inner).group(1))
    else:
        name = clean(re.sub(r'<span class="num">.*?</span>', "", inner, count=1))
    titles.append(f"{clean(num.group(1))} {name}" if num else name)

with pikepdf.open(src) as pdf:
    with pdf.open_outline() as outline:
        items = []

        def walk(lst):
            for it in lst:
                items.append(it)
                walk(it.children)

        walk(outline.root)
        if len(items) != len(titles):
            sys.exit(f"{len(items)} bookmarks but {len(titles)} headings")
        for it, heading in zip(items, titles):
            if re.sub(r"\s", "", heading) not in re.sub(r"\s", "", it.title):
                sys.exit(f"bookmark {it.title!r} does not match heading {heading!r}")
            it.title = heading
    pdf.docinfo["/Title"] = title
    pdf.save(dst, object_stream_mode=pikepdf.ObjectStreamMode.generate, compress_streams=True,
             recompress_flate=True, linearize=False)
print(len(titles), "bookmark titles set; wrote", dst)
