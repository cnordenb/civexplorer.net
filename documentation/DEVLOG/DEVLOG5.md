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

### 12:47:21: `TERMINOLOGY.md`

#### What changed

- **`TERMINOLOGY.md`.** `documentation/TERMINOLOGY.md` defines 49 of the project's terms, one a line, each line at
  most 120 characters and in lower case except where it quotes the page. No line uses a term that is defined below
  it. The terms run from the input panel and its nodes through marking, the output panel, the filters and the
  variants to Options, Simple UI, the pictures and the updater's parts of `data.json`.
- **Checked.** A script checked every line's length, its case and the order of the terms it uses.
- **Rule 26.** `documentation/` now holds seven files, as many as Rule 26 allows.

### The language menu as the game's combo box

#### What changed

- **The box.** Without Simple UI, the language menu in the Options window no longer shows `button_sd.webp` or
  `button_4k.webp`. It is `combobox_background.webp` in its own proportions, 290 by 35 pixels, or narrower in a
  narrow window, with its caption in bold Georgia, `#391c1b`. At its right end is an arrow from
  `combobox_arrow_atlas.webp`, which holds two rows, up and down, of three columns, normal, under the mouse and
  pressed: down while the list is closed, up while it is open. Both pictures come in one size, used on 4K screens too.
- **The list.** It opens right below the box, as wide as the box with its outline included, in place of the grid of
  button pictures: the languages in one column, in bold Georgia, `#391c1b`, the chosen one `#ab1c1b` and the one
  under the mouse `#399c9a`, on `#d7b394`, within a `#201819` outline of 1 pixel, 2 on a 4K screen. It is as high
  as its languages, down to the bottom of the settings' room at most, and scrolls with the game's scroll bar, whose
  room it keeps at its right. The settings still hide while it is open. A language's focus outline is `#201819`.
- **How.** The rules for the button picture in `css/pictures.css` leave out the language menu (`.language .tool`),
  and new rules there draw the box, its arrow, the list and the languages. Nothing changes with Simple UI.
- **Measured.** Each arrow is 35 by 28 pixels with transparent margins, the pressed ones one pixel lower, and sits at
  the box's right end, centred from top to bottom. The box's frame is about 5 pixels wide, and its inside is
  `#d7b394`, as the list is.
- **Checked.** In Chrome at 1280 by 800, at 1920 by 1080 on a 4K screen, where the outline is 2 pixels, and at 390 by
  844, where the box is 226.5 by 27.3 pixels and the list as wide. Test 51 now also checks the box, its arrow closed
  and open, the list one column right below the box and as wide, its outline and colours, and the languages' colour,
  font and lack of a picture. With the button picture put back on the menu, Test 51 failed. All 100 tests pass in light
  colours at 1920 by 1080 and in dark colours at 1280 by 800 and 500 by 900.
- **Documents.** `TESTS.md`: Test 51, and the lines of Tests 52 and 53. `MAINTAINER.md`: the language menu with the
  pictures, and its pictures under Assets.
- **Replaced.** The language menu and its choices as the button picture
  ([2026-10-21](DEVLOG2.md#game-buttons-with-trajan-pro)), and the open list's thin `#391c1b` border without a
  background of its own ([2026-10-21](DEVLOG2.md#the-options-window-on-its-own-parchment)). Commit `15a0c86` has
  both.

#### Not done

- `code_docu.pdf` does not yet describe the new rules in `css/pictures.css` or `comboProblems()` in
  `js/tests/helpers_test.js`, and the lines it gives below the changes in those files and in
  `js/tests/pictures_test.js` are out of date.

#### Questions

1. **Under the mouse.** The chosen language turns `#399c9a`, not `#ab1c1b`, while the mouse is over it. Should the
   chosen colour win instead?
2. **The closed box.** Its caption is `#391c1b`, the list's normal colour, and stays so under the mouse, where only
   the arrow changes. Is another colour wanted?
3. **The settings.** As before, they hide while the list is open, rather than staying in sight under it, as they
   would below a traditional combo box. Should the list lie over them instead?

### 12:56:48: the combo box's arrow sizes, and the settings in sight

#### What changed

- **The arrow.** It no longer grows with the box. It is 35 by 28 pixels on a 4K screen, the size of each picture in
  `combobox_arrow_atlas.webp`, and 19 by 14 on others, still at the box's right end, centred from top to bottom.
  19 by 14 is not quite in the picture's proportions, so the arrow is squeezed a little more across than down.
- **The settings stay in sight.** With the pictures, the settings no longer hide while the language list is open.
  The list lies over them, and its scroll bar over the list: `z-index` 1 and 2 in `css/pictures.css`, as the list
  comes before the settings in the page and would otherwise be drawn under them. With Simple UI the settings still
  hide, as the list there is a grid in their place: `setMenu()` in `js/controller/optionshandler.js` hides them
  only then.
- **Checked.** In Chrome at 1920 by 1080, on a full-HD screen (an arrow of 19 by 14) and on a 4K one (35 by 28), with
  the settings in sight around the open list. Test 51 now checks the arrow's size and place, and that the open list
  and its bar are on top with the settings in sight; with the settings hidden again, Test 51 failed. To measure the
  list's bar, the check waits a frame after opening the list, and one before it, so that the `close` event of an
  earlier `reset()` does not shut the list in between. All 100 tests pass in light colours at 1920 by 1080 and in
  dark colours at 1280 by 800 and 500 by 900.
- **Documents.** `TESTS.md`: Test 51. `MAINTAINER.md`: the arrow's sizes and the list over the settings.
- **Answers.** Of the questions in the entry before: the list now lies over the settings (3). Questions 1 and 2 are
  open.
- **Replaced.** The arrow as a share of the box's width, and the settings hidden while the list is open, of the entry
  before. Commit `15a0c86` has the settings hidden, with the old look.

#### Not done

- `code_docu.pdf`, as in the entry before.

### 13:03:07: the 4K arrow in the screen's own pixels

#### What changed

- **The arrow on 4K screens.** It was 35 by 28 CSS pixels, which a 4K screen at a scaling of 200 % draws as 70 by 56
  of its own pixels, twice the picture's size. It is now 35 by 28 of the screen's own pixels: 17.5 by 14 CSS pixels at
  200 %, and 35 by 28 at 100 %. On other screens it stays 19 by 14 CSS pixels.
- **How.** As the page works out its pictures' size from the screen, `setSimple()` in
  `js/controller/optionshandler.js` also sets `--pixel` on `<html>`, one screen pixel in CSS pixels, from
  `devicePixelRatio`, once, as `data-assets` is. `css/pictures.css` sizes the arrow on 4K screens as 35 and 28
  times `--pixel`.
- **Checked.** In Chrome at 1920 by 1080, on a 4K screen at 200 % (an arrow of 17.5 by 14 CSS pixels, 35 by 28 in the
  screenshot's pixels) and on a full-HD one (19 by 14). Test 51 expects 35 by 28 divided by `devicePixelRatio` on
  4K screens; the tests' Chrome has a small screen, so it checks the 19 by 14. All 100 tests pass in light colours at
  1920 by 1080 and in dark colours at 500 by 900.
- **Documents.** `TESTS.md`: Test 51. `MAINTAINER.md`: `--pixel`, and the arrow's sizes.
- **Replaced.** The 4K arrow at 35 by 28 CSS pixels, of the entry before.

#### Not done

- `code_docu.pdf`, as in the entries before.
### 13:43:37: tooltips on every control, civilisations in a new tab, and the combo box in its corner

#### What changed

- **The combo box's place.** Without Simple UI, the language box and its list sit at the right of the Options
  window's panel, as far from the panel's right edge as from its top edge: 17 pixels, the panel's margin around the
  window's grid. In a window less than 588 pixels high the panel takes in the title too, so the box sits the title's
  height and the gap below it (`--lid`) further in, 52 pixels from both edges. `css/pictures.css` puts both at the end
  of their column, with that margin below 588 pixels and none from 588 up.
- **The label.** It reads "Language:" in English and ends with a colon in every language, with Simple UI too: after a
  no-break space in French, full-width in Chinese and Japanese (`language` in `data.json` and `locales/`).
- **Tooltips.** Without Simple UI and with **Tooltips** ticked, every control now has a tooltip, not only the tree's
  items and **Include Unique and Universal**: the cogwheel, **Find** and its cross, **Clear**, **Expand all** and
  **Collapse all**, each branch's arrow and each group's name (to open or close it), the chips of **Filters**, the
  language box and each language, the other settings, both civilisation views, **Cancel**, **OK**, and each part of a
  scroll bar. Each says what a click does, as "Click to clear all nodes and reset filters" on **Clear**, in at most
  100 characters; the longest in any language has 83. The footer's links show their address, as the civilisations'
  links already did. 22 new texts, `optionsTip` to `knobTip`, are in `data.json` and the 16 language files.
- **How.** Each control in `index.html` and its templates names its text with `data-tip`. `tipFor()` in
  `js/view/pictures.js` takes a tree item's text first, then the nearest `data-tip`, then a branch's text to open or
  close it, then a link's address. Include's description now comes through `data-tip` too, in place of its own line in
  `tipFor()`. A branch's arrow has no tooltip while the branch is locked, as a click does nothing then.
- **Civilisations in a new tab.** A civilisation's link opens its page on aoe2techtree.net in a new tab
  (`target="_blank"`, with `rel="noopener"`), from `civTemplate` in `index.html`. The footer's links are unchanged.
- **Checked.** Test 49 now moves the mouse over every control and link in sight, with every branch open, a filter
  and text in **Find**, then in Options, then with the language list open, and wants a tooltip of at most 100
  characters on each, and a link's address on a link (Include's description may be longer). Test 51 also wants the
  box as far from the panel's right edge as from its top. `hover()` moved from `js/tests/pictures_test.js` to
  `js/tests/helpers_test.js` for the check. With **Clear**'s `data-tip` taken out, Test 49 failed; with the footer's
  links left out of `tipFor()`, too; with the box back at the left of its column, Test 51 failed. All 100 tests pass
  in light colours at 1920 by 1080, 1000 by 1000 and 1000 by 720 (984 by 569, where the panel holds the title), and
  in dark colours at 1280 by 800, 720 by 1280 and 500 by 900. Screenshots at 1920 by 1080, on a full-HD and a 4K
  screen, show the box in its corner and the tooltips of the box, **Clear** and a footer link.
- **Documents.** `TESTS.md`: Tests 49 and 51, and the lines of Tests 48 to 53. `MAINTAINER.md`: the tooltips, the
  civilisations' new tab, and the box's place and label. `DECISIONS.md`.

#### Not done

- `code_docu.pdf`, as in the entries before; it lacks `tipFor()`'s new lines, `panelGaps()` and `tipGaps()`.
- The report window of `?test` and `?update` has no tooltips: it is a tool in English with Simple UI's look.
- The new texts in the 16 other languages have not been proofread.
- **Runs that stop early.** On this machine about one run of the tests in seven, in headless Chrome, came back
  without a report, with the new check and without it. Chrome's virtual time (`--virtual-time-budget=900000`) runs on
  while the page waits for a frame: one `painted()` in Test 51 or Test 53 then takes about 100 seconds of it, with
  no timer of the page's own in between, and a few of those use up the 900. Turning off Windows' window occlusion
  (`CalculateNativeWinOcclusion`) changed nothing. Whether CI's Chrome on Linux does the same was not tried.
- **Test 53 in a low window.** Below 500 pixels high the content scrolls as a whole and the tree does not, so Test 53
  fails with "the tree has no bar", at 1000 by 560 and 1000 by 640, with the new check and without it. CI's windows
  are all higher.

#### Questions

1. **Requirement 8.** It names the menu's label "Language", which is now "Language:". `REQUIREMENTS.md` is left as it
   is. Should requirement 8 read "Language:"?
2. **The low window.** Below 588 pixels high the box is 52 pixels from the panel's right edge, as far as from the
   panel's top above the title. Would 17 pixels, as in a higher window, be better there?
3. **The footer's links.** They still open in the same tab. Should they open in a new tab too?
4. **Runs that stop early.** Should the tests wait for frames less, or CI give Chrome more virtual time?
### 13:54:31: the combo box's arrow further in, and the language list's own scroll bar

#### What changed

- **The combo box's arrow.** It sits 2 pixels in from the box's right end, and on a 4K screen 4 of the screen's own
  pixels in (4 times `--pixel`, the unit of the arrow's size there), rather than at the very end.
- **The language list's scroll bar.** Its arrows are the combo box's own, from `combobox_arrow_atlas.webp`, at the
  box's arrow's size, 19 by 14 pixels, on a 4K screen 35 by 28 of the screen's own, centred on the 20-pixel bar; the
  bar's body takes the room they leave. Its arrows and knob show only their normal picture, under the mouse and while
  pressed too. The other bars are unchanged.
- **No smooth scrolling in the list.** The browser scrolls a list smoothly under the mouse wheel. Without Simple UI
  the language list now scrolls at once by the wheel's step, as its bar already did: `js/view/scrollbars.js` handles
  the wheel over the list itself (`STEPPED`). With Simple UI the browser scrolls it as before.
- **Tests.** Test 51 wants the arrow 2 pixels in, or 4 screen pixels on a 4K screen. Test 53 wants the combo box's
  arrows on the language list's bar, at the box's arrow's size and centred, and a turn of the wheel over the list to
  scroll it at once. `comboArrow()` in `js/tests/helpers_test.js` holds the arrow's sizes for both.
- **Documents.** `TESTS.md`: Tests 51 and 53, and the lines of Tests 48 to 53. `MAINTAINER.md`: the arrow's place,
  and the language list's bar. `DECISIONS.md`.
- **Replaced.** The arrow at the box's very end, of the entries before.

#### Not done

- The tests were not run for this entry; the changed scripts parse.
- Page Up and Page Down with a language focused still scroll the list the browser's way, smoothly where it does.
- Nothing checks that the list's arrows and knob keep their normal picture under the mouse: a script cannot put the
  mouse over them.
- `code_docu.pdf`, as in the entries before.

#### Questions

1. **The 4K inset.** 4 pixels is read as 4 of the screen's own pixels, the unit of the 4K arrow's size: 2 CSS pixels
   at a scaling of 200 %. Were 4 CSS pixels meant?
2. **The list's bar arrows.** They are the box's arrow's size, 19 by 14 on a bar 20 wide, rather than stretched to
   fill the bar's width. Is that the size wanted?
### 13:59:17: seven languages in sight, a language at a time

#### What changed

- **Seven languages.** Without Simple UI, the open language list is seven languages high, its outline added, rather
  than as high as the settings' room: each language is a line of text and 8 pixels high (`--entry` in
  `css/pictures.css`), and the list `7 * var(--entry)` with its outline (`--edge`, 1 pixel, 2 on a 4K screen). In a
  window too low for seven, the settings' room still caps it.
- **A language at a time.** A turn of the mouse wheel over the list or its bar, or a click on one of the bar's arrows,
  scrolls the list by one language, whatever the wheel's step; a click beside the knob scrolls by six, a page less one.
  `js/view/scrollbars.js` takes a language's height as the step of the list (`line()` in `wire()`) with the pictures,
  and `LINE` elsewhere. The list snaps to a whole language at its top (`scroll-snap-type`), so dragging the knob also
  moves it a language at a time. With Simple UI nothing changes.
- **Tests.** Test 51 wants the open list to show exactly seven languages. Test 53 turns the wheel by 100 pixels over
  the list and wants it one language further down.
- **Documents.** `TESTS.md`: Tests 51 and 53, and the lines of Tests 49 and 51 in `js/tests/helpers_test.js`.
  `MAINTAINER.md`: the list's height and its steps. `DECISIONS.md`.
- **Replaced.** The list as high as the settings' room, and its wheel scrolling by the wheel's own step, of the entries
  before.

#### Not done

- The tests were not run for this entry or the one before; the changed scripts parse.
- Page Up and Page Down with a language focused, and a touchpad's small wheel steps, are not changed to whole
  languages beyond what the snapping does; on a touchpad each small step moves a whole language.
- `code_docu.pdf`, as in the entries before.

#### Questions

1. **A page.** A click beside the knob scrolls by six languages, keeping the last one in sight. Should it be seven, or
   one, as the arrows?
### 14:07:50: the Options panel's contents 60 pixels from its sides

#### What changed

- **The margins.** Without Simple UI, the Options window's contents keep 60 pixels from the panel's left and right
  edges, and on a 4K screen 120 of the screen's own pixels (`--side` in `css/pictures.css`, 120 times `--pixel`),
  rather than 17. The panel keeps its place and size: its sideways margin around the window's grid is now `--side`,
  and the window's padding at the sides one pixel less, its border making up the pixel. Its top and bottom are
  unchanged. In a window less than 588 pixels high, where the panel also holds the title and the buttons, they keep
  the same margins.
- **The box.** `combobox_background.webp` is now 219 by 35 pixels, shorter than the 290 before. The box and its list
  are 219 pixels wide, or narrower in a narrow window, and the caption's margins and size are reckoned in 219ths of
  the box. The box sits at the right of the contents, 60 pixels from the panel's right edge; it no longer keeps as far
  from that edge as from the panel's top, and `--lid` no longer moves it in a low window.
- **Tests.** Test 51 now wants the label and the settings 60 pixels, or 120 screen pixels on a 4K screen, from the
  panel's left edge, and the box and the settings as far from its right edge, and the box in 219 by 35 proportions.
  `panelGaps()` in `js/tests/helpers_test.js` measures the gaps to the panel's sides instead of to its top.
- **Documents.** `TESTS.md`: Test 51. `MAINTAINER.md`: the margins and the box's size and place. `DECISIONS.md`.
- **Replaced.** The box as far from the panel's right edge as from its top, of
  [13:43:37](#134337-tooltips-on-every-control-civilisations-in-a-new-tab-and-the-combo-box-in-its-corner), and the
  contents 17 pixels from the panel's sides.

#### Not done

- The tests were not run for this entry or the two before; the changed scripts parse.
- `code_docu.pdf`, as in the entries before.

#### Questions

1. **4K.** 120 pixels is read as 120 of the screen's own pixels, 60 CSS pixels at a scaling of 200 %, as with the
   arrow's inset. Were 120 CSS pixels meant?
2. **Low windows.** The title and Cancel and OK, inside the panel there, keep the same 60 pixels. Is that wanted?
### 14:14:36: the tooltips of the language box and Find, and tooltips that follow a click

#### What changed

- **The language box.** Its tooltip is now the same as each language's in its list: "Select a language". Both name
  `languageTip`; `languageOptionTip` is gone from `data.json` and the 16 language files.
- **Find.** Its tooltip now reads "Search for a unit, technology, or building. If you cannot find what you are looking
  for, enable Regionals or Universal and Unique in Options.", 140 characters, over the 100 the other tooltips keep.
  The other languages name the two settings as their own texts do; German keeps to the infinitive of its other
  tooltips rather than choosing between du and Sie.
- **After a click.** The tooltip changed only when the mouse moved, so after a click on **Expand all** it still said
  "Click to expand all nodes" over **Collapse all**, and a branch's arrow kept its old text. `wireTip()` in
  `js/view/pictures.js` now remembers where the mouse is and, after every click, works the tooltip out again for what
  is under it (`elementFromPoint`). The tooltip moves into an open window only when it shows, no longer while hidden.
- **Tests.** No new checks. Test 49's limit of 100 characters now leaves out Find as well as Include.
- **Documents.** `TESTS.md`: Test 49. `MAINTAINER.md`: the tooltips. `DECISIONS.md`.
- **Replaced.** "Click to choose a language" on the box, "Click to select this language" on each language and
  "Type to find buildings, units and technologies" on Find, of
  [13:43:37](#134337-tooltips-on-every-control-civilisations-in-a-new-tab-and-the-combo-box-in-its-corner).

#### Not done

- The tests were not run for this entry or the three before; the changed scripts parse.
- No test checks the tooltip after a click, or the new texts.
- The new texts in the 16 other languages have not been proofread.
- `code_docu.pdf`, as in the entries before.
### 14:16:57: Include's tooltip worded as the other settings'

#### What changed

- **Include's tooltip.** Without Simple UI, **Include Unique and Universal** showed its whole description as its
  tooltip. It now says what a click does, worded as **Include Regionals**' does: "Click to show or hide unique and
  universal units, buildings and technologies" (`includeTip`, after `simpleTip` in `data.json` and the 16 language
  files; the longest, in German, has 95 characters). Each language follows its own `regionalTip` and names the
  setting as its `includeAll` does.
- **The description.** It stays in the page: Simple UI shows it under the box as before, and without Simple UI it is
  hidden as before, while the box still names it with `aria-describedby`, so screen readers read it.
- **Tests.** Test 49 now wants `includeTip` over Include, the description hidden and still named by the box; its
  limit of 100 characters now leaves out only Find.
- **Documents.** `TESTS.md`: Test 49. `MAINTAINER.md`: the tooltips. `DECISIONS.md`.
- **Replaced.** The Include description as Include's tooltip
  ([2026-10-21](DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip)).

#### Not done

- The tests were not run for this entry or the four before; the changed scripts parse.
- The new texts in the 16 other languages have not been proofread.
- `code_docu.pdf`, as in the entries before.

#### Questions

1. **Requirement 8.** It asks for a description of the checkbox's effect in the Options window. Without Simple UI the
   description now shows nowhere on screen, only to screen readers. Should it show again, as text under the box or
   in the tooltip?
