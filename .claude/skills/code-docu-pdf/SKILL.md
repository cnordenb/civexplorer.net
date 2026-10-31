---
name: code-docu-pdf
description: >-
  Print, number, pack, check and render code_docu.pdf for AoE2 Civ Explorer: Chrome prints the page that gen.mjs
  builds, the page of every heading is read back for the contents and the index, bookmarks are titled and the file
  compressed, and the result is checked for dead links, wrong headers, bad bookmarks and pages that are not A4. Use
  this skill when code_docu.pdf is being made or updated (with the code-docu skill) and a step of build.mjs fails,
  when its checks have to change, or to look at pages of the PDF as pictures.
---

# Printing and checking code_docu.pdf

`build.mjs` of the `code-docu` skill runs these scripts in order; each can also be run alone on the files in the
work folder. Rule 36 allows Python and its packages here, for code_docu.pdf only. `PYTHON` names the interpreter
(`python` by default) and `CHROME` the browser.

| Step | Script | In | Out |
| --- | --- | --- | --- |
| Print | `print.mjs <page.html> <out.pdf> [port]` | `doc.html` | `printed.pdf` |
| Page numbers | `pages.py <printed.pdf> <pages.json>` | `printed.pdf` | `pages.json` |
| Pack | `pack.py <printed.pdf> <page.html> <out.pdf> [title]` | both | `code_docu.pdf` |
| Check | `verify.py <final.pdf> <page.html> <pages.json>` | all three | its report |
| Look | `shot.py <file.pdf> <prefix> [pages] [scale]` | a PDF | `<prefix>-<n>.png` |

## Print

`print.mjs` starts Chrome without a window, on its own profile in the work folder and debugging port 9351 by
default, opens the page, waits until the page sets `window.docReady` (after the UML diagram is drawn), prints the
UML report and calls `Page.printToPDF` with the page's own sizes, backgrounds, a tagged PDF and an outline, then
closes Chrome. The page's `@page` rules in `code-docu/scripts/doc.css` and those `gen.mjs` writes give every page its
size, margins and header, so Chrome's own header and footer stay off. Node 21 needs `--experimental-websocket`;
Node 22 and later do not.

## Page numbers

Chrome makes a named place in the PDF for every heading that a link points to. `pages.py` reads them back, as
`{"c-data-json": 7, …}`, and `gen.mjs` writes those numbers into the contents and the index the next time it runs.
As the numbers can move a page break, `build.mjs` prints again until `pages.json` stays the same, four times at most.

## Pack

Chrome titles each bookmark after the whole text of its heading, which runs the number into the name. `pack.py`
retitles every bookmark after its heading in `doc.html` ("4.1.4 load(url)"), refusing if their numbers differ or a
title does not match its heading, sets the document's title to "AoE2 Civ Explorer: Code documentation", and saves the
file with object streams and compressed streams: about 1.4 MB instead of about 4 MB, with every page unchanged.

## Check

`verify.py` prints what it counted and fails, with "FAILED:" and the name of each check, if:

- a link in the page points to no id, or to no named place in the PDF;
- a chapter, subchapter, function, the UML page or the index has no named place;
- a page between the first chapter and the index does not name its chapter and subchapter in its header;
- a bookmark runs a number into a name, or repeats a word, as Chrome's own titles did;
- a link in the PDF has no target;
- a page is not A4;
- the `data.json` subchapter takes more than one page.

A new check belongs here when a decision about the form adds something that can be counted. Keep each check one
that fails only when the PDF is wrong.

## Look

`verify.py` cannot see how a page looks. `shot.py` renders pages to PNG files with pypdfium2, by default every page
at 1.4 times 72 dots per inch, so they can be read with the Read tool:

```
python .claude/skills/code-docu-pdf/scripts/shot.py "$WORK/code_docu.pdf" "$WORK/shot" 1,2,4 2
```

Look for text that runs out of its box or under the header, a table split over two pages, and an empty page.
