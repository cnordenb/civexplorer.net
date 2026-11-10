# Development log, part 6

- [2026-11-02](#2026-11-02)
- [2026-11-08](#2026-11-08)
- [2026-11-10](#2026-11-10)

Part 6 of the development log. It follows [part 5](DEVLOG5.md). The decisions made in the log are listed in
[DECISIONS.md](../DECISIONS.md).

## 2026-11-02

### 00:44:14: the model guards its own marks and saves its own state

#### What changed

- **Why.** Compared with model, view and controller in *Head First Design Patterns* (chapter 12), some application
  logic and some of the model's state were found outside the model. `toggle()` in `nodetree.js` checked that an item
  was not greyed out before marking it, while `mark()` in `model.js` marked a greyed-out item too. The model's three
  settings, Include, Include Regionals and the language, were saved by `optionshandler.js` and read back by
  `js/script.js`, and `optionshandler.js` called `keepInAddress()`, which Test 85's check for the address could not
  see. The page looks and works as before.
- **Greyed-out items.** For an item that is greyed out (`barred()`), `mark()` returns at once, changing nothing and
  telling no view, and `reach()` reaches nothing. The check in `toggle()` is gone, and `nodetree.js` no longer imports
  `barred`. `locked()` and `behind()` stay in its imports, as whether a branch can be opened is the view's state.
- **Saved choices.** `setIncluded()` and `setRegionals()` save `include` and `regional`, and `chooseLanguage()` saves
  `language` and writes `?lng=` into the address. `startModel(code)` reads `include` and `regional` back and saves
  nothing, so that only a choice saves, as before. `start()` in `js/script.js` passes only the language and no longer
  imports `recall`. `optionshandler.js` saves only Simple UI, the civilisations' view and Tooltips, which stay outside
  the model, and no longer imports `keepInAddress()`; `setLanguage()` stays, for the tests. The tests' `restore()`
  still puts the address and the saved choices back after `setLanguage()`.
- **The model itself.** The views and controllers import `model.js` itself, not an interface, as the book's views
  are handed `BeatModelInterface`. With one model an Adapter would gain nothing, so none was added; `MAINTAINER.md`
  lists it as the ninth way in which the code differs from the book.
- **Tests.** There are still 99. Test 21 also calls `mark()` itself on the greyed-out item, with must have and must
  lack, and checks that it stays unmarked. Test 85 also fails when a script outside `js/model/` and the tests calls
  `keepInAddress()`, or saves or reads `include`, `regional` or `language`, and its name says that only the model
  saves and restores its own state. Its pattern for the path ends in `\b`, not `\/`, as the one for the sets does,
  since its own check for comments fails on two slashes in code.
- **Checked.** All 99 tests passed in Chrome in each of the six windows GitHub runs them in: light and dark colours,
  at 1920 by 1080, 1000 by 1000 and 720 by 1280. With the check taken out of `mark()`, Test 21 failed, and Test 22
  too, as greyed-out alternatives could then be marked. With `remember("include", …)` put back into `setInclude()`,
  Test 85 failed, naming `optionshandler.js`. No other test failed, and both were undone.
- **Documents.** `MAINTAINER.md`: the scripts `js/script.js`, `model.js` and `optionshandler.js`, the ninth difference
  from the book, and the rule to keep, in both places. `TESTS.md`: Tests 21 and 85, and the lines of the tests that
  moved. `DECISIONS.md`.

#### Not done

- `code_docu.pdf`, as in the entries before: it still describes the check in `toggle()` and the old `startModel()`.
- The page was not tried by hand; only the tests ran.

### 00:52:37: `datahandler.js` split: the updater in `updater.js`, and `cellOf()` in the view

#### What changed

- **Why.** `datahandler.js` had many reasons to change: loading the data and the saved choices, the address, the
  language's formats, the grid of the icon atlases, which is only how the icons are laid out, the whole updater, and
  a JSON printer. The page looks and works as before.
- **`cellOf()`** and its cache, `orders`, are in `js/view/stringbuilder.js`, next to `place()`, which every caller
  uses with it, and `treeview.js` imports it from there. `byFile`, the order of the files in an atlas, a fact about
  the data, stays in `datahandler.js` and is now exported, as `cellOf()` and the updater's `addIcons()` both use it.
- **`js/model/updater.js`** holds the updater, its code unchanged: `LINE_WIDTH`, `ABBREVIATION`, `iconFile`, the JSON
  printer (`isScalar`, `isFlatList`, `flat` and `toJson`), `isLower`, `capitalise`, `fromExtra`, `joinLines`,
  `localName`, `availabilityOf`, `pictureOf`, `missingText`, `gather`, `addExtras`, `translate`, `compare`,
  `addIcons`, `refresh` and `fetchUpdate`. It imports `data`, `load`, `fill`, `treeKeys`, `byFile` and `pack` from
  `datahandler.js`, and reads files only through `load()`. `pack` stays with `unpack`, its inverse. `datahandler.js`
  went from 289 lines of code to 104, and `updater.js` has 179; `js/model/` holds 3 files.
- **Imports.** `updatehandler.js` imports `fetchUpdate` from `updater.js`, and `static_test.js` the six functions of
  the updater that it tests. No test imports `cellOf()`.
- **Tests.** There are still 99. `PAGE_FREE` in `static_test.js` names `updater.js`, so Test 85 checks that it never
  touches the page either.
- **Checked.** All 99 tests passed in Chrome in each of the six windows GitHub runs them in: light and dark colours,
  at 1920 by 1080, 1000 by 1000 and 720 by 1280, after the move of `cellOf()` and again after the split. Every line of
  `updater.js` but its import is a line of `datahandler.js` as committed, in the same order. `?update` fetched the
  game's data from aoe2techtree.net and showed the same report as a copy of the commit before: 56 civilisations, 470
  items and 17 languages, eleven new names, and `data.json` and 16 language files to download.
- **Documents.** `MAINTAINER.md`: the files table, the UML diagram, the scripts `datahandler.js`, `updater.js`,
  `stringbuilder.js` and `updatehandler.js`, the order of the scripts, and where `cellOf()` is, under Assets.
  `TESTS.md`: the lines of the tests that moved, and `PAGE_FREE`'s line in Test 85's. `DECISIONS.md`.

#### Not done

- `code_docu.pdf` and `.claude/skills/code-docu/layout.json` do not yet know `updater.js`, and `code_docu.pdf` still
  has `cellOf()` in `datahandler.js`; `.claude/skills/` was left as it is.
- The new names that `?update` found were not downloaded; the data files are unchanged.

### 01:11:03: data from Update 188329, the footer names the game update, and a skill for the updater's files

#### What changed

- **The footer names the game update.** It reads "Data from aoe2techtree.net, Update 188329.", where it gave the
  month of the last update, and "Update 188329" links the update's notes on ageofempires.com, as aoe2techtree.net's
  footer does. The whole of "Update 188329" is the link, not the number alone, so that the link says where it leads
  without the words around it (WCAG 2.4.9, AAA). `source.update` in `data.json` holds the number and the address of
  the notes, in place of `source.updated`; `source` in the texts has `{update}` in place of `{date}`, and the new
  text `update` is "Update {number}" in each language, such as "mise à jour {number}" and "アップデート {number}".
  `<a id="updateLink">` is in the footer in `index.html`, and `writeFixed()` and `writeTexts()` in `stringbuilder.js`
  fill it in. Like the other links of the footer, it shows its address as its tooltip.
- **The updater reads the game update** from aoe2techtree.net's page, which it now loads too: `gameUpdate()` in
  `updater.js` finds "Update" and the link after it (`GAME_UPDATE`) and keeps the number and the address. A new
  number is reported ("New game update: …"); when the page has none, the report says so and `data.json` keeps the
  update it had. `updateSame` no longer says "apart from the date".
- **The data.** The updater was run and its files saved: `data.json` and the 16 language files. It found Update
  188329 and eleven new names: Herbalism and Incendiaries in French, Mounted Crossbowman in German, the Jurchens and
  the Khitans in Korean, the Danes in Malay, Clerical Recruitment in Russian, the Great Wall in Vietnamese, and the
  Champi Scout, the Jomsviking and the Elite Jomsviking in Brazilian Portuguese. No civilisation, item, icon or
  availability changed. Seven language files only have their items in the tree's order, as the updater writes them,
  and the Chinese ones their headings on one line.
- **The `data-update` skill**, in `.claude/skills/data-update/`, does for Claude Code what steps 2 to 7 of the update
  guide do by hand. `scripts/download.mjs` serves the project on 127.0.0.1, opens `?update` in headless Chrome,
  prints the report and saves each file offered, keeping its line endings and listing each value that changed. It
  uses Node with no packages.
- **Tests.** There are still 99. Test 41 also checks the update's link and its text in every language, and Test 94
  the update's number and address, in place of the date.
- **Checked.** All 99 tests passed in Chrome in each of the six windows GitHub runs them in: light and dark colours,
  at 1920 by 1080, 1000 by 1000 and 720 by 1280. The footer was read in English, French and Japanese. A second run of
  the updater found nothing new and offered `data.json` unchanged.
- **Documents.** `MAINTAINER.md`: the two new lines of the report in step 4, the skill after step 8, `source` in the
  data, and `.claude/skills/`. `TESTS.md`: Tests 41 and 94, and the lines of the tests that moved. `DECISIONS.md`.

- **Requirement 5** was changed at the same time: the footer reads "Data from aoe2techtree.net, Update xxxxxx", where
  xxxxxx is the game update the data is from, in place of the month and year.

#### Questions

1. **The link.** It is "Update 188329", where aoe2techtree.net links only "188329". Linking only the number would need
   a hidden name for screen readers to keep WCAG 2.4.9. Is the longer link right?
2. **The skill's script** uses Node, which Rule 36 allows only for `code_docu.pdf`. It installs nothing, builds
   nothing and is no part of the page, so it was read as no build and no dependency (Rules 13 and 14). Is that right?

### 01:15:20: `code_docu.pdf` made again

#### What changed

- **`code_docu.pdf`** made again, after all 99 tests passed in the six windows: 83 pages, 1.4 MB, 4142 links, none
  without a target, 486 bookmarks, and every page A4. `updater.js` is subchapter 4.2, with its 21 functions,
  `gameUpdate()` among them, and `cellOf()` is in `stringbuilder.js`.
- **Descriptions.** `layout.json` names `updater.js`, after `datahandler.js`. In `desc/`, the updater's entries moved
  from `datahandler.js` to `updater.js` unchanged, `gameUpdate()` is new, and `refresh()` and `fetchUpdate()` say that
  the game update comes from aoe2techtree.net's page. Brought up to date: `js/model/`, the footer of `index.html`,
  `source` in `data.json`, `start()`, `keepInAddress()`, `byFile()`, `setIncluded()`, `setRegionals()`,
  `startModel()`, `chooseLanguage()`, `reach()`, `mark()`, `writeFixed()`, `writeTexts()`, `toggle()` in
  `nodetree.js`, `setInclude()`, `setRegional()`, `choose()`, `runUpdate()`, `mvcProblems()`, `textDataTests()`,
  `rivals()` and `languageTests()`.
- **UML.** The overview and the model's diagram show `updater.js`, which imports `datahandler.js`. The model's text
  is now 5.1 points, down from 7.4, the smallest of the four; `code-docu/SKILL.md` and `code-docu-uml/SKILL.md` give
  the new sizes.
- **Checked.** `verify.py` found no dead link, no wrong header, no bad bookmark and no page that is not A4. The title
  page, the contents, the four UML pages, the page of `data.json`, the first pages of `js/model/` and of `updater.js`,
  and the first page of the index were looked at.

#### Not done

- `icons.atlas` on the page of `data.json` still says that `cellIn()`, a test's helper, places the pictures, as before;
  `cellOf()` does it in the page.

### 09:51:57: Clean Code refactoring: names, arguments, error handling and `datahandler.js` in parts

#### What changed

- **Why.** The code was compared with the heuristics of *Clean Code* (Robert C. Martin, chapter 17). Numbers without
  names and ternaries inside ternaries hid what the code meant. The same walks through the tree were written out
  several times, and five names were exported that no other file used. Flag arguments made a call such as
  `showLoading(false)` mean its opposite. `attempt()` turned every error into `null`, and `borrowed()` returned `null`
  for "not found". Many names made the reader guess, and three things were called `reach`. `datahandler.js` changed
  for too many reasons. The tests shared one set of sample items, which two of them refreshed for the tests after
  them. The page looks and works as before.
- **The starting point.** The review was made of the commit `b1fa37e`, and the work was done on top of the entries
  above, which are not committed yet. Code was found by its name, not by its line. Where an entry above had already
  dealt with a finding, it was left out (see "Not done").
- **Numbers and branches.** `treeview.js` names the long press, `LONG_PRESS_MS` (500 ms), the time after a touch in
  which a context menu is ignored, `MENU_AFTER_TOUCH_MS` (600 ms), and the drift that cancels a press,
  `PRESS_DRIFT_PX` (10 pixels). `pictures.js` names the tooltip's margin and gap, `TIP_MARGIN` and `TIP_GAP`, and the
  screens it tells apart, `PHONE_SIDE`, `ULTRAWIDE_RATIO`, `QHD` and `FHD`; `screenPictures()` picks the background
  with `backgroundFor()`, in early returns, as `setOf()` and the updater's `oneLine()` now do too. The tree's keys are
  two tables in `nodetree.js`, `MARK_KEYS` and `MOVES`, with `moveRight()` and `moveLeft()`.
- **Repeated walks and exports.** `chainWhile()` in `model.js` follows the only kid, for `chainOf()` and, through
  `itemChain()`, for `passedTo()` and `lineEnd()`. `ancestors()` lists the items above an item, for `isUnitOrTech()`,
  for `find()` and `enter()` in `nodetree.js`, and for the tests' new `openTo()`. `fit()` became `updateMatching()`,
  which returns nothing, and `mark()`, `clear()` and both ways of clearing a filter end with `marksChanged()`.
  `civBit`, `plurals`, `matching`, `markOf` and `pictureFiles` are no longer exported.
- **Arguments.** `showLoadError(shown = true)` and `showLoading(shown = true)` became `setLoadError(on)` and
  `setLoading(on)`, always called with `true` or `false`. `chipOf()` and `chipName()` take a filter of `filtersOf()`,
  `{ item, mark, own }`. `unmarkLine(item, kind, own)` became `unmarkOwn(item)`, for the own filter of a unique item,
  and `unmarkLine(item, kind)`; `unchip()` in `nodetree.js` picks one by the filter button's `data-own`. `refresh()`
  in `updater.js` takes the current data and what was fetched, `{ techtree, trees, strings, page }`, and
  `treeProblems()` finds the tree's duplicate and unknown items, reported in the same order as before.
- **Errors.** `attempt()` returns `null` only for a `DOMException`, the browser's refusals: storage that is blocked or
  full, `history` on `file://`, a selector it cannot match, a style sheet it will not read, a pointer it cannot
  capture. Any other error is thrown again; no test failed and Chrome's console showed no error. `borrowed()` became
  `placesIn()`, which lists every node of the tree once, in the order `borrowed()` searched them, each with whether it
  is inside an item or a group of lines, and `borrowedKids()`, which returns no kids where `borrowed()` returned
  `null`.
- **Names.** In `model.js`, `lift` is `liftedKids`, `lent` `isLendable`, `common` `lentCopy`, `named` `keysIn`,
  `variants` `withBorrowedKids`, `twin` `shareMarksWithOriginals`, `pair` `linkBothWays`, `side` `branchWithout`,
  `oppose` `addOpponents`, `siblings` `addSiblingAlternatives`, `within` `isInside`, `put` `applyMark`, `reached`
  `spreadOf`, `reach` `toReveal`, `unique` `isUnique`, `alone` `isLoneUnique` and `held` `keepsOwnFilter`. In
  `updater.js`, `flat` is `oneLine`; in `pictures.js`, the tooltip's `reach` is `offset`, and `--reach` in
  `css/pictures.css` is `--offset`; in `optionsview.js` and `optionshandler.js`, `shown(id)` is `optionValue(id)`.
  `reach` is now only a node's class in `data.json`, and `shown()` only whether a row of the tree is in sight. Four
  lines that the longer names took past 120 characters were wrapped, and the last line of `toJson()` was split in two.
  `TERMINOLOGY.md` defines a chip, the code's name for a filter entry.
- **`datahandler.js`** now only loads and stores data: `data.json` and the language files, the saved choices and the
  address. Three new scripts in `js/model/` hold the rest: `civsets.js` the civilisations as sets (`ALL`, `size()`,
  `setOf()`, `civsOf()` and the new `useCivs()`, which takes the list of civilisations, so that it imports nothing),
  `texts.js` the chosen language (`fill()`, `useLanguage()`, `nameOf()`, `civName()`, `plural()`, `plain()` and the
  language's formats), and `icons.js` the icons' file names and the order of an atlas (`iconFile()`, `civFile()` and
  `byFile()`). A script imports only those before it: `civsets.js`, `datahandler.js`, `texts.js`, `icons.js`,
  `updater.js`, `model.js`. `datahandler.js` has 62 lines of code, and `js/model/` holds 6 files. `PAGE_FREE` in
  `static_test.js` is now a pattern for `js/script.js` and all of `js/model/`, so that Test 85 covers a new script of
  the model by itself.
- **Tests.** There are still 99, none added or removed. Each test that uses sample items picks them itself with
  `fixtures()`, after `reset()`; nothing passes them on or refreshes them, and `run_test.js` no longer makes them. A
  log of each test's items, made before and after the change, matched for every test. The long-press test waits
  `LONG_PRESS_MS + 100`. `ticked()` and the new `flags()` are in `helpers_test.js`, and a failure's detail names each
  part, such as "held true, exclusive false", where it gave a row of bare booleans; Test 22's now names `last` too,
  and Test 46's `opened`. Lines moved in every test file; `TESTS.md` follows.
- **Checked.** All 99 tests passed in Chrome in each of the six windows GitHub runs them in: light and dark colours,
  at 1920 by 1080, 1000 by 1000 and 720 by 1280, after the change to `attempt()`, after the split, after the sample
  items and at the end, and in one window after every other step. `?update` fetched the game's data from
  aoe2techtree.net with the code before and after the change: the same report, "Nothing has changed since the last
  update.", and the same `data.json` to download, equal to the one in the project.
- **Documents.** `MAINTAINER.md`: the files table, the UML diagram, the scripts of `js/model/`, `unmarkOwn`, the order
  of the scripts, `setLoading()`, `--offset`, and `fixtures()` in the table of the tests. `TESTS.md`: the lines of the
  tests. `TERMINOLOGY.md`: chip. `DECISIONS.md`.

#### Not done

- `code_docu.pdf` was not made again. It lacks the new files and names, and `.claude/skills/code-docu/`
  (`layout.json`, `desc/`) does not know them yet.
- `startModel()` with named settings: it already takes only the language and reads Include and Include Regionals
  itself (00:44:14), so no two booleans are passed to it.
- `monthOf()`: no month has been written since 01:11:03; `refresh()` reads the game update from aoe2techtree.net's page
  instead.
- `cellOf()` and its cache stay in `stringbuilder.js`, not in `icons.js`, as decided at 00:52:37: they are how the
  icons are laid out. `icons.js` holds only `iconFile()`, `civFile()` and `byFile()`.
- Shorter `optionTests()`, `standIns()` and `branches()`: each helper taken out of them would add lines, and
  `behaviour_test.js` has 399 lines of code and `interface_test.js` 398, against Rule 25's 400. For the same reason
  `behaviourTests()` calls its tests from two lists, and `menuAudit()` and `spacingTests()` take `fixtures().partial`
  where they use it: with a line for each call and for each test's items, `behaviour_test.js` would have had 406.
- `model.js` was not split. It builds the tree, holds the marking rules and makes the filters; building the tree in a
  file of its own would mean returning the items rather than filling `model.js`'s lists, so that the imports do not go
  round in a circle.
- The page was not tried by hand; only the tests ran.

#### Questions

1. **The starting point.** The review asked for a clean tree to start from. The tree held the uncommitted work of the
   entries above and a change to `REQUIREMENTS.md`, and this work was done on top of it, so the same files hold both;
   this entry lists what is its own. Is one review of both right?
2. **Rule 17 against one concept per test.** With 99 of 100 tests, many tests check five to eight things at once,
   such as Tests 22, 46 and 48. Counting groups of checks rather than single checks would allow one concept per test.
   Should the rule count them so?
3. **The seven files of `js/view/`** keep `stringbuilder.js` whole. It holds the helpers of the views, the views of
   the texts, the civilisations and **Filters**, and the loading and error screens, which its name does not say.
   Should `js/view/` have room for one more file?
4. **`model.js`**, as under "Not done": should the tree's building go into a seventh file of `js/model/`?

### 10:12:50: `code_docu.pdf` made again, with `civsets.js`, `texts.js` and `icons.js`

#### What changed

- **`code_docu.pdf`** made again: 85 pages, 1.5 MB, 4396 links, none without a target, 506 bookmarks, and every page
  A4. `js/model/` has six subchapters: `datahandler.js` (4.1), the new `civsets.js` (4.2), `texts.js` (4.3) and
  `icons.js` (4.4), then `updater.js` (4.5) and `model.js` (4.6). It uses the names of the entry at 09:51:57.
- **Descriptions.** `layout.json` names the three new scripts after `datahandler.js`, in the order the scripts import
  each other. In `desc/`, the entries of the functions that left `datahandler.js` moved with them unchanged, and
  `useCivs()` is new. The renamed functions kept their entries under their new names; "side" is now "branch" in those
  of `branchWithout()` and `addOpponents()`. New: `placesIn()` and `borrowedKids()` in place of `borrowed()`,
  `ancestors()`, `chainWhile()`, `itemChain()`, `updateMatching()` in place of `fit()`, `marksChanged()`,
  `unmarkOwn()`, `treeProblems()`, `beyond()` and `backgroundFor()` in `pictures.js`, `moveRight()`, `moveLeft()`,
  `MOVES` and `unchip()` in `nodetree.js`, and `flags()`, `openTo()` and `ticked()` in `helpers_test.js`. Brought up
  to date: the folder `js/model/`, the loading screen of `index.html`, `datahandler.js` itself, `attempt()`,
  `useData()`, `refresh()`, `rebuild()`, `keepsOwnFilter()`, `chipOf()`, `chipName()`, `setLoadError()`,
  `setLoading()`, `optionValue()`, `screenPictures()`, `toggle()`, `find()`, `key()`, `startTree()`, `rounds()` and
  `fixtures()`.
- **`icons.atlas`** on the page of `data.json` now says that `cellOf()` places the pictures by file name, and
  `cellIn()` in the tests too. The entry at 01:15:20 had left this under "Not done".
- **UML.** The overview and the model's diagram show the three new scripts. In the model's, `datahandler.js` imports
  `civsets.js`, `texts.js` and `icons.js` import `datahandler.js`, and `updater.js` and `model.js` import those they
  use. The model's text is now 4.7 points, down from 5.1, and the overview's 7.6, down from 8.1; the view's stays at
  5.6 and the controller's at 9. `code-docu/SKILL.md` and `code-docu-uml/SKILL.md` give the new sizes.
- **Checked.** The draft listed no warning. `verify.py` found no dead link, no wrong header, no bad bookmark and no
  page that is not A4. These pages were looked at: the title page, the contents, the four UML pages (the model's also
  at four times the size, to follow its arrows), the page of `data.json`, the first pages of `js/model/` and of
  `civsets.js`, and the first page of the index. The tests were not run again: all 99 passed at 09:51:57, and since
  then only `.claude/skills/` and `documentation/` have changed.

#### Questions

1. **The model's UML text** is 4.7 points on its A4 page, the smallest yet, as `js/model/` now has six scripts and
   `model.js` alone 59 functions. The skill gives a diagram more room only when asked, as A4 was a decision. Should the
   model's diagram get a larger page, or be split in two, such as `model.js` on one page and the other five scripts on
   another?

## 2026-11-08

### 22:36:58: Clean Code and Head First Design Patterns refactoring: names, branch sets, `itemtree.js` and the tests' start

#### What changed

- **Why.** The code at `4dc6483` was compared with *Clean Code* (Robert C. Martin, chapter 17) and *Head First Design
  Patterns* (Freeman and Robson). Look-alike names such as `setInclude` and `setIncluded` meant one idea in each
  layer, and `own` and `set` meant several things. Three ternaries were still nested. `build()` in the tree view did
  three jobs. The language menu's keys were an if/else chain, though the tree's keys were a table. Three places found
  a template's parts by their position. The updater sorted the civilisations twice, an item's reach was read from
  `data.json` in three places, and the tree view read the shape of `data.json` itself. `whole()` was a query used for
  what it wrote. `model.js` changed both for the tree's shape and for the marks. Many loops kept their body on their
  own line, and the scripts read from the bottom up. The model's Observer had an `unsubscribe` that nothing called,
  and each group of tests began in whatever state the group before it left. The page looks and works as before.
- **The starting point.** The tree held an uncommitted change to `RULES.md`, where Rule 26's line has lost its first
  words and begins "Ruly exceed 7 files", and eight untracked `techtree_*.webp` files in
  `assets/images/ui/backgrounds/`. Neither was touched, and nothing in this entry depends on them. Code was found by
  its name; every finding of the review still applied.
- **Removed.** `unsubscribe`, and Test 85's demand for it; the controller's `setLanguage()`, which only passed its
  argument on; and the exports of `page`, `opening`, `fit`, `shared` and `bars`, which no other file imported. The
  tests ask `nameIsShared(name)` in `stringbuilder.js` and `barsByBox()` in `scrollbars.js` instead.
- **One verb per layer.** `set…` is a model or view setting its own state, `choose…` a controller acting on the
  visitor's choice, telling the model or view and saving it where the model does not, and `use…` a module taking in
  data. In `optionshandler.js`, `setInclude`, `setRegional` and `setSimple` became `chooseInclude`, `chooseRegional`
  and `chooseSimple`, and the private `choose()` became `chooseLanguage()`. In `model.js`, `setIncluded`,
  `setRegionals` and `chooseLanguage` became `setInclude`, `setRegional` and `setLanguage`. `applySimple()` in
  `pictures.js` keeps its name, as it also picks, preloads and redraws the pictures.
- **One meaning per word.** `countOf()` returns `{ withItem, withBranch }`. A unique item's own filter is `lone`, after
  `isLoneUnique()`: the filter's flag, `unmarkLone()` (was `unmarkOwn()`) and the chip's `data-lone`. The whole of the
  data is `siteData` in `addLanguage()`, `pack()` and `missingText()`, where it was `set`, and `pack()`'s `own` is
  `ofLanguage`. An icon is a `sprite`, in the updater's `addIcons()` and the tree view's `dress()`. `own` is now only
  the field of `data.json` (on Domestication), and `set` only a set of civilisations.
- **Branches and keys.** `paint()` reads `aria-checked` from the table `ARIA_CHECKED`, `highlight()` asks
  `foundText()`, and the test report's line asks `outcome()`. `build()` became `build()`, `newRow()`,
  `makeHeading()` and `setUpBranch()`. The language menu's keys are the table `MENU_MOVES`, with `stepFrom()`, and
  `isPicked()` is the one test of the current language. The scroll bar's arrows, track and knob, a civilisation's
  link and name, and a language's caption are found by their class.
- **Data reads.** `fetchUpdate()` sorts the civilisations and hands them to `refresh()`. `spriteOf()` and `atlasOf()`
  in `icons.js` find an item's icon, so `treeview.js` no longer imports `data`, and `reachOf()` reads an item's reach.
- **`itemtree.js`.** The new `js/model/itemtree.js` builds the tree's items from `data.json`: what Include and Include
  Regionals hide, the items a variant borrows, the rivals, opponents and alternatives, and each item's branch set,
  which `storeBranchSets()` writes into `item.all` as the tree is built, walking the items from the last to the
  first. `whole()`, which wrote `item.all` while reading it, is gone. `itemtree.js` owns `items` and `roots`;
  `model.js` imports them and exports them on, so the imports go one way and every other script still imports them
  from `model.js`. Its `buildItems({ include, regionals })` takes the tree's settings as one object, which also ends
  `prune()`'s two flag arguments. The code moved unchanged otherwise, with its loops in blocks and the innermost loop
  of `addOpponents()` as `opposeBranches()`, which works out the rival's branch once rather than once per item.
  `model.js` keeps the marks, the filters, the counts and the saving: 188 lines of code, down from 251; `itemtree.js`
  has 99. `js/model/` now holds 7 files. This answers Question 4 of 2026-11-02 09:51:57.
- **Layout.** Every loop in the scripts of the page has its body in a block of its own: 20 loops in `civsets.js`,
  `model.js`, `optionsview.js`, `stringbuilder.js`, `treeview.js`, `nodetree.js` and `optionshandler.js`. Each
  script now reads from the top down: imports, constants and state, then each exported function followed by the
  functions it calls, in the order it first calls them. Functions that look alike stay together, with a helper they
  share after them, such as `recall()`, `remember()` and `keepInAddress()`, then `attempt()`; small helpers that many
  functions use come last, such as `$()`, `clone()` and `simple()` in `stringbuilder.js`. `model.js` follows the
  order the review gave. Constants read while a script loads stay above what reads them: `fitAll` above `sizes`,
  `draw` above `page`, `chooseView` and `chooseTips` above `choices`, `picked` above `readers` and `showView` above
  `writers`. In `js/script.js` the start-up code comes before `start()`. Fifteen scripts were reordered; each holds
  exactly the lines it held before, which a comparison of their sorted lines showed. `icons.js` has no calls between
  its functions, `itemtree.js` was written in this order, and `updatehandler.js` has one function.
- **Tests.** Still 99, none added or removed, with the same numbers. `toStart()` in `run_test.js` runs before each of
  the 15 groups of tests: it clears the page (`reset()`) and sets Simple UI on, Include off, Include Regionals on,
  Tooltips on and the first language. `snapshot()` keeps the visitor's settings for `restore()`, and `rounds()` runs
  the groups from one list, in the same order as before; the two returns to the first language written into it by
  hand are gone. Run once in the reverse order, all 99 tests passed, so no group leant on what an earlier group left
  behind, and `toStart()` needed nothing more. `checkAll(name, parts)` in `helpers_test.js` checks named parts, and a
  failure's detail lists the parts that failed: 15 of the 16 checks of three or more parts joined with `&&` use it, 7
  in `behaviour_test.js` and 8 in `interface_test.js`, keeping their names. A part that was broken on purpose for one
  run was reported as "Test 29 failed: tree: Expand all, … (1904 by 929: closed)". `behaviour_test.js` has 400 lines
  of code and `interface_test.js` 399.
- **Checked.** All 99 tests passed in Chrome in each of the six windows GitHub runs them in: light and dark colours,
  at 1920 by 1080, 1000 by 1000 and 720 by 1280, at the start, after the new names, after `itemtree.js`, after the
  new order, after `toStart()` and at the end, and in one window after every other step. `?update` fetched the game's
  data from aoe2techtree.net with the code of `4dc6483` and with the new code, after the civilisations were sorted
  once and again at the end: the same report, "Nothing has changed since the last update.", and the same `data.json`
  to download; the two pages differed only in the download's `blob:` address.
- **Documents.** `MAINTAINER.md`: `itemtree.js` in the files table, the UML diagram, the scripts' paragraphs and their
  order; the paragraphs of `model.js` and `icons.js`; the tenth difference from the book's model, view and
  controller, and the Prototype, Command and Facade in the code; the tests' start state and `checkAll()`; and, in the
  rules for changing the code, the top-down order and the loops' blocks. `TESTS.md`: the lines of Tests 3 to 32, 36,
  43 to 46, 49, 52 to 54, 56 to 62, 78 to 80, 98 and 99. `TERMINOLOGY.md`: branch set, lone filter entry, sprite.
  `DECISIONS.md`: the names of the bullets on the model's guard and state, `byFile` and the scripts' order, and new
  bullets for the verbs, `unsubscribe`, `itemtree.js`, the branch sets, the icons and reaches, the patterns, the
  top-down order and the tests' start.

#### Not done

- `code_docu.pdf`, as in the entries before.
- Test 8's check ("marking: marking a building marks and shows everything in it") still joins its three parts with
  `&&`: named, it would take a line more, and `behaviour_test.js` would have 401 lines of code. Checks of two parts
  were left as they are.
- The long functions of the tests were not split. `pictureTests()` is long mostly because of its long test names, and
  the parts of `toolLooks()` and `sourceTests()` share local helpers (`spots()`, `wrong()`, `named()`, `testing()`),
  which each new function would have to be handed; the split would add lines and arguments and leave the checks as
  they are. The long functions of `behaviour_test.js` and `interface_test.js` stay too, as those files are at Rule
  25's limit.
- The loops and order of the tests themselves were left, as were the marks as plain strings (`"has"`, `"lacks"`), the
  exported module state, the `self` accessor of copied items, and the marks' rules without the State pattern: the
  review weighed them and found the change worth less than its cost.
- The page was not tried by hand; only the tests ran.

#### Questions

1. **Rule 26 and the CI's file names against one job per file in `js/view/`.** `pictures.js` holds the tooltips, the
   choice of the screen's pictures, their preloading, Simple UI, and the civilisations' view and Tooltips settings.
   `stringbuilder.js` holds the helpers of the views, three views and the loading screen, and builds no strings,
   whatever its name says. `js/view/` is full, and the pattern of the CI, `js/(model/|view/|controller/)?[a-z]+\.js`,
   and the path check of `sourceTests()` allow no subfolder. Should a subfolder such as `js/view/parts/`, or an eighth
   file in `js/view/`, be allowed, so that both can be split and named for what they hold?
2. **Rules 17 and 25 against clean tests.** One concept per test cannot be had at 99 of 100 tests, and the test
   functions of 36 to 58 lines of code (`standIns()`, `optionTests()`, `branches()`, `menuTests()`, `rivals()`,
   `uniqueFilterTests()`, `crowding()`) cannot be split in files at 400 and 399 lines. Should a group of checks count
   as one test, or should the test files have a larger limit?
3. **`js/model/` is full**, with 7 files. Where should the next script of the model go?
4. **`code_docu.pdf`** knows neither `itemtree.js` nor the new names until it is made again. Should it be made again
   now?

## 2026-11-10

### 05:21:12: Clean Code and Head First Design Patterns refactoring, round 3: test runner, view modules, settings, start-up

#### What changed

- **Why.** The code at `6e846da` was compared with *Clean Code* and *Head First Design Patterns* again. The test
  runner stopped at the first group that threw and named none. `stringbuilder.js` was named for something it did not
  do. A setting reached its control in Options by four routes. A leaf view, `pictures.js`, ran part of the start-up
  and redrew the page. The language rule was written out in five places. The views read each other's markup, as the
  tree view decoded the filter buttons that another view drew. Words such as `mark`, `state` and `kind` had two
  meanings. Several functions did several jobs. The updater read the game's data in the game's own shape throughout.
  The checks of model, view and controller were text searches. The page looks and works as before, but for the six
  changes under "Behaviour changes".
- **Tests.** `runAll()` runs each group through `runGroup()`, which catches what it throws: the group fails "the tests
  ran to the end", with its name and error, and the next group runs. `runTests()` only catches, and
  `runAndPublish()`, `withLimitTest()`, `numbered()`, `publish()` and `stopped()` do the rest. Every result but "the
  tests ran to the end" is numbered, without the old rule that a numbered name holds a colon. Two throwaway errors, in
  `textTests()` and in `runAndPublish()`, were reported as "textTests stopped: Error: probe …" and "the test runner
  stopped: probe", and were removed. `fixtures()` throws when `data.json` lacks an item that a test needs, `beyond()`
  fails when no case exists, `loaded()` names the pictures that did not load, `englishFirst()` puts the languages
  back in a `finally`, and `toStart()` also shows the civilisations as a list. `.github/runtests.sh` runs the tests
  for GitHub and by hand, and the whitelist of `tests.yml` allows only the script paths that `sourceTests()` allows.
  In the tests themselves, the tooltip helpers moved to `pictures_test.js` and the focus helpers to `audit_test.js`;
  `mustHave()` and `mustLack()` replace four pairs of lines; the parts of `rivals()` and `standIns()` have names, from
  `greysTheirs` to `greysAlternatives`, and six more checks use `checkAll()`; loops over lists are `for…of`; bare
  numbers are named constants, with `TIP_MARGIN` and `TIP_GAP` imported from `pictures.js`; clean-ups at the end of
  three groups, which `toStart()` makes needless, are gone; and `sourceTests()` is now `ruleTests()` and
  `layerTests()`, and `toolLooks()` `toolsAtRest()` and `toolsInUse()`. `static_test.js` reads every import into its
  path and names (`importsIn()`), and Test 83 fails a script with an import it cannot follow. Test 85 checks from those
  imports that only `js/model/` imports `civsets.js` and only `page.js` imports `subscribe`, and its check for texts
  in the model's state reads `model.js` and `itemtree.js`. Test 81 reads `index.html` only up to the code that Live
  Server injects, and looks for `//` in the code with its strings blanked. Test 84 tries its function finder on a
  sample first, and checks the form rule below. Four throwaway faults, one for each new check, each failed the test
  meant for it, and were removed. The tests keep their names and numbers, which the names from a real run before and
  after showed; only Test 34's detail differs.
- **View modules.** `js/view/` holds seven modules, each named for what it holds: `page.js` (the page's Composite, its
  fixed and translated texts, its messages and showing it), `civsview.js` (the civilisations' pane: the count, the
  list or the tiles with their setting, and **Filters**), `treeview.js` (the tree, its gestures, buttons and Find
  box), `optionsview.js`, `report.js`, `pictures.js` (the picture look: the screen's pictures, their preloading, the
  loading screen, the tooltip and the scroll bars) and the new `toolkit.js` (`$()`, `clone()`, `simple()`,
  `compose()`, `place()` and `demand()`). `stringbuilder.js` became `civsview.js`, `scrollbars.js` went into
  `pictures.js`, and `nodetree.js` became `treehandler.js`. `cellOf()` is in `icons.js`. The page's observer is
  `{ update: redraw }`, so `draw` and the `page` object are gone, and so is Test 85's check for `page.update(`.
- **Settings and start-up.** `SETTINGS` in `datahandler.js` lists each setting's values, the default first, and
  `recallSetting()` and `rememberSetting()` read and store them everywhere, which ends eight decodings of stored
  strings. `showChoices()` (was `reset()`) is the one writer of the controls of Options, at the start and after
  **OK**, and `apply()` reads every control before it chooses. `optionsview.js` says `languageOptions()`,
  `showChoice()`, `readChoice()` and `setTicked()` (were `options()`, `show()`, `optionValue()` and `tick()`), and
  the switches are styled from `aria-checked`. `setInclude()` and `setRegional()` share `saveAndRebuild()`.
  `script.js` asks for the mode once (`MODE`, `RUNS`) and starts the page; `startScreen()` sets the screen's pictures
  once, `applySimple()` only switches the look, and `chooseSimple()` redraws and ends the loading screen. In
  `pictures.js`, `finishLoading()` is `hideLoadingWhenReady()`, `copy()` `preload()`, `kept` `preloaded` and `rooted`
  `appliesToRoot`. `fetchUpdate()` loads the languages it needs itself.
- **Languages.** `firstLanguage()`, `hasLanguage()` and `startLanguage()` in `datahandler.js` hold the language rule,
  which `unpack()`, `pack()`, `script.js` and `optionshandler.js` use. `chooseLanguage()` keeps the language it waits
  for in `wanted`, without calling itself again. A language that cannot load shows `#languageError`, "The language
  could not be loaded.", from `languageFailed` in the texts, in all 17 languages.
- **Views and controllers.** The tooltip asks the tree view what is under the mouse (`itemAt()`, `branchAt()`,
  `isOpen()`) and the model whether a branch is locked. A filter button carries its filter in a `WeakMap`, and
  `unchip({ item, mark, lone })` takes it as one argument. In `treeview.js`, a press is one object, a long press and a
  drifting press have names, and the drawing of a row, its mark and its bar are functions of their own. In
  `treehandler.js`, `key()` acts on a key and `keyAction()` only finds what the key means; `MOVES` holds the four
  moves of the focus and `BRANCH_KEYS` the right and left arrows (`enterOrExpand()`, `leaveOrCollapse()`); and
  **Find** is `highlightMatches()` and `showMatches()`. `changesNames()` and `rebuilds()` in `toolkit.js` say what a
  change means for a view. `civsview.js` builds an entry of the list and of **Filters** in functions of their own;
  `page.js` sets its links with `setLink()`; the language menu says `menuOpen()`, `setMenu()` and `coverSettings()`;
  and the scroll bars name their timings and steps (`LINE_PX`, `REPEAT_AFTER_MS`, `REPEAT_EVERY_MS`).
- **Model.** The words of marking have one meaning each: `toggleMark()` (was `mark()`), `branchState()`,
  `toggleState()`, `checkboxState()` and `filterMark()`, while `mark` is a mark's value and `kind` a node's type, and
  `allCivs` is the set of every civilisation (was `ALL`). The questions about the tree's shape (`lineOf()`,
  `lineEnd()`, `endsInLine()`, `chainOf()`, `itemChain()`, `ancestors()`, `descendants()`, `isUnitOrTech()`) and
  `treeKeys()` moved to `itemtree.js`, which builds the items in named steps (`linkOriginals()`, `linkRivals()`,
  `linkAlternatives()`) and prunes them with named questions (`isHidden()`, `tellsNothing()`, `isBareLeaf()`).
  `filtersOf()` reads as one line of named steps, and `chipOf()` is `entryOf()`. The updater reads the game's nodes and
  `extras` through `fromGame()` and `fromExtra()`, into one shape, works on maps keyed by civilisation and language,
  and returns `{ messages, blocked, counts, files }`, which `report.js` shows in short functions.
- **Form.** `icons.js` names a picture's file once (`fileName()`), `texts.js` exports the placeholder pattern that
  `fill()` and `compose()` share, both with `Object.hasOwn`, and `pictures.css` names the parchment's ink, the gold
  and the serif font stack as custom properties. At a script's top level, a function with statements is now a
  `function` declaration and an arrow function a single expression: 52 arrows became declarations, and Test 84
  checks the rule.
- **Behaviour changes.**
  - B1: the test runner goes on after a group throws and names it; `fixtures()` throws and `beyond()` fails when
    `data.json` lacks a case.
  - B2: GitHub runs six windows over http, from Node's built-in `http` module, and one over `file://`, from
    `.github/runtests.sh`; its whitelist allows only the script paths that `sourceTests()` allows.
  - B3: `cellOf()` throws for a picture that is not in its atlas.
  - B4: the switches in Options have no `data-state`; CSS styles them from `aria-checked`, and they look the same.
  - B5: the start-up only reads the stored settings, and no longer writes them back.
  - B6: a language that cannot load shows `#languageError`, in the language in use, on a switch and at the start;
    `#loadError` has `lang="en"`.
- **Checked.** All 99 tests passed in all seven windows of `.github/runtests.sh`: over http in light and dark colours
  at 1920 by 1080, 1000 by 1000 and 720 by 1280, and over `file://` in light colours at 1920 by 1080, after steps 1,
  3 to 7, 9, 12, 13 and 16 to 18 of the work and at its end, and in one window after every other step; once more with
  the civilisations stored as tiles. By hand, over http, with Chrome driven from Node: the switches in Options gave
  the same 40 screenshots as at `6e846da` (light and dark, forced colours, with and without Simple UI, each switch
  on and off), and changed settings came back after a reload; the start in the picture look, the loading screen,
  Simple UI on and off, a reload in either look, and `?update`; a blocked language on a switch and at the start, and
  a language that loads; the tooltips of the tree's arrows; clearing a filter button by click and by Enter, and the
  focus after it; the keys, clicks, right-click, long and drifting presses, **Find**, and the buttons above the
  tree, against `6e846da`; and `?update` with the data of aoe2techtree.net, and with data altered by hand, which gave
  the same report and the same files with the old updater and the new.
- **Documents.** `MAINTAINER.md`: the files table with `.github/runtests.sh`, the UML diagram, the scripts'
  paragraphs and their order, how to add a setting, how to run the tests, the patterns by their true names, the
  loading screen's functions, the tests' start state and a group that stops, and the form rule. `TESTS.md`: the
  lines of every test, with the function each sits in, and the runner's names as the titles of Tests 6, 9, 68 and
  79; Tests 81, 83, 84, 85, 86 and 99 as they now work; the address part of the language tests over http only; and
  the details that now name what failed. `TERMINOLOGY.md`: filter entry, setting, picture look and start language.
  `DECISIONS.md`: the bullets with old names and the patterns brought up to date, new bullets for this entry, and
  seven rule conflicts.

#### Not done

- `code_docu.pdf` and the code-docu skills' files, which still name the old modules, as in the entries before.
- The step that asked for no `params.has` in `js/view` and `js/script.js` leaves one: the `MODE` line, which that
  same step gives.
- Choosing the language already shown does not hide `#languageError`, as **OK** acts only on changed choices;
  choosing a language that loads does (Question 8).
- The range line under the tree keeps `compose()`, not `fill()`: with `fill()` it became one text node, and Test 69,
  "every control has a name that contains its visible text", failed.
- `updateLink` keeps its one line in `writeFixed()`, as its text comes from the texts and `data.source.update` has no
  name to pass to `setLink()`.
- One font stack in `pictures.css`, `"Trajan Pro", "Civ Georgia", Georgia, serif`, differs from the serif stack and
  stays as written.
- Two limits of 3 in the tests, the offenders the audit lists and the notes of the interface tests, keep their bare
  numbers. Test 34's detail names the failing part instead of the window sizes.
- `barProblems()` and `dropsGreyed()` stay in `helpers_test.js`, as `pictures_test.js` and `behaviour_test.js` have
  400 lines of code (`DECISIONS.md`, Rule 25).
- The titles of Tests 13, 47, 78 and 95 in `TESTS.md` still differ from the runner's names: those of 13 and 47 are
  over 120 characters, and those of 78 and 95 read only after their category.
- This entry follows the form of the entry of 2026-11-08 22:36:58, the last before it.

#### Questions

1. **Rule 26 and the CI's whitelist against one job per module.** `js/view/`, `js/model/` and `js/tests/` are full,
   so the tooltip and the scroll bars share `pictures.js`, `datahandler.js` cannot be split, and test helpers stay in
   `helpers_test.js`. Would one level of subfolders, or 9 files to a folder, be allowed, so that `tooltips.js` and
   `scrollbars.js` can be modules of their own?
2. **The tests over http.** `.github/runtests.sh` uses Node's built-in `http` module as a plain program, with no
   package and no build. Is that within Rules 13 to 15? The first push shows whether the `ubuntu-26.04` image runs it
   as expected.
3. **The new text `languageFailed`.** Its 16 translations were written without a native speaker's check, and it also
   shows at the start when the visitor's language cannot load. Should they be checked?
4. **The 8 `techtree_*.webp` files** in `assets/images/ui/backgrounds/`, which nothing uses. Keep them or delete them?
5. **Rule 17.** Would counting groups of tests instead of checks keep the rule's intent and allow one concept per
   check?
6. **Rule 7.** Would a narrow exception be acceptable for a comment giving a reason or a pattern's name?
7. **`code_docu.pdf` and the code-docu skills** know neither the new modules nor the new names until they run again.
   Should they run now?
8. **`#languageError`.** Should choosing the language already shown hide it, as choosing one that loads does?
9. **Test 84's name** speaks of lines and functions only, not of the form rule or the finder's sample, which it now
   checks too. Should its name say so?

### 09:36:28: Answers to the questions, subfolders, and one thing per test (Rule 17)

#### What changed

- **Answers.** Of the questions of 05:21:12: one level of subfolders is allowed (1); Node's built-in `http` module in
  `.github/runtests.sh` is within Rules 13 to 15 (2); no native speaker can check the 16 translations of
  `languageFailed` for now, so they stay as they are (3); the 8 `techtree_*.webp` files stay (4); Rule 17 now asks
  that a test test one thing only, for one purpose, a requirement, a rule or a bug that once was, and that no two
  tests test the same thing, with no limit of 100 (5); Rule 7 has no exception, and the code keeps no comments (6);
  `code_docu.pdf` and the code-docu skills do not run yet (7); Question 8 is set out in more detail under "Questions"
  (8); Test 84 went with the split of the tests, as it no longer kept Rule 17 (9).
- **Subfolders.** `js/view/pictures/` holds the picture look: `pictures.js` (the screen's pictures, their preloading and
  the loading screen), `tooltips.js` (the tooltip, with `tips`, `setTips()`, `TIP_MARGIN` and `TIP_GAP`) and
  `scrollbars.js` (the scroll bars, with `barsByBox` and `LINE_PX`). `startPictures()` starts the other two with
  `startTips()` (was `wireTip()`) and `startBars()`. `js/model/data/` holds what `datahandler.js` held: `storage.js`
  (`SETTINGS`, `recall()`, `remember()`, `recallSetting()` and `rememberSetting()`), `address.js` (`params` and
  `keepInAddress()`), `guard.js` (`attempt()`) and `datahandler.js`, the Facade, which loads, unpacks and packs the data
  and the languages, holds the language rule and passes on the others' exports, so the scripts outside `js/model/data/`
  import from it as before, by its new path. `treeview.js` stays whole: its gestures, buttons and **Find** box share its
  rows, its actions and its press, and modules split from it would import each other. The scripts load in the same
  order, with the new files in their place. The tests' check of paths allows one subfolder (`PLACED`), the check that
  only the data layer stores data or touches the address exempts `js/model/data/`, and the whitelist of `tests.yml`
  allows `js/model/`, `js/view/`, `js/controller/` and `js/tests/` one subfolder each.
- **One thing per test.** The 99 tests are 289. Each checks one thing and names one purpose in `TESTS.md`: a
  requirement; a rule, with WCAG 2.2 under Rule 3; or a bug that once was, with its entry. A behaviour that no
  requirement names, such as the picture look, Include Regionals or the updater, is tested under Rule 4, which asks
  for tests that the page still works, with the entry where it was decided, and a decision about the code's structure
  under Rule 6 (Question 2). No test was dropped for want of a purpose. `js/tests/` holds `run_test.js`,
  `helpers_test.js`, `audit_test.js` and a folder for each kind:
  - `behaviour/`, 79 tests: `marking_test.js`, `branches_test.js`, `tree_test.js`, `lines_test.js`,
    `greying_test.js`, `finding_test.js` and `samples_test.js`.
  - `interface/`, 76 tests: `menu_test.js`, `languages_test.js`, `options_test.js`, `keys_test.js` (the keyboard,
    accessibility and the runs of the audit), `uniques_test.js`, `headings_test.js` and `reporting_test.js`.
  - `pictures/`, 69 tests: `pictures_test.js`, `picturetools_test.js`, `icons_test.js`, `findbox_test.js`,
    `tooltips_test.js`, `treebuttons_test.js` and `scrollbars_test.js`.
  - `static/`, 54 tests: `scanner_test.js`, the scanner of the scripts, `rules_test.js`, `layers_test.js`,
    `data_test.js` and `updates_test.js`.
  - `audit_test.js`, 11 tests, which the other files run in many states.

  A thing checked in several places keeps one name, from `NAMES` in `helpers_test.js`, such as "layout: the page does
  not scroll" and "options: the choices are remembered"; 13 tests run in more than one file. A sample that a test needs,
  and that the data or the page must have, is now a guard that throws, as `fixtures()` does, and the group then fails
  "the tests ran to the end"; the setup checks of the old Tests 8, 13 to 15, 83 and 84, among others, became such
  guards. Parts that another test already checked went, such as the order of the civilisations in seven behaviour tests
  and the state of the language button in the old Tests 33 and 34. The old Test 55 went, as the tests of every `lang`
  attribute, of each language choice's tag and of each control's name cover it, and so did the old Test 99, which
  counted the tests, with `withLimitTest()`, `LIMIT` and `tagTests()`. The paths of the style sheets and the scripts,
  and the folder and the format of a picture that a style sheet names, are left to the whitelist of `tests.yml`; a path
  or a `url()` outside the project is still caught, by "rules: the code has no dependencies".
- **New tests**, of things no test checked: **Clear** removes every mark (Requirement 17); Space marks an item must
  have; a right-click by pointer events marks it must lack; the tick and the cross in Simple UI (Requirement 23); an
  edge case of Requirement 34; marking a line must lack clears the must-have marks below it; Up goes to the item
  above; and a click outside the language menu closes it.
- **Helpers.** A helper sits beside the tests that use it: the tooltip's in `tooltips_test.js`, the scroll bars'
  (`loaded()`, `sprite()` and the others that `barProblems()` used) in `scrollbars_test.js`, and `dropsGreyed()` in
  `finding_test.js`; those that a folder's files share are in `behaviour/samples_test.js` and
  `pictures/picturetools_test.js`. `helpers_test.js` lost 43 declarations that nothing used any more, `checkAll()` and
  `flags()` among them, and has `phone()`, `footerAsWide()` and `footerHidden()` for the footer's tests. `run_test.js`
  runs the groups and numbers the results, with no limit.
- **Checked.** All 289 tests passed in all seven windows of `.github/runtests.sh`: over http in light and dark
  colours at 1920 by 1080, 1000 by 1000 and 720 by 1280, and over `file://` in light colours at 1920 by 1080. In each
  folder, throwaway faults in the page, its style sheets or its data each failed the tests meant for them, and were
  removed; where one failed nothing, its test was made stricter until it did. The order of the scripts was read
  from `index.html` and the imports.
- **Documents.** `TESTS.md` anew: each test with its file, its purpose and what it expects, in the order the tests
  run, with a contents by the category in each name. `MAINTAINER.md`: the files table, the UML diagram, the
  subfolders, the data and pictures paragraphs, the order of the scripts, how to add a setting, the table of
  `js/tests/`, and the tests by file instead of number. `TERMINOLOGY.md`: setting and picture look.
  `DECISIONS.md`: the decisions of these answers, the Facade over `js/model/data/`, the view modules, one thing per
  test, the tests in groups and folders, the paths left to GitHub, and the end of the rule conflicts of Rules 17, 25
  and 26.

#### Not done

- `code_docu.pdf` and the code-docu skills' files, which still name the old modules and test files, such as
  `static_test.js`, `js/view/pictures.js` and `js/model/datahandler.js`.
- `treeview.js` stays whole, as above.
- `#languageError` is as it was (Question 1).
- "layout: on a phone, the footer is hidden" checks only in a window under 720 pixels wide and over 639 high, and no
  window of `.github/runtests.sh` is: there it passes without checking.
- In a headless tab driven from Node, which gets no focus events, "language menu: moving focus out of it closes it"
  (Test 90) fails, as the old Test 34 did; it passes in all seven windows of `.github/runtests.sh`.

#### Questions

1. **`#languageError` (Question 8 of 05:21:12).** Only putting a language to use hides it. **OK** acts only on the
   choices that changed, so choosing the language already shown does nothing, and the text stays until a language
   loads or the page reloads. The text also sits between the header and the panes (`.load-error`, `flex: none`, in
   the body's column of `100dvh`), so showing or hiding it moves the panes and makes them shorter or taller, which
   Rule 18 and Requirement 35 may forbid; `#loadError` did the same before 05:21:12. Should it stay as it is, hide on
   **OK** when the language shown is chosen, hide on any **OK** or **Cancel**, or take no room, over the page or in
   the Options window?
2. **Tests under Rules 4 and 6.** Some tests rest only on a decision in the DEVLOG, under Rule 4 (the page still
   works) or Rule 6, as no requirement names what they check: the picture look, Include Regionals, the updater, and
   the structure of the code. Should they stay, or go?
3. **Requirement 3 and the headings.** Requirement 3 gives each node a checkbox, while Test 188, "tree: a group
   inside a building has no checkbox", checks the headings decided on 2026-10-26. Should Requirement 3 say so?
4. **Requirement 16's "Close".** The Options window has **Cancel** and **OK**, and Test 114, "options: Cancel or OK
   closes the window", reads them for Requirement 16's Close button. Is that right?
5. **Include Regionals** is in no requirement, and Tests 108 and 111 rest on Rule 4. Should a requirement name it?
6. **The Xolotl Warrior and the Stable** grey each other out, which Requirement 37's variant branches do not cover,
   so Tests 44 and 49 rest on Rule 4. Is that right?
7. **Greying out and Rule 18.** A branch that is greyed out closes (Test 46), which moves the rows below it. Does
   Rule 18 allow it?
8. **The paths in `url()`.** Only the whitelist of `tests.yml` checks them now, and it does not catch a style sheet
   that names a picture that does not exist. Should a test check that?

### 11:04:37: Answers to the questions of 09:36:28, Requirements 3 and 16, and the Civ view's test

#### What changed

- **Answers.** Of the questions of 09:36:28: the tests that rest on Rule 4 or Rule 6 stay (2); Requirement 3 now
  allows some group nodes without a checkbox (3), and Requirement 16 names **Cancel** and **OK** and says that **OK**
  applies any changes (4); Include Regionals (5) and the Xolotl Warrior (6) stay tested under Rule 4; Rule 18 allows
  a greyed-out branch to close (7). Question 8 rested on no bug: the two style sheets and `index.html` name 47 files
  in 49 places, and each of them exists, with the same case, so no test is due (8). Question 1 is asked again below,
  with the steps that show it.
- **Purposes.** In `TESTS.md`, Test 112, "options: the window's buttons are Cancel and OK", and Test 114, "options:
  Cancel or OK closes the window", rest on Requirement 16, and Test 189, "tree: a group inside a building has no
  checkbox" (was Test 188), on Requirement 3.
- **The Civ view's test.** Of the six choices in the Options window, only the Civ view had no test that **OK**
  applies it: the tests start with the list, and none picked **Tile**. Test 169, "pictures: OK shows the
  civilisations in the Civ view chosen" (Requirement 16), picks **Tile** and **OK**, then **List** and **OK**, without
  Simple UI, where the choice shows: the first two civilisations sit side by side as tiles, and not as a list.
  "options: the choices are remembered" (Test 116) checks that the Civ view is stored too. Tests 169 to 289 are now
  170 to 290.
- **Checked.** All 290 tests passed in all seven windows of `.github/runtests.sh`. Two throwaway faults each failed
  only the test meant for them, and were removed: tiles that never show failed Test 169, and a Civ view that is not
  stored failed Test 116.
- **Corrected.** The entry of 09:36:28 has, under "Not done", that "layout: on a phone, the footer is hidden" never
  checks in the windows of `.github/runtests.sh`. It does: the window of 720 by 1280 gives the page 704 by 1129
  pixels, which is under 720 wide, so the test checks the phone layout there, in light and dark colours.
- **Found.** A language that cannot load shows its message in a line above the panes, which makes both panes shorter
  and moves everything in them down: in a window of 1280 by 900, by 36 pixels with Simple UI and 48 without. When the
  message goes, they move back. So it has been since 2026-11-02, with the text "AoE2 Civ Explorer could not load its
  data." until 05:21:12 (Question 1).
- **Documents.** `TESTS.md`: the purposes above, Test 169, the numbers from 169 on, Test 116's places, and the line
  numbers in `pictures_test.js`. `DECISIONS.md`: a greyed-out branch closes under Rule 18, and the tests under Rules
  4 and 6 stay.

#### Questions

1. **The message "The language could not be loaded."** (`#languageError`; Question 8 of 05:21:12 and Question 1 of
   09:36:28). It shows when the file of a language chosen in the Options window, such as `locales/fr.json`, cannot be
   fetched, for example offline: the page stays in the language it was in, and the message appears in a line of its
   own between the title and the two panes. It also shows at the start, when the file of the visitor's own language
   cannot be fetched and the page starts in English. In Chrome:
   1. In DevTools, open "Network request blocking" and block `locales/fr.json`.
   2. Open Options, choose Français and press **OK**. The page stays in English, the message appears, and both panes
      move down and get shorter, by 36 pixels with Simple UI and 48 without.
   3. Open Options, choose English, the language shown, and press **OK**. Nothing happens, as **OK** acts only on
      the choices that changed, and the message stays.
   4. Open Options, choose Deutsch and press **OK**. German loads, the message goes, and the panes move back up.

   So the message goes only when another language loads, or on a reload, and its coming and going resizes both panes,
   which Requirement 35 forbids. Which should be done?
   - (a) Nothing.
   - (b) Hide it on the next **OK** or **Cancel** too. It then goes when expected, but the panes still move when it
     comes and goes.
   - (c) Give its line room always. Nothing moves, but the panes are always 36 pixels shorter, 48 without Simple UI,
     on phones too.
   - (d) Show it in a small window over the page, like the updater's report, closed with **OK**. Nothing moves, and
     it goes when closed. At the start, though, the window would open by itself, which WCAG 2.2's 3.2.5, Change on
     Request, may not allow, so there the page could start in English without a message.

### 11:35:26: The message that a language could not be loaded is a popup

#### What changed

- **The popup.** "The language could not be loaded." (`#languageError`) is now a popup: a modal `<dialog>`, with the
  role `alertdialog`, over the page, which opens when the language chosen in Options cannot be fetched, and at the
  start when the visitor's own language cannot. Its **OK** closes it, and the focus goes back to where it was, the
  Options button after a choice. Nothing on the page moves: the panes keep their place and size (Requirement 35),
  which the line between the title and the panes did not, and the message no longer stays until another language
  loads. `showLanguageError()` in `page.js` opens it, in place of `setLanguageError()`; `optionshandler.js` calls it
  when a language fails and hides nothing when one loads, so `useChosen()` is gone; and `script.js` calls it once the
  page is shown. With Simple UI the popup is a plain box with an **OK** button, and in the picture look its **OK** is
  the game's button, as in Options. `.load-error` now styles only `#loadError`. This answers Question 1 of 11:04:37.
- **The new text `messageTip`**, "Click to close this message", is the tooltip of the popup's **OK**, in all 17
  languages; its 16 translations were written without a native speaker's check, as those of `languageFailed` were.
- **Tests.** Five new tests in `js/tests/interface/options_test.js`, which run after the accessibility tests: with
  the file of the next language made to fail, choosing that language opens the popup (Test 233), the page and
  Options stay in the language in use (234), the panes neither move nor change size (235), **OK** closes the popup
  (236) and gives the focus back to the Options button (237). The audit also runs with the popup open. `wait()` moved
  from `marking_test.js` to `helpers_test.js`, as both test files use it. Tests 233 to 290 are now 238 to 295.
- **Checked.** All 295 tests passed in all seven windows of `.github/runtests.sh`. Throwaway faults, each removed at
  once: a line above the panes again failed only Test 235; a popup that is not modal, only Test 233; an **OK** that does
  not close it, Tests 236 and 237; and the focus taken away before the popup opens, Test 237, with "rules: only the
  views touch the page", which that fault broke. Options left on the failed language failed Test 234 only when `apply()`
  also no longer showed the choices: `apply()` shows the language in use after every **OK**, so the same line in
  `languageFailed()` changes nothing then. By hand, in Chrome, with `locales/fr.json` blocked, with and without Simple
  UI: the popup opened after Français and **OK**, and at the start with `?lng=fr`; the panes kept their place and size;
  and **OK** closed it, with the focus back on the Options button after a choice, and on the page at the start.
- **Documents.** `TESTS.md`: Tests 233 to 237, the numbers from 233 on, and the line numbers in `options_test.js`.
  `MAINTAINER.md`: the popup in `script.js`, `page.js` and `optionshandler.js`. `DECISIONS.md`: the popup, how it
  opens at the start under WCAG 2.2's 3.2.5, and the translations of `messageTip`.

#### Not done

- `languageFailed()` still shows the language in use in Options, which `apply()` has done already. It stays, as it
  still counts when the window is open again as the language fails: the window then shows the language in use.
- `code_docu.pdf` and the code-docu skills' files, which still name the old modules, as in the entries before.

### 13:04:12: `code_docu.pdf` made again, with a chapter for each subfolder

#### What changed

- **`code_docu.pdf`** made again: 126 pages, 2.4 MB, 6893 links, none without a target, 783 bookmarks, and every page
  A4; 14 chapters, 57 subchapters, 652 functions and 12 objects. Each subfolder of `js/` is now a chapter of its own,
  after the folder it is in: `js/model/data/` (5), `js/view/pictures/` (7) and the four folders of tests,
  `js/tests/behaviour/` (10), `interface/` (11), `pictures/` (12) and `static/` (13). It describes the code as it
  stands after 11:35:26: `treehandler.js` in place of `nodetree.js`, `civsview.js` and `toolkit.js` in place of
  `stringbuilder.js`, `itemtree.js`, the four scripts of `js/model/data/`, the three of `js/view/pictures/`, the tests
  in 22 files, and the popup about a language that could not be loaded.
- **Descriptions.** `layout.json` lists the 14 folders and their 57 files. The text in `desc/` was written again for
  every script that was split, moved or renamed since 2026-11-02; where a function's code had not changed, its old
  description was kept word for word, with the names of files and functions brought up to date. Two old descriptions
  were wrong: `countOf()` takes what every item under an item has in common, its branch set, not what any of them has;
  and `clear()` now cites Requirement 17 alone, as 18 and 19 are Expand all and Collapse all. `onTop()` no longer
  cites Requirement 27, which was rescinded. `desc/` now holds six files, which `references/descriptions.md` lists.
  In `desc/00.txt`, the folders `js/model/`, `js/view/`, `js/controller/` and `js/tests/` are described anew, and the
  six subfolders for the first time. In `desc/01.txt`, the parts of `index.html`, `base.css` and `pictures.css` cover
  their files' lines again, `index.html` has a part for the popup, and the introductions of the UML pages name the
  subfolders.
- **UML.** The overview's boxes name the scripts of a subfolder as `data/datahandler.js` and the folders of tests as
  `behaviour/`, each now linked to its subchapter or chapter: `uml.js` read a name only up to a `/`, and `gen.mjs`
  linked a folder's name as a file's. The diagrams of the model and the view take in their subfolders' scripts. The
  model could not at first be drawn without a crossing, as `model.js` and `updater.js` both import `itemtree.js` and
  `texts.js`; 48 shuffled orders of the arrows, shuffled orders of the boxes, and ELK's other layouts (stress, force
  and mrtree) all failed and were dropped again. `uml.js` now also tries each arrow written the other way round
  (`civsets <.. itemtree` for `itemtree ..> civsets`), which still draws the arrow from `itemtree` to `civsets` but
  lets ELK lay the boxes out from its other end; with that arrow turned, the model is drawn clean. `collide.js` takes
  an arrow's head from its marker, so a turned arrow is checked as the arrow it shows. `uml.js` also draws every order
  and keeps the largest clean drawing, where it kept the first. The text is 6.5 points in the overview (7.6 before),
  3.7 in the model (4.7), 4.5 in the view (5.6) and 9 in the controller.
- **The skills' scripts.** `code-docu-uml/scripts/parts.mjs`: each part's diagram takes in its subfolders, a box of
  the overview may name `sub/file.js` or `sub/`, and the overview is checked against the subfolders.
  `code-docu-inventory/scripts/inventory.mjs` follows an `import()` held in a `const`, as `testRunner` in `script.js`
  is, so `runTests()` and `loadFailed()` are called by `script.js`; `testmap.mjs` finds the file of each part of a
  test's "File residence" in `TESTS.md`. The `SKILL.md` of `code-docu`, `code-docu-uml` and `code-docu-inventory`,
  `references/form.md` and `references/descriptions.md` say so.
- **Checked.** The draft listed no warning. `verify.py` found no dead link, no wrong header, no bad bookmark and no
  page that is not A4. These pages were looked at: the title page, both pages of the contents, the four UML pages (the
  model's also at four times the size, to follow its arrows), the page of `data.json`, the first pages of
  `js/model/`, `js/model/data/` and `js/tests/behaviour/`, and the first page of the index. No `node_modules` or
  `package.json` is in the repository. The tests were not run again: since 11:35:26, when all 295 passed, only
  `.claude/skills/` and `documentation/` have changed.
- **Documents.** `MAINTAINER.md`: a subfolder is a chapter too. `DECISIONS.md`: the decision on `code_docu.pdf` says
  so and links here.

#### Questions

1. **The UML text** is now 3.7 points in the model and 4.5 in the view, the smallest yet: `js/model/` and its
   subfolder have ten scripts, and `js/view/` and its subfolder nine. Question 1 of 2026-11-02 10:12:50 asked the
   same at 4.7 points and is still open. Should the model's and the view's diagrams get a larger page, or be split,
   such as `js/model/data/` and `js/view/pictures/` each on a page of their own?

### 13:13:18: Every page of `code_docu.pdf` upright

#### What changed

- **The controller's UML page** was printed on its side, the only page of the PDF that was not upright: `uml.js` tried
  each diagram on an upright and a lying A4 page and kept the larger drawing, and at 9 points the controller's three
  boxes fit the lying page better. `uml.js` now tries the upright page alone, `doc.css` and `gen.mjs` no longer define
  the lying page, and `verify.py` now fails a page that is not upright A4, where it passed a lying one. The
  controller's diagram is upright, its three boxes one under the other, at 9 points as before; the other three UML
  pages were upright already and are unchanged.
- **`code_docu.pdf`** made again: 126 pages, all upright A4, 2.4 MB, 6888 links, none without a target. The five links
  fewer are in the index, where a name that wraps over two lines is two links.
- **Documents.** `references/form.md` and the `SKILL.md` of `code-docu-uml` and `code-docu-pdf` say that every page
  is upright. `DECISIONS.md`: the decision on the UML pages says so and links here.
