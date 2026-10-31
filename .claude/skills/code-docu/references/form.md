# The form of code_docu.pdf

What the PDF must look like, as decided in the DEVLOG (2026-10-19, 2026-10-30 and 2026-10-31) and recorded in
`documentation/DECISIONS.md` under "Documents". The scripts already make it so; this list is what to keep when
changing them, and what to look for on the rendered pages.

## Order

1. Title page: "AoE2 Civ Explorer", "Code documentation", the date, the number of chapters, subchapters, functions
   and objects, and the introduction from `@ (title)` in `desc/01.txt`.
2. Contents: every chapter with its number, its number of files and its page; under it, indented one level, every
   subchapter with its number, its number of functions, parts or keys, and its page. The UML diagram and the index
   have lines of their own, without numbers.
3. The UML diagram, on one A4 page.
4. The chapters, one per folder, in the order of `layout.json`:
   1 the main folder (`index.html`, `data.json`), 2 `css/`, 3 `js/` (`script.js`), 4 `js/model/`, 5 `js/view/`,
   6 `js/controller/`, 7 `js/tests/`, 8 `locales/` (`de.json`, standing for every file in `locales/`).
   This order, from the page down, was kept on 2026-10-31 over putting the four folders of scripts first.
5. The index.

## Chapters and subchapters

- A chapter opens with what its folder holds (`@ folder/` in `desc/00.txt`) and a list of its subchapters. Its first
  subchapter follows on the same page; every other subchapter starts a page.
- A subchapter is a file. It opens with what the file holds, its lines, what it imports and what imports it.
- **Scripts.** Each function and object defined at the top level is a section, numbered chapter.subchapter.n in the
  order of the file, such as 4.1.4 for `load()` in `datahandler.js`. A section gives its lines, "exported" or
  "internal", what it does and why, then "Called by" and "Calls", grouped by file, its own file first. A function
  handed on to be called later counts as called by the one that hands it on, and a script's top-level code is named
  where it is the caller. Helpers defined inside a function are part of that function.
- **`index.html`, the style sheets and `script.js`** are described in parts, each with its title and lines. Together
  the parts cover every line of the file but blank ones and bare `<html>` and `<body>` tags, and no two overlap.
- **`data.json`** takes exactly one page: how the file is laid out, and a table of its keys, with their lines and what
  is there, the parts of `icons` and `text` included. `locales/de.json` has a page of its own.

## Links

- Every mention of a folder, file or function outside its own heading links to its chapter, subchapter or section: in
  the text, the lists, the contents, the UML diagram and the index. There were 3,425 links on 2026-10-31.
- Files of the repository that are not chapters, such as `RULES.md`, link to their page on GitHub
  (`https://github.com/cnordenb/civexplorer.net/blob/master/…`).
- Every link must have a target in the PDF; `verify.py` fails otherwise.

## Pages

- A4 throughout, the UML page included. It was A3 until 2026-10-31, when A4 was chosen with smaller names.
- The header at the top left names the chapter and the subchapter, such as "4 js/model/ › 4.1 datahandler.js"; the
  front pages name themselves ("Contents", "UML diagram", "Index"). At the top right: "AoE2 Civ Explorer · Code
  documentation". At the bottom right: the page's number and the number of pages.
- The page numbers in the contents and the index are those where each heading starts, read back from a printing.

## The PDF

- Titled "AoE2 Civ Explorer: Code documentation", tagged, in English.
- One bookmark for every chapter, subchapter and section, each titled as its heading, such as "4.1.4 load(url)",
  with no number run into a name and no word given twice.
- Its objects packed into compressed streams: about 1.4 MB instead of about 4 MB.
- 65 pages on 2026-10-31.

## The index

Every chapter, subchapter, function and object, in alphabetical order, one to a line, under a letter heading:
chapters in bold, subchapters in plain letters, functions in the letters of the code, each with where it is (such as
"function 4.1.4, in js/model/datahandler.js") and its page.
