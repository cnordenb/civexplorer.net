# The form of code_docu.pdf

What the PDF must look like, as decided in the DEVLOG (2026-10-19, 2026-10-30, 2026-10-31 and 2026-11-10) and recorded
in `documentation/DECISIONS.md` under "Documents". The scripts already make it so; this list is what to keep when
changing them, and what to look for on the rendered pages.

## Order

1. Title page: "AoE2 Civ Explorer", "Code documentation", the date, the number of chapters, subchapters, functions
   and objects, and the introduction from `@ (title)` in `desc/01.txt`.
2. Contents: every chapter with its number, its number of files and its page; under it, indented one level, every
   subchapter with its number, its number of functions, parts or keys, and its page. The UML diagrams, with a line
   for each diagram under them, and the index have lines of their own, without numbers.
3. Four UML diagrams, each on one A4 page, with the introduction from `@ (uml)` above the first and its own from
   `@ (uml overview)`, `@ (uml model)`, `@ (uml view)` or `@ (uml controller)`: the overview of `MAINTAINER.md`, the
   code in model, view and controller, file by file; then the scripts of each part, function by function, generated
   from the code. No arrow crosses or touches another, or runs under a box or a label, and every build checks it
   (decided 2026-11-01; until then one diagram of all the scripts).
4. The chapters, one per folder, in the order of `layout.json`, each subfolder a chapter of its own after the folder
   it is in (since 2026-11-10): 1 the main folder (`index.html`, `data.json`), 2 `css/`, 3 `js/` (`script.js`),
   4 `js/model/`, 5 `js/model/data/`, 6 `js/view/`, 7 `js/view/pictures/`, 8 `js/controller/`, 9 `js/tests/`,
   10 `js/tests/behaviour/`, 11 `js/tests/interface/`, 12 `js/tests/pictures/`, 13 `js/tests/static/`, 14 `locales/`
   (`de.json`, standing for every file in `locales/`). This order, from the page down, was kept on 2026-10-31 over
   putting the four folders of scripts first.
5. The index.

## Chapters and subchapters

- A chapter opens with what its folder holds (`@ folder/` in `desc/00.txt`) and a list of its subchapters. Its first
  subchapter follows on the same page; every other subchapter starts a page.
- A subchapter is a file. It opens with what the file holds, its lines, what it imports and what imports it.
- **Scripts.** Each function and object defined at the top level is a section, numbered chapter.subchapter.n in the
  order of the file, such as 5.1.5 for `load()` in `datahandler.js`. A section gives its lines, "exported" or
  "internal", what it does and why, then "Called by" and "Calls", grouped by file, its own file first. A function
  handed on to be called later counts as called by the one that hands it on, and a script's top-level code is named
  where it is the caller. Helpers defined inside a function are part of that function.
- **`index.html`, the style sheets and the top-level code of `script.js`** are described in parts, each with its
  title and lines. In `index.html` and the style sheets the parts cover every line of the file but blank ones and bare
  `<html>` and `<body>` tags, and no two overlap.
- **`data.json`** takes exactly one page: how the file is laid out, and a table of its keys, with their lines and what
  is there, the parts of `icons` and `text` included. `locales/de.json` has a page of its own.

## Links

- Every mention of a folder, file or function outside its own heading links to its chapter, subchapter or section: in
  the text, the lists, the contents, the UML diagrams and the index. There were 3,425 links on 2026-10-31 and 6,893 on
  2026-11-10.
- Files of the repository that are not chapters, such as `RULES.md`, link to their page on GitHub
  (`https://github.com/cnordenb/civexplorer.net/blob/master/…`).
- Every link must have a target in the PDF; `verify.py` fails otherwise.

## Pages

- A4 throughout, the UML pages included. It was A3 until 2026-10-31, when A4 was chosen with smaller names. Every
  page is upright, the UML pages too; until 2026-11-10 a UML page was turned on its side when its diagram came out
  larger that way.
- The header at the top left names the chapter and the subchapter, such as "5 js/model/data/ › 5.1 datahandler.js"; the
  front pages name themselves ("Contents", "UML diagrams", "Index"). At the top right: "AoE2 Civ Explorer · Code
  documentation". At the bottom right: the page's number and the number of pages.
- The page numbers in the contents and the index are those where each heading starts, read back from a printing.

## The PDF

- Titled "AoE2 Civ Explorer: Code documentation", tagged, in English.
- One bookmark for every chapter, subchapter and section, each titled as its heading, such as "5.1.5 load(url)",
  with no number run into a name and no word given twice.
- Its objects packed into compressed streams: about 1.4 MB instead of about 4 MB on 2026-10-31, and 2.4 MB instead of
  7.9 MB on 2026-11-10.
- 65 pages on 2026-10-31, 126 on 2026-11-10.

## The index

Every chapter, subchapter, function and object, in alphabetical order, one to a line, under a letter heading:
chapters in bold, subchapters in plain letters, functions in the letters of the code, each with where it is (such as
"function 5.1.5, in js/model/data/datahandler.js") and its page.
