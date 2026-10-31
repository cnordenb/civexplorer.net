# Development log, part 3

- [2026-10-22](#2026-10-22)
- [2026-10-23](#2026-10-23)
- [2026-10-24](#2026-10-24)

Part 3 of the development log. It follows [part 2](DEVLOG2.md) and goes on in [part 4](DEVLOG4.md). The decisions made
in the log are listed in [DECISIONS.md](../DECISIONS.md).

## 2026-10-22

### Compliance with RULES.md and REQUIREMENTS.md, and js/ui.js split in three

Goal: make the project compliant with `RULES.md` and `REQUIREMENTS.md`, with every test passing, without stopping
for questions, and with `js/ui.js` split into `js/nodetree.js`, `js/stringbuilder.js` and `js/optionshandler.js`.
Nothing was committed. Questions are at the end of this entry.

#### What changed: the code (Rules 23 to 26)

- **`js/ui.js` is now three scripts**, as suggested. `js/ui.js` had 400 lines of code, the limit.
  - `js/stringbuilder.js` (68 lines of code) writes the page's text: the fixed texts, the texts of the chosen
    language, the tree's names, the list of civilisations and **Filters**. It also holds `$()` and `clone()`.
  - `js/nodetree.js` (221) looks after the tree: drawing its rows, opening them, their counts, marking with clicks,
    touch and keys, Find, and the buttons above it.
  - `js/optionshandler.js` (142) looks after the Options window: the language menu, the Include boxes, Simple UI and
    the tab icon, and starts the page with the visitor's saved choices.
  - The scripts use each other in one direction only: `datahandler.js`, then `model.js`, `stringbuilder.js`,
    `nodetree.js` and `optionshandler.js`, each using only those before it. So that the lower scripts need not ask
    `optionshandler.js` whether Simple UI is on, the variable `simple` became the function `simple()`, which reads
    the `pictures` class on the page, the one switch that already shows the pictures.
  - The rule test that kept page code in `ui.js`, `report.js` and `pictures.js` now checks the other way round:
    `script.js`, `datahandler.js` and `model.js` never touch the page. A new script that does is then allowed
    without changing the test.
- **No function over 60 lines of code (Rule 23).** `wireTree()` (90) became a handler per kind of event and
  `startTree()`. `pictureTests()` (127) became eleven functions, and moved with them into a new
  `js/tests/pictures.js`, as `js/tests/interface.js` would otherwise have passed 400 lines of code. `audit()` (73)
  became one function per group of checks. `refresh()` in the updater (60, at the limit) became `gather()`,
  `translate()`, `compare()` and `refresh()`, and `runTests()` (59) became `prepare()`, `rounds()`, `restore()` and
  `runTests()`.
- **No line of a script over 120 characters (Rule 24).** 165 lines were wrapped or rewritten, in every script.
  The three long lines of `.github/workflows/tests.yml` were wrapped too, as its steps are code.
- **Folders (Rule 26).** `js/` and `js/tests/` hold 7 files each, the most allowed. `favicon.ico` moved into
  `assets/images/` (see Req. 33 below), so the main folder holds 7 files instead of 8.
- **The updater is unchanged in what it does.** Its output was checked twice: run against aoe2techtree.net before and
  after, it wrote byte for byte the same 17 files; and the old and new `refresh()` were run side by side on changed
  data (a civilisation added and one removed, changed availability, a new icon, renamed items, an item left out of
  the tree, missing texts, a duplicate and an unknown item), giving the same messages and files.

#### What changed: requirements

`REQUIREMENTS.md` describes the page without exceptions for the pictures, and Rule 20 makes it the definition of
the page. Several things decided for the pictures on 2026-10-21 differed from it, and so did a few things in Simple
UI. They now follow `REQUIREMENTS.md`. Each one can be put back from commit `fa11988` if `REQUIREMENTS.md` is changed
to allow it.

- **Req. 2, the title.** With the pictures on, the title was "Civ Explorer". It is now the full sentence in every
  mode, on two balanced lines in the title frame. Below 720 pixels wide the frame is too small for it, so there the
  title stands on the parchment without its frame. `titleShort` is gone from all 17 languages.
- **Req. 3, the tree pane.** With the pictures on, the Find box came first, its "Find" label was hidden and the
  legend was left out. The order is now as Req. 3 lists it in every mode: title and buttons, Find with its label, the
  legend, the tree. The Find box is still 325 pixels wide where the pane allows.
- **Req. 8, the description of Include.** With the pictures on, it only showed as a tooltip. It now shows under the
  box in every mode, and the tooltip stays. The Options window is 32rem tall instead of 30rem, so that the bold
  Georgia text fits without a scroll bar.
- **Req. 14, 23 and 26, the marks.** The checkbox pictures have a red tick and a gold cross, and Simple UI drew a
  white tick on a green box, a white cross on a red box and a black dash on a white box. The requirements ask for a
  green tick, a red x and a white dash. `style.css` now draws them in every mode: a green tick and a red cross on
  the box, and a white dash on a dark box (`--dash`) with Simple UI. With the pictures on, they are drawn over the
  sheet's empty row with a thin black edge; the sheet's ticked and crossed rows are no longer used. Contrast stays
  above 3:1 in light and dark colours.
- **Req. 20, yellow.** Find's highlight was a dark olive (`#3d3400`) in dark colours and amber with the pictures. It
  is now `#fff0a0` in both colour schemes, and a clear yellow with the pictures. In dark colours a found row takes
  the light colours, so its text, count, box and focus ring keep their contrast on yellow; the audit passes with
  Find on in both schemes.
- **Req. 10, English by default.** On a first visit the page chose the browser's language. It now starts in English
  unless the address (`?lng=`) or an earlier choice says otherwise. This also answers question 5 of 2026-10-18.
- **Req. 12, the language list closes on a click.** A click between two languages, in the list's gaps, left it
  open. Any click in it or outside it now closes it. A click on its own scroll bar does not, so that it can still be
  scrolled: Chrome sends a click for that too. The list can now take focus (`tabindex="-1"`, not in the Tab order);
  before, a click on its scroll bar moved focus away and closed it at once.
- **Req. 24, "Full".** A fully marked building with nothing under it read just its name, and Stone Wall and Watch
  Tower read "Fortified Wall" and "Keep" through the `upgrades` flag. Every root and building node now reads "Full",
  such as "Full House" and "Full Watch Tower". The `upgrades` flag is gone from `data.json`, `js/model.js`, the tests
  and `MAINTAINER.md`.
- **Req. 27 with Req. 30, must lack on a line's last item.** X on the last item of a line marked only that item. It
  now also marks the items above it in the line that have as many civilisations, and X again clears them. X on Elite
  Champi Warrior marks the whole Champi line (4 civilisations each); X on Champion still marks only Champion (39,
  where Two-Handed Swordsman has 49). Must have is unchanged.
- **Req. 33, no images with Simple UI.** The tab icon is an image, and it was used with Simple UI too.
  `index.html` now gives the tab the empty icon `data:,`, and `js/optionshandler.js` puts the real icon in only while
  Simple UI is off, as for every other picture. The icon moved to `assets/images/favicon.ico`, named in `icons` in
  `data.json`, and the check of allowed files now lets ICO files into `assets/images/`.
- **Rule 18, Find.** Find scrolled the first match into view with `scrollIntoView()`, which also scrolls everything
  around the tree. In short windows, where the content scrolls as a whole, it moved the very box being typed in. Find
  now scrolls only the tree's own list (`reveal()`), and nothing in that layout.

#### Tests

- Still 97, numbered as before. New checks went into existing tests, and each was shown to fail when the old
  behaviour is put back in a copy of the project:
  - Test 10 checks the white dash, green tick and red cross (fails with the old white tick or the black dash);
  - Test 13 checks "Full" on a building heading a line and on one with nothing under it (fails with the old naming);
  - Test 17 checks must lack on the last item of a line of equal counts (fails without it);
  - Test 32 checks that Find's highlight is yellow (fails with olive), and Test 50 the same with the pictures (fails
    with amber);
  - Test 35 checks that a click in the language list closes it (fails with the old handler);
  - Test 37 checks English as the default with a German browser (fails with the old language choice);
  - Test 48 checks the full title and the tab icon with the pictures (fails with the short title);
  - Test 49 checks the drawn marks on every box with the pictures (fails with the sheet's red tick row);
  - Test 50 checks the tree pane's order, the legend, the Find label and the description under Include (each fails
    when hidden or reordered as before);
  - Tests 51 and 73 check that Simple UI uses no tab icon (both fail with the icon left on);
  - Test 84 checks that `index.html` starts with the empty tab icon and that the icon lives in `assets/images/`.
- Test 83 now reads "script.js, datahandler.js and model.js never touch the page", and Test 87 no longer knows the
  `upgrades` flag.
- The picture tests now take fresh sample items: the tree is rebuilt when Include changes, and items picked before
  that are no longer on the page.
- **Checked.** All 97 tests pass in Chrome 155 on Windows, in light and dark colours, with the four window sizes of
  the GitHub check (1920 by 1080, 1280 by 800, 800 by 1100 and 500 by 900, which headless Chrome on Windows shows as
  1904 by 929, 1264 by 649, 784 by 949 and 500 by 749). Both repository checks of the workflow were run on the file
  list as it will be committed: no file is refused and no folder is too full. They have not run on GitHub's Ubuntu.

#### Documents

- `TESTS.md`: the new wording of Tests 10, 13, 17, 32, 35, 37, 48 to 51, 73, 83, 84 and 87, and the files and lines
  of every test, worked out from the code. No field is over 120 characters.
- `MAINTAINER.md`: the new scripts and what each does, the diagram (drawn with Mermaid 10.9.1 to check it), the
  title, the checkboxes and their marks, the tree pane's order, the Find box, the tooltip over Include, the Options
  window and its language list, the tab icon, the marking rules of Step 4 without `upgrades`, and that `js/` and
  `js/tests/` are full.
- `code_docu.pdf`, rebuilt in its old form: it was last built on 19 October and still described `js/ui.js`, test
  frames and a page without pictures. It now has 35 pages and 19 chapters, one per file, covering all 259 functions
  of the current scripts, each in at most 240 characters, with page numbers and a clickable outline. A script
  checked that every function in the code has a text and every text a function. As before, the page it is printed
  from is not kept in the project.
- `REQUIREMENTS.md` and `RULES.md` were not touched.

#### How the rules were read

- **Rule 18** cannot be read word for word: opening a branch moves the rows below it (Req. 18, 19, 20, 28), and
  switching Simple UI rearranges the page (Req. 32). As before, it is read as: a control must not move away from
  under the user while they use it. The Options window keeps its size, the Simple UI box and the Find box stay put,
  and Find no longer scrolls the page (above).
- **Rules 24 and 25** count lines of code. `data.json`, the language files and the documents are data and text, not
  code, as decided on 2026-10-21. `data.json` has 2,244 lines, 62 of them over 120 characters, and splitting it would
  break Rule 1. HTML and CSS are exempt from Rule 24 by the rule itself; `style.css` has 398 lines of code.
- **Req. 26**, "multiple assigned values", is read as before: unmarked counts as a value, so a branch with one marked
  and one unmarked item shows the dash.
- **Req. 25**, "the deepest descendant node", is read as before: the deepest item of the line that is marked must
  have, so marking Militia alone is not listed as Champion.
- **Req. 24**, "building node", is read as before: an item with no item above it. The `kind` in `pictures`, from
  aoe2techtree.net, would also call the Fortified Wall, Guard Tower, Keep and Fish Trap buildings.
- **Req. 13**, "the checkbox in the Options window", is Include Unique and Universal, the one Req. 8 names. Include
  Regionals and Tooltips start ticked; they are not in `REQUIREMENTS.md`.

#### Questions

1. **The look with the pictures.** The title, the order of the tree pane, the hidden legend and label, the
   description as a tooltip only, and the sheet's red tick were all decided on 2026-10-21, but differ from
   requirements 2, 3, 8, 14, 23 and 26, which now win. If the earlier look is wanted, the requirements need an
   exception for the pictures, and the old CSS can come back from commit `fa11988`.
2. **The checkbox sheet.** A version of `checkboxes_sd.webp` and `checkboxes_4k.webp` with a green tick and a red
   cross would let the sheet's own marks be used again, instead of the drawn ones.
3. **Req. 27 against Req. 30, for must have.** Marking Champion (39 civilisations) marks the whole Militia line,
   though Militia has 52, as was decided on 2026-10-19 (Req. 27). Read word for word, Req. 30 forbids that, as the
   counts differ. The mark changes no result, since every civilisation with Champion has the whole line. Should
   Req. 30 say that it applies to marks passed down?
4. **"Full House".** Req. 24 makes a fully marked building with nothing under it read "Full House" or "Full Gate".
   Is that wanted, or should Req. 24 apply only to buildings with something under them?
5. **Rule 26.** `js/` and `js/tests/` are full at 7 files. The next script will need a merge or a folder such as
   `js/screen/`. Should the rule leave room, or name a preferred layout?
6. **Include Regionals, Civ view and Tooltips** are in the Options window but not in `REQUIREMENTS.md`.
7. **The updater's order.** The updater would write the Dock's items further down in `data.json` and the language
   files, following the tree since the Dock moved on 2026-10-19. That only reorders lines, so it was left for the
   next update, as before.

#### Obstacles met, and how they were solved

- **Chrome sends a click when a list's scroll bar is clicked.** Found when closing the language list on any click.
  Clicks whose position falls on the list's own scroll bar are ignored, and the list takes focus so that the click
  does not move focus out of the menu.
- **The tests kept items from before the tree was rebuilt.** The picture tests marked items picked at the start,
  which Include had since replaced, so the marks went nowhere. They now pick their items when they start.
- **`code_docu.pdf` is printed by Chrome from a page that is not kept in the project**, and its text is stored as
  glyphs. Its text was read back with pdf.js in a scratch page, outside the project, to rebuild it in the same form.

### Answers to the questions above

Decided, and recorded before any work on them:

1. **The look with the pictures (question 1).** `REQUIREMENTS.md` now has an exception for the pictures. Pictures
   mode goes back to how it was before the previous entry: the unedited checkbox sprites (the sheet's own tick and
   cross rows), no legend under the search bar with the pictures (Simple UI keeps it), the buttons back under the
   search bar, and the title "Civ Explorer" with the pictures.
2. **"Full House" (question 4).** There is no such thing: a node without child nodes cannot be "full". Only nodes
   with something under them read "Full".
3. **Req. 27 against Req. 30 (question 3).** Req. 27 has been clarified: it is about the top parent node only, such
   as Scout Cavalry for the Scout line, Knight for the Knight line and Militia for the Militia line. Req. 30 does not
   apply to top parent nodes.

### The decisions carried out

The three decisions above are in place. Nothing was committed, and `REQUIREMENTS.md` and `RULES.md` were not touched.

#### Decision 1: the pictures as before

- With the pictures on, the page looks as in commit `fa11988` again: the title "Civ Explorer", the Find box first with
  its label hidden and the buttons under it, no legend, the checkbox sheets' own ticked and crossed rows with a black
  dash, Include's description only as a tooltip, and Find's matches in amber. The pictures' rules in `style.css`
  are those of `fa11988`, but for two that keep that look over the new Simple UI rules: the black dash's width, and
  the text colour of found rows. `index.html` holds both titles again, `titleShort` is back in `data.json`, and the
  language files are as in `fa11988`. The Options window is 30rem tall again in both modes: measured at the four window
  sizes, its contents fit without a scroll bar, with the pictures and with Simple UI.
- With Simple UI, what the entry above changed stays, as requirement 0 now limits the look to Simple UI: the green
  tick, red cross and white dash on a dark box, Find's yellow in both colour schemes, the tree pane in the order of
  requirement 3 with Find's label and the legend, and Include's description under its box.
- In every mode, as in the entry above: English by default (Req. 10), the language list closing on a click
  (Req. 12), the empty tab icon with Simple UI and the icon from `assets/images/` otherwise (Req. 33), and Find
  scrolling only the tree (Rule 18).
- Question 2 above, a checkbox sheet with a green tick and a red cross, is no longer needed.

#### Decision 2: "Full" only with something under it

- A fully marked building, top-level row or group reads "Full" only when it has something under it, such as "Full
  Market" or "Full Watch Tower". The House, with nothing under it, reads "House" (`chipName()` in `js/model.js`).

#### Decision 3: the top of a line

- Marking the top of a line, the first unit or technology under a building or a group, such as Militia, Scout
  Cavalry or Knight, marks the whole line down to its end, whatever the counts, must have or must lack (Req. 27).
  Marking Militia now asks for the whole line up to Champion, so 39 civilisations fit instead of 52.
- Marking any other unit or technology passes the mark down only while the items below have as many civilisations
  (Req. 29, 30): marking Man-at-Arms (52) does not mark Long Swordsman (51).
- A mark never passes up. That ends three ways the page had of marking upwards: marking the last item of a line
  marked the line above it (the old reading of Req. 27); X on a line's last item marked the items above it at the
  same count (added in the entry above); and an item counted as marked when everything under it was. Now marking
  Champion marks only Champion, and marking everything in the Lumber Camp leaves the Lumber Camp unmarked, with a
  dash.
- The `optional` flag only kept the Mill, Lumber Camp, Mining Camp and Monastery from being marked through what is
  under them, so it is gone from `data.json` and the code. Asking for civilisations with Two-Man Saw but no Lumber
  Camp still works: mark the Lumber Camp must lack and Two-Man Saw must have, and Muisca and Tupi remain.
- In `js/model.js`, `settle()`, `sameCount()` and `sameAbove()` are gone, and `isTop()` and `passedTo()` are new. An
  item keeps only the mark it was given or passed down (`self`); nothing is worked out from the marks below any more.

#### How the requirements were read

- **Never up.** Requirements 27 and 29 pass a mark only to items below the one marked, and requirement 30 forbids
  passing one from a unit or technology to an item with another count. No requirement passes a mark up, so nothing
  does.
- **The top of a line** is a unit or technology straight under a building or a group, as in the examples of decision
  3. A line ends where an item has more than one item under it.

#### Tests

- 93 instead of 97. Four tested the marks that passed up and the `optional` flag, and went with them: old Test 20 (an
  optional item stays unmarked), 22 (no item stays unmarked when all under it is marked), 23 (marking every leaf
  marks every item but optional ones) and 88 (items a civilisation can do without are optional).
- Rewritten: Test 13 ("Full" only with something under it), 17 (the top of a line marks the whole line whatever the
  counts, must have and must lack, and clears it again), 18 (a line's end marks only itself), 19 (a mark never passes
  up), 20 (old 21: a building must lack over must-have items, without the flag), 22 (old 25: below the top, a mark
  passes down only at the same count, never up) and 84 (old 87: the tree uses only `item`, `group`, `kids` and
  `unique`, so a leftover `optional` or `upgrades` is caught). Test 11 now marks the second item of a line before
  its top, as the top marks the whole line.
- The picture tests, 45 to 47 (old 48 to 50), check the look of `fa11988` again, without the title or the tree pane's
  order; Test 45 still checks the tab icon. Test 46 checks the sheet's row for each state, and that no mark is drawn
  but the black dash. Chrome reports the borders of a `::before` or `::after` that draws nothing (`content: none`),
  so `drawn()` now leaves those out.
- Numbers: Tests 1 to 19 keep theirs, old 21 is now 20, old 24 and 25 are 21 and 22, old 26 to 87 are 23 to 84, and
  old 89 to 97 are 85 to 93. The numbers in the entry above are the old ones. `TESTS.md` was written again with the
  new numbers, files and lines.
- Each decision was undone in a scratch copy, to show that the tests notice: without the whole line from the top,
  Tests 11, 17 and 20 fail; with marks passing up, Tests 5, 11, 12, 17 to 20, 22, 40 and 50; with "Full House",
  Test 13; and with marks drawn over the pictures, Test 46.
- **Checked.** All 93 tests pass in Chrome 155 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26.

#### Documents

- `MAINTAINER.md`: the title, checkboxes, tree pane, tooltips and Options window with the pictures as before, beside
  what Simple UI shows; Step 4's marking rules (the top of a line, the same count below it, never up, and "Full" only
  with something under it) without the section on `optional`; the test numbers; `settle()` out of the diagram and
  the description of `js/model.js`; and the rule on `REQUIREMENTS.md`, which now says what requirement 0 says.
- `code_docu.pdf` rebuilt: 35 pages, 258 functions. `isTop()` and `prune()` in `js/model.js`, and `onTop()` in the
  tests, are used only in their own scripts, so they are no longer exported; `prune()` was exported for the test
  of the `optional` flag.

#### Questions still open

Questions 5, 6 and 7 of the entry above: room in `js/` and `js/tests/` (Rule 26), the options that
`REQUIREMENTS.md` does not mention, and the order the updater writes the Dock's items in.

### Requirement 27 rescinded

Decided, and recorded before any work on it:

- Decision 3 above is withdrawn. Requirement 27 has been rescinded and is no longer complied with, and the
  exception for the top of a line has been taken out of requirement 30. Every node now follows requirements 29 and
  30 without exception: a mark passes down a line of only children only to items with as many civilisations as the
  one marked, the top of a line included.
- `MAINTAINER.md` is not to be edited for now.

#### Carried out

- **Marking.** `passedTo()` in `js/model.js` no longer treats the top of a line differently, and `isTop()` is gone.
  Marking any unit or technology, the top of a line included, passes the mark to the items in its line of only
  children that have as many civilisations as the one marked, and to no other (Req. 29, 30). Marking Militia (52)
  marks Man-at-Arms (52) again, but not Long Swordsman (51), so 52 civilisations fit, as before decision 3. Marks
  still never pass up, buildings and groups still pass a mark to everything in them, and "Full" still needs
  something under it.
- **All items of the same count, not only the first run of them.** Req. 29 gives the mark to "all descendant
  nodes of equal number" in the line, so an item further down with the same count again would get it, past one
  with another count. No line in `data.json` has such an item today, so this changes nothing yet; it only decides
  what happens if a game update makes one.
- **Tests**, still 93, with the same numbers:
  - Test 17 now checks that marking the top of a line passes the mark down only at the same count, must have and
    must lack, and that marking it again clears it. The sample line is now one whose last item has another count
    than its top, so that the test can tell the difference.
  - Test 11 marks the top of the line first, then its end, as marking the top no longer reaches the end.
  - Test 20 marks everything under the building itself, as marking the top of each line no longer does.
  - Test 22 works out the items of the same count in the same way as Test 17.
  - Undone in a scratch copy, the rescinded rule for the top of a line fails Tests 11 and 17; a mark passing down
    the whole line from any item fails Tests 11, 17 and 22; no mark passing down at all fails Tests 17 and 22.
    Stopping at the first other count passes every test, as no line in the data tells the two apart.
- **Checked.** All 93 tests pass in Chrome 155 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26.
- **Documents.** `TESTS.md`: the wording of Tests 11, 17, 20 and 22, and the lines of every test in
  `js/tests/behaviour.js`. `code_docu.pdf` rebuilt (258 functions).
- **`MAINTAINER.md` was not edited, so it is now out of date.** Step 4 still says that marking the top of
  a line marks the whole line whatever the counts (requirement 27), with Militia marking up to Champion, and that
  the first item of a line is the one that marks the whole line. Both need rewriting to requirements 29 and 30
  when the guide may be edited again.

### MAINTAINER.md rewritten for Rule 27

Requested, following the new Rule 27: `MAINTAINER.md` had grown to 873 lines, and the update
guide only started halfway down. It is rewritten from scratch, at 369 lines, 104 of them the UML diagram.

- **Two chapters.** "Updating Civ Explorer after a game patch" comes first, with a short description and
  eight steps, and no subchapters. Fixing a wrong name and adding a new civilisation's icon are now part of step 4,
  where the report asks for them. "How the code works" has eight subchapters: Files and folders, UML diagram, The
  data, How marking works, Simple UI and the pictures, Assets, Tests, and Rules for changing the code. Changing the
  page's text and adding a language are now part of The data.
- **Table of contents.** It sits right under the title, with no heading of its own, so that it is not a chapter
  and nothing else comes before the update guide. Rule 27 asks for both a table of contents and nothing before the
  guide; the title and the table of contents are read as not being content.
- **Left out as detail.** The measurements behind the pictures (where the parchment, the title frame and the Options
  window's parchment sit, the cut of each frame, the fonts' colours and shadows), the tables of picture sizes, the
  layout rules for phones, the tooltip's placement, and the history of decisions and bugs. The numbers stay in
  `style.css` and the history in this log. The guide keeps what a maintainer needs to change a picture safely.
- **Marking** is described as requirements 29 and 30 now ask, with requirement 27 rescinded: the mark passes down a
  line only at the same count, from any unit or technology. This ends the out-of-date text noted in the entry above.
- The UML diagram is unchanged. No other file links to the old headings.

### Requirements 24, 25 and 30 amended for Fortifications

Amended, and recorded before any work on them:

- Req. 24, "Full", no longer applies to the descendant nodes of Fortifications. The Fortifications row itself keeps
  it.
- Req. 25, a line's filter named after its deepest descendant, now also applies to Fortifications.
- Req. 30, no mark passed to an item of another count, now also applies to Fortifications.

So the walls and towers under Fortifications are marked and named like units and technologies: marking the Watch
Tower no longer marks the Guard Tower and Keep, as their counts differ, and a marked tower line is named after its
deepest item marked must have, such as "Keep", instead of "Full Watch Tower".

#### Carried out

- **A flag in the data, not a name in the code.** The Fortifications group in `data.json` now reads
  `{"group": "fortifications", "lines": true, ...}`. Every item in a group marked so counts as a unit or technology
  (`isUnitOrTech()` in `js/model.js`), so requirements 25, 29 and 30 apply to it and requirement 24 does not. The
  scripts still name no group, as the rule test against game data in the code asks; a future group of upgrade lines
  needs only the flag.
- **What visitors see.** Marking the Watch Tower (55 civilisations) marks only the Watch Tower, as the Guard Tower
  has 51; marking the Stone Wall (54) does not mark the Fortified Wall (43). A marked tower line is listed as its
  deepest item marked must have, such as "Keep", never "Full Watch Tower". A mark still never passes up.
- **How the requirements were read.** Req. 24 exempts the descendant nodes of Fortifications, so the Fortifications
  row itself is still a root: marking it marks everything in it, and Filters reads "Full Fortifications". Req. 30 is
  read the same way, for the items under Fortifications, as passing nothing down from the Fortifications row would
  leave nothing for "Full Fortifications" to describe.
- **Tests**, still 93, with the same numbers:
  - Test 13 now also marks a wall or tower line, picked from the data as the first line in a group marked lines
    whose second item has another count. It checks that the mark stayed on the first item, and that the fully
    marked line is named after its last item, without "Full". If no group is marked lines, Test 13 fails and says
    so, instead of the run stopping.
  - Test 84 knows the `lines` flag, and checks that it is `true` and only on groups.
  - The tests' own `itemAbove()` knows the flag too, so the walls and towers are no longer picked as sample
    buildings.
  - Undone in a scratch copy: treating the walls and towers as buildings again, in the code or by removing the flag
    from `data.json`, fails Test 13; a flag of `"yes"` fails Test 84.
- **Checked.** All 93 tests pass in Chrome 155 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26.
- **Documents.** `MAINTAINER.md`: Fortifications in How marking works, the `lines` flag in The data, and walls and
  towers as lines in step 5 of the update guide. `TESTS.md`: Tests 13 and 84, and the lines of the tests that moved
  in `js/tests/behaviour.js` and `js/tests/static.js`. `code_docu.pdf` rebuilt.

### Two tree buttons with the pictures

Requested: with the pictures on, the three buttons under the Find box become two, Clear and
Expand all, and Expand all turns into Collapse all while one or more nodes are expanded. The buttons use the whole
button sprite, unstretched, side by side as wide as the input pane, and the same size in every language. Simple UI is
unchanged. The request first said "while one or more nodes has an assigned value"; it was corrected
while the work was under way: only whether nodes are expanded counts, and the marks have no effect on the button.

#### Carried out

- **Three buttons in the page, two on screen.** `index.html` keeps all three, as Simple UI needs them (requirements
  3, 18 and 19). With the pictures, `style.css` hides Collapse all while no branch at the top of the tree is open,
  and Expand all while one is. It reads the arrows' `aria-expanded` with `:has()`, so the button follows the tree
  itself and is never out of date: Expand all, Collapse all, the arrows, the keyboard, Find and marking (which opens
  branches) all switch it. Marking a row that opens nothing leaves it alone. Both sit in the same place, so nothing
  moves (Rule 18).
- **What counts as expanded.** Only a branch at the top of the tree. A branch left open inside a closed one cannot be
  seen, so the tree looks closed, and the button reads Expand all.
- **Focus.** The button that is clicked disappears and the other takes its place, so `wireTools()` in
  `js/nodetree.js` hands focus to the other one when the clicked one had it. Without that, a keyboard user would be
  sent back to the top of the page. With Simple UI nothing is handed on.
- **The whole sprite.** The tree's buttons no longer use the stretched middle and the two end caps of the other text
  buttons. Each shows a whole frame of `button_sd.webp` or `button_4k.webp` in the sheet's own proportions, 290 by
  50, with the hover and pressed rows as before. "Unscaled" was read as "not stretched": at 1920 by 1080 the pane is
  499 pixels wide inside, too narrow for two buttons at the sprite's own 290 pixels, and the request asks for both
  to fit in it. The Options window's buttons keep the end caps.
- **Size.** Two equal columns across the pane's head. At 1920 by 1080 each button is 245 by 42 pixels, at 1280 by 800
  174 by 30, at 800 by 1100 134 by 23, and on a 500 by 900 phone 200 by 35. Their text is 16 pixels, or 3.8% of the
  pair's width when that is less, so that the longest caption, Malay's "Kembangkan semua", fits at every size. A
  longer translation would end in an ellipsis instead of spilling off the picture.
- **Rule 25.** `style.css` had 398 of its 400 lines of code. The rule for the end caps went onto one line to make
  room, and the file now has 399.

#### Tests: 94

- **New Test 48** runs without Simple UI. It checks that the tree shows Clear and Expand all, side by side across
  the pane's head, each the whole button picture at 290 by 50, with no end caps and its text not cut. Marking a row or
  opening a branch inside a closed one must leave Expand all. Expand all must turn into Collapse all in the same
  place and hand focus to it, and Collapse all must hand it back. In every language, the buttons keep their size and
  place across the pane, and no caption is cut.
- Tests 48 to 93 are now 49 to 94.
- **Undone in a scratch copy**, each of these fails Test 48 and nothing else: the end caps back on the tree's buttons;
  all three buttons shown; no focus handed on; and a fixed 16-pixel text, which cuts the Brazilian Portuguese, German,
  Italian and Japanese captions, among others, in a window of 1262 by 648 pixels.
- **Checked.** All 94 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900, and with the page itself exactly 1920 by 1080 and 1280 by 800 pixels. No script breaks
  Rules 23 to 26.

#### Documents

- `MAINTAINER.md`: the two buttons in Simple UI and the pictures.
- `TESTS.md`: Test 48, the renumbering, and the lines of Tests 45 to 49 in `js/tests/pictures.js`.
- **`code_docu.pdf` was not rebuilt.** It does not yet describe `toolLooks()` in `js/tests/pictures.js`, or the
  handing on of focus in `wireTools()`.

#### Not done

- **Requirement 34**, "A prerequisite node must be automatically enabled if a descendant node is enabled", was added
  to `REQUIREMENTS.md` during this work. It has not been carried out. It goes against how marking works now, where a
  mark never passes up (marking Champion marks Champion only).

### The report window keeps its title and Close button in view

Requested: in the test results window, the title "Test results" and the summary of how many tests
passed or failed stay at the top of the window, and the part with the Close button stays at the bottom, so that
neither disappears when scrolling and Close is found without scrolling down. Only the list of the individual test
results scrolls. Before, the whole window scrolled: with 94 results at 1920 by 1080, Close sat 3,400 pixels down.

#### Carried out

- **One scrolling part.** In `index.html` the two lists of the report window, the results and the updater's download
  links, are now inside `<div class="report-body">`. In `style.css` the open window is a column: the title, the
  summary and the Close button keep their height, and the list part takes what is left of the window, at least 44
  pixels, and scrolls. A line above and below it shows where the scrolling part begins and ends.
- **The updater** shows its report in the same window, so the same applies to it: its messages and its download links
  scroll together, with the download links at the end, as step 6 of the update guide says.
- **The keyboard.** The list part can take focus, like the list of civilisations, so that it can be scrolled with the
  keys. So that the window still opens with focus on Close, as before, Close now has `autofocus`.
- **Rule 25.** `style.css` had 399 lines of code. The `dialog` rule went onto one line to make room for the three new
  rules, and the file still has 399.

#### Tests: 95

- **New Test 94**, in `js/tests/interface.js` and run last before the count of tests, fills the report window with
  200 lines and scrolls its list to the end. The title, the summary and Close must not have moved and must still be
  on screen, the window itself must not scroll, and focus must start on Close.
- Test 94, at most 100 tests, is now Test 95.
- **Undone in a scratch copy**, each of these fails Test 94 and nothing else: the window back to scrolling as a whole,
  and Close without `autofocus`.
- **Checked.** All 95 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26. The updater's window was checked by hand with 60
  messages and two download links.

#### Documents

- `MAINTAINER.md`: step 6 of the update guide, and the description of `js/report.js`.
- `TESTS.md`: Test 94, Test 95, and the lines of every test in `js/tests/interface.js`, which moved down by one, and
  of Test 95 in `js/tests/run.js`.
- `code_docu.pdf` was not rebuilt, as in the entry above. It does not describe `reportTests()` either.

### The report window's Close button, plain and on the right

Requested: the test results window uses the plain button, without the button sprite, whether or
not Simple UI is on, and its Close button is on the right instead of the left.

#### Carried out

- **No sprite.** With the pictures on, the sprite rules in `style.css` now read `.pictures .tool:not(.icon, .report
  .tool)`, so they no longer reach the report window's Close button, which keeps the plain look of `.tool`: a thin
  border, the page's colours and the page's font. The rules for 4K screens and for the end caps are left out for it
  in the same way. The updater's report is the same window, so its Close button is plain too.
- **On the right.** The window's `form` aligns its button to the right.
- **Rule 25.** The `.options[open]` rule went onto one line, and `style.css` now has 397 lines of code.

#### Tests: still 95

- **Test 94** now also checks that Close sits on the right and that, with the pictures turned on, its background,
  border, colours, font and end caps are the same as with Simple UI.
- **Undone in a scratch copy**, each of these fails Test 94 and nothing else: the sprite back on the report's Close
  button, and Close back on the left.
- **Checked.** All 95 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26.

#### Documents

- `MAINTAINER.md`: the description of `js/report.js`.
- `TESTS.md`: Test 94.
- `code_docu.pdf` was not rebuilt.

### Cancel and OK in the Options window with the pictures

Requested: instead of a Close button, the Options window has two buttons, Cancel and OK, using the
button sprite in its own proportions and unstretched, on the right instead of the left. On Cancel the changes are
discarded; on OK they are applied. Before the work began, it was decided:

- **Changes wait for OK.** Nothing on the page changes while the window is open, not even the language or Simple UI.
  OK applies everything; Cancel or Escape throws it all away.
- **Simple UI keeps Close**, as requirements 8 and 16 ask, and its changes still take effect at once (requirements 11,
  15 and 33). Cancel and OK appear only with the pictures on.

#### Carried out

- **Three buttons in the page.** The window's `form` in `index.html` holds Close, Cancel and OK, in that order.
  `style.css` shows Close with Simple UI, and Cancel and OK with the pictures, side by side at the right. Each shows a
  whole frame of the button sprite at 290 by 50, like the tree's buttons: 192 by 33 pixels, smaller in a narrow
  window, with an ellipsis rather than text spilling off the picture.
- **The settings as choices.** Each setting in the window is one of the `choices` in `js/optionshandler.js`: the
  language, Include, Include Regionals and Simple UI, and, added by `js/pictures.js`, the civilisations' view and
  Tooltips. Each choice knows its value on the page, how to apply a value, and, unless it is a plain box, what the
  window shows and how to show a value. This replaces `flip`, and the view no longer changes the moment a radio
  button is picked.
- **With the pictures**, ticking a box, picking a language or picking a view only changes what the window shows. OK
  applies every choice whose value in the window differs from the page's, then closes the window. Cancel, Escape or
  any other way of closing it applies nothing, and the window always opens showing the page's own values.
- **Set back when it opens, not when it closes.** The first try set the window back in its `close` event, which comes
  a moment after the window closes. The tests reopened it sooner than that and found the old changes still showing;
  a quick visitor could have too. The window is now set back as it opens, which cannot come too late.
- **With Simple UI** a change takes effect at once, as before. Unticking Simple UI turns the pictures on at once, and
  from then on, while the window stays open, it waits for OK: Cancel drops only what was changed after that.
- **Requirement 33** says the page uses no images "upon the user enabling the Simple UI checkbox". With the pictures,
  that is read as the moment OK applies it, as requirement 0 leaves the look with the pictures open.
- **New texts.** `cancel` and `ok` are in `text.ui` of `data.json` and every language file, after `close`. They were
  written by hand, without the game's own words, so a native speaker may want to check them.
- **Rule 25.** The `.option` rule went onto one line, and `style.css` has 397 lines of code.

#### Tests: 96

- **New Test 49**, without Simple UI: the window shows Cancel and OK and no Close, side by side at its right edge,
  each the whole button picture. Ticking Include and picking another language must change nothing on the page; after
  Cancel, and after closing the window without OK, the window must open showing the page's values again; OK must apply
  both and close the window.
- **Test 47** (tooltips) and **Test 50** (Simple UI) now confirm with OK. Test 50 also checks that ticking Simple UI
  changes nothing before OK, and that unticking it with Simple UI on gives everything back at once without moving its
  box. The tests' `pick()` confirms with OK when the pictures are on. The shared check for a whole button picture
  moved to the top of `js/tests/pictures.js`, for Tests 48 and 49.
- Tests 49 to 95 are now 50 to 96.
- **Undone in a scratch copy**: the window not set back, Cancel and OK on the left, or the buttons stretched to the
  old 44-pixel height each fail Test 49 and nothing else. Changes applied at once with the pictures fail Tests 49 and
  50, and OK applying nothing fails Tests 47, 49 and 50.
- **Checked.** All 96 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26.

#### Documents

- `MAINTAINER.md`: Cancel and OK in Simple UI and the pictures, `choices` in the description of
  `js/optionshandler.js` and in the UML diagram.
- `TESTS.md`: Test 49, Tests 47 and 50, the renumbering, and the lines of Tests 45 to 50.
- `code_docu.pdf` was not rebuilt.

### The footer links to the project

Requested: in the footer, "Civ Explorer" links to https://github.com/cnordenb/aoe2civexplorer.

- **In the data.** `source.notice` in `data.json` now reads "{project} was created under Microsoft's ...", and
  `source.project` holds the link's text, "Civ Explorer", and its address, beside `source.rules`. `index.html` has a
  `projectLink` beside `rulesLink` in the notice, and `writeFixed()` in `js/stringbuilder.js` fills in both. The
  notice stays in English in every language, as before, and the updater keeps `source` as it is, apart from the date.
- **The look** is that of the footer's other links: underlined, in the footer's colour, with the pointing cursor with
  the pictures.
- **Test 39**, run in every language, now also checks that the notice holds the project's link with the address from
  `data.json`, and reads the notice with "Civ Explorer" in it. Without the link's address in a scratch copy, it fails
  and nothing else does.
- **Checked.** All 96 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.
- **Documents.** `MAINTAINER.md`: `source` in The data. `TESTS.md`: Test 39. `code_docu.pdf` was not rebuilt.

## 2026-10-23

### The Xolotl Warrior, which excludes the Stable

Requested: a new regional unit under the Stable, the Xolotl Warrior, for the Aztecs, Mayans, Incas,
Muisca, Mapuche and Tupi. As an edge case, when the Xolotl Warrior is enabled the Stable is disabled, and when the
Stable is enabled the Xolotl Warrior is disabled. As in the tree's tooltip, "Left-click to enable, right-click to
disable", enabled is read as must have and disabled as must lack.

#### Carried out

- **Not in the source data.** aoe2techtree.net knows the unit (number 1570, its name is string 5040), but gives it to
  no civilisation, and none of its civilisations' trees has it. Put in the tree alone, it would have stopped the
  updater with "In the tree, but not in the source data". So `data.json` has a new part, `extras`, edited by hand,
  with the Xolotl Warrior's kind, icon number, reach, name number and civilisations. The updater takes the items in
  `extras` from there instead of from the source (`addExtras()` and `fromExtra()` in `js/datahandler.js`), writes
  their availability, icon and names in every language like any other item's, and says "In the source data now, so it
  can be taken out of extras" once aoe2techtree.net has one of them. Run against today's data from aoe2techtree.net,
  the updater reports nothing and writes the same Xolotl Warrior as `data.json` holds.
- **The data.** The availability, the icon and the names in all 17 languages were written with the updater's own
  writer, right after the Stable, so the files are as the updater writes them. The names are the game's string 5040,
  such as Xolotl-Krieger, Guerrier de Xolotl and ショロトルの戦士. In Polish and Russian the game calls it only Xolotl
  and Шолотль.
- **The icon.** aoe2techtree's repository has no icon for the unit. `assets/images/icons/nodes/unit/1570.png` is the
  game's icon from the Age of Empires wiki, `Xolotlicon.png` at 256 by 256, made 48 by 48 on black like the others and
  numbered after the unit. Its outline has the colour of a regional unit.
- **`excludes` in the tree.** The entry reads `{"item": "Xolotl Warrior", "excludes": "Stable"}`, and `js/model.js`
  pairs the two as each other's `rivals` while both are shown.
  - Must have on either marks the other must lack. On the Xolotl Warrior, the Stable and everything in it become
    must lack, as a right-click on the Stable does. On the Stable, everything in it becomes must have and the Xolotl
    Warrior must lack; Filters then reads "Full Stable" and "Xolotl Warrior".
  - Clicking the same item again clears both, the other only if it is still must lack. Without this, unticking the
    Stable left the Xolotl Warrior crossed.
  - Otherwise the Xolotl Warrior is not part of the Stable: marking the Stable must lack or clearing it leaves the
    Xolotl Warrior alone, and the Stable's box and "Full Stable" leave it out. Counted in, must have on the Stable gave
    a dash and a filter button for every line in it, and must lack on the Stable fitted no civilisation, since every
    civilisation has either. The groups above the Stable still count it, and **Clear** clears it.
- **First under the Stable.** Marking the Xolotl Warrior opens everything in the Stable that it marks (Req. 31). After
  the other units, that pushed its own row down while it was being clicked (Rule 18), so it is the Stable's first row.
- `toggle()` in `js/nodetree.js` now stops at the top of the tree when it opens the rows a mark reached, as a mark can
  now reach an item above the one clicked.

#### Tests: 97

- **New Test 21** takes the first item in the tree that excludes another. Must have on it must mark the other must
  lack without its row moving, show everything marked, list the civilisations that have it and lack the other, and
  give both filter buttons. Must have on the other must turn this round without its row moving; a second click must
  clear both; and X on the other must leave the first alone. With no item that excludes another, it fails and says so.
- **Test 87** allows `excludes` in the tree, on an item only, naming another item in the tree.
- **Test 88** also checks `extras`: each is an item in the tree, with a whole `nameId`, naming only known
  civilisations, and `availability` and `pictures` agree with it, worked out with the updater's own `fromExtra()`.
- Tests 21 to 96 are now 22 to 97.
- **Undone in a scratch copy**, each of these fails Test 21 and nothing else: the Xolotl Warrior after the Steppe Lancer
  instead of first, as its row then moves; must have no longer marking the other item; and the Stable's box counting
  the Xolotl Warrior. "Maya" for "Mayans" in `extras` fails Test 88 and nothing else.
- **Checked.** All 97 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26.

#### Documents

- `MAINTAINER.md`: the updater's new message in step 4; `excludes` and `extras` in The data, with how to add an item
  that aoe2techtree.net gives to no civilisation; the rule in How marking works; and where the icon comes from in
  Assets.
- `TESTS.md`: Test 21, Tests 87 and 88, the renumbering, and the lines of the tests in `js/tests/behaviour.js` and
  `js/tests/static.js`.
- `code_docu.pdf` was not rebuilt. It does not describe `pair()`, `current()`, `put()` and `reached()` in
  `js/model.js`, `fromExtra()` and `addExtras()` in `js/datahandler.js`, `badExtras()` in `js/tests/static.js` or
  `rivals()` in `js/tests/behaviour.js`.

#### How the rules were read

- **"The Stable is disabled"** is read as what a right-click on the Stable does, everything in it must lack, apart from
  the Xolotl Warrior. Must lack on the Stable alone would have shown it with a dash.
- **Rule 18 and Req. 31** together decide the Xolotl Warrior's place: opening the rows its mark reaches must not move
  it, so nothing that opens may be above it.
- **Req. 24**, "Full", is read as before for the Stable: everything in it must have, and the Xolotl Warrior, not part
  of it, must lack.

### Test 21 on GitHub

Reported: Test 21 passed in Chrome on Windows, by hand and in the tests, but failed on GitHub,
only in the window of 800 by 1100, whose page is 800 by 1013 pixels.

- **The cause.** At 800 pixels the tree pane is at its narrowest, 20rem. GitHub's Linux has no Segoe UI, and its
  wider font, DejaVu Sans, wraps "Archery Range" beside its count "56–0", making the row 48 pixels high. Marking the
  Xolotl Warrior leaves 6 civilisations, the count becomes "6–0", the name fits on one line, and the row shrinks to
  44 pixels, so the Xolotl Warrior's row moved up by 4 pixels. Test 21 measured that row's place on the screen.
- **Reproduced** in Chrome on Windows with DejaVu Sans, copied from Ubuntu, as the page's font in a scratch copy, in a
  page of exactly 800 by 1013 pixels. Only Test 21 failed, and only in that size.
- **Not the exclusion's doing.** Every mark changes the counts on every row, so the same happens above any item
  marked, with any font that wraps a name beside a long count. Test 21 is about what the Xolotl Warrior's mark opens.
- **The fix.** Test 21 now checks that marking either item opens no row above it: as many rows are shown above it
  before as after. This no longer depends on fonts. With the Xolotl Warrior after the Steppe Lancer, in a scratch
  copy, it still fails, as the lines opened above it are counted.
- **Checked.** All 97 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900, and with DejaVu Sans in pages of 1920 by 993, 1280 by 713, 800 by 1013 and 504 by 813,
  as Chrome on Windows would not make it narrower.
- **Documents.** `TESTS.md`: Test 21. `MAINTAINER.md`: How marking works no longer says the box stays where it was
  clicked.

#### Not done

- **A row moving when a count above it changes length** happens with any mark, as above, and was there before. Giving
  the counts a fixed width would stop it, but changes the tree's look, so it is left as an open question.

## 2026-10-24

### Phone panes of equal, fixed height (requirement 35, rule 18)

Reported: on a phone, with nothing marked, marking the Watch Tower made the civilisations
pane much taller and moved it, breaking rule 18 and requirement 35. Both panes should be the same size on phones.

- **The cause.** The phone layout of 2026-10-21 gave each pane the height of its contents: a grid of five rows, the
  tree's header and list and the civilisations' header, filters and list, with the lists sharing what was left. Marking
  opens the tree and shows **Filters**, so the rows changed. Measured at 390 by 844: the tree pane went from 419 to
  335 pixels, the civilisations pane from 296 to 380, and its top moved up 85 pixels.
- **The fix.** In the phone layout, `.panes` is now two rows of `minmax(0, 1fr)`. Each pane takes half the height
  and keeps it, whatever is marked or open. The subgrid rules, and the scrolling of the panes together, are gone.
  The tree's header no longer spills out of its half at 360 by 640, as it did on the first try at halves on
  2026-10-21, because the footer is now hidden on phones.
- **Many filters.** In a half-height pane, enough filters could push the list of civilisations out of its pane. As
  everywhere else, the filters row now shrinks and scrolls by itself when there is no room, and the list keeps its
  44 pixels. Its padding is 2 pixels larger and its margin 2 pixels smaller, so the filter buttons stay where they
  were, and their focus ring is not cut off.
- **Measured.** At 390 by 844 both panes are 378 pixels with Simple UI and 357 with the pictures, before and after
  marking. At 360 by 640 they are 276 and 262 pixels; the tree's list then shows less than two rows with Simple UI,
  and scrolls inside its pane. The page never scrolls.
- **Test 15** now also checks, wherever the panes are in a grid, that the two panes are the same height and that
  opening everything and marking an item does not move or resize either. With the old layout put back it failed at
  500 by 900 ("panes of 394.75 and 305.25 pixels; a pane moved or changed its size"), and it was the only test that
  failed. The check that stacked lists share the height is gone, as the lists no longer do: the headers differ.
- **Checked.** All 97 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.
- **Documents.** `TESTS.md`: Test 15, and the new lines of the tests after it in `js/tests/behaviour.js`.

#### Not done

- **Short windows.** Below 640 pixels high on a narrow screen, or below 500 high on any screen, such as a phone
  held sideways or at 400% zoom, the panes still stack and the whole content scrolls, so a pane grows as the tree
  opens. Two fixed halves do not fit there, so this is left as an open question.

### Items all civilisations but one have count as universal

Requested: items 55 of the 56 civilisations have, such as the Farm and the House, are now left
out of the tree with the unique and universal ones, unless **Include Unique and Universal** is ticked.

- **The rule.** `prune()` in `js/model.js` leaves out an item with nothing shown under it when one civilisation has
  it, or all but one, or all: `civs === 1 || civs >= data.civs.length - 1`. It follows the number of civilisations in
  `data.json`, so it needs no change when one is added.
- **What it hides.** 11 items are missing from one civilisation. Those with nothing shown under them are now left
  out: the House (not the Huns), the Farm (not the Khitans) and the Elite Skirmisher (not the Turks). The Skirmisher,
  which all have, goes with them, as nothing is left under it. The tree shows 163 items by default instead of 167.
  Items with something shown under them stay, as the Town Center does: the Watch Tower above the Guard Tower, the
  Horse Collar and Heavy Plow above Crop Rotation, the Scorpion, Iron Casting, Chain Mail Armor, Leather Archer
  Armor and Clinker Construction.
- **The Include description,** in all 17 languages, now also names what all but one civilisation has, so that it
  stays true (requirement 15). In English: "things all civilisations or all but one have". The other 16 are new
  text and, like the rest of the page's own text, should be checked by native speakers.
- **Test 42** now expects every shown item with nothing under it to be held by more than one civilisation and
  missing from more than one. With the old rule put back it fails, and it is the only test that does.
- **Checked.** All 97 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.
- **Documents.** `TESTS.md`: Test 42. `MAINTAINER.md`: which items Include Unique and Universal brings back.

### The Monastery is a top-level row

#### What changed

- **The Monastery and its whole branch moved.** They left the Economy group and are
  now a top-level row between Blacksmith and University, the order aoe2techtree.net uses. The Fortified Church, the
  Monastery of the Armenians and the Georgians, stays in Economy.
- **How.** As with the Dock, the JSON writer in `js/datahandler.js` made the move, after confirming that it
  reproduces `data.json` exactly, so nothing else in the file changed.
- **Tests.** All 97 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.

### The Fortified Church is a top-level row, and it and the Monastery hide each other

#### What changed

- **The Fortified Church moved.** It left the Economy group and is now a top-level
  row right after the Monastery, which the Armenians and the Georgians have instead. The JSON writer in
  `js/datahandler.js` made the move, as for the Dock and the Monastery.
- **Marking either hides the other.** While the Monastery is marked must have, the Fortified Church is hidden, and
  while the Fortified Church is, the Monastery is. Must lack hides nothing, nor does a mark on something inside
  either. In `data.json` the Fortified Church says `"replaces": "Monastery"`, and the pairing goes both ways, like
  `"excludes"`, so other pairs can be added by hand the same way.
- **Rule 18.** Whichever is above, hiding it would move the row clicked below it. As decided,
  a hidden row keeps its room (`visibility: hidden`), so no row moves; the tree shows an empty row there. A hidden
  row cannot be clicked, reached with the keyboard or found with **Find**, and **Expand all** leaves it closed, so
  that the gap stays one row high.
- **Code.** `js/model.js`: `pair()` now pairs both `excludes` and `replaces`, and `veiled()` says whether an item is
  hidden. `js/nodetree.js`: hidden rows get the class `veiled`, and are left out of `shown()`, **Find** and
  **Expand all**. `style.css`: `.tree .veiled`.
- **Tests.** New Test 22 marks the Fortified Church, then the Monastery, and checks that the other is hidden, keeps
  its room, cannot be focused or found, that no row above the clicked one goes, and that clearing the mark shows it
  again. With `display: none` instead of keeping the room, it fails. Test 88 now also accepts `replaces`. There are
  98 tests; Tests 22 to 97 are now 23 to 98 in `TESTS.md`.
- **Rule 25.** The new test took `js/tests/behaviour.js` over 400 lines, so the keyboard tests of the tree (Tests 54
  to 60) moved to `js/tests/interface.js`, which already tests the keyboard in the menus. They run in the same place
  and keep their numbers. `chainOf()`, which both files use, moved to `js/tests/helpers.js`.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.
- **Documents.** `TESTS.md`: Test 22, Test 88, the new numbers and the new places of the tests. `MAINTAINER.md`:
  `"replaces"`, and the keyboard tests in `interface.js`.

### The Fortified Church holds the Monastery's rows

#### What changed

- **The Fortified Church is a Monastery.** Everything under the Monastery outside
  its unique groups is now also under the Fortified Church: the Monk, Devotion and Faith, Redemption, Atonement,
  Herbal Medicine, Heresy, Sanctity, Fervor, Illumination, Block Printing and Theocracy. The Missionary, in the
  Monastery's Unique Units, is not; the Warrior Priest stays the Fortified Church's own, first under it, and is
  not under the Monastery.
- **How.** `data.json` lists each item once, as Test 87 and the updater require, so the rows are not copied there.
  `variants()` in `js/model.js` adds them when the tree is built, to every item that `"replaces"` another. A new
  Monastery technology in a game update is then added in one place only. The copies have the same civilisations as
  the originals, so marking either filters the same way, and **Filters** names their building, such as "Redemption
  (Fortified Church)", through the existing `inParent` text.
- **Tests.** Test 22 now also checks that the Fortified Church holds the same rows as the Monastery, and fails
  without `variants()`. `shownKeys()` in `js/tests/helpers.js` lists each item once, so Tests 42 to 44 still
  compare the tree with `data.json`. With Include Unique and Universal ticked, the rows under each were checked in
  Chrome: the Missionary only under the Monastery, the Warrior Priest only under the Fortified Church.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.
- **Documents.** `TESTS.md`: Test 22, and the new lines of the tests after it. `MAINTAINER.md`: what `"replaces"`
  does.

### One Devotion, not two

#### What changed

- **The rows the Fortified Church takes from the Monastery are the same items,** as was pointed out:
  there is only one Devotion. Marking Devotion under either building now marks it under both, in the same way, with
  one entry in **Filters**, plainly "Devotion". The same goes for every row the two share. Marking it under one
  opens nothing under the other: requirement 31, as amended, allows this exception.
- **How.** In `js/model.js`, `twin()` links each copy to its original, and the copy reads and writes the original's
  mark, so the two can never differ, whatever sets them: a click, a key, **Clear**, a filter button or a building
  marked whole. `filtersOf()` lists only originals, and leaves an item out when its building on either side is
  marked whole, so "Full Fortified Church" stays one entry. `share()` no longer counts the copies, so their names
  need no building after them.
- **Checked in Chrome.** Devotion under the Fortified Church: one filter, "Devotion", both boxes ticked, the
  Monastery closed with a dash. Marking it again clears both. "Full Fortified Church" and "Full Monastery" are one
  entry each. X marks both must lack.
- **Tests.** Test 22 also opens the Fortified Church, marks its first shared row, and checks that the Monastery's
  is marked too, that there is one filter, named plainly, and that the Monastery stays closed. Without `twin()` it
  fails.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.
- **Documents.** `TESTS.md`: Test 22, and the new lines of the tests after it. `MAINTAINER.md`: what `"replaces"`
  does.

### Greyed out instead of hidden

#### What changed

- **Greyed out, not hidden.** While the Monastery is marked must have the Fortified
  Church is greyed out instead of hidden, and the other way round. If it was open, it closes. A greyed-out row cannot
  be marked or opened, by a click, a key or a long press, until the mark on the other is cleared. **Expand all**
  leaves it closed, and **Find** does not open it to reach what is inside it, but finds the row itself.
- **How it looks.** The row is drawn at half strength (`opacity: 0.5`), and with the pictures its icon is grey too. It
  takes no pointer, so it has no hover colour or tooltip. Its box still shows its own mark, such as the Monastery's
  dash when the Fortified Church's shared rows are marked.
- **Accessibility.** The row's checkbox and arrow say `aria-disabled="true"`, and stay in the keyboard order, so a
  screen reader can still find and announce them. WCAG 1.4.3 and 1.4.6 set no contrast for inactive controls, so the
  fainter text is allowed with Simple UI on.
- **Code.** `js/model.js`: `barred()` replaces `veiled()`, and looks only at the item itself. `js/nodetree.js`:
  `update()` closes barred rows, `toggle()` and `expand()` ignore them, `paint()` sets the class `barred` and
  `aria-disabled`, and `shown()` is as it was. `style.css`: `.tree .barred > .row`, and the grey icon.
- **Rule 18.** Closing an open Monastery above the Fortified Church, when the Fortified Church is marked, moves the
  Fortified Church and the rows below it up. A closed Monastery, as after **Collapse all**, moves nothing.
- **Tests.** Test 22 now checks that marking either building greys out and closes the other, that the other cannot
  then be marked by a click or X, nor opened by its arrow, and that clearing the mark lifts all this. It fails
  without the closing, and without the block on marking.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. Screenshots checked with and without Simple UI.
- **Documents.** `TESTS.md`: Test 22, and the new lines of the tests after it. `MAINTAINER.md`: what `"replaces"`
  does.

### The Xolotl Warrior clears the Stable

#### What changed

- **New rule for the Xolotl Warrior.** Marking the Xolotl Warrior must have now
  clears the Stable and everything in it, instead of marking them must lack, and marking the whole Stable must have
  ("Full Stable") clears the Xolotl Warrior, instead of marking it must lack. Neither is greyed out or blocked: the
  cleared one can be marked again at once, which in turn clears the first. Must lack on either still leaves the
  other alone.
- **Read literally.** A full Stable clears the Xolotl Warrior whatever its mark, also must lack. Marking a single
  item in the Stable, such as the Knight, leaves the Xolotl Warrior alone; marking the Xolotl Warrior clears it.
- **How.** `mark()` in `js/model.js`: on must have, each item it `"excludes"`, or that excludes it, is cleared with
  `put(rival, null)`. As nothing is marked in the cleared one, no rows are opened there. Clicking a marked item again
  no longer touches the other.
- **Checked in Chrome.** Knight must have, then Xolotl Warrior must have: one filter, "Xolotl Warrior", the Stable and
  the Knight cleared, 6 civilisations. Then Full Stable: one filter, "Full Stable", the Xolotl Warrior cleared.
- **Tests.** Test 21 now marks the Stable whole, then the Xolotl Warrior, and checks that only the Xolotl Warrior is
  marked, with one filter; then the Stable, and checks that the Xolotl Warrior is cleared; neither moves a row above
  the clicked one; and X on each leaves the other alone. With the old must-lack rule put back, it fails.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.
- **Documents.** `TESTS.md`: Test 21. `MAINTAINER.md`: How marking works.

### A building heading a single line is named after its deepest item

#### What changed

- **Requirement 24, as amended,** gives "Full" only to roots and buildings with more than one
  row under them. A building whose only row starts a single line is now named in **Filters** like a line
  (requirement 25): after its deepest item marked must have. A fully marked Lumber Camp reads "Two-Man Saw", not
  "Full Lumber Camp", and with Two-Man Saw unmarked again, "Bow Saw".
- **Which buildings.** It follows the tree as shown. By default these are the Mill (Crop Rotation), the Lumber Camp
  (Two-Man Saw) and the Market (Guilds). With Include Unique and Universal ticked, the Market has more rows again and
  reads "Full Market"; the Lumber Camp still reads "Two-Man Saw".
- **Unchanged.** Must lack on such a building still reads its own name, as for lines. Buildings with more than one
  row, such as the Blacksmith, still read "Full".
- **How.** `chipName()` in `js/model.js`: any item marked must have takes the name of the deepest item marked must
  have in its line, which for a building with no single line is the building itself; "Full" needs more than one row
  under the item.
- **Tests.** Test 13 now expects the building at the top of a single line to be named after the line's end. With the
  old naming put back it fails ("Full Mill").
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. The names above were checked in Chrome.
- **Documents.** `TESTS.md`: Test 13, and the new lines of the tests after it. `MAINTAINER.md`: How marking works.

### Must have passes up to an item's prerequisites (requirement 34)

#### What changed

- **Requirement 34.** Marking a unit or technology must have now also marks every unit and technology above it,
  its prerequisites, but never a building. Marking Two-Man Saw marks Bow Saw and Double-Bit Axe too, but not the
  Lumber Camp; marking Champion marks the whole Militia line, but not the Barracks. So Double-Bit Axe can no longer
  be without must have while Two-Man Saw has it: clearing Double-Bit Axe, or marking it must lack, already clears
  Two-Man Saw. **Filters** still shows one entry, named after the deepest item ("Two-Man Saw").
- **The civilisations listed do not change.** Inside every line of units or technologies in `data.json`, each item's
  civilisations are among those of the item above it, so marking the prerequisites too narrows nothing.
- **Fortifications.** Its lines count as units and technologies, as for requirements 25 and 30, so marking the Keep
  marks the Guard Tower and the Watch Tower too.
- **Shared rows.** Marking Faith under the Fortified Church marks Devotion there, and so under the Monastery too,
  with one entry in **Filters**.
- **Must lack** never passes up, as before.
- **How.** `mark()` in `js/model.js` marks the item's prerequisites must have, found by the new `prerequisites()`,
  and clears what they exclude as it does for the item itself.
- **Tests.** Tests 18, 19 and 24 said a mark never passes up; they now check that must have passes up to the items
  before it, but not to a building, with one filter named after the last item. With the prerequisites left unmarked,
  exactly these three fail.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. Two-Man Saw, Champion, the Keep, Imperial Age and Faith under the Fortified Church
  were checked by hand in Chrome.
- **Documents.** `TESTS.md`: Tests 18, 19 and 24. The places of the tests after them in `js/tests/behaviour.js`
  are updated, and so are the places of Tests 6, 7, 9, 25 and 27, which were out of date, and Test 59, which moved
  to `js/tests/interface.js` before. `MAINTAINER.md`: How marking works.

### The drop-off site variants hold what they replace, as the Fortified Church does

#### What changed

- **The Mule Cart, the Settlement and the Folwark** now work as the Fortified Church does for the Monastery. In
  `data.json`, the Mule Cart replaces the Lumber Camp and the Mining Camp, the Settlement the Mill, the Lumber Camp
  and the Mining Camp, and the Folwark the Mill. Each is held by exactly the civilisations that lack what it
  replaces. Under each, the page shows the rows of what it replaces, in that order: under the Mule Cart, the
  Double-Bit Axe, Gold Mining and Stone Mining lines.
- **Same items.** These rows are shared: marking Two-Man Saw under the Mule Cart marks it under the Lumber Camp and
  the Settlement too, with one entry in **Filters**, and opens nothing elsewhere.
- **Greyed out.** While the Mule Cart is marked must have, the Lumber Camp and the Mining Camp are greyed out and
  closed; while the Lumber Camp is, the Mule Cart and the Settlement are. The Folwark is unique, so it shows only
  with Include Unique and Universal ticked.
- **`replaces` takes a list.** It names one item, as before, or a list of items. `variants()` and `pair()` in
  `js/model.js` read both through the new `named()`.
- **An item marked must have is never greyed out.** The Economy group holds both the Lumber Camp and the Mule
  Cart, so marking it marked both, greyed out both, and left neither clickable. Now `barred()` leaves an item alone
  while it is marked must have itself, so the group marks everything as before, and clearing one of the two greys
  it out. The Monastery and the Fortified Church are both at the top, so this could not happen with them.
- **Full.** A fully marked Mule Cart lists no civilisation: neither the Armenians nor the Georgians have Two-Man Saw.
  This is what "Full" means, as for any building.
- **Pasture** stands in for the Farm for the Khitans, but it is not a drop-off site and neither has anything under
  it, so it is left as it was.
- **Tests.** Test 22 now picks the Mule Cart, checks a row with nothing under it, so that the filter is named after
  it, and checks that every item that replaces others holds exactly their rows. Test 14 checks that marking a group
  greys out nothing in it. Test 24 counts each shared row once. Test 88 accepts a list. With the old `model.js`,
  Test 22 fails; with the old `barred()`, Test 14 fails.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. The Mule Cart, the Settlement, the Lumber Camp, the Mill, the Economy group and, with
  Include ticked, the Folwark were checked by hand in Chrome.
- **Documents.** `TESTS.md`: Tests 14, 22 and 88, and the places of the tests after Test 14. `MAINTAINER.md`: How
  marking works.

Variants still to be resolved:
- farm v pasture
- harbor v dock (also harbor needs to be root node)
- donjon v watch tower
- variant v variant (settlement - mule cart)
- unit variants (shock infantry, siege elephant v siege ram, champi v militia)
- tech variants (cranqequins v parthian tactics)
