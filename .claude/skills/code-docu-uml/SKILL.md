---
name: code-docu-uml
description: >-
  Draw the four UML pages of code_docu.pdf for AoE2 Civ Explorer: the overview from MAINTAINER.md (model, view and
  controller, file by file) and a diagram of each part, function by function, generated from the code. Each is fitted
  to one A4 page, linked to the chapters, subchapters and sections, and checked so that no arrow crosses or touches
  another or runs under a box or a label. Use this skill when code_docu.pdf is being made or updated (with the
  code-docu skill) and a UML page is wrong, the build stops on a `uml:` warning or a `uml problem:` line, its text is
  too small, a box or name in it does not link, or the overview in MAINTAINER.md has to change.
---

# The UML pages

There are four diagrams, each on its own page after the contents, decided on 2026-11-01:

| Id | Diagram | Made from | Layout |
| --- | --- | --- | --- |
| `uml-overview` | Each folder of `js/` with its files | `MAINTAINER.md`, by hand | dagre |
| `uml-model` | The scripts of `js/model/` and their functions | The code, by `parts.mjs` | ELK |
| `uml-view` | The scripts of `js/view/` and their functions | The code, by `parts.mjs` | ELK |
| `uml-controller` | The scripts of `js/controller/` and their functions | The code, by `parts.mjs` | ELK |

The overview's source is the mermaid block under "### UML diagram" in `documentation/MAINTAINER.md`, which shows
the overview only. `gen.mjs` of the `code-docu` skill puts the four into the page as
`window.umlDiagrams`, each with its links, and the page loads `scripts/uml.js`. In Chrome, `uml.js` loads mermaid
and `@mermaid-js/layout-elk` from the work folder's `node_modules` (installed by `preflight.mjs`, at the versions
`.claude/skills/package.json` names; Rule 36 allows it here only), draws each diagram, checks it, fits it to its page,
and sets `window.docReady`, which `print.mjs` waits for.

## The overview

The overview is written by hand, so that it stays short enough for `MAINTAINER.md`: a box for each folder, its
stereotype the folder (`<<js/view/>>`) and its lines the files, and an arrow with a label from a part to each part it
uses. `parts.mjs` (`overviewProblems`) compares it with the code on every build, and `gen.mjs` stops on each
difference with a warning that starts with `uml:`:

- `the overview's box … differs from … in …`: a file was added, moved or removed; change the box's lines.
- `the overview lacks a ..> b`: a script of folder `a` imports one of folder `b` (dynamic imports count) and no arrow
  says so; add the arrow with a label.
- `the overview draws a ..> b, which no script does`: remove the arrow.

The scripts in `js/tests/` use all three parts, but those arrows are not drawn and not asked for: with them the five
boxes would all be joined to each other, which cannot be drawn without a crossing. The text says so.

The overview is drawn with dagre, mermaid's default, as GitHub draws it. dagre places the boxes in the order the
arrows are written, so the order is part of the drawing: `start ..> view` comes first, and any other order was
seen to cross. GitHub's own rendering cannot be checked from here; the check is of mermaid 11.4.1 in Chrome.

## The diagrams of the parts

`parts.mjs` (`partDiagrams`) writes them from the inventory: a box for each script of the folder, named by its file
name without `.js`, its role as stereotype (`ROLES`: `subject`, `observer, composite`, the strategies, what
`datahandler` reads, or `module`), then each top-level object and function in the order of the file, `+` if
exported and `-` if not, with the names of its parameters. An arrow points from a script to each script of the same
folder that it imports. They change with the code by themselves and need no edits.

They are drawn with ELK (`layout: elk`), which routes arrows at right angles and spreads their ends along the
boxes; dagre crossed arrows in the view's diagram in every order tried. `uml.js` draws the arrows in their own order,
then reversed, then in shuffled orders (`TRIES`, 12, with a fixed seed so every build is the same), each top to
bottom and left to right, and keeps the first order that gives a clean drawing.

## The check

`scripts/collide.js` reads each drawn diagram's SVG: the boxes (`g.node`), the arrows (`.edgePaths path`, sampled
every unit) and the labels (`.edgeLabels g.edgeLabel`). It reports:

- an arrow that runs under or along a box that is not one of its ends, closer than `GAP` (4 units);
- an arrow that runs into one of its own boxes rather than stopping at its edge;
- two arrows that cross or come closer than `GAP`, and two arrows into one box whose heads are closer than `HEAD`;
- an arrow that runs under a label that is not its own.

`window.umlReport.problems` lists each with its diagram's id, and `print.mjs` prints them as `uml problem: …` and
exits with 1, which stops `build.mjs`. Never install a PDF whose build printed one.

## How it is fitted

- Each diagram is tried on an upright and a lying A4 page (`@page uml-portrait` and `uml-landscape` in
  `code-docu/scripts/doc.css`, 176 by 263 mm inside the margins, and the other way round). The room is the page less
  the headings and paragraphs above the diagram, measured at that page's width, less `SAFETY_MM` (4 mm).
- Of the clean drawings the largest scale wins, but the text is never larger than `MAX_PT` (9 points), so a small
  diagram does not fill the page with large letters; at a tie the upright page wins.
- `print.mjs` prints a line `uml: {…}` for each: its id, layout, direction, page, the text's size in points and how
  many drawings were tried. On 2026-11-02: the overview upright at 7.6 points, the model upright `LR` at 4.7 after 2
  drawings (7.4 before `updater.js`, 5.1 before `civsets.js`, `texts.js` and `icons.js`), the view upright `LR`
  at 5.6 after 4 drawings, the controller upright at 9.

If the model's or the view's text gets too small to read as it grows, the choice is to give it more room; ask before
changing the page's size, as A4 was a decision.

## The links

- In the overview, a box links to its folder's chapter and a file to its subchapter.
- In the parts' diagrams, a box links to its script's subchapter, and each `+` or `-` name to its section.
- A stereotype that names `data.json` links to that subchapter.
- A name that finds no link is a problem: `… links nowhere`.

## When it fails

- `uml problem: mermaid could not draw a diagram: …`: the overview in `MAINTAINER.md` has a syntax error, or mermaid
  or the ELK layout is not in the work folder (run `preflight.mjs`).
- `uml problem: <id>: a → b and c → d cross` and the like: in the overview, reorder or relabel its arrows and run
  again; in a part's diagram, raise `TRIES` in `uml.js`.
- A page that never sets `window.docReady` makes `print.mjs` stop after a minute with "the page never set
  window.docReady".
