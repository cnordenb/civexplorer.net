# Development log, part 1

- [2026-10-18](#2026-10-18)
- [2026-10-19](#2026-10-19)

Log of sessions starting from 18 October, refining a generated single file prototype into an actually good, maintainable and robust page which should survive possible extinction of artifical intelligence. Some development may have been left out from phases of not syncing and git tracking this devlog between devices. There have been attempts to clean up any slop writing from this log. Readers who happen to read and notice rubbish are encouraged to submit an issue pointing it out and it will be remedied ASAP.

Part 1 of the development log. It goes on in [part 2](DEVLOG2.md). The decisions made in the log are listed in
[DECISIONS.md](../DECISIONS.md).

## 2026-10-18

### Translations, and making the project follow RULES.md

#### What changed

- **One file became four.** The old `index.html` held its data, styles and script inline. It is now split, as
  rules 1 and 2 ask:
  - `index.html` holds only structure. All repeated markup, such as tree rows, filter buttons, list items and
    language choices, is in `<template>` elements.
  - `style.css` holds all styles.
  - `script.js` holds all behaviour.
  - `data.json` holds every fact and every piece of text.
- **All comments are gone** (rule 7). What they explained now lives in `MAINTAINER.md`.
- **Translations.** A language menu at the top right offers the same 17 languages as aoe2techtree.net, in the same
  order and under the same `?lng=` codes (`en`, `zh`, `tw`, `fr`, `de`, `hi`, `it`, `jp`, `ko`, `ms`, `pl`, `ru`, `es`,
  `mx`, `tr`, `vi`, `br`), so a link such as `index.html?lng=de` works the same way. Taken from how aoe2techtree.net
  does it:
  - The choice is remembered in the address (`?lng=`) and in local storage.
  - On a first visit the page picks the best match from the browser's languages, or else English.
  - Names of civilisations, buildings, units and technologies come from the game's own text, through
    aoe2techtree.net's locale files.
- **Where this project differs from aoe2techtree.net:**
  - It uses proper language tags (`ja`, `zh-TW`, `pt-BR` and so on) in `lang`, where aoe2techtree.net writes its
    own codes such as `jp`. The tags matter for screen readers, and for WCAG 3.1.1 and 3.1.2.
  - It changes language in place, without reloading, so marks and open branches are kept.
  - It uses a menu of buttons rather than a `<select>`. With a `<select>` that acts on change, the language would
    switch on every arrow key press while someone moves through the list. That is a WCAG 3.2.2 and 3.2.5 failure
    (technique F37).
- **Text that changes with the language:**
  - The `lang` of the page, and of every language choice in the menu.
  - Plural forms through `Intl.PluralRules`, including Polish and Russian "few" and "many".
  - Numbers, the footer's month (`Intl.DateTimeFormat`), and the sort order of the civilisation list
    (`Intl.Collator`).
  - Search ignores case, accents and punctuation in every script.
- **Text rewritten so it reads clearly in translation.**
  - "techs" and "Civs" are now written out in full, because WCAG 3.1.4 (AAA) asks for abbreviations to be
    expanded.
  - The count after each tree item is read out as "52 civilisations" in each language.
- **The data now comes from aoe2techtree.net automatically.** Before, which civilisation has what was typed in by
  hand.
  - All 465 items of the old hand-made tree were compared with aoe2techtree.net's per-civilisation trees, and every
    one matched exactly.
  - The page's built-in updater, `index.html?update`, now produces `data.json` from that source. It keeps the
    hand-made parts: the tree's shape, the page's text, `overrides` and `ignore`.
- **Four items were missing from the old tree and are now in it:** the Pasture, and Domestication, Pastoralism and
  Transhumance (all Khitans only). They sit next to the Farm and under the Mill.
- **Visible changes to English names,** because English names now come from the game's text like every other
  language:
  - "Warships" is now "Medium Warships".
  - "Ming-Kuang Armor" is now "Ming Guang Armor".
  - "Red Cliff Tactics" is now "Red Cliffs Tactics".
  - "Incas" is now "Inca", and "Mayans" is now "Maya".
  - "Heavy Demolition Ship" is kept through an override, because the game's tech-tree label shortens it to
    "Heavy Demo Ship".
- **Name corrections in `overrides`.** The game's tech-tree labels are sometimes shortened ("E.", "Arm.", "dem.").
  The updater then falls back to the full name in the item's help text. In Polish, Russian and German that full
  name is in the accusative case, so 13 names have hand corrections in `overrides` (de, pl, ru, mx, tw, vi, en),
  plus "Корабль-дракон", which the Russian game text leaves in English.
- **Tests (rule 4)** live in `script.js` and run with `index.html?test`. There are about 6,000 checks:
  - The rules themselves: no comments, no CSS or HTML in `script.js`, no game data in `script.js`, no images,
    sounds or animations, and no dependencies.
  - The completeness and consistency of `data.json`.
  - Marking with click, Space, X, right-click, long press and the menu key; filter buttons; Find; Expand and
    Collapse all; keyboard movement in the tree and the menu; and the language menu.
  - For every language: all text present, no placeholders left over, the tree named and the civilisations sorted
    in that language.
  - Accessibility, in several states and every language:
    - text contrast of 7:1 (4.5:1 for large text), and 3:1 for control borders;
    - 44 by 44 pixel targets;
    - a 3px focus outline with 3:1 contrast, and nothing covering what has focus;
    - names for every control, with the visible label inside the name;
    - valid ARIA references, headings and landmarks;
    - 1.5 line spacing, no justified text, no sideways overflow, and the WCAG 1.4.12 text spacing test;
    - no page scrolling, and on the landing page nothing scrolling at all where the screen allows.
  - The page also tests itself inside 320 by 256 (400% zoom), 360 by 640 and 390 by 844 frames.
  - The tests were checked by breaking a copy of the page in 11 ways: contrast, focus outline, a transition, sideways
    overflow, a comment, a missing translation, an inline style, target size, the filter logic, page scrolling and
    an image. Every break was caught.
- **Continuous integration.** `.github/workflows/tests.yml` runs the tests on every push and pull request:
  - It uses the Chrome that GitHub's Ubuntu runners already have, in light and dark colours, at four window sizes.
  - It checks that the repository holds only the allowed files.
  - It uses no GitHub Actions at all, not even `actions/checkout` (rule 14).
- **No page scrolling (rule 12).** The document never scrolls.
  - When the page opens, with every branch closed, it fits on desktop, laptop, tablet and 390 by 844 phone
    screens with nothing scrolling.
  - On smaller screens the panes scroll inside themselves.
  - On very short screens, such as 400% zoom, the content area below the header scrolls.
- **Layout.** The language button stays at the top right. On phones the tree pane gets the room its rows need, and
  the civilisation pane takes the rest.
- **Before the data has loaded, the page shows nothing,** instead of unlabelled buttons. Without JavaScript only the
  `<noscript>` message shows.
- **`MAINTAINER.md`** explains, step by step, how to update the page after a patch (rule 5).
- **`README.md`** describes the page and points to `MAINTAINER.md`.

#### Decisions where rules met each other

- **Rule 1 and rule 2.** A few texts stay in `index.html` in English because they must exist before or without
  JavaScript:
  - the `<title>` ("AoE2 Civ Explorer", which a valid page must not leave empty);
  - the meta description;
  - the `<noscript>` message and the "could not load its data" message;
  - the "×" on filter buttons.

  The `<title>` is a proper name, so leaving it untranslated does not break WCAG 3.1.2.
- **Rule 2 and rule 4.** "All JavaScript in `script.js`" meant the tests and the updater had to live there too, so
  every visitor downloads them, about 40 KB more (roughly 11 KB once compressed). They run only with `?test` or `?update`. The CI step is shell
  commands in YAML, not JavaScript.
- **Rule 3 and rule 12.** At 400% zoom (320 by 256), WCAG 1.4.10 needs vertical scrolling: nothing can fit. So the
  document still never scrolls, but the content area below the header does, and the header with the title and the
  language menu stays put.
- **Rules 13, 14 and 15.** The update tool is not a build step: it refreshes the data, and runs in the browser
  from `script.js`. The first, Python version of the tool, and the Python tests, were removed when rule 15 arrived.
- **Testing small screens.** Chrome's current headless mode will not make a window narrower than 500 pixels. The tests
  therefore load the page into 320, 360 and 390 pixel frames themselves (a template in `index.html`, sizes in
  `style.css`), so CI covers 400% zoom without any extra download.

#### Open questions

1. **Translations.** The page's own text in the 16 other languages is new: the title, buttons, hints, group
   headings such as "Economy", and the counts. Names of game items come from the game. Native speakers should
   check this text, especially Hindi, Malay, Vietnamese, Turkish, Korean and Japanese. German uses the game's own
   word "Völker" for civilisations, and "Spezialeinheiten" for unique units.
2. **English names.** Should the English page keep "Incas" and "Mayans" instead of the game's current "Inca" and
   "Maya"? The same question applies to "Warships" instead of "Medium Warships". Either can be set with two lines
   in `overrides`.
3. **Title.** The tab title stays "AoE2 Civ Explorer", as last set, and is not translated. The heading on the
   page is the longer title, and it is translated. Is that the intended result?
4. **Rule 12 on small phones and at high zoom.** On a 360 by 640 phone the tree's five rows do not all fit next to
   the rest, so the tree pane scrolls inside itself. At 400% zoom the content area scrolls. The document itself
   never does. Is that acceptable, or should the phone layout be squeezed further? Two ways to squeeze it: put Find
   and the buttons on one row, or shorten the legend.
5. **First visit.** Should the page follow the browser's language on a first visit, as it does now, or always
   start in English, as aoe2techtree.net does?
6. **Publishing.** Is the page published, for example on GitHub Pages? `MAINTAINER.md` says the updater can also
   be run on the published address.

#### Obstacles met, and how they were solved

- **Rule 15 came part-way through.** A Python update tool and a Python test plan were replaced by the updater and
  the tests in `script.js`. The JavaScript updater was checked against the Python output: it produces a `data.json`
  that is identical byte for byte.
- **Browsers will not `fetch()` a `file://` address.** `script.js` uses `XMLHttpRequest`, and CI starts Chrome with
  `--allow-file-access-from-files`. For people, `MAINTAINER.md` explains how to use a local server such as Live
  Server.
- **Chrome's headless mode on Windows.**
  - It made the viewport 16 by 208 pixels smaller than the window, and it followed the system's dark mode.
  - The tests therefore print the real window size, and CI sets the colours explicitly with
    `--blink-settings=preferredColorScheme`.
  - The workflow has not yet run on GitHub, because nothing has been pushed. The first push will show whether
    Linux behaves the same.
- **WCAG AAA cannot be proven by automated tests alone.** Some criteria need a person to judge: 3.1.3 unusual
  words, 3.1.5 reading level, 1.3.2 meaningful sequence, and how a screen reader actually announces things.
  `MAINTAINER.md` asks for a keyboard, zoom and screen reader check after bigger changes.
- **The game's own names are sometimes abbreviated, or in the accusative case.** This is handled by the
  abbreviation check in the updater and by `overrides`.

## 2026-10-19

### An item is marked when everything under it is

#### What changed

- **The rule.** An item is now marked must-have whenever everything under it is marked must-have. Before, marking
  Champion left Militia, Man-at-Arms, Long Swordsman and Two-Handed Swordsman unmarked, and showed Militia as only
  partly marked. Now marking Champion marks the whole line.
- **How it works.** `script.js` keeps two marks per item.
  - `chosen` is what the visitor set.
  - `self` is what counts: the visitor's own mark, or must-have when everything under the item counts as
    must-have.

  `settle()` works out `self` from `chosen`, from the bottom of the tree up, every time anything changes.
- **Undoing.** Because the parents' marks are worked out rather than stored, clearing Champion clears the marks it
  caused, instead of leaving four ticks behind.
- **Must-lack marks.** When marking an item makes the items above it must-have, any must-lack mark the visitor had
  put on those items is removed. It cannot hold any more, and it would otherwise come back if the item were
  cleared again.
- **Tests.** Seven new checks:
  - marking the last item of a line marks the whole line, and lists the right civilisations;
  - clearing it clears the line again;
  - it replaces must-lack marks above it;
  - marking every leaf under an item marks the item;
  - marking every item marks the whole tree;
  - and, after marking every third leaf and after marking every leaf, no item in the tree is left unmarked while
    everything under it is marked.

  With the old behaviour put back, six of them fail.
- **`MAINTAINER.md`.** Step 4 now explains that where an item sits in the tree matters, because of this rule.

#### Open question

- **Lumber Camp and Mining Camp.** In two places a civilisation has everything under an item without having the item
  itself:
  - Muisca and Tupi have all the Lumber Camp technologies.
  - Incas, Mapuche and Muisca have all the Mining Camp technologies.

  These civilisations research them at their Settlement instead. Under the new rule, marking all of those
  technologies also marks the camp, so these civilisations drop out of the list. Before, they stayed in. Every other
  item in the tree is unaffected: wherever a civilisation has everything under an item, it also has the item. Is
  that acceptable for the two camps? If not, the technologies could move out from under the camps in the tree.

### Opening a branch opens its whole line

#### What changed

- **Opening a branch opens the chain below it.** Opening a branch, with its arrow or the Right key, now also opens
  each only child below it, down to the end of the line or to the first item that has more than one child. So
  opening Militia shows everything down to Champion in one step. Before, it took four.
- **How it works.** `expand()` in `script.js` does this. Closing a branch, Expand all and Collapse all are
  unchanged. Find also still opens only the branches that lead to its matches.
- **Tests.** Two new checks:
  - For every branch in the tree, opening it from a fully closed tree leaves exactly that branch and its chain of
    only children open.
  - The Right key opens a line all the way down.

  With the old behaviour put back, both fail.
- **Note.** The current tree has no only child that itself forks into several children, so the "stop at the first
  fork" case is covered by the rule in the code and in the test, but no current item exercises it.

### Optional items, an exception to the marking rule

#### What changed

- **The exception.** Some items are now marked `"optional": true` in the tree in `data.json`: the Mill, Lumber Camp
  and Mining Camp. Civilisations with a Folwark, Mule Cart or Settlement have those buildings' technologies without
  having the building. An optional item is not marked automatically when everything under it is marked. It stays
  unmarked, and shows as partly marked.
- **What this allows.** An optional item can also be marked must-lack while everything under it is must-have. For
  example, "Two-Man Saw but no Lumber Camp" lists Muisca and Tupi. This answers the question about the two camps in
  the earlier entry.
- **Code.** `script.js` reads the flag when it builds the tree, and `settle()` skips optional items when it marks
  parents. The flag lives in `data.json`, not in the code (rule 1), so `script.js` still names no game item.
- **Tests.** Five new checks:
  - an optional item stays unmarked when everything under it is marked, and the right civilisations are listed;
  - an optional item can be must-lack while everything under it is must-have;
  - marking every leaf marks every item except optional ones (this replaces "marking every item marks the whole
    tree");
  - the flag only appears as `true`, on items with something under them;
  - a guard for future patches: any item that some civilisation can do without, while having everything under it,
    must be optional. Today that is the Lumber Camp and the Mining Camp. The Mill is optional by choice: Poles
    have its farming technologies without a Mill, though no civilisation has everything under it without one.

  When the code ignores the flag, three tests fail. When the flag is removed from Lumber Camp, the guard fails and
  names it.
- **`MAINTAINER.md`.** Step 4 explains optional items, and what to do if the guard fails after a game update.

### Two numbers on closed items

#### What changed

- **Closed items show two numbers.** An item that is closed and has something under it now shows two numbers, such
  as Militia's "52–39". The first counts the civilisations that have the item itself. The second counts those that
  have the item and everything under it, which is also what marking the item selects. For a line, the second number
  is its last upgrade's: 39 civilisations have Champion.
- **Open items, leaves and groups show one number.** An open item, and an item with nothing under it, show only
  their own number, so an open Militia line reads 52, 52, …, 39 down to Champion. Groups such as Economy have no
  item of their own, so they keep their single number: the civilisations with everything in the group.
- **Numbers follow the filters.** Both numbers count only civilisations that fit the marks so far, as before.
- **Code.** `count()` in `script.js` writes one item's number. `update()` calls it for every item, and `setOpen()`
  calls it whenever an item opens or closes.
- **Screen readers.** The visible "52–39" is hidden from them. They hear "52 civilisations, 39 civilisations with
  everything under it" instead.
- **Text.** Two new texts in every language: `range` (the visible "{own}–{all}", with an en dash) and `civRange`
  (the spoken version). `civRange` is a new translation, so it should be checked with the other texts.
- **Tests.** Six new checks:
  - closed items show both numbers;
  - a closed line shows its first item's and its last upgrade's numbers (the Militia example);
  - opening a line shows each item's own number;
  - open items show one number;
  - and both stay right with filters, open and closed.

  When every item always shows one number, three of them fail.

#### Open question

- **Items that branch.** For items that branch, "its deepest descendant" was read as "everything under it". So a
  closed Archery Range shows "56–0", because no civilisation has every Archery Range unit, unique units included.
  The other option would be the single deepest item under it, but where several items sit equally deep there is
  no single answer. Should branching items show only their own number when closed instead?

### A shorter tree by default, and an Options window

#### What changed

- **Left out by default.**
  - The Unique Units, Unique Technologies and Unique Buildings groups. These are marked `"unique": true` in the
    tree in `data.json`.
  - Items that every civilisation has, when everything under them does too. The whole Town Center branch goes,
    along with Wonder, Monk, Murder Holes and others: 34 items in all.
  - Items that only one civilisation has, when everything under them does too: the Pasture, Domestication,
    Pastoralism and Transhumance.

  Universal and single-civilisation items are worked out from the data, from the bottom of the tree up, so an
  item goes once nothing under it is left. The tree drops from 469 items to 166. All five top-level rows stay.
- **Left out means left out entirely.** These items cannot be marked, do not count in the numbers, and do not stop a
  parent being marked. A closed Castle now shows 56–27 instead of 56–0, and the Monastery 54–7 instead of 54–1,
  because their unique units no longer count.
- **Options window.** An **Options** button now sits beside Clear, Expand all and Collapse all.
  - It opens a window with one checkbox, **Include Unique and Universal**, which is off by default. Ticking it shows
    the full tree again.
  - The choice is remembered in local storage. Marks and open branches survive switching it on and off, for items
    in both views.
  - The checkbox is a full-width row with the tree's own tick box, so the whole row is a 44 by 44 pixel target.
  - A line under it explains what it includes.
  - The window closes with Close or Escape, and focus returns to the Options button.
- **Code.** `prune()` and `plant()` in `script.js`:
  - `prune()` works out the shortened tree.
  - `plant()` rebuilds the tree when the option changes, keeping marks and open branches by each item's place in
    the tree.
- **The Monastery is now optional.** With unique units and the universal Monk left out, Armenians have every
  remaining Monastery technology but no Monastery, because they use the Fortified Church. The test for optional
  items now checks both the full tree and the shortened one, which is how it found this.
- **Counts no longer wrap.** A two-number count could break across lines at the dash next to a long name, such as
  "15–10" beside Mounted Crossbowman. It no longer does.
- **Text.** Four new texts in every language: `options`, `includeAll`, `includeHint` and `close`. The English
  wording of `includeAll` was given. The rest are new translations, so they should be checked.
- **Tests.**
  - New checks:
    - what the default view leaves out;
    - the Options button;
    - ticking and unticking with click and Space, keeping marks;
    - remembering the choice;
    - closing and returning focus;
    - accessibility with the window open, and with everything included and open;
    - the `unique` flag is only on groups.
  - The tests start from the default view and put the visitor's own choice back at the end.
  - Making the page show everything by default fails two checks. Removing the Monastery's flag fails the optional
    check.
- **`MAINTAINER.md`.** Step 4 explains the `unique` flag, the automatic leaving out, and the Monastery.

#### Open question

- **Items that still show 56–0.** Some items show 56–0 even without unique units: the Barracks, Archery Range,
  Stable (50–0), Siege Workshop and Dock. No civilisation has every regional unit under them, for example both the
  Elephant Archer and the Slinger. This is the
  same question as in the entry before: should branching items show only their own number when closed?

### script.js split into modules in js/ (rule 16)

#### What changed

- **The layout.** `script.js`, which had grown to 1,401 lines, is now ten scripts in `js/`. They are native ES
  modules, linked with `import` and `export`, so there is still no build step and no dependency (rules 13 and 14).
  `index.html` loads `<script type="module" src="js/script.js">`.

  | Script | Lines | Its job |
  | --- | --- | --- |
  | `js/script.js` | 16 | Entry point: loads the data, starts the page, loads the tests (`?test`) or runs the updater (`?update`). |
  | `js/datahandler.js` | 238 | All data handling: loading `data.json` and the language files, the chosen language and its text and formats, availability sets, saved choices (`recall`, `remember`), and the updater's fetching and file writing. |
  | `js/model.js` | 113 | The tree and its rules: building and pruning it, marking, optional items, lines and chains, filter names. |
  | `js/ui.js` | 397 | All UI handling: the tree's DOM, counts, the civilisation list, filter buttons, Find, mouse, touch and keyboard, the language menu, the options window and the report window. |
  | `js/tests/run.js` | 93 | The test runner: the small-window frames, merging results, the report. |
  | `js/tests/helpers.js` | 87 | Shared test helpers and the sample items. |
  | `js/tests/audit.js` | 143 | The accessibility and layout audit. |
  | `js/tests/static.js` | 136 | Checks on the source files and the data. |
  | `js/tests/behaviour.js` | 218 | Marking, filters, counts, the tree, the keyboard, Find. |
  | `js/tests/interface.js` | 119 | The language menu, every language, the options window, text spacing. |
- **Why `model.js`.** Marking rules are neither data handling nor UI, and keeping them out of `ui.js` keeps it under
  400 lines. For the same reason the chosen language's text and formats (`nameOf`, `plural` and so on) now live in
  `datahandler.js`, and saved choices go through `recall` and `remember` there instead of `localStorage` in `ui.js`.
- **Tests only load when testing.** They are pulled in with a dynamic `import()` when the address has `?test`, so
  visitors no longer download them.
- **Modules from disk.** ES modules load from `file://` in Chrome with `--allow-file-access-from-files`, which CI
  already uses. Both static and dynamic imports were checked before splitting. From a server, as with Live Server or
  GitHub Pages, nothing changes.
- **Tests now check the new layout.** They find every script by following the imports from `js/script.js`, so a new
  script is checked automatically, with no list to maintain. Rules now checked:
  - no comments in any script;
  - no CSS or HTML in the scripts;
  - every script is in `js/` and imports only scripts there;
  - test files are in `js/tests/` and load only when testing;
  - no script is over 400 lines (a guideline, now a check);
  - only `ui.js` (and the tests) touch the page, and only `datahandler.js` (and the tests) load or store data;
  - no game data in any script.

  Breaking each rule in a scratch copy fails exactly the matching check and names the file. This covers a comment,
  a 407-line `ui.js`, a static import of the tests, `document` in `model.js`, and `localStorage` in `ui.js`.
- **CI.** The list of allowed files in `.github/workflows/tests.yml` now accepts `js/…/name.js` instead of
  `script.js`.
- **Results.** All 108 tests pass in light and dark colours, in the main window and the 320 by 256, 360 by 640 and
  390 by 844 frames. The updater still reproduces `data.json`, reporting no changes apart from the date.
- **`MAINTAINER.md`** describes the scripts, what each one does, and what to do when one passes 400 lines.

#### Note

- **The old `script.js`.** It is deleted from the working folder but not yet from git. Commit the deletion along
  with the new `js/` folder.

### At most 100 tests (rule 17)

#### What changed

- **108 tests became 91.** Checks that test one feature were merged into a single test with all of their conditions,
  so no behaviour lost coverage. A merged test's failure message just names the combined behaviour.
  - A click marks an item, then lists **and counts** the civilisations.
  - A long press marks must-lack, and a right-click clears it.
  - Marking a line's last item marks the line, and clearing it clears the line again.
  - The two "no item left unmarked" checks (some items marked, every item marked) are one.
  - "A whole line is named after its last upgrade" and "a line shows only its deepest must-have item" are one.
  - With filters, open and closed counts are one.
  - Expand all, Collapse all and a branch's arrow are one.
  - The keyboard checks are now two: Up, Down, Home and End; Right and Left.
  - Find marks matches and announces their number in one check.
  - Language menu: opening it with the current language marked is one check; Escape and leaving it is one;
    choosing a language and naming it on the button is one.
  - Options: opening and closing the window is one check; ticking the box and keeping marks is one.
  - On the page: no images, video or animations is one check.
  - Data: the `optional` and `unique` flags are one check.
- **One test removed outright.** "An open line shows only each item's own number" is gone. "Open items show only
  their own number" checks every open item, lines included.
- **A new guard.** "rules: there are at most 100 tests" counts the tests in the report, itself included. It runs in
  the main window, after the small-window results are merged in. That leaves room for nine more tests before one has
  to be folded in or replaced.
- **Checked.**
  - All 91 tests pass in light and dark colours, in the main window and the three small windows.
  - With the limit set to 90, the guard fails with "91 tests".
  - With counts always showing one number, three counts tests still fail.
  - With parents never marked automatically, six marking tests still fail.
- **`MAINTAINER.md`** explains the limit, what counts as a test, and what to do when it is reached. It also says to
  record changes in `DEVLOG.md`, which `RULES.md` now names for rule 8.

### A cogwheel button, with the language menu in the Options window

#### What changed

- **First, the Options button moved into the header.** It went from beside Clear, Expand all and Collapse all to
  the header, next to the language button. At 400% zoom in Spanish (Mexico), the title was squeezed into a sliver
  and the header grew taller than the screen, so the header was allowed to wrap. That was replaced straight away by the
  change below.
- **The Options button is now a cogwheel.** It shows ⚙ (U+2699) followed by U+FE0E, which asks for the plain-text
  form of the character rather than the coloured emoji. It is a text character in the page's text colour, not an
  image, so rule 9 holds, and the contrast tests measure it like any other text. It is hidden from screen readers,
  which hear the translated word "Options" from hidden text inside the button. The button is 44 by 44 pixels and
  sits at the top right.
- **The language menu now lives in the Options window.** It is labelled with a visible "Language". Its list now
  opens inside the window instead of being pinned to the top right of the screen; the window scrolls if the list
  does not fit. Escape first closes the list, then the window. Closing the window also closes the list.
- **The header** is back to the title and one button, with no wrapping needed.
- **Tests.** The language menu tests now open the Options window first, and check that the menu is inside it. To
  check that leaving the menu closes it, they now move focus to the checkbox, because the page behind an open
  window cannot take focus. The test count stays at 91. All 91 pass in light and dark colours, in all four window
  sizes.
- **`MAINTAINER.md`** says where the language menu is, and that the cogwheel opens the Options window.

### The Options window keeps its size

#### What changed

- **The rule.** Opening or closing the language list no longer changes the size of the Options window.
- **How.**
  - The open window has a fixed height of `min(30rem, the screen's height minus 32px)`, set in `.options[open]`, and
    its usual width, so its size depends only on the screen, never on what is open inside it.
  - The window is a grid of four rows: the title, the language row, a shared area, and Close.
  - The language list and the settings (the checkbox and its explanation, now wrapped in `#settings`) share the
    third row and take turns: opening the list hides the settings, and closing it brings them back. `setMenu()` in
    `js/ui.js` does this.
  - The shared row takes whatever height is left, and the list scrolls inside it when it does not fit.
  - The language picker's wrapper uses `display: contents`, so its list can sit in the shared area while still
    counting as part of the picker for keyboard and click-outside handling.
- **The cost.** With the list closed, there is some empty space between the explanation and Close.
- **Tests.**
  - The language menu check now also records the window's size with the list closed, open and closed again, and
    requires all three to match. It is folded into an existing check, so there are still 91 tests.
  - To check that leaving the list closes it, the test now moves focus to Close, because the checkbox is hidden
    while the list is open.
  - All 91 tests pass in light and dark colours, in all four window sizes.
  - Without the fixed height, the check fails. The window measured 512 by 273, then 512 by 489, then 512 by 273.

### Test bug fixed

#### What changed

- Tests reduced from 91 to 90
  - Check for javascript in index.html was removed because a local live server injection was causing false positive.

### The Dock is a top-level row

#### What changed

- **The Dock and its whole branch moved.** They left the Economy group and are now a top-level row between Military
  and Blacksmith, a change made in the tree in `data.json`.
- **How.** The JSON writer in `js/datahandler.js` made the move, after confirming it reproduces `data.json` exactly,
  so nothing else in the file changed.
- **Tests.** All tests pass in light and dark colours, in all four window sizes.

### TESTS.md filled in (rule 19)

#### What changed

- **`TESTS.md`** now lists all 90 tests as Test 1 to Test 90, in the order they first run, in the format stated at
  the top of the file. Each test has three fields: File residence (file and line numbers), Purpose and Assertion
  expectation.
- **At most 120 characters per field.** Purposes name the rule, WCAG criterion or requirement number a test protects,
  where there is one. Known false positives are noted in the assertion expectation, as in Tests 75 and 87.
- **Checked.** A script confirmed 90 tests, no field over 120 characters, and that each listed line holds the test it
  names.
- **CI.** The workflow's list of allowed files now includes `TESTS.md` and `REQUIREMENTS.md`, so committing them does
  not fail the "only allowed files" check.
- **`MAINTAINER.md`** asks for `TESTS.md` to be updated whenever a test is added, changed or removed.

### Marking opens what it marks (requirements 28 to 31)

#### What changed

- **Marking opens what it marks (Req. 28, 31).** Marking an item, by click, Space, X, right-click or long press, now
  opens it down to its first fork or the end of its line, and opens the way to every item the mark was passed to.
  So marking a building, a top-level row or a group opens everything in it. Before, marking opened nothing.
  Clearing a mark still opens nothing.
- **Marks pass down a line only at the same count (Req. 29, 30).** Marking a unit or technology marks the items
  below it in its line only while they have as many civilisations, counted from the data without filters. Before,
  it marked everything below: marking Militia (52 civilisations) also marked Champion (39), so the list shrank to
  39. Now it marks Man-at-Arms (52) and stops at Long Swordsman (51), and the list keeps all 52.
- **Unchanged.** Marking the end of a line still marks the whole line (Req. 27), as was decided. A civilisation with
  a line's last item always has the items above it, so the list does not change. Buildings, top-level rows and
  groups still pass their mark to everything in them.
- **Which items are units and technologies.** `data.json` has no type field. An item with no other item above it,
  only groups or nothing, counts as a building. All 34 such items are buildings. Any item under another item counts
  as a unit or technology. `isUnitOrTech()` in `js/model.js` works this out.
- **Follow-on fixes.**
  - Clicking a marked unit or technology again clears it. The toggle now looks at the item's own mark. Before, a line
    only partly marked below it read as mixed, and a second click marked it again.
  - A marked unit or technology shows its own mark, and a dash only when items below it carry a different mark
    (Req. 26). Unmarked items below it no longer turn its box into a dash. `boxState()` in `js/model.js` decides.
  - Marking a unit or technology must lack clears must-have marks below it, which can no longer hold. Otherwise, X on
    a fully marked line did nothing.
- **Tests.** There are now 92.
  - New: marking a unit or technology opens its line and shows everything marked with it; a mark passes down a line
    only to items with as many civilisations, for both must have and must lack.
  - "Marking a branch marks everything in it" is now "marking a building marks and shows everything in it", and
    "marking a group marks what is in it" is now "marking a top-level group marks and shows everything in it".
  - The line filter test now expects the filter to be named after the deepest item the mark reached.
  - Each new or changed check fails when the behaviour it covers is taken out.
  - All 92 tests pass in light and dark colours, in all four window sizes.
- **`TESTS.md`.** The new tests are Tests 44 and 45, and the tests after them are renumbered. The table of contents
  lists every test once, under its category.
- **`MAINTAINER.md`.** Step 4 explains how an item's place in the tree makes it a building or a unit or technology,
  and how marks pass down a line.

### A building at the top of a line is named Full

#### What changed

- **The names.** In the default tree, some buildings head a single line, because what else sat under them is left
  out. Fully marked, they were listed under Filters by the line's last item: Market read "Guilds", Mill "Crop
  Rotation" and Lumber Camp "Two-Man Saw". It was decided that they read "Full Market", "Full Mill" and "Full Lumber
  Camp", like every other building (Req. 24). Mining Camp already read "Full Mining Camp".
- **Walls and towers keep their names.** It was decided that Stone Wall and Watch Tower still follow the deepest
  descendant (Req. 25) and read "Fortified Wall" and "Keep", because their rows are their own upgrades. The tree
  cannot tell them apart from the Lumber Camp, so both carry a new flag in `data.json`: `"upgrades": true`.
  Marking them still marks their whole line, as for any building.
- **Code.** `chipName()` in `js/model.js` names a filter by its line's deepest marked item only for units,
  technologies and buildings with upgrades.
- **Tests.** There are now 93.
  - New: a building at the top of a line is named Full, unless the line holds its upgrades. It is Test 34, and the
    tests after it are renumbered in `TESTS.md`. With the old naming put back, only this test fails.
  - The data check for the hand-edited flags now also covers `upgrades`.
  - All 93 tests pass in light and dark colours, in all four window sizes.
- **`MAINTAINER.md`.** Step 4 explains the `upgrades` flag, and when to add it.

### The tests run in the order of TESTS.md's categories

#### What changed

- **Three rounds.** It was decided that the tests run in the order of the table of contents in `TESTS.md`: the 47
  functional tests first, then the 27 accessibility tests, then the 19 maintainability tests. Within each round they
  keep the order they had. `TESTS.md` is renumbered to match, so the former Test 13 is now Test 1.
- **How.** `runTests()` in `js/tests/run.js` runs the rounds. Tests that moved to another round no longer lean on
  what the tests around them left behind; each sets up what it needs.
  - `js/tests/static.js`: the data checks are split into `textTests()` (functional), `tagTests()` (accessibility)
    and `dataTests()` (maintainability).
  - `js/tests/behaviour.js`: the focus checks for filter buttons, "Right opens a line" and "Enter goes to the first
    match" moved into `keyboardTests()`, for the accessibility round.
  - `js/tests/interface.js`: the audits, the language menu's keys, wider text spacing and Space on the Include box
    moved into `accessibilityTests()`. The audits still run in every state they ran in before.
- **Checked.** For one run, the report's sorting was switched off, so it listed the tests in the order they first ran.
  That order matched `TESTS.md`, all 93 tests. Every line number in `TESTS.md` was checked against the code. All 93
  tests pass in light and dark colours, in all four window sizes.
- **`TESTS.md`** also has back the previous entry's changes, the new Test and the flag check's wording, which a
  save from an editor had undone.
- **`MAINTAINER.md`** explains the three rounds, and that a new test goes in its own round.

### MAINTAINER.md explains the code

#### What changed

- **New chapter, "How the code works".** It sits before the rules and says briefly what each script does, naming
  its main functions, and how a click on an item travels through the code.
- **UML diagram.** A class diagram, written in Mermaid inside the Markdown, shows each script, its main functions and
  which scripts it uses. GitHub draws it, so there is no image file. It was checked by drawing it with Mermaid 10.9.1.

### A blank line around every function

#### What changed

- **Easier to read.** As decided, every function in `js/` and `js/tests/` now has a blank line before and after
  it, at every level. A function that opens or closes its block has none on that side. Only blank lines were added;
  every other line is unchanged, which was checked file by file.
- **The 400-line limit counts lines of code.** It was decided that blank lines no longer count. The test is now "no script
  is over 400 lines of code". With the limit lowered to 300 for one run, it failed and named `js/ui.js`, which has
  389 lines of code.
- **`TESTS.md`.** Every line number is updated, and so is the limit test's wording.
- **`MAINTAINER.md`.** The limit counts lines of code, and the rules now ask for a blank line around every function.
- **Tests.** All 93 tests pass in light and dark colours, in all four window sizes.

### code_docu.pdf

#### What changed

- **`code_docu.pdf`**, 26 pages: one chapter per file, in this order: `index.html`, `style.css`, each script in `js/`,
  `data.json`, and `locales/de.json` as an example. Each top-level function in a script is a subchapter that says
  what it does and why, in at most 240 characters; the two JSON chapters are short.
- **Checked.** All 159 functions are covered, in the order of the code, and no explanation is over 240 characters;
  the build checked both against the scripts. The PDF has page numbers and a clickable outline.
- **Not yet allowed in the repository.** The CI check of allowed files does not list `code_docu.pdf`, so committing
  it as it is fails that check.

### A documentation folder, and script.js in the main folder

#### What changed

- **`documentation/`.** As decided, `README.md` is the only Markdown file left in the main folder. `MAINTAINER.md`,
  `RULES.md`, `REQUIREMENTS.md`, `TESTS.md`, `DEVLOG.md` and `code_docu.pdf` moved into `documentation/`. Their
  contents are unchanged; `REQUIREMENTS.md` was only moved.
- **`script.js`** moved from `js/` to the main folder, as decided. `index.html` loads it from there, and its imports
  now point into `js/`.
- **Links.** `README.md`'s two badges and its link to the guide point into `documentation/`.
- **CI.** The list of allowed files now allows `README.md` and `script.js` in the main folder, and Markdown and PDF
  files in `documentation/`. A Markdown file in the main folder now fails the check. This also allows `code_docu.pdf`.
- **Tests.** The tests find the scripts from `script.js`. The rule test now reads "script.js is in the main folder and
  every other script in js/, scripts import only scripts in js/, and the tests are in js/tests/ and load only when
  testing".
- **Documents.** `MAINTAINER.md` lists `script.js` and `documentation/` among the files; `TESTS.md` has the new wording
  of Tests 77 and 78; `code_docu.pdf` was built again with `script.js` as its third chapter.
- **Checked.** All 93 tests pass in light and dark colours, in all four window sizes.
