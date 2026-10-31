import json
import re
import sys

from pypdf import PdfReader

if len(sys.argv) != 4:
    sys.exit("usage: python verify.py <final.pdf> <page.html> <pages.json>")
pdf_path, page, pages_path = sys.argv[1:4]
reader = PdfReader(pdf_path)
pages = json.load(open(pages_path, encoding="utf8"))
html = open(page, encoding="utf8").read()
problems = []


def report(label, items):
    items = list(items)
    print(f"{label}: {len(items)}", items[:8] if items else "")
    if items:
        problems.append(label)


ids = set(re.findall(r'\bid="([^"]+)"', html))
hrefs = set(re.findall(r'href="#([^"]+)"', html))
report("links to no id in the page", sorted(hrefs - ids))
report("links to no place in the PDF", sorted(hrefs - set(pages)))
listed = {i for i in ids if i.startswith(("c-", "d-", "f-")) or i in ("uml", "index")}
report("chapters, subchapters or functions with no place in the PDF", sorted(listed - set(pages)))

heads = dict(re.findall(r'@page ch(\d+) \{ @top-left \{ content: "([^"]+)"', html))
starts = sorted((pages[cid], int(n)) for n, cid in
                re.findall(r'style="page: ch(\d+)">.*?<h2 class="file" id="(c-[^"]+)"', html, re.S))
wrong = []
for i, p in enumerate(reader.pages, 1):
    current = [n for start, n in starts if start <= i]
    if not current or i >= pages["index"]:
        continue
    text = (p.extract_text() or "")[:240]
    want = heads[str(current[-1])].split()
    if not all(w in text for w in want):
        wrong.append((i, " ".join(want)))
report("pages whose header names the wrong chapter or subchapter", wrong)


def walk(items, depth=1, out=None):
    out = [] if out is None else out
    for it in items:
        if isinstance(it, list):
            walk(it, depth + 1, out)
        else:
            out.append((depth, it.title))
    return out


marks = walk(reader.outline)
depths = sorted({x for x, _ in marks})
print("bookmarks:", len(marks), "by depth:", {d: sum(1 for x, _ in marks if x == d) for d in depths})
print("first bookmarks:", [t for _, t in marks[:6]])
report("bookmarks that run a number into a name or repeat a word",
       [t for _, t in marks if re.match(r"^\d[\d.]*[A-Za-z]", t) or re.search(r"(\b\w{4,})\1", t)])

links = 0
dead = []
for i, p in enumerate(reader.pages, 1):
    for a in p.get("/Annots") or []:
        a = a.get_object()
        if a.get("/Subtype") != "/Link":
            continue
        links += 1
        act = a.get("/A")
        dest = a.get("/Dest") if act is None else act.get("/D")
        if (act is None or act.get("/S") != "/URI") and dest is None:
            dead.append(i)
print("links:", links)
report("links without a target, by page", dead)

sizes = {}
for i, p in enumerate(reader.pages, 1):
    w, h = (round(float(x)) for x in p.mediabox[2:])
    sizes.setdefault((w, h), []).append(i)
print("pages:", len(reader.pages), "sizes:", {f"{w}x{h}": len(v) for (w, h), v in sizes.items()})
report("pages that are not A4", [(i, f"{w}x{h}") for (w, h), v in sizes.items()
                                  if {w, h} != {595, 842} for i in v])

data_start = pages.get("c-data-json")
after = [pages[k] for k in pages if pages[k] > (data_start or 0)]
if data_start and after and min(after) - data_start > 1:
    problems.append("data.json chapter")
    print("the data.json subchapter takes", min(after) - data_start, "pages, not one")

sys.exit(f"FAILED: {', '.join(problems)}" if problems else 0)
