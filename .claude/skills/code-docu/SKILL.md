---
name: code-docu
description: >-
  Regenerate and update documentation/code_docu.pdf, the code documentation of AoE2 Civ Explorer (civexplorer.net):
  bring its descriptions in desc/ up to date with the code, build the PDF from them, check it and install it. Use this
  skill whenever the user asks to make, remake, rebuild, regenerate, update or refresh code_docu.pdf, "the code
  documentation" or "the code docu", or asks why it is out of date or how it is made. Do not rebuild the PDF on your
  own initiative: it is made only when asked, and a DEVLOG entry otherwise lists it under "Not done".
---

# code_docu.pdf

`documentation/code_docu.pdf` explains the code of the page, folder by folder, function by function. It is printed by
Chrome from an HTML page that `scripts/gen.mjs` builds out of three things:

- the code itself, read by the `code-docu-inventory` skill (functions, their lines, who calls whom);
- `layout.json`, which folders are chapters and which files are their subchapters, in order;
- `desc/*.txt`, the hand-written descriptions of every folder, file, function, part and key.

The UML page is drawn by the `code-docu-uml` skill, and printing, page numbers, packing and checking are done by the
`code-docu-pdf` skill. `scripts/build.mjs` runs all of it in order, so for a normal rebuild these other skills only
need to be opened when one of their steps fails or has to change.

## When

Only when the user asks for it (decided 2026-10-31). Changes to the code do not by themselves call for a rebuild; an
entry in the DEVLOG that changes code without one says "`code_docu.pdf`, as in the entries before." under "Not done".

## Rules that apply

- Rule 36 lifts Rules 13 to 15 (no build, no dependencies, no Python) for this work only, so the scripts here may use
  npm packages, Python and a build. None of it may leak into the page: nothing in `index.html`, `css/`, `js/` or
  `data.json` may depend on it, and no `node_modules`, `package-lock.json` or build output goes into the repository.
- The other rules still hold for the files in `.claude/skills/`: no comments in code (Rule 7), functions of at most
  60 lines of code, lines of at most 120 characters, files of at most 400 lines of code, folders of at most 7 files,
  and no two files with the same name apart from `SKILL.md` (Rules 23 to 26 and 29). Wrap `desc/` lines at 120
  characters with an indented continuation line.
- Rule 0: never commit. Leave the new PDF and the changed descriptions in the working tree.

## What it needs

- Node 21 or later (Node 21 needs `--experimental-websocket`, which `build.mjs` adds itself).
- Chrome, at `C:/Program Files (x86)/Google/Chrome/Application/chrome.exe` or wherever `CHROME` points.
- Python 3 with `pikepdf`, `pypdf` and `pypdfium2`; `PYTHON` names the interpreter, `python` by default. If they are
  missing: `python -m pip install --user pikepdf pypdf pypdfium2`.
- A work folder outside the repository, such as `docu-work` in the session's scratchpad. `scripts/preflight.mjs`
  installs acorn and mermaid there from `.claude/skills/package.json`, at the exact versions it names, and keeps every
  file of the build there.

`build.mjs` runs `preflight.mjs` first, which lists everything that is missing and stops.

## Steps

Below, `REPO` is the repository's folder and `WORK` the work folder; run the commands from `REPO`.

1. **Find what has drifted.** Make a draft, which also lists every problem:

   ```
   node .claude/skills/code-docu/scripts/gen.mjs "$REPO" "$WORK" --allow-todo
   ```

   Each warning names a file and a function, part or key. Those that stop a real build are:

   | Warning | What to do |
   | --- | --- |
   | `no description js/…#name` | Describe the new function under `@ js/…` in `desc/` |
   | `extra description js/…#name` | The function is gone or renamed: remove or rename its entry |
   | `part: file …` | A part's lines are past the end, overlap another, or leave lines of the file in no part |
   | `undescribed key` / `extra key` | A top-level key of `data.json` or `locales/de.json` was added or removed |
   | `layout: …` | A script or style sheet is not in `layout.json`, or `layout.json` names one that is gone |
   | `no description of folder …` | A folder in `layout.json` has no `@ folder/` entry in `desc/00.txt` |

   `unlinked name()`, `ambiguous …` and `repo file …` do not stop the build, but read them: each is a name in a
   description that did not become a link. Fix it in the text with `[[file#name]]` or backticks, as
   `references/descriptions.md` explains.

2. **Update the descriptions.** Read the code that changed (`git diff`, `git log`) and the DEVLOG entries since the
   last rebuild, then edit `desc/` and, for a new or moved file, `layout.json`. Follow `references/descriptions.md`:
   describe what each function does and why, in the project's plain English, and change only what the code changed.
   For `index.html` and the style sheets, move the line ranges of the parts so they again cover the whole file.
   Repeat step 1 until it lists no warning that stops the build.

3. **Build.** Without `--allow-todo`, so that it refuses to print while a description is missing:

   ```
   node .claude/skills/code-docu/scripts/build.mjs "$REPO" "$WORK"
   ```

   It generates the page, prints it, reads back the page of every heading, generates again with those numbers and
   prints again until they no longer change, then packs and checks the PDF (`verify.py`). It ends with the PDF's size
   and the command that copies it into place. Add `--date "31 October 2026"` to set the title page's date; it is
   today's by default.

4. **Look at it.** `verify.py` checks the links, the headers, the bookmarks and the page sizes, but not how pages
   look. Render the title page, the contents, the UML page, a chapter's first page, the `data.json` page and the
   first page of the index, and look at each. `$WORK/pages.json` gives the page of each heading by its id, such as
   `uml`, `index`, `d-js-model` and `c-data-json`:

   ```
   python .claude/skills/code-docu-pdf/scripts/shot.py "$WORK/code_docu.pdf" "$WORK/shot" 1,2,4,5
   ```

   The line `uml: …` that `build.mjs` prints gives the UML page, the direction of the diagram and its text size in
   points; at A4 it was 4.3 points on 2026-10-31.

5. **Install it.** Copy `$WORK/code_docu.pdf` over `documentation/code_docu.pdf`.

6. **Document it.** In the last part of the DEVLOG (`documentation/DEVLOG/`), add an entry `### hh:mm:ss: …`
   under today's date, written passively and naming no one (Rule 28): what changed in the PDF, its pages and size, the
   number of links, and what was checked. Earlier entries that list `code_docu.pdf` under "Not done" stay as they are.
   If the form of the PDF changed, also update the decision on `code_docu.pdf` in `documentation/DECISIONS.md` with a
   link to the new entry, the paragraph on `code_docu.pdf` in `documentation/MAINTAINER.md`, and
   `references/form.md`.

## The form

`references/form.md` lists what the PDF must look like and which decision set each part of it. Read it before
changing `layout.json`, `scripts/doc.css` or how a chapter is laid out, and keep the form unless the user asks
otherwise.

## When something goes wrong

- **The page numbers do not settle.** A page break moves with the numbers in the contents. It rarely takes more
  than two printings; if four are not enough, look at the pages around the heading that keeps moving.
- **Chrome does not open its debugging port.** Another Chrome is using port 9351, or Chrome is not at `CHROME`.
  `print.mjs` takes the port as its third argument.
- **The UML text is too small.** The `code-docu-uml` skill explains how the page and the scale are chosen.
- **The PDF fails `verify.py`.** Its last line names each problem; the `code-docu-pdf` skill explains each check.
