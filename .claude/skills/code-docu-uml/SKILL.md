---
name: code-docu-uml
description: >-
  Draw the UML page of code_docu.pdf for AoE2 Civ Explorer: the mermaid class diagram from MAINTAINER.md, fitted to
  one A4 page and linked to the scripts' subchapters and sections. Use this skill when code_docu.pdf is being made or
  updated (with the code-docu skill) and the UML page is wrong, its text is too small, a box or name in it does not
  link, or the diagram in MAINTAINER.md has changed shape.
---

# The UML page

The diagram is the one under "### UML diagram" in `documentation/MAINTAINER.md`. `gen.mjs` of the `code-docu` skill
copies its mermaid source, the paragraph above it and the link targets into the page, which loads
`scripts/uml.js`. In Chrome, `uml.js` loads mermaid from the work folder's `node_modules` (installed by
`preflight.mjs`, at the version `.claude/skills/package.json` names; Rule 36 allows it here only), draws the diagram
and sets `window.docReady` once it is done, which `print.mjs` waits for before printing.

To change the diagram, change it in `MAINTAINER.md`: the PDF draws whatever is there, so the two never differ.

## How it is fitted

- The page is A4, decided on 2026-10-31; it was A3 before. `uml.js` draws the diagram twice, top to bottom (`TB`)
  and left to right (`LR`), and tries each on an upright and a lying A4 page (`@page uml-portrait` and
  `uml-landscape` in `code-docu/scripts/doc.css`, 176 by 263 mm inside the margins, and the other way round).
- For each of the four, the room is the page less the heading and the paragraph above the diagram, measured at that
  page's width, less `SAFETY_MM` (4 mm), so that the diagram never spills onto a second page. The largest scale wins,
  and the section takes that page's name.
- `window.umlReport`, printed by `print.mjs` as `uml: {…}`, gives the page, the direction, the text's size in points
  and the names that found no link. On 2026-10-31 it was the upright page, `TB`, at 4.3 points.

If the text gets too small to read, as the diagram grows, the choices are to make the diagram in `MAINTAINER.md`
smaller, or to give the page more room; ask before changing the page's size, as A4 was a decision.

## The links

- Each box is a script, named by its file name without `.js`, and links to that script's subchapter. The box
  `tests` stands for `js/tests/` and links to its chapter, and the label `data.json` links to its subchapter.
- Each name in a box that starts with `+` or `-` links to its section. Names that are not top-level functions or
  objects, such as `model.items`, have no section: `uml.js` links them to their script's subchapter instead, and
  lists them as `missing`. On 2026-10-31 those were `model.items`, `datahandler.data`, `pictures.view` and
  `scrollbars.bars`, all values rather than functions, which is as it should be. A new name in that list is either
  such a value or a name in `MAINTAINER.md` that no longer matches the code.

## When it fails

- `uml: {"error": …}` means mermaid could not draw the source: the diagram in `MAINTAINER.md` has a syntax error, or
  mermaid is not in the work folder (run `preflight.mjs`). The PDF is still printed, with an empty UML page, so
  never install a PDF whose build printed this.
- A page that never sets `window.docReady` makes `print.mjs` stop after a minute with "the page never set
  window.docReady".
