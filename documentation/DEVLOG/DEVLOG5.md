# Development log, part 5

- [2026-10-30](#2026-10-30)
- [2026-10-31](#2026-10-31)

Part 5 of the development log. It follows [part 4](DEVLOG4.md). The decisions made in the log are listed in
[DECISIONS.md](../DECISIONS.md).

## 2026-10-30

### Two style sheets in `css/`, the scripts in model, view and controller, and the game's scroll bars

#### What changed

- **Two style sheets.** `style.css` is split into `css/base.css`, the page's layout and its look with Simple UI, and
  `css/pictures.css`, its look without Simple UI: every rule with a picture or a font, the fonts, and the loading
  screen and the tooltip, which only show without Simple UI. The seam was already in the file, as every rule with a
  picture starts with `.pictures`. Of 389 lines of code, 194 went to `base.css` and 195 to `pictures.css`; with the
  scroll bars `pictures.css` has 223. A script sorted the file's 218 rules by their selectors, each keeping its place
  among the others of its sheet, and none mixed the two. `index.html` links `base.css` first.
- **Addresses.** A style sheet's addresses go from its own folder, so the pictures and fonts in `pictures.css` start
  with `../assets/`. The loader still finds them, as `pictureFiles()` reads every sheet against the sheet's address.
- **Nothing looks different.** Every `.pictures` rule now comes after every other rule, which could have changed which
  rule wins. Every element's computed style and box, pseudo-elements included, were compared between the last commit
  and the split in Chrome, at 1280 by 800, 1920 by 1080 and 500 by 900, with and without Simple UI, with the tree
  closed, with it open and a filter, and with Options open: all 18 were identical.
- **The scripts.** `script.js` moved to `js/script.js`, and the other scripts into three folders by what they do:
  `js/model/` holds `datahandler.js` and `model.js`; `js/view/` holds `stringbuilder.js`, `pictures.js`, `report.js`
  and the new `scrollbars.js`; `js/controller/` holds `nodetree.js` and `optionshandler.js`. `nodetree.js` also draws
  the tree, but most of it handles clicks, touches, keys and Find. Every import was rewritten from each script's old
  and new place; apart from that the code is unchanged, but for one import in `stringbuilder.js`, split over three
  lines as its new path made it 125 characters long. The main folder now holds 6 files instead of 8.
- **The scroll bars.** Without Simple UI, every list that scrolls has the game's scroll bar instead of the browser's:
  the tree, the civilisations, Filters, the language list, the Options window's settings, and the whole content in a
  very short window. The report window of `?test` and `?update` keeps the browser's, as it keeps Simple UI's look.
  - An arrow at each end, from `scrollbarendings_x1.webp` (20 by 20 pixels a picture) or `_x2` (40 by 40); between
    them, `scrollbar.webp`, 5 by 15, repeated downwards; and the knob, from `scrollbarknob_x1.webp` or `_x2`. `_x1`
    or `_x2` goes by `data-assets`, as for the other pictures. In each sheet the columns are normal, under the mouse
    and pressed, and the arrows' rows are up and down.
  - The three are drawn equally wide, 20 pixels, `--bar` in `css/pictures.css`: the arrows' own size in `_x1`, and
    half their size in `_x2`, as for a 4K screen at 200 %. Nothing is stretched: the body is 20 by 60 pixels a
    repeat, and the knob keeps its picture's proportions, 21⅓ by 21 in `_x1` (the sheet is 64 pixels wide for three)
    and 43 by 43 in `_x2`, so it is 19.69 pixels high with `_x1` and 20 with `_x2`.
  - The bar shows whenever its list holds more than it shows, whether or not the mouse is over it, and is hidden
    otherwise; the mouse only turns an arrow or the knob to its second picture, and pressing it to its third, which
    stays while the button is held. The browser's own bar was the Windows 11 kind, shown only under the mouse.
  - The knob stays its own size and moves from the top of the body to its bottom as the list scrolls. An arrow
    scrolls 40 pixels, and again every 50 milliseconds after 400 while held; a press above or below the knob scrolls
    a page, less 40 pixels, and goes on while held until the knob reaches the pointer; the knob can be dragged; the
    wheel over the bar scrolls the list. The scrolling is instant, as there are no animations (Rule 11).
  - **Rule 18.** Each list keeps the bar's room on its right at all times, so nothing in it moves when the bar comes or
    goes. The tree and the civilisations have the bar instead of their 8-pixel right padding, as their rows have
    padding of their own; Filters and the language list keep theirs beside it. The tree's rows are thus 12 pixels
    narrower than beside Windows 11's bar, which takes no room, and 3 pixels wider than beside headless Chrome's,
    which takes 15.
  - **How.** `index.html` has the bar's template, as the scripts make no HTML. `startBars()` in
    `js/view/scrollbars.js` puts a bar after each list, so that a bar does not scroll with what it scrolls, and
    `fit()` gives CSS its place, height and knob position as numbers, the only thing the scripts give CSS. Without
    Simple UI the panes and `<body>` are positioned, so a bar is placed against them; the Options window already is.
    A bar is fitted again when its list scrolls or changes size, when something in it does, when anything is added
    to it or taken out, when Simple UI changes, and when the window does. `css/pictures.css` hides the browser's bar
    with `scrollbar-width: none`; with Simple UI it is back, and the bars are hidden.
  - The loading screen waits for the scroll bar's pictures too, as they are in a style sheet.
- **GitHub.** The file check in `.github/workflows/tests.yml` allows `css/*.css`, and no longer `style.css` or
  `script.js` in the main folder.
- **Tests.**
  - The new Test 53 opens the tree, marks an item and checks every bar: it is shown exactly when its list scrolls; it
    lies along the list's right edge inside the room kept for it and is as tall as the list; its pictures are the
    `_x1` or `_x2` ones of the screen, each the whole picture of its state, in its own proportions (taken from the
    pictures' own sizes) and no part wider than another; and the knob sits where the list is scrolled to. It also
    checks that the tree is as wide with its bar as without, that the down arrow and the wheel over the bar scroll,
    that Options and the language list follow the same rules, and that with Simple UI no bar shows and the browser's
    own bars are back. Tests 53 to 99 are now Tests 54 to 100: the suite has 100 tests, the most Rule 17 allows.
  - Tests 82, 85 and 87 read every style sheet `index.html` links (`styles()` in `js/tests/static.js`) instead of
    `style.css`, and Test 87 checks pictures' and fonts' addresses from the page's folder, so `../assets/` passes.
    Test 84 checks that the style sheets are in `css/`, that the scripts start from `js/script.js`, and that every
    other script is in `js/model/`, `js/view/`, `js/controller/` or `js/tests/`.
- **Mutation runs.** Test 53 fails, and no other test, with the browser's bar not hidden, with no room kept, with the
  `_x1` knob squared, with the body stretched instead of repeated, with a bar shown where nothing scrolls, with the
  knob kept at the top, and with the down arrow doing nothing; with bars shown with Simple UI, Test 47 fails too.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900. Over the debugging protocol in Chrome, and over WebDriver BiDi in headless Firefox, with a
  real mouse: both arrows and the knob show their three pictures, a pressed one stays pressed when the pointer leaves
  it, dragging the knob 100 pixels moves it 100 pixels, and the wheel over the bar scrolls the tree. Firefox hides
  its own bar and puts the game's along the tree's edge.
- **Documents.** `TESTS.md`: Test 53, the numbers of Tests 54 to 100, Tests 82, 84 and 85, and the lines of Tests 1,
  2, 47 to 52, 56 and 82 to 98. `MAINTAINER.md`: the files and folders, the diagram and the scripts, the style sheets
  in "Simple UI and the pictures", the scroll bars there and in Assets, and the rule on where a new script goes.
  `code_docu.pdf` is not updated (Question 2).

#### Questions

1. **Rule 2.** It says that all CSS is in `style.css`, and Rule 16 lifts only the part about JavaScript. The CSS is
   now in two files in `css/`, and `script.js` is in `js/`. Should Rule 16 cover the CSS too, for example: "Rule 2
   regarding all CSS in style.css and all JavaScript in script.js does not apply if the developer splits them into
   several .css or .js files"?
2. **`code_docu.pdf`.** It still names the old places of the scripts and does not describe `js/view/scrollbars.js`.
   It cannot be edited here; should it be made again?
3. **The report window.** The report of `?test` and `?update` keeps the browser's scroll bar, as it keeps Simple UI's
   look. Should it have the game's too?
4. **The bar's width.** 20 pixels is the `_x1` arrows' own size. Windows' own bars are 15 to 17 pixels, and the
   bar's room is taken from the tree's width. Is 20 the width wanted?

### The `_x2` cursors at half their size

#### What changed

- **Answers.** Of the questions in the entry before: Rule 16 now lifts Rule 2 for the CSS too (1); `code_docu.pdf` is
  not made again for now (2); the report window keeps the browser's scroll bar (3); the bar stays 20 pixels wide (4).
- **The `_x2` cursors.** `cursor_normal_x2.webp` and `cursor_pointing_x2.webp` are 48 by 48 and were drawn at 48 CSS
  pixels, which the browser enlarges by the screen's scale, so on a 1920 by 1080 screen at 200 % they came out 96 pixels
  wide. `css/pictures.css` now names them in `image-set(url("...") 2x)`, so they are drawn at half their size, 24 by 24
  CSS pixels: on a screen at 200 % that is the picture's own 48 pixels, and on a 3840 by 2160 screen at 100 % it is 24.
  The scroll bar's `_x2` pictures are drawn at half their size the same way. The `_x1` cursors stay at their own 32 by
  32, and every cursor keeps its point at `0 0`.
- **The tooltip.** It starts at the cursor's bottom-right corner, so `--reach` on `.tip` is now 24 with the `_x2`
  cursors instead of 48.
- **Browsers.** Chrome and Firefox 159 both keep the rules and give them back as `image-set(url("...") 2dppx) 0 0,
  auto`. A browser without `image-set()` in `cursor` drops the two declarations, and the `_x1` cursors are shown at 32
  pixels instead.
- **Tests.** Still 100. Test 47 now requires the `_x2` cursors in `image-set()` at 2x, and Test 49 the tooltip 24 pixels
  from the pointer with them.
- **Mutation runs.** With the `_x2` sword named in `url()` alone, Test 47 fails, naming `html.pictures`, `<body>` and
  the header; with `--reach` back at 48, Test 49 fails. No other test fails in either.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800 by
  1100 and 500 by 900, which use the `_x1` cursors. Over the debugging protocol, with the screen emulated as 3840 by
  2160 at 100 % and as 1920 by 1080 at 200 %, which use the `_x2` ones, all 100 pass too once focus is emulated. Without
  it, Test 34 fails, as the page never has focus there, and it fails the same with an emulated 1920 by 1080 screen at
  100 % and the `_x1` cursors. A headless browser draws no cursor, so the size on screen was not seen; it follows from
  `2x`.
- **Documents.** `TESTS.md`: what Test 47 expects. `MAINTAINER.md`: the cursors and the tooltip's `--reach` in Assets.

#### Questions

1. **A 4K screen at 100 %.** The `_x2` cursors are picked by the screen's size in device pixels, so a 3840 by 2160
   screen at 100 % gets them too, and its cursor is now 24 pixels, smaller than the 32 of the `_x1` cursors on a 1920 by
   1080 screen. On a screen at 200 % it is 48 pixels, the picture's own size. Is the smaller cursor at 100 % wanted, or
   should such a screen keep the `_x2` cursors at their own size?

### `code_docu.pdf` made again

#### What changed

- **`code_docu.pdf`**, 64 pages, made again for the code as it now stands: 21 chapters, one per file, in the order
  `index.html`, `css/base.css`, `css/pictures.css`, `js/script.js`, the scripts in `js/model/`, `js/view/`,
  `js/controller/` and `js/tests/`, then `data.json` and `locales/de.json`; 356 functions and the object `choices`.
  The descriptions of the old PDF were kept where they still held, and written anew where the code had changed.
- **Chapters.** Each names the folder its file is in, its number of lines, and what it imports and what imports it.
  `index.html` and both style sheets are described in parts, each with its lines.
- **Subchapters.** Each function's gives the lines it takes up, whether it is exported, what it does, and two lists:
  first the functions that call it, then the functions it calls, grouped by file. A function handed on to be called later
  counts as called by the one that hands it on, and a script's top-level code is named where it is the caller.
- **Links.** Every mention of a file or function outside its own heading links to its chapter or subchapter: in the
  text, the lists, the contents, the UML diagram and the index, 3,340 links in all. Other files of the repository,
  such as `RULES.md`, link to their page on GitHub.
- **Page header.** Each page names its chapter at the top left, and gives its number at the bottom right.
- **UML diagram.** On a page of its own between the contents and the first chapter. That page is A3, as on A4 its
  names came out at about 5 points. Each box links to its chapter, and each name in it to its subchapter.
- **`data.json`.** One page: how the file is laid out, and a table of its keys with their lines and what is there,
  the parts of `icons` and `text` included. `locales/de.json` follows on a page of its own, for every file in
  `locales/`.
- **Contents and index.** The contents give each chapter's folder, its number of parts, functions or keys, and its
  page. The index at the end lists every chapter and function in alphabetical order, one to a line, each with its
  page and a link.
- **How it was made.** Chrome printed it from a page built outside the project. The functions, their lines and the
  calls between them were read from the scripts with a JavaScript parser, and the UML diagram was drawn from the one in
  `MAINTAINER.md`. The page numbers were taken from a first printing and stayed the same in a second. The PDF's objects
  were then packed into compressed streams, which took it from 4.0 MB to 1.3 MB without changing a page. It is tagged,
  with a bookmark for every chapter. None of this is in the project, as Rules 13 to 15 and the CI check of allowed
  files leave no room for it.
- **Checked.** Every link leads to a named place in the PDF; every page from the first chapter to the index names the
  chapter it is in; the page numbers in the contents and the index are those where each section starts; the
  `data.json` chapter takes one page.
- **Documents.** `MAINTAINER.md`: what `code_docu.pdf` holds.

#### Questions

1. **The PDF's sources.** The page the PDF is printed from and the descriptions of the functions are not kept in the
   project, so the next time it is made they have to be read back from the PDF or written again. Should they be kept
   somewhere, such as outside the repository, or is making it again from the PDF each time wanted?
2. **The A3 page.** The UML diagram is the only page that is not A4. Is that wanted, or should it be A4 with smaller
   names, or spread over two pages?

### The test scripts end in `_test.js`

#### What changed

- **Rule 29.** `js/view/pictures.js` and `js/tests/pictures.js` had the same name. Every script in `js/tests/` now ends
  in `_test.js`: `run_test.js`, `helpers_test.js`, `static_test.js`, `behaviour_test.js`, `interface_test.js`,
  `pictures_test.js` and `audit_test.js`. Their imports of each other, and the two imports of `run_test.js` in
  `js/script.js`, were changed to match. Nothing else in them changed but Test 84.
- **Test 84** now also requires every script in `js/tests/` to end in `_test.js`, and no two of the files it reads,
  the scripts and the style sheets, to share a name. Still 100 tests.
- **CI.** The check of allowed files took scripts as `js/([a-z]+/)*[a-z]+\.js`, which has no room for `_`. It now
  takes scripts of letters only in `js/`, `js/model/`, `js/view/` and `js/controller/`, and `js/tests/[a-z]+_test\.js`.
- **Mutation runs.** With `pictures_test.js` named `pictures.js` again, Test 84 fails, naming `js/tests/pictures.js`
  and two files named `pictures.js`. With `js/view/report.js` renamed to `js/view/model.js`, Test 84 fails, naming two
  files named `model.js`. No other test fails in either.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800 by
  1100 and 500 by 900. The CI checks of allowed files and of files per folder pass on the files as they now are.
- **Documents.** `TESTS.md`: the new names in every File residence, the lines of the tests in `static_test.js`, which
  moved down by two or three, and the purpose and expectation of Test 84. `MAINTAINER.md`: the table of test files,
  and a line on Rule 29 in Rules for changing the code. `code_docu.pdf` made again, with the new names and lines.
  Older entries of this log keep the names of their time.

#### Questions

1. **Rule 29 in `assets/`.** Outside `assets/`, no two files now share a name. Inside it, 85 names repeat: the tree's
   icons are named by their number in each kind's folder, such as `1.png` in both `icons/nodes/building/` and
   `icons/nodes/unit/`, and `options_sd.webp` and `options_4k.webp` are in both `ui/backgrounds/` and `ui/buttons/`.
   Should Rule 29 hold for `assets/` too, as Rule 26 leaves it out? If so, the pictures need new names, and CI could
   then check the whole repository for repeated names; such a check would fail until then.
2. **Names that differ only in their ending.** `css/pictures.css` and `js/view/pictures.js` are taken as different
   names under Rule 29, as their endings differ. Is that how the rule is meant?

## 2026-10-31

### 00:30:03: the `_x2` cursors at two thirds of their size

#### What changed

- **The `_x2` cursors.** `css/pictures.css` now names them in `image-set(url("...") 1.5x)`, so the 48 by 48 pictures
  are drawn at two thirds of their size, 32 by 32 CSS pixels, as large as the `_x1` cursors. On a screen at 150 %
  that is the picture's own 48 pixels. They were drawn at half, 24 by 24. With this, the smaller cursor that question
  1 of the entry on the `_x2` cursors at half their size asks about is gone: a 3840 by 2160 screen at 100 % now shows
  a cursor of 32 pixels.
- **The tooltip.** It still starts at the cursor's bottom-right corner. As both cursors are now 32 pixels, `--reach`
  is 32 with both, and the rule that gave the `_x2` cursors their own `--reach` is removed. Test 49 expects 32 with
  both.
- **Test 47** expects the `_x2` cursors at `1.5x`. In `strayCursors()`, the variable that holds this is named
  `density`, after what it holds, and the line that uses it is split in two to stay within 120 characters (Rule 24).
  The file keeps its number of lines, so no File residence in `TESTS.md` moved.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800 by
  1100 and 500 by 900, which use the `_x1` cursors; and over the debugging protocol, with focus emulated, on screens
  emulated as 3840 by 2160 at 100 %, 1920 by 1080 at 200 % and 2560 by 1440 at 150 %, which use the `_x2` ones. No
  mutation runs were made for this change.
- **Documents.** `TESTS.md`: what Test 47 expects. `MAINTAINER.md`: the cursors and the tooltip in Assets.
  `code_docu.pdf`: see the next entry.

### `code_docu.pdf` by folder

#### What changed

- **Chapters.** Each folder is now a chapter, and each file in it a subchapter: 1 the main folder (`index.html` and
  `data.json`), 2 `css/`, 3 `js/`, 4 `js/model/`, 5 `js/view/`, 6 `js/controller/`, 7 `js/tests/` and 8 `locales/`.
  Each function, and each part of the page, of a style sheet or of `script.js`, is a section numbered after both, such
  as 4.1.4 for `load()` in `datahandler.js`. A chapter opens with what its folder holds and a list of its subchapters;
  its first subchapter follows on the same page, and every other one starts a page.
- **Contents.** Every chapter and every subchapter has its own line with its page number; the subchapters are
  indented one level under their chapter.
- **Headers.** Each page names its chapter and its subchapter, such as "4 js/model/ › 4.1 datahandler.js".
- **Links and index.** Names of folders link to their chapters, as names of files and functions link to theirs. The
  index lists the chapters in bold, the subchapters, and the functions with their section numbers.
- **Bookmarks.** The PDF's bookmarks follow the chapters, subchapters and sections. Those of the earlier PDF named
  each chapter twice, such as "ContentsContents", and ran numbers into names; each is now written as its heading, such
  as "4.1.4 load(url)".
- **The cursors.** The descriptions of `css/pictures.css` and of `strayCursors()` give the `_x2` cursors at two
  thirds, and the parts of `css/pictures.css` from line 24 on are one line higher, as one rule was removed.
- **Checked.** 65 pages, 1.4 MB. Every page's header names the right chapter and subchapter; all 3,425 links have a
  target; and every page number in the contents and the index was read back from the PDF, and stayed the same when
  the PDF was made once more with them.
- **Documents.** `MAINTAINER.md`: how `code_docu.pdf` is laid out.

#### Questions

1. **Chapters beside the scripts' folders.** The main folder, `css/`, `js/` and `locales/` are chapters too, so that
   every file is still described, in the order the page uses them from `index.html` on; `js/model/` is thus chapter
   4. Should the four folders of scripts come first instead, or should the other files be left out?

### 00:48:46: the log in parts

#### What changed

- **The log in parts.** `DEVLOG.md` is now five files in `documentation/DEVLOG/`, `DEVLOG1.md` to `DEVLOG5.md`, none
  over 1000 lines (Rule 30). Days go into a part in order until the next would take it past 1000 lines; that day then
  starts the next part, whole (Rule 35): part 1 holds 18 and 19 October (644 lines), part 2 21 October (855), part 3
  22 to 24 October (996), part 4 25 to 27 October (930), and part 5 30 October on.
- **One entry a day.** Each day is one entry titled with its date (Rule 32); the entries made that day are its
  sub-sections, under their own titles, with their headings one level lower and their text unchanged. No time was
  logged before this day, so those carry none. The first sub-section of this day has 00:30:03, when it was written
  into the log; the second, written in the same minute, has none (Rule 33).
- **Contents.** Each part starts with a list of its days, each a link to its day (Rule 31), and a line linking to the
  parts before and after it and to `DECISIONS.md`.
- **Checked.** Every line of `DEVLOG.md` but the entries' headings is in the parts, in the same order, compared line
  by line; all lines end in CR LF.
- **Documents.** `.github/workflows/tests.yml` allows the parts. `MAINTAINER.md`: the documentation folder, and where
  to record a change.

#### Not done

- `DECISIONS.md` (Rule 34) is not written yet; the parts already link to it.

#### Questions

1. **Rule 26 and the parts.** At the log's pace, about 3,600 lines in two weeks, `documentation/DEVLOG/` will need an
   eighth part within weeks, more files than Rule 26 allows. Should the folder be exempt, as `assets/` and
   `locales/` are?
2. **Rule 8** still names `DEVLOG.md`. It is read as naming the log, in whichever part.

### 01:42:40: `DECISIONS.md`

#### What changed

- **`DECISIONS.md`.** As the log is now more than one file, `documentation/DECISIONS.md` lists its decisions (Rule
  34), by subject: rules and how they are read, data and languages, marking, the tree's shape, variants, layout and
  controls, pictures and Simple UI, code and files, tests, and documents. Each decision ends with the day it was made,
  and the time where the log has one, as a link to its entry in its part. Where a later decision replaced an earlier
  one, the earlier one is named after it, with its own link. This does what the entry before left undone.
- **Checked.** Every link in `DECISIONS.md` leads to a heading of the part it names, and every entry it names was
  found by its day and title.
