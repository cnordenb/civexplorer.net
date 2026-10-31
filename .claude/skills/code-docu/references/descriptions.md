# Writing the descriptions

The text of code_docu.pdf is in `desc/00.txt` to `desc/04.txt`. `gen.mjs` reads them in that order as one text, so
which file an entry is in only keeps them short: 00 the folders; 01 the title page, `index.html`, the style sheets,
`script.js` and `js/model/`; 02 `js/view/`, `js/controller/` and `run_test.js`; 03 `helpers_test.js` and
`static_test.js`; 04 the other tests, `data.json` and `locales/de.json`. Keep each file under 400 lines of code; when
one grows past that, move its last entries to the next file.

## The format

```
@ js/model/datahandler.js
What the file holds, as one or more paragraphs. A line that starts at the left margin starts a paragraph,
  and a line that starts with spaces continues the line above it.
- load: What load() does and why.
  Its second line, indented.
# A line that starts with # is left out.
```

- `@ key` starts an entry. The key is a file's path from the repository's folder (`js/view/pictures.js`), a folder
  in `desc/00.txt` (`js/model/`, or `./` for the main folder), or `(title)` for the title page's introduction.
- A line that is not an item is a paragraph of the entry's introduction.
- `- name: text` describes the function or object `name` of a script, or the key `name` of `data.json` or
  `locales/de.json`. A key in a key, such as `icons.groups`, gets its own row in the table.
- `- [Title a-b]: text` describes the part of `index.html`, a style sheet or `script.js` that takes lines `a` to `b`;
  `- [Title a]: text` takes one line. Parts are numbered in the order they are written, so write them in the order of
  the file.
- Wrap at 120 characters: start the next line with two spaces. The line breaks do not show in the PDF.

Every function the inventory finds needs an item, and every item needs a function: `gen.mjs` warns of both, as of a
top-level key without an item, and refuses to build until they match. The items of a script may be in any order; the
PDF puts the sections in the order of the file.

## Links

Names become links by themselves, so write them as the code does:

- `name()` links to the function `name`: in the entry's own file first, then the file it is imported from, then the
  one file in the code that defines it. Write a method of the browser that should not link, such as `fetch()`,
  without the brackets, or add it to `UNLINKED` in `scripts/links.mjs`.
- `[[js/view/pictures.js#wireTip]]` links to a function in a given file, shown as `wireTip()`. Use it where a name is
  defined in more than one file, which `gen.mjs` reports as `ambiguous function`.
- A file's name (`pictures.js`) or path (`js/view/pictures.js`) links to its subchapter, and a folder's path with its
  slash (`js/view/`) to its chapter. Other files of the repository, such as `RULES.md` or `colour_key.csv`, link to
  GitHub.
- Text in backticks is set as code, and the names in it still link: `` `cellIn()` ``.

## The words

- Say what the code does and why, as for a reader who knows JavaScript but not this page. Name the rule or
  requirement behind a choice: "(Rule 2)", "(Req. 33)". Leave out what the code says plainly.
- One to three sentences for most functions. The longest are the ones whose reason is not in the code.
- Write as the rest of the project does: plain, present tense, British spelling (colour, civilisation), the page's own
  words for its controls (**Options**, Simple UI, Find), and the terms of `documentation/TERMINOLOGY.md`.
- For a test function, say what it checks, not how. `node .claude/skills/code-docu-inventory/scripts/testmap.mjs
  "$REPO" "$WORK" pictures_test` lists each test function, the tests of `TESTS.md` whose lines it is in, and the
  names it checks.
- When the code changed, change only the entries it touched, and keep the rest word for word.
