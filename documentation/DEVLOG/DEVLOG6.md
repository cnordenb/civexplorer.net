# Development log, part 6

- [2026-11-02](#2026-11-02)
- [2026-11-08](#2026-11-08)

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
