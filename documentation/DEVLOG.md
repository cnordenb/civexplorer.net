# Development log

Log of sessions from 18-19 October, refining a generated single file prototype into an actually good, maintainable and robust page which should survive possible extinction of artifical intelligence.

## 2026-10-18: translations, and making the project follow RULES.md

### What changed

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

### Decisions where rules met each other

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

### Open questions

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

### Obstacles met, and how they were solved

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

## 2026-10-19: an item is marked when everything under it is

### What changed

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

### Open question

- **Lumber Camp and Mining Camp.** In two places a civilisation has everything under an item without having the item
  itself:
  - Muisca and Tupi have all the Lumber Camp technologies.
  - Incas, Mapuche and Muisca have all the Mining Camp technologies.

  These civilisations research them at their Settlement instead. Under the new rule, marking all of those
  technologies also marks the camp, so these civilisations drop out of the list. Before, they stayed in. Every other
  item in the tree is unaffected: wherever a civilisation has everything under an item, it also has the item. Is
  that acceptable for the two camps? If not, the technologies could move out from under the camps in the tree.

## 2026-10-19: opening a branch opens its whole line

### What changed

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

## 2026-10-19: optional items, an exception to the marking rule

### What changed

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

## 2026-10-19: two numbers on closed items

### What changed

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

### Open question

- **Items that branch.** For items that branch, "its deepest descendant" was read as "everything under it". So a
  closed Archery Range shows "56–0", because no civilisation has every Archery Range unit, unique units included.
  The other option would be the single deepest item under it, but where several items sit equally deep there is
  no single answer. Should branching items show only their own number when closed instead?

## 2026-10-19: a shorter tree by default, and an Options window

### What changed

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

### Open question

- **Items that still show 56–0.** Some items show 56–0 even without unique units: the Barracks, Archery Range,
  Stable (50–0), Siege Workshop and Dock. No civilisation has every regional unit under them, for example both the
  Elephant Archer and the Slinger. This is the
  same question as in the entry before: should branching items show only their own number when closed?

## 2026-10-19: script.js split into modules in js/ (rule 16)

### What changed

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

### Note

- **The old `script.js`.** It is deleted from the working folder but not yet from git. Commit the deletion along
  with the new `js/` folder.

## 2026-10-19: at most 100 tests (rule 17)

### What changed

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

## 2026-10-19: a cogwheel button, with the language menu in the Options window

### What changed

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

## 2026-10-19: the Options window keeps its size

### What changed

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

## 2026-10-19: test bug fixed

### What changed

- Tests reduced from 91 to 90
  - Check for javascript in index.html was removed because a local live server injection was causing false positive.

## 2026-10-19: the Dock is a top-level row

### What changed

- **The Dock and its whole branch moved.** They left the Economy group and are now a top-level row between Military
  and Blacksmith, a change made in the tree in `data.json`.
- **How.** The JSON writer in `js/datahandler.js` made the move, after confirming it reproduces `data.json` exactly,
  so nothing else in the file changed.
- **Tests.** All tests pass in light and dark colours, in all four window sizes.

## 2026-10-19: TESTS.md filled in (rule 19)

### What changed

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

## 2026-10-19: marking opens what it marks (requirements 28 to 31)

### What changed

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

## 2026-10-19: a building at the top of a line is named Full

### What changed

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

## 2026-10-19: the tests run in the order of TESTS.md's categories

### What changed

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

## 2026-10-19: MAINTAINER.md explains the code

### What changed

- **New chapter, "How the code works".** It sits before the rules and says briefly what each script does, naming
  its main functions, and how a click on an item travels through the code.
- **UML diagram.** A class diagram, written in Mermaid inside the Markdown, shows each script, its main functions and
  which scripts it uses. GitHub draws it, so there is no image file. It was checked by drawing it with Mermaid 10.9.1.

## 2026-10-19: a blank line around every function

### What changed

- **Easier to read.** As decided, every function in `js/` and `js/tests/` now has a blank line before and after
  it, at every level. A function that opens or closes its block has none on that side. Only blank lines were added;
  every other line is unchanged, which was checked file by file.
- **The 400-line limit counts lines of code.** It was decided that blank lines no longer count. The test is now "no script
  is over 400 lines of code". With the limit lowered to 300 for one run, it failed and named `js/ui.js`, which has
  389 lines of code.
- **`TESTS.md`.** Every line number is updated, and so is the limit test's wording.
- **`MAINTAINER.md`.** The limit counts lines of code, and the rules now ask for a blank line around every function.
- **Tests.** All 93 tests pass in light and dark colours, in all four window sizes.

## 2026-10-19: code_docu.pdf

### What changed

- **`code_docu.pdf`**, 26 pages: one chapter per file, in this order: `index.html`, `style.css`, each script in `js/`,
  `data.json`, and `locales/de.json` as an example. Each top-level function in a script is a subchapter that says
  what it does and why, in at most 240 characters; the two JSON chapters are short.
- **Checked.** All 159 functions are covered, in the order of the code, and no explanation is over 240 characters;
  the build checked both against the scripts. The PDF has page numbers and a clickable outline.
- **Not yet allowed in the repository.** The CI check of allowed files does not list `code_docu.pdf`, so committing
  it as it is fails that check.

## 2026-10-19: a documentation folder, and script.js in the main folder

### What changed

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

## 2026-10-21: background pictures, and a Simple UI option (requirements 32 and 33, rule 22)

### What changed

- **Background pictures.** As decided, the page shows a parchment pinned to a wooden board behind the panes. There
  are four versions in `assets/images/ui/backgrounds/`, and `style.css` picks one by the window's size, using media
  queries and no script:
  - `ultrawide.webp` when the window is wider than 16:9, whatever its size;
  - otherwise `uhd.webp` when it is bigger than 2560 by 1440, `qhd.webp` when it is bigger than 1920 by 1080, and
    `fhd.webp` for anything smaller.

  The browser downloads only the picture in use. A maximised browser on a 16:9 screen usually shows the page in a
  window wider than 16:9, because of its tabs and address bar, so it gets `ultrawide.webp`.
- **Solid panels.** As decided, the header, both panes and the footer have solid backgrounds, and the picture shows
  only in the gaps around and between them. The parchment is light and the wood is dark, so no text colour could
  keep a 7:1 contrast on both, in light or dark colours. The header became a full-width bar with 6 pixels of padding,
  so the Options button's border and focus outline sit on it. The footer became a box as wide as its text.
- **Simple UI.** A new box in the Options window, below the Include hint, unticked by default. Ticking it removes the
  picture, so the page uses no images at all, and the layout stays exactly the same. The choice is remembered, like
  Include. Its label is translated into all 17 languages.
- **No picture until it is wanted.** The picture shows only while the page has the `pictures` class. `script.js` calls
  `setSimple()` with the saved choice before it loads `data.json`, so the picture starts loading at once, and a visitor
  who has chosen Simple UI never downloads one. Without JavaScript there is no picture.
- **`js/ui.js`.** `setSimple()` is new. `tick()` replaces `showInclude()` and draws both boxes. One click listener
  and one key listener on the settings now serve both boxes. `ui.js` has 397 lines of code, close to the limit of
  400.
- **Tests.** 95 tests, two new:
  - "options: without Simple UI, the background picture suits the window's size and shape" works out which picture
    the window should get and compares it with the one shown. It runs in every window, so the four test windows in
    GitHub check `ultrawide.webp` and `fhd.webp`. `qhd.webp` and `uhd.webp` were checked by hand in windows of 2184 by
    1349 and 2984 by 1849.
  - "options: ticking Simple UI takes away every image without moving anything and is remembered, and Space unticks
    it" looks for pictures on the whole page, including the page's own background and every `::before` and `::after`.
    It also checks that the box, both lists and the Options button do not move.
  - The contrast tests for text, control borders and focus outlines now fail anything that sits straight on a
    picture. Before, they would have measured it against the colour under the picture.
  - The rule tests allow the background and nothing else. On the page, only the page's background may be a picture.
    In `style.css`, `url()` may only appear in `.pictures` rules and only point into `assets/images/ui/backgrounds/`.
  - During the tests Simple UI is off, and the visitor's choice is put back afterwards, as is done for Include.
- **Checked.** Each new or changed test was broken on purpose and failed as it should. This was done for the panes,
  the header and the footer without their backgrounds, the wrong picture for the window, Simple UI leaving the
  picture on, and a `url()` outside `.pictures`. All 95 tests pass in Chrome, in light and dark colours, in all four
  window sizes.
- **CI.** The check of allowed files now lets in WebP files under `assets/images/` named in lower-case letters.
- **Documents.** `TESTS.md` has Tests 48 and 49, everything after them renumbered, and new line numbers and wording
  where the code changed. `MAINTAINER.md` has a section on the background pictures, the new file folder, `setSimple()`
  and the rule on images. `REQUIREMENTS.md` was not touched. `code_docu.pdf` was not rebuilt, so it does not yet
  describe `setSimple()` or `tick()`, and it still describes `showInclude()`.

## 2026-10-21: the page sits on the parchment, and WCAG applies to Simple UI

### What changed

- **WCAG only with Simple UI.** As decided, WCAG 2.2 AAA is only required with Simple UI on. The tests now run with
  Simple UI on; only the two picture tests turn it off.
- **The page sits on the parchment.** As decided, with the picture on, the header, the panes and the footer fit
  inside the parchment, between the two pins at its top corners. The area was measured in the pictures themselves:
  - `fhd.webp`, `qhd.webp` and `uhd.webp` have the same layout. Their sheet spans 10.5% to 92% of the width and
    1.2% to 98.5% of the height, and the pins sit at 13.2% to 14.5% and 88% to 89.2% of the width. The page uses
    15.5% to 87% of the width and 3% to 96.7% of the height.
  - In `ultrawide.webp` the sheet spans 19.2% to 80.4% of the width, and the pins sit at 21.3% to 22.3% and 77.3% to
    78.3%. The page uses 23.25% to 76.36% of the width and 3.1% to 96.8% of the height.

  `style.css` keeps these shares as five numbers on `.pictures body` (`--ratio`, `--left`, `--right`, `--top`,
  `--bottom`). From them it works out, for any window, where the picture's parchment lands, and pads the page to
  fit it. This needs no script, because a picture that fills the window and stays centred lands in a place that
  depends only on the window's size. When the parchment fills the whole window, as on a phone, the usual 16-pixel
  margin stays.
- **Simple UI looks as the page did before the pictures.** The solid header bar, the footer box and the panes'
  backgrounds now apply only with the picture on. So turning Simple UI on or off moves the page, but not the
  Simple UI box itself.
- **Tests.** Still 95.
  - Test 48 also checks that the header, the content area, both panes and the footer are inside the parchment area,
    and that the page does not scroll. It takes the five numbers from `style.css`, so it checks the layout but
    not whether the numbers match the picture. That was checked by eye in screenshots at 1920 by 1080, 1920 by 900,
    2560 by 1080 and 1280 by 800.
  - Test 49 now only checks that the Simple UI box stays where it is.
  - The contrast tests no longer need to look for text on a picture, so `js/tests/audit.js` is back as it was,
    except for the image check. That check now covers the page's own background too, because the tests run with
    Simple UI on.
- **Checked.** The new check was broken on purpose twice, and each time the right test failed. Without the padding,
  Test 48 failed. With the audits run on the picture, the image check failed. All 95 tests pass in Chrome, in light
  and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` explains that the tests run with Simple UI on, and has the new wording of Tests 48, 49
  and 71. `MAINTAINER.md` has the five numbers, explains how to measure them for a new picture, and says that
  WCAG applies to Simple UI. `RULES.md` was not changed: Rules 3 and 4 still ask for WCAG 2.2 AAA everywhere.

## 2026-10-21: a picture for the Options button

### What changed

- **The Options button.** As decided, with the pictures on, the cogwheel button shows a picture from
  `assets/images/ui/buttons/` instead of the text cogwheel. Each file is a strip of three square pictures: normal on
  the left, under the mouse in the middle, and pressed on the right. `style.css` sizes the strip to three times the
  button and moves it to 0%, 50% or 100%, so only one picture shows at a time.
- **sd or 4k.** `options_sd.webp` holds three 52 by 52 pictures, and `options_4k.webp` three 104 by 104 ones. The
  button stays 52 by 52 either way. `options_4k.webp` is used when the client's resolution is larger than 1920 by
  1080. That is the case when the window is bigger than 1920 by 1080, or when the screen has more than one device
  pixel per page pixel, as on phones and on laptops scaled to 125% or more. The second case gives a window of 1920 by
  1080 or less a real resolution above 1080p. Without it, such screens would get a blurry button.
- **An outline.** As decided, the button has a 2-pixel ring of `#ee9d05` around it. It is a `box-shadow` rather than
  an `outline`, because `outline` already shows keyboard focus; the focus outline draws just outside the ring. It is
  2 page pixels, so 2 screen pixels on an ordinary screen, and it grows with the button on sharp screens.
- **Simple UI** keeps the old button: the text cogwheel with a border, 44 by 44.
- **Tests.** Still 95.
  - Test 48 also checks that the button shows `options_sd.webp` or `options_4k.webp` as described, at its normal
    picture and with its ring. The mouse states cannot be tested from a script. They were checked in screenshots, with the middle and
    right pictures forced on in a copy of `style.css`.
  - Test 49 now expects two pictures without Simple UI, the background and the button, and none with it.
  - Test 82 now allows `url()` to point anywhere in `assets/images/`, still only in `.pictures` rules.
- **CI.** The check of allowed files now allows digits and underscores in names under `assets/images/`, such as
  `options_4k.webp` and `civs9slice.webp`.
- **Checked.** At a device scale of 2 every test passed with the button on `options_4k.webp`. With the sharp-screen
  condition taken out of `style.css`, Test 48 failed as it should. All 95 tests pass in Chrome, in light and dark
  colours, in all four window sizes.
- **Not used yet.** `assets/images/` also holds pictures for label buttons, checkboxes, cursors and the two panes.
  The page does not use them yet.
- **Documents.** `TESTS.md` has the new wording of Tests 48, 49 and 82. `MAINTAINER.md` has a section on the Options
  button and its two files, and the folder and naming rules for pictures.

## 2026-10-21: picture cursors

### What changed

- **Cursors.** As decided, with the pictures on, the mouse cursor comes from `assets/images/ui/cursors/`. It is a
  sword over the page and a pointing hand over links, buttons, the tree's boxes and the Options window's boxes. In
  the Find box it stays the text cursor, so it is clear where typing goes. Labels needed their own rule, because
  browsers give them the plain arrow instead of the cursor around them.
- **x1 and x2.** `x2` (48 by 48) is for uhd and `x1` (32 by 32) for sd, as decided. `x2` is used when the window is
  bigger than 2560 by 1440, the same test that picks `uhd.webp`, and `x1` otherwise, which includes qhd windows.
  Sharp screens do not switch to `x2`, unlike the Options button. Chrome already enlarges a cursor by the screen's
  scale, so `x2` on a screen at 200% would come out 96 pixels wide.
- **The point.** In all four pictures the tip of the sword and of the finger is the top-left pixel. This was found
  by reading the pictures' pixels, so every cursor has its point at `0 0`.
- **Tests.** Still 95.
  - Test 48 also checks every element on the page: the hand over what can be clicked, the text cursor in the Find
    box, and the sword everywhere else, each in the `x1` or `x2` size the window should get. A window of 2984 by 1849
    was checked by hand, for `x2`.
  - The image check now counts a cursor picture as an image. So Test 71 also makes sure Simple UI has no picture
    cursor, and Test 49 that ticking Simple UI takes the cursors away too.
  - Test 82 now checks each selector in a list on its own, so `.pictures, .pictures label` passes but
    `.pictures, label` fails.
- **Checked.** Leaving labels out of the cursor rule made Test 48 fail, naming `label`. Writing `.pictures, label`
  made Tests 49, 71 and 82 fail. All 95 tests pass in Chrome, in light and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new wording of Test 48 and new line numbers. `MAINTAINER.md` has a section on the
  cursors.

## 2026-10-21: game buttons with Trajan Pro

### What changed

- **Button pictures.** As decided, with the pictures on, every button with words on it shows `button_sd.webp`, or
  `button_4k.webp` for uhd. That covers Clear, Expand all, Collapse all, the language menu and its choices, and Close.
  Each file is three bars on top of each other: normal, under the mouse, pressed. The bars are 55 to 58 rows tall in
  `button_sd.webp` and exactly 111 in `button_4k.webp`, which was measured from the pixels, so showing a third at a time
  fits within two rows. The strip is stretched to each button's width. `button_4k.webp` is used when the window is
  bigger than 2560 by 1440, the same test as `uhd.webp` and the `x2` cursors.
- **Trajan Pro Bold.** As decided, the words are in Trajan Pro Bold, `#ffb20d`, fading from white at the top to
  `#ffb20d` at the bottom, with a black shadow at 50% opacity, 2 pixels down and 2 to the right (45 degrees). The font is
  `assets/Fonts/TrajanPro-Bold.ttf`. A copy installed on the visitor's computer is used first, and the file is only
  downloaded with the pictures on.
- **A gold ring.** As decided, the text buttons have the same 2-pixel `#ee9d05` ring as the Options button. The chosen
  language already used a `box-shadow` for its blue mark, so it now has both, the ring and the mark. The language
  menu leaves 8 pixels between its choices instead of 4, so the rings do not touch.
- **A caption inside each button.** A `text-shadow` would be drawn over the fade, and a `filter` on the button would
  shadow the whole picture. So each of these buttons now holds its words in a `<span class="caption">`, which carries
  the fade and a `drop-shadow` filter. `index.html` and the language template changed for this, and
  `buildLanguages()` in `js/ui.js` writes into the caption.
- **The Simple UI box stays put.** Trajan Pro is wider than the usual font. In the 320 by 256 test window, "Português
  (Brasil)" took two lines on the language button, which pushed the Simple UI box down by 12 pixels when Simple UI was
  turned off; the existing test caught this (rule 18). With the pictures on, the language button now keeps its words
  on one line and ends a name that does not fit in "…".
- **Tests.** 96, one new:
  - New Test 49 checks every text button: the right picture at its normal bar, the ring, and words in Trajan Pro Bold,
    `#ffb20d`, with the fade and the shadow. It also checks that the font loads. That needed `pictureTests()` to wait
    for the font, so it is now `async`.
  - Test 83 (the source rules) also allows `url()` in an `@font-face` rule, pointing into `assets/Fonts/`.
- **CI.** The check of allowed files now allows `.ttf` files in `assets/Fonts/`.
- **Checked.** In screenshots, with the mouse states forced on in a copy of `style.css`, the middle bar showed under
  the mouse and the bottom one when pressed. With the installed copy of the font switched off, the font loaded from
  `assets/Fonts/` and Test 49 passed, which is what GitHub will do. Without the fade, Test 49 failed. In a window of 2984
  by 1849, `button_4k.webp` was used. All 96 tests pass in Chrome, in light and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new Test 49, everything after it renumbered, and the new wording of Test 83.
  `MAINTAINER.md` has a section on the text buttons and the font.

## 2026-10-21: checkbox pictures

### What changed

- **Checkboxes.** As decided, with the pictures on, every checkbox shows a picture from the checkbox sheet: in the
  tree, in the legend, on the filter buttons and in the Options window. The sheet has three rows and three columns.
  The rows are unchecked, enabled (a red tick) and disabled (a cross); they show not marked, must have and must lack.
  The columns are normal, under the mouse and pressed.
- **Under the mouse and pressed.** The column changes when the mouse is over, or presses, the whole item, Options
  choice or filter button, since a click anywhere on it acts on the box. A long press in the tree, which marks
  must lack, shows the pressed column once it is ready.
- **Partly marked.** The sheet has no picture for a branch that is partly marked. It shows the empty box with a black
  dash over it, as the dash was drawn before.
- **sd or 4k.** The boxes stay 20 by 20; `checkboxes_4k.webp` holds the same pictures at twice the detail. It is used on
  the same terms as `options_4k.webp`: when the window is bigger than 1920 by 1080, or the screen is sharper than
  usual. The cells are exactly 20 and 40 pixels, so each picture lines up exactly.
- **Tests.** 97, one new: Test 50 checks every checkbox on the page: the right file, the normal column, and the row
  for its state. It also checks that the drawn tick, cross and frame are gone, and that a ticked and a crossed box
  are among those checked.
- **Checked.** In screenshots, with the mouse states forced on in a copy of `style.css`, the middle and right columns
  showed. With the rows for must have and must lack swapped, Test 50 failed. At a device scale of 2, every test passed
  with `checkboxes_4k.webp`. All 97 tests pass in Chrome, in light and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new Test 50 and everything after it renumbered. `MAINTAINER.md` has a section on
  the checkboxes.

## 2026-10-21: the title in its frame

### What changed

- **Civ Explorer.** As decided, with the pictures on, the title reads "Civ Explorer", in bold Georgia coloured
  `#391c1b`. It applies only with the pictures on. With Simple UI on, the title stays the full sentence that
  requirement 2 asks for, which is also the more useful heading for accessibility. Both texts are in the language
  files, `title` and the new `titleShort`. `titleShort` is "Civ Explorer" in all 17 languages, as a name. The heading
  holds both, and `style.css` shows one.
- **No header panel.** As decided, the header's solid bar is gone with the pictures on. The title sits in
  `title_frame_sd.webp`, or `title_frame_4k.webp` on the same terms as the Options button. The frame is centred at the
  top of the parchment, at most 784 pixels wide, and the Options button stays on the right. The header is a grid of
  three columns, so the frame stays truly centred however wide the button is.
- **Centred in the frame.** The frame's plain inner box was measured from its pixels: 20.28% to 79.59% of the width and
  36.21% to 70.69% of the height. The heading's padding is exactly that box, and the title is centred in it. The
  title's size follows the frame's width (`cqi`), 24 pixels at full size and never under 12.
- **Blending in.** The frame's edges are already partly transparent, but its top showed as a straight line against
  the torn top of the parchment. A gradient `mask-image` fades all four edges a little more; the ornaments and the
  title are untouched.
- **Tests.** 98, one new:
  - New Test 49 checks that only "Civ Explorer" shows, in bold Georgia, `#391c1b`, on the right frame picture. It also
    checks that the header has no background and that the frame is centred.
  - Test 52, Simple UI, also checks that the full title shows with Simple UI on.
  - Test 36 now reads the full title from its own span, since the heading holds both.
- **Checked.** In screenshots at 1920 by 1080, 1920 by 900 and 600 by 900, in light and dark colours. With the
  full title left visible with the pictures on, Test 49 failed. All 98 tests pass in Chrome, in light and dark colours,
  in all four window sizes.
- **Not changed.** `REQUIREMENTS.md`, whose requirement 2 still names the full sentence.
- **Documents.** `TESTS.md` has the new Test 49 and everything after it renumbered. `MAINTAINER.md` has a section on
  the title.

## 2026-10-21: framed panels with their own fonts

### What changed

- **Nine-slice frames.** As decided, with the pictures on, the tree pane sits in `nodes9slice.webp` and the
  civilisations pane in `civs9slice.webp`, drawn with `border-image`. Where to cut was measured from the pictures. The
  tree's frame and gold corners end 24 pixels in, so it is cut at 24 and drawn at full size. The rounded corners of
  the civilisations' frame reach 76 pixels in, so it is cut at 76 and drawn at half size, 38 pixels, which keeps
  the corners in proportion. Each pane's border is as wide as its frame, so no text sits on a corner.
- **Text.** As decided, the tree pane's text is Georgia in `#391c1b`, and the civilisations pane's text is Times New
  Roman Bold (`timesbd`) in white. The buttons keep their own Trajan Pro, and the Find box keeps its own colours.
- **Fonts.** `assets/Fonts/Georgia.ttf` and `assets/Fonts/timesbd.ttf` are loaded under their own names, "Civ Georgia"
  and "Civ Times", with the installed copies tried first. Loading the file as plain "Georgia" would have hidden the
  installed Georgia Bold, so bold text would have been a thickened regular. No bold Georgia file was given. Where
  Georgia is not installed, bold text in the tree uses the browser's next choice. The title now uses "Civ Georgia"
  too, so it also gets Georgia where it is not installed.
- **Colours that suit the frames.** The panes' grey headers are see-through with the pictures on. In the tree, the
  highlight under the mouse is a light tint and Find's highlight a gold tint, both readable with dark brown text in
  light and dark colours. Among the civilisations, the filter buttons have an orange outline and see-through
  background, so their white text shows; the dividing lines are orange.
- **Tests.** 99, one new: Test 52 checks both frames' pictures, cuts and widths. It also checks the font and colour of
  every piece of text in both panes, and that both fonts load. Test 49, the title, now expects "Civ Georgia".
- **Checked.** In screenshots at 1920 by 1080 and 1920 by 900, in light and dark colours, with marks, filters and a
  search on. With the installed fonts switched off, both font files loaded and every test passed, which is what GitHub
  will do. With the tree's text colour changed, Test 52 failed. All 99 tests pass in Chrome, in light and dark
  colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new Test 52 and everything after it renumbered. `MAINTAINER.md` has a section on
  the panels and lists the new fonts.

## 2026-10-21: a thinner frame for the tree

### What changed

- **The tree's frame was too thick.** It was drawn at 24 pixels, the picture's own size. A screenshot of the game in 4K
  (`reference_image.png`) shows the same frame on its panels, and its pixels were measured. There, the frame runs 17
  screen pixels from its shadow to its tan middle, where `nodes9slice.webp` has 22, so the game draws it at about 0.8
  of its size in 4K. This page uses half as many pixels as a 4K screen (16-pixel text where the game's is about 32),
  which makes about 0.4, so the frame is now drawn at 10 pixels: `border-image-width` and the pane's border are both
  10 pixels. The cut stays at 24, so the corners and lines are the same, only smaller. A sharp screen at twice the
  scale draws it at 20 screen pixels, close to the game's 17 to 19.
- **The civilisations' frame** is unchanged at 38 pixels, as nothing was said about it.
- **Tests.** Test 52 now expects the tree's frame to be 10 pixels wide.
- **Checked.** In screenshots at 1920 by 1080, at a device scale of 1 and 2, the frame matches the reference's thin
  gold line and small corner. All 99 tests pass in Chrome, in light and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new wording of Test 52, and `MAINTAINER.md` how the 10 pixels were measured.

## 2026-10-21: unstretched frames, new buttons, a Find box, a tooltip and civilisation icons

### What changed

All of this applies with the pictures on. Simple UI is unchanged.

- **Frames are no longer stretched.** As decided, the nine pieces of a frame are never stretched, only repeated
  (`border-image-repeat: repeat`). Cut at 24, the tree's frame then showed small gold ticks every 60 pixels along its
  edges, because the cut ran through the tips of its gold corners. The frames are now cut at a third and drawn 30
  pixels wide: the tree's at 64, the civilisations' at 85, as set in `style.css` meanwhile.
- **New button picture and lettering.** As decided, the text buttons use the new `button_sd.webp` and
  `button_4k.webp`, lose their gold ring (the Options button keeps its), and their words are bold Georgia in
  `#f2d2b6`. The white-to-gold fade went with Trajan Pro; the 50% black shadow stayed. Trajan Pro is no longer used.
  The new picture has gold ends, so, in the spirit of the frames, the ends are not stretched either. `::before` and
  `::after` draw them at their own shape, 12 by 50 of the picture's pixels; their size was measured from the
  picture. Only the plain red middle stretches. The language menu's arrow moved into a `<span class="chevron">`, as
  `::after` now draws the right end.
- **No legend, search first.** As decided, the legend is left out and the three buttons sit below the Find box. Simple
  UI keeps both as requirement 3 has them, and keeps the legend's keyboard hints.
- **Find box.** As decided, the "Find" label is hidden, though screen readers still read it. The box is drawn from
  `textfield_9slice.webp` in nine repeated 15-pixel pieces. `search.webp` shows at its right while it is empty, and
  `clear_search.webp` while it holds text. The latter is a button that empties the box. CSS tells the two apart with
  `:placeholder-shown`, so the box has a placeholder of one space.
- **Tooltip.** As decided, "Left-click to enable, right-click to disable" follows the mouse over the tree, in the style
  of frcp.net: 12-pixel Georgia, `#391c1b` on `#d7b394`, a grey border and a soft shadow. It sits 10 pixels right of and
  20 below the pointer, and moves left or above near the window's edges. Its text is `nodeTip`, in all 17
  languages. frcp.net places its tooltip with `element.style`, which this project's rules forbid. Here the script
  only sets two custom properties, `--x` and `--y`, to numbers, and `style.css` does the rest; the rule test now
  allows exactly that.
- **Civilisation icons.** As decided, each civilisation in the list has its icon from `assets/images/icons/civs/`
  before its name. Files are the English name in lower case, except Incas (`inca.png`) and Mayans (`maya.png`), which
  `icons` in `data.json` records. The icons are `<img>` elements from a template, made only while Simple UI is off.
  Turning Simple UI on or off redraws the list. The rule test now allows `<img>` inside templates only.
- **`js/report.js`.** The new code would have taken `js/ui.js` past 400 lines of code. As `MAINTAINER.md` says, part
  of it moved to a new script: the report window of the updater and the tests (`runUpdate()`, `openReport()`,
  `report()`). The rule that only `ui.js` touches the page now names `report.js` too. `ui.js` has 383 lines of code.
- **Fonts folder.** `assets/Fonts/` became `assets/fonts/`, so `style.css`, the rule test and the check of allowed
  files now say `fonts`. GitHub serves file names case-sensitively, so the old paths would have broken there.
- **CI.** The check of allowed files now also allows PNG files under `assets/images/`, for the icons.
- **Tests.** 100, the most allowed; one new.
  - Test 50, the buttons, checks the new picture, the unstretched ends, no ring, bold Georgia, `#f2d2b6` and the shadow.
  - Test 52, the panels, checks the frames at 64/30 and 85/30, both repeated. It checks the hidden legend and label,
    and the Find box above the buttons. It also marks an item many civilisations have and checks that every icon in
    the list is the right file and loads.
  - New Test 53 checks the Find box: its tiled frame, the search icon, the cross while there is text, and that the
    cross empties the box. It also checks that the tooltip shows near the pointer over the tree, in the chosen
    language, and hides elsewhere.
  - Tests 83, 86 and 87, the rules, allow the custom properties, `report.js` and `<img>` in templates.
  - The icon check first waited with `img.decode()`, which never finished in the phone-sized and tall test windows;
    it now waits for each icon's `load` or `error`, at most 10 seconds.
- **Checked.** In screenshots at 1920 by 1080 with a search, a mark, the tooltip, and a full list of icons. All 100
  tests pass in Chrome, in light and dark colours, in all four window sizes.
- **Not used yet.** `assets/fonts/TrajanPro-Bold.ttf`, `assets/images/ui/backgrounds/options_sd.webp` and
  `options_4k.webp`, and `assets/images/icons/nodes/colour_key.csv`. The check of allowed files would refuse the CSV
  file.
- **Documents.** `TESTS.md` has the new Test 53, everything after it renumbered, and the new wording of the tests
  above. `MAINTAINER.md` has sections on the Find box, the tooltip and the civilisation icons, the new button and
  panel drawing, `js/report.js`, and `icons` in `data.json`.

## 2026-10-21: a Find box of fixed width, and the tooltip by the cursor

### What changed

- **The Find box keeps its width.** It grew and shrank while typing, because the number found took its room. As
  decided, with the pictures on it is now always 325 pixels wide, or as wide as the pane if that is narrower. The
  number found shows beside it in the space left.
- **The tooltip at the cursor's corner.** As decided, the tooltip's top-left corner now sits at the bottom-right
  corner of the cursor's picture instead of near the pointer. The cursor's point is the picture's top-left pixel, so
  that corner is 32 pixels right of and below the pointer with the `x1` cursors, and 48 with the `x2` ones. The size
  is `--reach` on `.tip`, set in `style.css` next to the cursor pictures and in the same media query. `js/ui.js` reads
  it, so the window-size rule exists only once.
- **Tests.** Test 53 now also checks that the box is 325 pixels, or the pane's width, and keeps it while typing. It
  also checks that the tooltip starts at the pointer plus the cursor's size.
- **Checked.** In a screenshot with a cursor picture drawn at the pointer, the tooltip starts at its bottom-right
  corner, and the box measured 325 pixels both empty and with text. All 100 tests pass in Chrome, in light and dark
  colours, in all four window sizes, and in a window of 2984 by 1849, which uses the `x2` cursors.
- **Not changed.** With Simple UI on, the Find box still fills the row (see the next entry for its messages).
- **Documents.** `TESTS.md` and `MAINTAINER.md` describe the width and where the tooltip sits.

## 2026-10-21: search messages beside the box

### What changed

- **Always to the right.** As decided, the search's messages, such as "2 found" and "None found", always show to the
  right of the Find box and never below it, with the pictures on or off. Before, the row was allowed to wrap, so in a
  narrow pane, or with a long message such as Spanish "No se ha encontrado nada", the message dropped below the box.
- **How.** The row no longer wraps. The message has a column of its own: 8em with Simple UI, and with the pictures on,
  whatever is left beside the 325-pixel box, at least 6em. At 1920 by 1080 that keeps the box at 325 pixels. A long
  message wraps onto a second line inside its column. The row keeps room for two lines (`min-height: 3em`), so a
  message does not push the buttons or the tree down. Only the Spanish "none found" can need three lines, in a
  narrow pane. With Simple UI, the box also no longer changes width while typing, as its column stays the same.
- **A narrow pane.** A row that cannot wrap is as wide as its contents at their narrowest, and a search box is at
  least about 170 pixels unless told otherwise. So the row first stuck out of the 320, 360 and 390 pixel test windows.
  `min-width: 0` on the row lets the box narrow to 44 pixels instead.
- **Tests.** Tests 32 and 33, in Simple UI, and Test 53, with the pictures on, now check that the message sits right
  of the box and on its row, both when there are matches and when there are none. Test 53 also expects the box at
  325 pixels, or the row less 6em and the gap.
- **Checked.** In screenshots of the Spanish message, with the pictures on at 1920 by 1080 and with Simple UI at 600
  pixels wide, it stays beside the box on two lines. All 100 tests pass in Chrome, in light and dark colours, in all
  four window sizes.
- **Documents.** `TESTS.md` has the new wording of Tests 32, 33 and 53. `MAINTAINER.md` explains where the messages go.

## 2026-10-21: no focus ring on the Find box

### What changed

- **No white ring.** As decided, the Find box no longer shows the white ring around it while you type, with the
  pictures on. The ring was the focus outline, which is white in dark colours and black in light ones. The text
  cursor still shows where you type. With Simple UI the ring stays, as WCAG 2.2 asks for a visible focus.
- **Tests.** Test 53 checks that the box has no outline while it has focus, after the cross empties it.
- **Checked.** All 100 tests pass in Chrome, in light and dark colours, in all four window sizes.

## 2026-10-21: Civ view, and the search message by the pane's edge

### What changed

- **The Find box stays at 325 pixels.** The message column's reserve made the box narrower than 325 pixels at 1920 by
  1080, as `100% - 6em - 12px` was less than 325 there. As decided, the box keeps its 325 pixels and the message makes
  room. The message is now aligned right, and it reaches 6 pixels into the pane's padding, so it ends 16 pixels from
  the pane's edge. The box now only gives way where the row is narrower than 325 pixels and 3em. In windows of 1904 by
  929, 889 and 849 it measured 325 pixels, with "None found" on one line in the first and two in the others.
  The request said 235 pixels; it was read as the 325 pixels decided before.
- **Civ view.** As decided, the Options window has a choice, "Civ view:", between List and Tile, as radio buttons.
  - Tile shows each civilisation as a 123-pixel box from `civ_box_sd.webp` or `civ_box_4k.webp`. The icon (88 pixels)
    sits in its black part and the name on its red bar, in 12-pixel Trajan Pro Bold. The name fades from white to
    `#ff9900` and has a black shadow at 50%, 2 pixels down and left. The black part and the red bar were measured from
    the picture: rows 2 to 97 and 100 to 120 of 123. The name is in its own `<span class="civ-name">` now, in both views,
    so the fade and the shadow can be drawn without touching the icon.
  - The radio buttons come from `radiobutton_sd.webp` or `radiobutton_4k.webp`: not chosen on the top row (normal, under
    the mouse), chosen on the bottom row (normal, pressed). They are real radio buttons, so arrow keys move between
    them.
  - The choice is remembered. It is hidden with Simple UI, which always shows the list, since the tiles are made of
    pictures and Simple UI uses none. It sits below the Simple UI box, so hiding it does not move that box.
  - Its texts, `civView`, `viewList` and `viewTile`, are in all 17 languages. Trajan Pro is used again, for the tiles'
    names.
- **Tests.** Still 100, as no more are allowed, so the new checks went into existing tests.
  - Test 51 also checks the radio buttons' pictures.
  - Test 52 also switches to Tile, with civilisations listed. It checks the box picture, the icon, the font, fade and
    shadow of the name, and that the choice is remembered, then switches back. It also checks that Trajan Pro loads.
  - Test 53 expects the box at 325 pixels, or the row less 3em, and the message aligned right.
  - The tests put the visitor's Civ view back afterwards, as they do for the other choices.
- **`js/ui.js`** has 393 lines of code, close to the limit of 400.
- **Checked.** In screenshots of the tiles and of the Options window. All 100 tests pass in Chrome, in light and dark
  colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new wording of Tests 51, 52 and 53. `MAINTAINER.md` has a section on Civ view and
  the new width rule for the Find box.

## 2026-10-21: one-line search messages, pinned filters, one cursor, seven tiles and a flatter tree

### What changed

- **Search messages on one line.** As decided, the search's message never takes more than one line. It no longer
  wraps; a message too long for its room ends in "…", and screen readers still read all of it. The row no longer
  keeps room for two lines. With the pictures on, the box keeps 325 pixels and the message at least 6em beside it,
  which is room for "None found" in English. With Simple UI the message's column is up to 12em and at least 6em
  wide, and keeps its width while typing.
- **Filters are pinned.** As decided, the Filters section can no longer be scrolled away. It moved out of the list's
  scrolling area, between the pane's header and the list, with the pictures on or off. Requirement 22 still holds: it
  sits between the header and the list. Two things followed in narrow windows, both caught by the tests.
  - The filter buttons' hidden labels are placed with `position: absolute`. Out of the scrolling area they were
    placed against the page, which then scrolled in the 320 by 256 window. `.ticked` now has `position: relative`.
  - In the phone-sized window, the civilisations pane is at least 10rem tall and no taller. Its header, the filters
    and the list no longer fitted, and the list became shorter than 44 pixels. The list now has a minimum height of
    44 pixels, and the pane may grow to fit (`min-height: auto`); the tree pane gives way.
- **One cursor.** As decided, the pointing hand is gone: the sword is the cursor over everything, the Find box
  included. `style.css` sets it on `html.pictures *`, which outranks the browser's own cursors. The rule test now
  allows image rules that start with `html.pictures`. `cursor_pointing_x1.webp` and `cursor_pointing_x2.webp` are no
  longer used.
- **Seven tiles a row.** As decided, the tiles first came nine to a row and now seven. They are square, and
  everything in them is sized as a share of the tile's width (`cqi`), as measured on the 123-pixel picture. At 1920
  by 1080 a tile is about 80 pixels wide.
- **The names' shadow goes right.** The tiles' names cast their shadow 2 pixels down and to the right, as fixed in
  `style.css` by hand; the test and the documents now say so too.
- **A flatter tree.** As decided, the groups Drop-off Sites, General Infantry and Shock Infantry are gone from
  `tree` in `data.json`, and what was in them moved up one level: Mill, Lumber Camp and Mining Camp now sit in Economy,
  and Militia and the rest straight under Barracks. Their headings are gone from all 17 languages. The change was
  checked against the same change made on the parsed data.
- **No footer panel.** As decided, with the pictures on, the footer has no background of its own. Its words are
  `#391c1b`, link included, so they read on the parchment in light and dark colours.
- **Tests.** Still 100.
  - Test 48 expects the sword everywhere.
  - Tests 32, 33 and 53 check that the message is on one line, right of the box. Test 53 expects the box at 325 pixels,
    or the row less 6em.
  - Test 52 checks seven square tiles a row, the shadow going right, and that the filters stay where they are when
    the list scrolls.
- **Checked.** In a screenshot with a filter, tiles and the list scrolled down. All 100 tests pass in Chrome, in
  light and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new wording of Tests 32, 33, 48, 52 and 53. `MAINTAINER.md` describes the
  one-line messages, the sword cursor, the seven tiles and the footer.

## 2026-10-21: a full-width footer, civilisation links, the pointing hand and six tiles

### What changed

- **Microsoft's notice.** The footer now gives the notice that was supplied, after the source. It moved from
  the `source` text of the English language to `notice` in `source` in `data.json`, with a double space removed.
  `{rules}` in it becomes a link to Microsoft's
  [Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules); their name and address are in `rules`.
  The notice is a legal text, so it stays in English in every language, and the page marks it `lang="en"`. The
  source's own text, "Data from {source}, {date}.", is as before.
- **A full-width footer.** As decided, the footer spans the parchment between the panes' outer edges, so the notice
  takes two lines at 1920 by 1080 rather than many.
- **Civilisations link to aoe2techtree.net.** As decided, each civilisation, in the list and as a tile, is a link to its
  page, such as `https://aoe2techtree.net/#Armenians`. The address is the source's `url` and `#` and the English name.
  With Simple UI the links are 44 pixels tall, as WCAG asks of targets.
- **The tooltip shows the address.** Over a civilisation, the tooltip shows where its link leads. The tooltip's width
  no longer depends on where it was before: it is as wide as its text, at most 300 pixels or the window less 8, and an
  address too long for that breaks anywhere. Before, the tooltip measured itself where it last stood, near an edge,
  and came out narrower than it then was.
- **The pointing hand is back.** As decided, the pointing hand (`cursor_pointing_x1.webp` and `_x2`) is the cursor
  over the civilisations and the footer's links; the sword is the cursor everywhere else.
- **Six tiles a row.** As decided, the tiles are a little bigger: six to a row instead of seven.
- **`js/pictures.js`.** `js/ui.js` would have passed 400 lines of code, so Civ view and the tooltip moved to a new
  script, `js/pictures.js`. It is the third script allowed to touch the page.
- **Tests.** Still 100.
  - Test 42 checks the notice, its link and that it is marked English.
  - Test 48 expects the pointing hand over links, and the footer as wide as the panes.
  - Test 52 checks that every civilisation links to its page and that the tooltip shows the address, with six tiles
    a row.
  - Test 72 now checks the centre of a focused element's first line. A link that wraps, as the rules' link does in
    the 320 by 256 window, has the paragraph's text in the middle of its whole box.
  - Test 86 allows `js/pictures.js` to touch the page.
- **Checked.** In a screenshot of the tiles with the tooltip over a civilisation. All 100 tests pass in Chrome, in
  light and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new wording of Tests 42, 48, 52, 72 and 86. `MAINTAINER.md` describes
  `js/pictures.js`, the notice, the links, the pointing hand and the six tiles.

## 2026-10-21: Simple UI: a full-width footer, and civilisations without links

### What changed

- **A full-width footer with Simple UI too.** As decided, the footer spans the page with Simple UI as well, so the
  notice fits on one line at 1920 by 1080. Paragraphs are otherwise kept to 80 characters wide (`p { max-width: 80ch }`)
  for WCAG 1.4.8 (AAA); the footer is the one exception. 1.4.8 still holds, because the text reflows when the window is
  narrowed (technique G204).
- **No civilisation links with Simple UI.** As decided, with Simple UI the civilisations link nowhere: `js/ui.js`
  gives them an address only with the pictures on. Each one is still an `a` element, but without `href` it is plain
  text to browsers and screen readers, and it can't be focused. The civilisations now take the text's colour in both
  modes, as only real links should look like links. The 44-pixel height the links needed with Simple UI is gone again,
  so the list looks as it did before.
- **Tests.** Still 100.
  - Test 42 also checks that the footer is as wide as the panes.
  - Test 54 marks an item first, then checks that every civilisation is a link with the pictures, none is with
    Simple UI, and all are again when Simple UI is unticked.
- **Checked.** In a screenshot with Simple UI and a filter. All 100 tests pass in Chrome, in light and dark colours,
  in all four window sizes.
- **Documents.** `TESTS.md` has the new wording of Tests 42 and 54. `MAINTAINER.md` says the footer spans the page in
  both modes and that the civilisations link only with the pictures on.

## 2026-10-21: the Options window on its own parchment

### What changed

- **A panel on a parchment.** As decided, with the pictures on, the Options window is a panel framed with
  `nodes9slice.webp`, as the tree pane is. It lies on `options_sd.webp` (`options_4k.webp` on big or sharp screens),
  and its title "Options" sits in bold Georgia in the parchment's title frame. The text is `#391c1b`, the highlight
  under the mouse is the tree's light tint, and the open language list has a thin `#391c1b` border instead of its
  own background.
- **The Simple UI box stays put.** Rule 18 says a control must not move when it is used, and Test 54 checks that the
  Simple UI box stays in place when ticked. So the window keeps exactly the size, padding and text it has with Simple
  UI, and the pictures are drawn around it:
  - the parchment on the window's `::backdrop`, scaled and placed from the window's size;
  - the frame on `.options::before`, a grid item over the rows below the title, reaching out to the window's edges;
  - the title keeps its row and is lifted into the title frame with `translate`, which moves nothing else.
  The window's text keeps the page's usual font for the same reason: in Georgia, the hint under Include would wrap
  differently and move the box.
- **Short windows.** Below 588 pixels of height there is no room for the parchment above the panel. There the
  parchment is left out and the title stays in the panel, which covers the whole window.
- **Measured.** The title frame's inside runs from 223 to 441 across and 46 to 69 down in the 652 by 688 picture,
  and the thin inner border is at about 43 and 609 across and 638 down. The panel goes in the box from 60 to 592
  across and 95 to 622 down. The measurements were read from the picture's pixels in a canvas.
- **Tests.** Still 100.
  - Test 49 opens the Options window and checks that its title is in bold Georgia and centred in the parchment's
    title frame, worked out from the same measurements, or in the panel in short windows.
  - Test 52 checks the Options panel's frame with the other panels'.
- **Checked.** In screenshots at 1920 by 1080, at 1280 by 800 with the language list open in dark colours, and at
  1280 by 560. All 100 tests pass in Chrome, in light and dark colours, in all four window sizes.
- **Documents.** `TESTS.md` has the new wording of Tests 49 and 52. `MAINTAINER.md` has a new section, "The Options
  window", with the measurements behind the numbers in `style.css`.

## 2026-10-21: icons in the tree

### What changed

All of this applies with the pictures on. Simple UI is unchanged.

- **Icons in the tree.** As decided, each row of the tree reads checkbox, icon, name, as in "[ ] [icon] Militia". The
  icons are the 48 by 48 pictures from aoe2techtree's repository, in `assets/images/icons/nodes/`, drawn at 40 by 40
  inside a 2-pixel outline: 44 by 44 in all, the height of a row. They are `<img>` elements from a new template,
  `nodeIconTemplate`, made only while Simple UI is off, as the civilisation icons are. `dress()` in `js/ui.js` adds or
  removes them when the tree is built and when Simple UI is switched. The 100 by 100 pictures in the same folder are
  not used.
- **Outlines.** As decided, the outline's colour follows `colour_key.csv`, by unit, building or technology and by
  common, regional or unique. The nine colours are in `style.css`, as the page takes its looks only from there, and
  the tests compare them with the CSV file. As decided, the icons of Economy, Military and Fortifications, from
  `misc/`, have no outline, and the Unique Units, Unique Buildings and Unique Technologies headings, which have no
  picture, show no icon.
- **Which picture.** The files are named after each item's `picture_index` in aoe2techtree's data, not its id, and
  the folders after its `use_type`. Every item in the tree has a file. The Monk and the Trade Cart have a picture per
  architecture there; the most common one is used (Monk 33, Trade Cart 34). The Fortified Wall, Guard Tower, Keep and
  Bombard Tower are both buildings and technologies there; their building pictures are used.
- **Lower-case folders.** `Building`, `Unit` and `Tech` became `building`, `unit` and `tech`. The GitHub check of
  allowed files only lets in lower-case paths, as with `assets/fonts/` before.
- **`pictures` in `data.json`.** For each item, its folder (`kind`), its file (`picture`) and its `reach`: common,
  regional or unique, from aoe2techtree's `node_type`. The updater writes it, so new items get their icon with the
  rest of their data, and it reports "New icon for {name}: {file}" when an item's icon is new or changed, so the
  maintainer knows which file to copy in. `icons` also holds the tree's folder (`nodes`) and the headings' icons
  (`groups`). `pictures` was made by running the updater's own code on today's aoe2techtree data; it reported nothing
  new apart from the icons.
- **Tests.** Still 100.
  - Test 51 also checks, with every item included, that each item and top-level heading shows its icon between its
    box and its name, from the right file, loaded, 44 by 44, with the outline `colour_key.csv` gives, and that the
    unique headings show none.
  - Test 54 counts `<img>` elements as images too, so Simple UI must take the tree's icons away.
  - Test 92 checks that each item has an icon in `pictures`.
  - A new helper, `loaded()`, waits for the icons in Tests 51 and 52.
- **Checked.** In screenshots at 1920 by 1080, with the tree expanded and unique items included. With one outline
  colour changed in `style.css`, Test 51 failed and named the item; with the icons left on under Simple UI, Tests 54
  and 76 failed. All 100 tests pass in Chrome, in light and dark colours, in all four window sizes.
- **`js/ui.js`** has 388 lines of code.
- **Noticed.** `colour_key.csv` gives common technologies `#D43652`, the same colour as unique buildings; it is used as
  given. The updater would also put the Dock's items in `data.json` and the language files into the tree's order;
  only `pictures` was taken from its output, so that is left for the next update.
- **Documents.** `TESTS.md` has the new wording of Tests 51, 54 and 92, and their new lines. `MAINTAINER.md` has a
  section on the tree's icons, `pictures` in `data.json` and the updater's new message.

## 2026-10-21: Include Regionals, and the Include description as a tooltip

### What changed

- **Include Regionals.** As decided, the Options window has a new box, "Include Regionals", ticked by default. Unticked,
  it leaves out regional items, such as the Eagle Scout, the Camel Rider or the Longship, with everything under them,
  such as the Warrior Priest in the Fortified Church. Marks on other items are kept, and the choice is remembered. It
  works with or without Include Unique and Universal, and with or without Simple UI. Which items are regional comes
  from `reach` in `pictures` in `data.json`, which the updater copies from aoe2techtree's `node_type`, so there is
  nothing to mark by hand. The label uses the game's own word for regional (string 20133) in each of the 17 languages.
- **How.** `prune()` in `js/model.js` now takes two switches, one for unique and universal items and one for regional
  ones, and `rebuild()` always uses it. `setRegional()` in `js/ui.js` ticks the box and builds the tree again, as
  `setInclude()` does; the steps both share moved into `replant()`.
- **The description as a tooltip.** As decided, with the pictures on, "Also shows unique units, technologies and
  buildings…" is no longer shown under Include Unique and Universal, but as the tooltip over that box. Screen readers
  still read it, as the box names it with `aria-describedby` and the sentence is only hidden from sight. Include
  Regionals now sits straight under Include Unique and Universal. A modal window lies in the browser's top layer,
  above the tooltip, so `js/pictures.js` moves the tooltip into the Options window while the mouse is over it.
- **Simple UI keeps the sentence.** Simple UI has no tooltips, and WCAG 2.2 AAA asks that the description can be read
  without a mouse, so with Simple UI the sentence stays under the box, with Include Regionals below it.
- **Common technologies' outline.** `colour_key.csv` now gives `#397139` for common technologies; Test 51 caught that
  `style.css` still had `#D43652`, and `style.css` now follows the CSV file.
- **Tests.** Still 100.
  - Test 44 also checks that regional items are shown by default.
  - Test 45 also unticks Include Regionals, with every item included, and checks that exactly the items outside
    regional ones remain, marks kept; then ticks it again.
  - Test 46 checks that both choices are remembered, and Test 47 that Options opens with Include Regionals ticked.
  - Test 53 checks the tooltip over Include: its text, that it lies in the Options window, that the sentence is hidden
    from sight with the pictures on and that the box still names it.
  - Test 81 unticks and ticks Include Regionals with Space.
  - Test 91 checks the optional items with regional items left out, too.
  - The tests start with Include Regionals ticked and put the visitor's choice back at the end.
  - `js/tests/interface.js` passed 400 lines of code, so its helpers for the options tests moved to
    `js/tests/helpers.js`.
- **Checked.** In screenshots of the Options window with the pictures and with Simple UI. With the regional filter
  switched off in `prune()`, Tests 45 and 81 failed; with the tooltip left outside the Options window, Test 53 failed.
  All 100 tests pass in Chrome, in light and dark colours, in all four window sizes.
- **`js/ui.js`** has 400 lines of code, the limit. The next addition to it needs part of it moved to another script.
- **Requirements.** Requirement 8 lists a description of the Include checkbox in the Options window; with the pictures
  on, it is now the tooltip. Include Regionals is not in `REQUIREMENTS.md` yet, which is read-only here.
- **Documents.** `TESTS.md` has the new wording of Tests 44 to 47, 53, 81 and 91, and the new lines of the tests in
  `js/tests/interface.js`, `js/tests/static.js` and `js/tests/run.js`. `MAINTAINER.md` describes Include Regionals,
  the tooltip over Include and `setRegional()`.

## 2026-10-21: the phone layout, and Test 15

### What changed

- **The bug.** On a phone, with the tree open and many civilisations listed, the civilisations pane grew to the height
  of its whole list (about 1,800 pixels with 56 civilisations), the page scrolled, the list did not scroll inside its
  pane, and the tree pane was crushed to its border, its header spilling over the civilisations pane. The cause was
  `min-height: auto` on the civilisations pane in the one-column layout: for a pane holding a scrolling list, it
  works out to the list's full height, so the pane could never shrink. It was meant to keep the header, the filters
  and a 44-pixel list in view, as the entry of 2026-10-21 on pinned filters says. No test caught it, as none filled
  the list in a phone-sized window.
- **The fix.** With everything open and the civilisations listed, the two panes now take about half the
  window each, and each list scrolls inside its pane. In windows narrower than 720 pixels and at least 640 tall,
  `.panes` is a grid of five rows, the tree's header and list and the civilisations' header, filters and list, and
  each pane spans its rows as a subgrid, keeping its frame. Headers are as tall as their contents and always show
  whole; the two lists share the rest equally, each up to what it needs, and the civilisations' list takes what is
  left over, so on the first visit it still reaches the footer. A first try split the panes themselves in half, but
  then the tree's header (Find box, buttons, legend) spilled out of its half at 360 by 640, so the lists, not the
  panes, share the height.
- **Short phones.** Where the two headers and two 44-pixel lists do not fit, as with the pictures on at 360 by 640 or
  360 by 780, the panes scroll together between the header and the footer, and nothing overlaps. Their scroll bar's
  room is kept (`scrollbar-gutter: stable`), so that on a computer it cannot appear while typing and narrow the Find
  box. The panes have one column of `minmax(0, 1fr)`, so a header cannot push its pane wider than the window.
- **Measured.** With everything open and 56 civilisations listed, the page never scrolls. With Simple UI, the two
  lists are 141 and 141 pixels at 390 by 844, and 169 and 169 at 412 by 915. With the pictures on they are 97 and 69
  at 390 by 844; the civilisations' frame is 28 pixels thicker than the tree's. Screenshots checked at 360 by 640,
  360 by 780, 390 by 844 and 412 by 915, with a phone's touch screen emulated.
- **Test 15 replaced.** "Clear clears everything" made way for a test of this bug. Clear is still pressed
  before nearly every test, by `reset()`. The new Test 15 opens the whole tree and marks the item most civilisations
  have, then checks, in every test window, that the page does not scroll, that both headers sit inside their panes,
  that the panes do not overlap, that the list scrolls inside its pane, and that stacked lists share the height
  within a pixel when both scroll. With the old layout put back, it failed in the 360 by 640 and 390 by 844 windows
  ("the page is 375 by 1754; treeTitle sticks out"), and it was the only test that failed.
- **Tests.** Still 100. A first version ticked Include Unique and Universal to list all 56 civilisations; that
  rebuilds the tree, and the later tests, which keep the items picked at the start, failed. It now uses the item
  most civilisations have, and leaves Include alone. All 100 tests pass in Chrome, in light and dark colours, in
  all four window sizes.
- **Not changed.** On small phones with the pictures on, the footer (about 180 pixels at 360 wide) and the
  civilisations' 38-pixel frame take much of the height; making them smaller on phones would let the panes split the
  height there too.
- **Documents.** `TESTS.md` has the new Test 15 and the new lines of the tests in `js/tests/behaviour.js`.
  `MAINTAINER.md` has a section, "Phones and narrow windows".

## 2026-10-21: no footer on phones

### What changed

- **The footer is hidden on phones.** As decided, the footer need not show in the phone layout, so it is hidden there
  to give its room to the panes: `.foot { display: none; }` in the rule `@media (width < 720px) and (height > 639px)`.
  It took about 150 pixels with Simple UI and 180 with the pictures, at 360 pixels wide. In shorter narrow windows,
  where everything scrolls in one column, the footer stays at the end, as it takes no room from the panes there.
- **Measured.** With everything open and 56 civilisations listed, the two lists now share the height in every phone
  size tried: with Simple UI 115 and 115 pixels at 360 by 640, 185 and 185 at 360 by 780, 217 and 217 at 390 by
  844, 245 and 245 at 412 by 915; with the pictures 96 and 68 at 360 by 780, 179 and 151 at 390 by 844, 213 and 185
  at 412 by 915. Only 360 by 640 with the pictures is still 19 pixels short, so there the panes scroll together.
- **Tests.** Still 100. Tests 42 and 48 checked that the footer is as wide as the panes; they now expect it hidden in
  the phone layout and as wide as the panes elsewhere, through a shared helper, `spans()`. Test 48 leaves hidden
  elements out of its check that everything sits on the parchment. All 100 tests pass in Chrome, in light and dark
  colours, in all four window sizes; the 500 by 900 window, and the 360 by 640 and 390 by 844 test windows, use the
  phone layout.
- **Requirements.** Requirement 5 asks for the footer, but requirement 0 limits the requirements to desktop at 16:9.
- **Documents.** `TESTS.md` has the new wording of Tests 42 and 48, and the new lines of the tests after Test 42.
  `MAINTAINER.md` says where the footer is hidden.

## 2026-10-21: tests named by number

### What changed

- **The GitHub check names failed tests by number.** The log no longer prints each failed test's long name
  and details. For each window size it prints the summary, such as "3 of 100 tests failed in light colours, in
  windows of 500 by 749, 320 by 256, 360 by 640, and 390 by 844 pixels.", and then one line per failed test, such as
  "Test 42 failed". The number is the test's number in `TESTS.md`. A window that never finished says so.
- **The report window** shows the same number before each test's name, with the details after it: "Test 42 failed:
  languages: the footer … (500 by 749: en; …)". It lists the tests in the order of `TESTS.md`, failed ones first;
  before, it sorted them by the word before the colon, so its order matched nothing in `TESTS.md`.
- **How.** `js/tests/run.js` numbers the tests while they run: a test's number is its place in the order the tests
  first run in the main window, which is how `TESTS.md` was already ordered. The three messages that are not tests
  ("the page loaded", "the tests finished", "the tests ran to the end") get no number and still read "Failed: …".
  The report's texts are `pass`, `fail` and `aborted` in `tools` in `data.json`.
- **Checked.** The numbers of a full run were compared, one by one, with the list in `TESTS.md`; all 100 match. With
  the footer shown on phones and one outline colour changed, the log read "3 of 100 tests failed …", then "Test 42
  failed", "Test 48 failed" and "Test 51 failed". All 100 tests pass in Chrome, in light and dark colours, in all
  four window sizes.
- **Documents.** `TESTS.md` explains the numbers. `MAINTAINER.md` says how a failure reads in the report and in the
  GitHub log.

## 2026-10-21: Test 54 failing on GitHub, and Test 51 at 125%

### What changed

- **Why Test 54 failed on GitHub and in a browser, but not on this computer.** Test 54 checks that the Simple UI box
  does not move when Simple UI is ticked (Rule 18). When it runs, the page is in the last language tested, Brazilian
  Portuguese, so the language button reads "Português (Brasil)". In the 320 by 256 test window, that name fitted on
  one line with Windows' Segoe UI, with about 2 pixels to spare. With a wider font, such as the DejaVu Sans of
  GitHub's Linux, it wrapped onto two lines with Simple UI, though never with the pictures, which forbade wrapping.
  The button grew from 44 to 58 pixels and the Simple UI box moved 14 pixels down. The test was right: the box did
  move. It was reproduced here by setting the page's font to Verdana, which is as wide as DejaVu Sans; then only
  Test 54 failed, in the 320 by 256 window only.
- **The fix.** The language's name on its button never wraps now, with Simple UI as with the pictures: in a very
  narrow window a long name ends in "…". The opened list shows every name whole, and screen readers read the button
  whole, as it is labelled by the name itself. So the language row is 44 pixels tall in both modes, whatever the
  font, and the box stays put. With Verdana, all 100 tests pass.
- **Test 54 says what went wrong.** Its report detail used to list the pictures on the page at its end, which are
  always there, so it never told which step failed. It now names each problem, such as "320 by 256: ticking moved
  the box from 44,132 to 44,146", "the links did not come back" or "img.civ-icon is left".
- **Test 54 no longer presses Space.** As agreed, Space did not belong there: Space on the Options boxes goes through
  one handler, already tested on Include and Include Regionals (Test 81) and on Tooltips (Test 53). Simple UI is now
  unticked with a click, as it is ticked.
- **Unticking is checked properly.** "All back" used to mean only that the page, its body and the Options button had
  their pictures again. Now the test takes the full list of images before ticking, the icons of the tree and the
  civilisations included, and expects the same list after unticking, and checks that unticking does not move the
  box either. With the tree's icons kept from coming back, the new test fails; the old one did not look at them.
- **Question asked: does Test 54 wait for the pictures to load back?** It does not, and need not: it checks that the
  page asks for the pictures (the CSS pictures in the computed styles, and the `<img>` elements), which is true at
  once, not that the files have arrived. Tests 51 and 52 wait for the icons and the fonts to load.
- **Test 51 at 125% display scaling.** Chrome draws borders in whole screen pixels, so at 125% a 2-pixel border
  is 1.6 pixels, and Test 51, which expected exactly 2, failed. It now accepts a border within a pixel of 2.
- **Tests.** Still 100. The helpers Test 54 uses, and `need()`, which turns a failed condition into its message,
  moved to `js/tests/helpers.js`, so that `js/tests/interface.js` stays under 400 lines of code (395). The new
  lines keep to 120 characters, as Rule 24 now asks; many older lines in the project are longer.
- **Checked.** All 100 tests pass in Chrome, in light and dark colours, in all four window sizes, with Verdana as the
  page's font, and at 125% and 150% display scaling.
- **Documents.** `TESTS.md` has the new wording of Test 54 and the new lines of the tests in
  `js/tests/interface.js`. `MAINTAINER.md` explains, in "The Options window", why the language's name never wraps.

## 2026-10-21: fewer test windows, and three tests removed

### What changed

- **Two test windows gone.** As decided, the tests no longer open the 360 by 640 and 390 by 844 windows, which were
  judged too unlikely to be worth testing. The 320 by 256 window stays: it is how the page looks at 400% zoom, which
  WCAG's reflow criterion asks for, and Rule 3 and Rule 4 rely on it for Simple UI. The 322 by 480 and 352 by 480
  windows seen in a report are not set by the tests; the first window in a report is always the browser window the
  tests ran in. On GitHub, the 500 by 900 run still tries the phone layout.
- **Tests 49, 50 and 52 removed.** Nothing checks these things any more:
  - Test 49: the title "Civ Explorer" in bold Georgia in its frame, and the Options window's title in the frame of
    its parchment.
  - Test 50: the text buttons' picture with unstretched ends, and their bold Georgia lettering and shadow.
  - Test 52: the panels' frames, fonts and colours; the civilisation icons and that they load; the links to
    aoe2techtree.net and the tooltip showing them; Civ view's tiles; the pinned filters; the Find box above the
    buttons and the hidden legend.
- **97 tests**, renumbered in `TESTS.md`: what was Test 51 is now 49, and every test after it moved down by three.
  The numbers in a run were compared with `TESTS.md` again, and all 97 match.
- **Tidying.** `civsOf` and `matching` were only used by Test 52 and are no longer imported in
  `js/tests/interface.js`, which has 313 lines of code.
- **Checked.** All 97 tests pass in Chrome, in light and dark colours, in all four window sizes, each with the
  320 by 256 window.
- **Documents.** `TESTS.md` lists the 97 tests. `MAINTAINER.md` no longer promises checks that the removed tests
  made, mentions only the 320 by 256 window in step 6, and says where the phone layout is tested.

## 2026-10-21: no 320 by 256 window, and Test 82 checks Rules 23 to 26

### What changed

- **No more test windows.** As decided, the tests no longer open the 320 by 256 window either. They run only in the
  window they are opened in; on GitHub that is each of its four window sizes. The code that opened windows went with
  it: `framed()` and the messages between windows in `js/tests/run.js`, the `frameTemplate` in `index.html`, the
  `.test-frame` rules in `style.css`, and `frameTitle` in `data.json`. The report now says "in a window of …
  pixels". Nothing now checks the page at 400% zoom, which WCAG's reflow criterion asks for with Simple UI; try it by
  hand after bigger changes, as the end of `MAINTAINER.md` says.
- **Test 82 checks Rules 23, 24 and 25.** It now checks `index.html`, `style.css` and every script for
  files over 400 lines of code (Rule 25), functions over 60 lines of code (Rule 23) and lines over 120 characters
  (Rule 24). Blank lines are not lines of code. Before, it only checked that no script had over 400 lines of code.
  `data.json`, the language files and the documents are data and text, not code, so they are not checked.
- **How functions are measured.** `js/tests/static.js` first blanks out strings, the text of template strings and
  regular expressions, so that braces inside them do not count, then pairs each function body's `{` with its
  `}`: a body follows `=>`, or a `)` that closes a function's parameters rather than an `if`, `for`,
  `while`, `switch` or `catch`. Functions written without braces, such as `(a) => a + 1`, are not measured; they are
  short. On every script, it found as many functions as `function` and `=> {` appear, and its braces balanced.
- **Rule 26 is checked by GitHub.** A page in a browser cannot list folders, so Test 82 cannot see Rule 26. GitHub can:
  a new step in `.github/workflows/tests.yml` counts the committed files in each folder, leaving out `assets/` and
  `locales/`, and fails if a folder holds more than 7. It runs after the tests, even when they fail, so both
  results show.
- **What fails now.** Test 82 fails, as the code does not keep to the new rules yet:
  - Rule 23: `wireTree()` in `js/ui.js` has 90 lines of code, `pictureTests()` in `js/tests/interface.js` 127, and
    `audit()` in `js/tests/audit.js` 73.
  - Rule 24: 232 lines are over 120 characters: 14 in `index.html`, 49 in `style.css`, 1 in `script.js`, 10 in
    `js/datahandler.js`, 6 in `js/model.js`, 4 in `js/ui.js`, 1 in `js/report.js`, 4 in `js/tests/run.js`, 18 in
    `js/tests/helpers.js`, 23 in `js/tests/static.js`, 36 in `js/tests/behaviour.js`, 54 in `js/tests/interface.js`
    and 12 in `js/tests/audit.js`. The new code keeps to 120.
  - Rule 25: no file is over 400 lines of code; `js/ui.js` has exactly 400.
  - Rule 26: the main folder holds 8 files: `.gitignore`, `LICENSE`, `README.md`, `data.json`, `favicon.ico`,
    `index.html`, `script.js` and `style.css`. Every other folder holds 7 or fewer.
  The other 96 tests pass.
- **Documents.** `TESTS.md` has the new wording of Test 82 and the new lines of the tests in `js/tests/static.js` and
  `js/tests/run.js`. `MAINTAINER.md` describes Rules 23 to 26 and the GitHub step, and no longer mentions the
  320 by 256 window in step 6.

Currently: big refactor time, focussing on getting project compliant with rules 23-26. Hard stop on new features until this is under wraps.

## 2026-10-22: compliance with RULES.md and REQUIREMENTS.md, and js/ui.js split in three

Goal: make the project compliant with `RULES.md` and `REQUIREMENTS.md`, with every test passing, without stopping
for questions, and with `js/ui.js` split into `js/nodetree.js`, `js/stringbuilder.js` and `js/optionshandler.js`.
Nothing was committed. Questions are at the end of this entry.

### What changed: the code (Rules 23 to 26)

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

### What changed: requirements

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

### Tests

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

### Documents

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

### How the rules were read

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

### Questions

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

### Obstacles met, and how they were solved

- **Chrome sends a click when a list's scroll bar is clicked.** Found when closing the language list on any click.
  Clicks whose position falls on the list's own scroll bar are ignored, and the list takes focus so that the click
  does not move focus out of the menu.
- **The tests kept items from before the tree was rebuilt.** The picture tests marked items picked at the start,
  which Include had since replaced, so the marks went nowhere. They now pick their items when they start.
- **`code_docu.pdf` is printed by Chrome from a page that is not kept in the project**, and its text is stored as
  glyphs. Its text was read back with pdf.js in a scratch page, outside the project, to rebuild it in the same form.

## 2026-10-22: answers to the questions above

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

## 2026-10-22: the decisions carried out

The three decisions above are in place. Nothing was committed, and `REQUIREMENTS.md` and `RULES.md` were not touched.

### Decision 1: the pictures as before

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

### Decision 2: "Full" only with something under it

- A fully marked building, top-level row or group reads "Full" only when it has something under it, such as "Full
  Market" or "Full Watch Tower". The House, with nothing under it, reads "House" (`chipName()` in `js/model.js`).

### Decision 3: the top of a line

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

### How the requirements were read

- **Never up.** Requirements 27 and 29 pass a mark only to items below the one marked, and requirement 30 forbids
  passing one from a unit or technology to an item with another count. No requirement passes a mark up, so nothing
  does.
- **The top of a line** is a unit or technology straight under a building or a group, as in the examples of decision
  3. A line ends where an item has more than one item under it.

### Tests

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

### Documents

- `MAINTAINER.md`: the title, checkboxes, tree pane, tooltips and Options window with the pictures as before, beside
  what Simple UI shows; Step 4's marking rules (the top of a line, the same count below it, never up, and "Full" only
  with something under it) without the section on `optional`; the test numbers; `settle()` out of the diagram and
  the description of `js/model.js`; and the rule on `REQUIREMENTS.md`, which now says what requirement 0 says.
- `code_docu.pdf` rebuilt: 35 pages, 258 functions. `isTop()` and `prune()` in `js/model.js`, and `onTop()` in the
  tests, are used only in their own scripts, so they are no longer exported; `prune()` was exported for the test
  of the `optional` flag.

### Questions still open

Questions 5, 6 and 7 of the entry above: room in `js/` and `js/tests/` (Rule 26), the options that
`REQUIREMENTS.md` does not mention, and the order the updater writes the Dock's items in.

## 2026-10-22: requirement 27 rescinded

Decided, and recorded before any work on it:

- Decision 3 above is withdrawn. Requirement 27 has been rescinded and is no longer complied with, and the
  exception for the top of a line has been taken out of requirement 30. Every node now follows requirements 29 and
  30 without exception: a mark passes down a line of only children only to items with as many civilisations as the
  one marked, the top of a line included.
- `MAINTAINER.md` is not to be edited for now.

### Carried out

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

## 2026-10-22: MAINTAINER.md rewritten for Rule 27

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

## 2026-10-22: requirements 24, 25 and 30 amended for Fortifications

Amended, and recorded before any work on them:

- Req. 24, "Full", no longer applies to the descendant nodes of Fortifications. The Fortifications row itself keeps
  it.
- Req. 25, a line's filter named after its deepest descendant, now also applies to Fortifications.
- Req. 30, no mark passed to an item of another count, now also applies to Fortifications.

So the walls and towers under Fortifications are marked and named like units and technologies: marking the Watch
Tower no longer marks the Guard Tower and Keep, as their counts differ, and a marked tower line is named after its
deepest item marked must have, such as "Keep", instead of "Full Watch Tower".

### Carried out

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

## 2026-10-22: two tree buttons with the pictures

Requested: with the pictures on, the three buttons under the Find box become two, Clear and
Expand all, and Expand all turns into Collapse all while one or more nodes are expanded. The buttons use the whole
button sprite, unstretched, side by side as wide as the input pane, and the same size in every language. Simple UI is
unchanged. The request first said "while one or more nodes has an assigned value"; it was corrected
while the work was under way: only whether nodes are expanded counts, and the marks have no effect on the button.

### Carried out

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

### Tests: 94

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

### Documents

- `MAINTAINER.md`: the two buttons in Simple UI and the pictures.
- `TESTS.md`: Test 48, the renumbering, and the lines of Tests 45 to 49 in `js/tests/pictures.js`.
- **`code_docu.pdf` was not rebuilt.** It does not yet describe `toolLooks()` in `js/tests/pictures.js`, or the
  handing on of focus in `wireTools()`.

### Not done

- **Requirement 34**, "A prerequisite node must be automatically enabled if a descendant node is enabled", was added
  to `REQUIREMENTS.md` during this work. It has not been carried out. It goes against how marking works now, where a
  mark never passes up (marking Champion marks Champion only).

## 2026-10-22: the report window keeps its title and Close button in view

Requested: in the test results window, the title "Test results" and the summary of how many tests
passed or failed stay at the top of the window, and the part with the Close button stays at the bottom, so that
neither disappears when scrolling and Close is found without scrolling down. Only the list of the individual test
results scrolls. Before, the whole window scrolled: with 94 results at 1920 by 1080, Close sat 3,400 pixels down.

### Carried out

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

### Tests: 95

- **New Test 94**, in `js/tests/interface.js` and run last before the count of tests, fills the report window with
  200 lines and scrolls its list to the end. The title, the summary and Close must not have moved and must still be
  on screen, the window itself must not scroll, and focus must start on Close.
- Test 94, at most 100 tests, is now Test 95.
- **Undone in a scratch copy**, each of these fails Test 94 and nothing else: the window back to scrolling as a whole,
  and Close without `autofocus`.
- **Checked.** All 95 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26. The updater's window was checked by hand with 60
  messages and two download links.

### Documents

- `MAINTAINER.md`: step 6 of the update guide, and the description of `js/report.js`.
- `TESTS.md`: Test 94, Test 95, and the lines of every test in `js/tests/interface.js`, which moved down by one, and
  of Test 95 in `js/tests/run.js`.
- `code_docu.pdf` was not rebuilt, as in the entry above. It does not describe `reportTests()` either.

## 2026-10-22: the report window's Close button, plain and on the right

Requested: the test results window uses the plain button, without the button sprite, whether or
not Simple UI is on, and its Close button is on the right instead of the left.

### Carried out

- **No sprite.** With the pictures on, the sprite rules in `style.css` now read `.pictures .tool:not(.icon, .report
  .tool)`, so they no longer reach the report window's Close button, which keeps the plain look of `.tool`: a thin
  border, the page's colours and the page's font. The rules for 4K screens and for the end caps are left out for it
  in the same way. The updater's report is the same window, so its Close button is plain too.
- **On the right.** The window's `form` aligns its button to the right.
- **Rule 25.** The `.options[open]` rule went onto one line, and `style.css` now has 397 lines of code.

### Tests: still 95

- **Test 94** now also checks that Close sits on the right and that, with the pictures turned on, its background,
  border, colours, font and end caps are the same as with Simple UI.
- **Undone in a scratch copy**, each of these fails Test 94 and nothing else: the sprite back on the report's Close
  button, and Close back on the left.
- **Checked.** All 95 tests pass in Chrome 156 on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. No script breaks Rules 23 to 26.

### Documents

- `MAINTAINER.md`: the description of `js/report.js`.
- `TESTS.md`: Test 94.
- `code_docu.pdf` was not rebuilt.

## 2026-10-22: Cancel and OK in the Options window with the pictures

Requested: instead of a Close button, the Options window has two buttons, Cancel and OK, using the
button sprite in its own proportions and unstretched, on the right instead of the left. On Cancel the changes are
discarded; on OK they are applied. Before the work began, it was decided:

- **Changes wait for OK.** Nothing on the page changes while the window is open, not even the language or Simple UI.
  OK applies everything; Cancel or Escape throws it all away.
- **Simple UI keeps Close**, as requirements 8 and 16 ask, and its changes still take effect at once (requirements 11,
  15 and 33). Cancel and OK appear only with the pictures on.

### Carried out

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

### Tests: 96

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

### Documents

- `MAINTAINER.md`: Cancel and OK in Simple UI and the pictures, `choices` in the description of
  `js/optionshandler.js` and in the UML diagram.
- `TESTS.md`: Test 49, Tests 47 and 50, the renumbering, and the lines of Tests 45 to 50.
- `code_docu.pdf` was not rebuilt.

## 2026-10-22: the footer links to the project

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

## 2026-10-23: the Xolotl Warrior, which excludes the Stable

Requested: a new regional unit under the Stable, the Xolotl Warrior, for the Aztecs, Mayans, Incas,
Muisca, Mapuche and Tupi. As an edge case, when the Xolotl Warrior is enabled the Stable is disabled, and when the
Stable is enabled the Xolotl Warrior is disabled. As in the tree's tooltip, "Left-click to enable, right-click to
disable", enabled is read as must have and disabled as must lack.

### Carried out

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

### Tests: 97

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

### Documents

- `MAINTAINER.md`: the updater's new message in step 4; `excludes` and `extras` in The data, with how to add an item
  that aoe2techtree.net gives to no civilisation; the rule in How marking works; and where the icon comes from in
  Assets.
- `TESTS.md`: Test 21, Tests 87 and 88, the renumbering, and the lines of the tests in `js/tests/behaviour.js` and
  `js/tests/static.js`.
- `code_docu.pdf` was not rebuilt. It does not describe `pair()`, `current()`, `put()` and `reached()` in
  `js/model.js`, `fromExtra()` and `addExtras()` in `js/datahandler.js`, `badExtras()` in `js/tests/static.js` or
  `rivals()` in `js/tests/behaviour.js`.

### How the rules were read

- **"The Stable is disabled"** is read as what a right-click on the Stable does, everything in it must lack, apart from
  the Xolotl Warrior. Must lack on the Stable alone would have shown it with a dash.
- **Rule 18 and Req. 31** together decide the Xolotl Warrior's place: opening the rows its mark reaches must not move
  it, so nothing that opens may be above it.
- **Req. 24**, "Full", is read as before for the Stable: everything in it must have, and the Xolotl Warrior, not part
  of it, must lack.

## 2026-10-23: Test 21 on GitHub

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

### Not done

- **A row moving when a count above it changes length** happens with any mark, as above, and was there before. Giving
  the counts a fixed width would stop it, but changes the tree's look, so it is left as an open question.

## 2026-10-24: phone panes of equal, fixed height (requirement 35, rule 18)

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

### Not done

- **Short windows.** Below 640 pixels high on a narrow screen, or below 500 high on any screen, such as a phone
  held sideways or at 400% zoom, the panes still stack and the whole content scrolls, so a pane grows as the tree
  opens. Two fixed halves do not fit there, so this is left as an open question.

## 2026-10-24: items all civilisations but one have count as universal

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

## 2026-10-24: the Monastery is a top-level row

### What changed

- **The Monastery and its whole branch moved.** They left the Economy group and are
  now a top-level row between Blacksmith and University, the order aoe2techtree.net uses. The Fortified Church, the
  Monastery of the Armenians and the Georgians, stays in Economy.
- **How.** As with the Dock, the JSON writer in `js/datahandler.js` made the move, after confirming that it
  reproduces `data.json` exactly, so nothing else in the file changed.
- **Tests.** All 97 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900.

## 2026-10-24: the Fortified Church is a top-level row, and it and the Monastery hide each other

### What changed

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

## 2026-10-24: the Fortified Church holds the Monastery's rows

### What changed

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

## 2026-10-24: one Devotion, not two

### What changed

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

## 2026-10-24: greyed out instead of hidden

### What changed

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

## 2026-10-24: the Xolotl Warrior clears the Stable

### What changed

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

## 2026-10-24: a building heading a single line is named after its deepest item

### What changed

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

## 2026-10-24: must have passes up to an item's prerequisites (requirement 34)

### What changed

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

## 2026-10-24: the drop-off site variants hold what they replace, as the Fortified Church does

### What changed

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

## 2026-10-25: the Pasture, the Harbor and the Donjon are variants too, and unique buildings have no group

### What changed

- **Three more variants.** In `data.json`, the Pasture replaces the Farm, the Harbor the Dock, and the Donjon the
  Watch Tower, as the Fortified Church does the Monastery. Under the Harbor, the page shows the Dock's rows outside
  its Unique Units, from the Fishing Ship to Heavy Warships. The Farm has nothing under it, so the Pasture holds
  nothing, and only the greying out applies: while the Pasture is marked must have, the Farm is greyed out, and the
  other way round. The same goes for the Harbor and the Dock, and for the Donjon and the Watch Tower.
- **The Donjon holds nothing.** The Sicilians have neither the Watch Tower nor the Guard Tower nor the Keep, and the
  Guard Tower and the Keep are the Watch Tower's own upgrades, not things built in it. So `variants()` in
  `js/model.js` now lends only what is in a building: an item that counts as a unit or technology, as the Watch
  Tower does in Fortifications, lends nothing. Every other variant replaces buildings and holds what it did.
  Marking the Donjon must have lists the Sicilians, under the filter "Donjon".
- **No Unique Buildings group.** Both groups are gone, the one in Economy and the one in Military. The Feitoria and
  the Folwark are now straight under Economy, and the Donjon and the Krepost straight under Military, where their
  groups were. The Harbor is now at the top of the tree, right after the Dock, as the Fortified Church is after
  the Monastery. The group's name is gone from `data.json` and every language file.
- **Still left out by default.** No group hides the unique buildings now, so `prune()` in `js/model.js` also leaves
  out each item aoe2techtree calls unique (its `reach` in `pictures`) until **Include Unique and Universal** is
  ticked. These are exactly the items that were in the unique groups, so the default tree is unchanged. A new
  unique building is now left out by itself, with no group to put it in. The Pasture and the Farm are left out
  by default too, as before: the Khitans alone have the Pasture, and all but the Khitans have the Farm.
- **Tests.** Test 22 now ticks Include before it checks that every item that replaces others holds exactly the
  rows of the buildings among them. Otherwise the four unique or one-civilisation stand-ins (the Folwark, the
  Harbor, the Donjon and the Pasture) would not be in the tree to check. Ticking Include rebuilds the tree, so Test
  22 then picks the shared test items again for the tests after it. Test 43 counts an item as unique by its
  `reach` as well as by its group.
- **Mutation runs.** Without the new check in `prune()`, Tests 43 and 79 fail. With unique items ignoring
  `"replaces"`, Test 22 fails. Before, it ran with Include unticked and could not see this. With the Watch Tower
  lending its Guard Tower and Keep to the Donjon, Test 22 fails, and so does Test 44: the Donjon, in Military,
  would then show them before Fortifications does.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, with Include ticked, the tree has the shape above, the Donjon has nothing
  under it, and marking each of the three new variants must have greys out what it replaces, and the other way
  round.
- **Documents.** `TESTS.md`: Tests 22 and 43, and the places of the tests in `js/tests/behaviour.js`. Test 45's
  place was already wrong and is fixed. `MAINTAINER.md`: where a new unique building goes, How marking works, and
  what Include leaves out.

### Questions

1. **"Except for castle".** The first version of the request kept a Unique Buildings group "except for castle",
   but the version that followed dropped it, so both groups are gone. No group sat under the Castle. If the
   Donjon and the Krepost should keep a group in Military, it can come back from commit `9dadd70`.
2. **The Harbor and the Dock are not exclusive.** aoe2techtree gives the Malay both the Dock and the Harbor. So
   unlike the other variants, both can be had at once. The greying out only stops "Dock and Harbor must have",
   which lists the same civilisation as the Harbor alone. Should the pair still grey each other out?
3. **Borrowed rows that no civilisation of the variant has.** The Donjon now shows nothing its Sicilians lack, but
   other variants still show such rows, as they are things built in the building they replace: Two-Man Saw under
   the Mule Cart; Domestication, Pastoralism and Transhumance under the Settlement and the Folwark; and the Heavy
   Demolition Ship, the Longship line, the Dromon, the Catapult Galleon and the Lou Chuan under the Harbor. Should
   a variant leave out every row that none of its civilisations has?

Variants still to be resolved:
- variant v variant (settlement - mule cart)
- unit variants (shock infantry, siege elephant v siege ram, champi v militia)
- tech variants (cranequins v parthian tactics)

## 2026-10-26: the Domestication line stays the Mill's

### What changed

- **`"own": true`.** A row of the tree can now be marked `"own": true`, and no variant then borrows it, or
  anything under it. In `data.json`, Domestication is marked so, as only the Khitans have its line. The Folwark now
  shows only the Mill's Horse Collar line, and the Settlement shows that line and the rows of the Lumber Camp and
  the Mining Camp. The Mill keeps the Domestication line.
- **Question 3 of 2026-10-25.** It was chosen to leave the Domestication line out by hand, for both
  the Folwark and the Settlement, rather than leave out every row that none of a variant's civilisations has. So
  the Mule Cart keeps Two-Man Saw, and the Harbor keeps the ships the Malay lack.
- **Code.** `common()` in `js/model.js`, which copies a building's rows for its variants, skips a row marked
  `own`, as it skips a unique group.
- **Tests.** Test 88 accepts `own`, only as `true` and only on items. Test 22 expects a variant to hold the rows
  of the buildings it replaces, except their own rows, which it reads from `data.json` through the new `ownKeys()`
  in `js/tests/helpers.js`.
- **Mutation run.** With `common()` ignoring `own`, Test 22 fails, and no other test does.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, with Include ticked, the Folwark shows Horse Collar, Heavy Plow and Crop
  Rotation; the Settlement shows those and the Lumber Camp and Mining Camp lines; and the Mill shows Domestication,
  Pastoralism and Transhumance as well.
- **Documents.** `TESTS.md`: Tests 22 and 88, and the places of the tests after them in `js/tests/behaviour.js`
  and `js/tests/static.js`. `MAINTAINER.md`: The data, and How marking works.

## 2026-10-26: a unique item has its own filter (requirement 36)

### What changed

- **Requirement 36.** A unique item marked must have now always has its own entry in **Filters**, unless every
  item in its line is unique. Before, a fully marked Folwark read only "Crop Rotation", as a building heading a
  single line is named after its deepest item. Now it reads "Crop Rotation" and "Folwark", in the order of the tree.
  A line that is unique throughout, such as the Gbeto line, still has one entry, "Elite Gbeto".
- **Which items.** An item counts as unique by its `reach` in `pictures`. Requirement 36 only changes anything for
  a unique item in a line with items that are not unique, which `alone()` in `js/model.js` finds. Today that is
  only the Folwark, above the Mill's Horse Collar line. A unique item with no line, such as the Feitoria, or one
  that heads a branch, such as the Harbor ("Full Harbor"), already had an entry named after it.
- **How.** In `filtersOf()`, such an item gets an entry of its own. It no longer stands for its line, and it no
  longer hides the rows under it, so the Mill's Horse Collar line, which the Folwark borrows, gets its usual entry,
  named "Crop Rotation". Even a full Economy lists "Folwark" beside "Full Economy".
- **Clearing.** The Folwark's entry clears only the Folwark, so "Crop Rotation" stays. Any other entry, such as
  "Crop Rotation" or "Full Economy", leaves the Folwark marked. `unmarkLine()` takes the new `own` flag, which
  `listFilters()` sets on the entry as `data-own`.
- **Tests.** The new Test 53 marks the Folwark, or whichever unique item first heads a line of others. It checks
  both entries, that each clears only itself, that a full group's entry leaves the item marked, and that a wholly
  unique line has one entry. It ticks Include, so it runs at the end of the functional round, after the pictures,
  and the tests after it are renumbered from 54 to 99. Rule 17 allows 100.
- **Mutation runs.** Test 53 fails, and no other test does, with each of these: no entries of their own; the
  item still standing for its line and hiding its rows; and other entries clearing it.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, with Include ticked: the Folwark gives "Crop Rotation" and "Folwark" and
  lists the Poles; Elite Gbeto gives one entry; the Harbor gives "Full Harbor"; and the Folwark with the Feitoria
  gives "Crop Rotation", "Feitoria" and "Folwark".
- **Documents.** `TESTS.md`: Test 53, and the numbers of Tests 54 to 99, checked against the report.
  `MAINTAINER.md`: How marking works, and the list of test files.

### Questions

1. **Order.** The entries keep the order of the tree, so "Crop Rotation", from the Mill, comes before "Folwark".
   Should a unique item's entry come first instead?

## 2026-10-26: a variant greys out every alternative (requirement 37)

### What changed

- **Requirement 37.** While an item is marked must have, its alternatives are greyed out: what it replaces, what
  replaces it, and now also the other variants of what it replaces. Marking the Folwark now greys out the
  Settlement as well as the Mill, as both replace the Mill. Marking the Settlement greys out the Mill, the Lumber
  Camp, the Mining Camp, the Folwark and the Mule Cart, and marking the Mule Cart greys out the two camps and the
  Settlement. The Folwark and the Mule Cart replace nothing in common, so neither greys out the other.
- **Unit variants.** As chosen, in `data.json` the Varangian Guard and the Fire Lancer replace
  the Eagle Scout, the Champi Scout the Militia, and the Armored Elephant the Battering Ram. So the Eagle Scout,
  the Varangian Guard and the Fire Lancer grey each other out. The Militia is not shock infantry and is not one of
  them, but it and the Champi Scout grey each other out, and so do the Battering Ram and the Armored Elephant. A
  unit lends nothing, so no item gained a row: the Champi Scout still holds only its own line, down to the Elite
  Champi Warrior. Marking a row lower down, such as the Siege Ram, passes must have up to the Battering Ram, and so
  greys out the Armored Elephant.
- **The Harbor is in the Dock.** The Harbor is no longer a variant of the Dock. It is
  the first row under the Dock and holds nothing. This settles question 2 of 2026-10-25: the Malay have both, and
  neither greys out the other now. With Include ticked, a full Dock needs the Harbor too, which only the Malay
  have.
- **Code.** In `js/model.js`, the new `siblings()` runs in `rebuild()` after `pair()`. Each item that replaces
  others also takes as alternatives the other items that replace the same ones. `barred()` is unchanged, and
  greying adds no rows to any item.
- **Accessibility audit.** A greyed-out row lets clicks through (`pointer-events: none` in `style.css`). The shared
  test items mark the Elite Champi Warrior, which now greys out the Militia, so Test 78 ("nothing covers what has
  focus") found the Militia's own branch at the centre of the focused row. In `js/tests/audit.js`, it now accepts
  that branch when the focused element lets clicks through. It reads the style and sets none, as Rule 2 asks:
  setting it from the script failed Test 82.
- **Tests.** Test 22 marks each item that replaces another, or that another replaces, must have in turn, and
  checks that exactly its alternatives are greyed out. It reads them from `data.json` through the new
  `alternativesOf()` in `js/tests/helpers.js`.
- **Mutation runs.** Without `siblings()`, Test 22 fails. With `siblings()` also taking the alternatives of those
  alternatives, so that the Folwark greys out the two camps, Test 22 fails. No other test fails with either.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, with Include ticked, marking each item above must have greys out what is
  listed for it, the Pasture and the Farm, the Donjon and the Watch Tower, and the Fortified Church and the
  Monastery grey each other out as before, and the Harbor greys out nothing.
- **Documents.** `TESTS.md`: Tests 22 and 78, and the places of the tests after them in `js/tests/behaviour.js`
  and `js/tests/audit.js`. `MAINTAINER.md`: where a new unique building or unit variant goes, and How marking
  works.

### Questions

1. **Technology variants.** The list under the 2026-10-24 entry also names Cranequins and Parthian Tactics, which
   no civilisation has together. Requirement 37 does not name technology variants, so they are left as they are.
   Should Cranequins name Parthian Tactics with `"replaces"`, so that they grey each other out?
2. **The Harbor's place.** It is the first row under the Dock, above the Fishing Ship. Should it go elsewhere,
   such as last?

## 2026-10-26: Cranequins and Parthian Tactics are variants too

### What changed

- **Question 1 of the requirement 37 entry.** It was confirmed that Cranequins and Parthian Tactics
  are variants, covered by requirement 37. In `data.json`, Cranequins now replaces Parthian Tactics, so while one
  is marked must have, the other is greyed out. No civilisation has both. A technology lends nothing, so neither
  gained a row. No code changed.
- **Question 2.** The Harbor stays the first row under the Dock.
- **Tests.** Test 22 reads the alternatives from `data.json`, so it now also marks Cranequins and Parthian Tactics
  in turn, and checks that each greys out only the other.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, marking either one must have greys out the other, and every variant of
  the requirement 37 entry greys out what it did.
- **Documents.** `MAINTAINER.md`: where a new technology variant goes, and How marking works.

## 2026-10-26: the Dromon, the Catapult Galleon and the Lou Chuan are Cannon Galleon variants

### What changed

- **Requirement 37.** In `data.json` the Dromon, the Catapult Galleon and the Lou
  Chuan now replace the Cannon Galleon. No civilisation has two of the four. While one of them is marked must
  have, the other three are greyed out. Marking the Elite Cannon Galleon passes must have up to the Cannon
  Galleon, and so greys out the other three as well. They stay where they were, right after the Cannon Galleon.
  A unit lends nothing, so none gained a row. No code changed.
- **Tests.** Test 22 reads the alternatives from `data.json`, so it now also marks each of the four in turn, and
  checks that each greys out exactly the other three.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, with Include ticked, marking each of the four, or the Elite Cannon
  Galleon, must have greys out what is said above, and the other variants grey out what they did.
- **Documents.** `MAINTAINER.md`: How marking works.

## 2026-10-26: the Mangonel and the Rocket Cart are variants

### What changed

- **Requirement 37.** In `data.json` the Rocket Cart now replaces the Mangonel. The
  Chinese, the Jurchens, the Khitans and the Koreans have the Rocket Cart, and exactly they lack the Mangonel.
  While one of the two is marked must have, the other is greyed out. Marking a row lower down, such as the Siege
  Onager or the Heavy Rocket Cart, passes must have up, and so greys out the other unit as well. A unit lends
  nothing, so neither gained a row. No code changed.
- **Tests.** Test 22 reads the alternatives from `data.json`, so it now also marks both in turn, and checks that
  each greys out only the other.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, with Include ticked, the Mangonel and the Siege Onager grey out the
  Rocket Cart, the Rocket Cart and the Heavy Rocket Cart grey out the Mangonel, and the other variants grey out
  what they did.
- **Documents.** `MAINTAINER.md`: How marking works.

## 2026-10-26: the Xolotl Warrior and the Stable grey each other out

### What changed

- **Greying out, not clearing.** The Xolotl Warrior and the Stable now use the
  greying out of the variants. While the Xolotl Warrior is marked must have, the Stable and every row in it but the
  Xolotl Warrior are greyed out and cannot be marked. While the Stable, or any row in it, such as the Paladin or
  Husbandry, is marked must have, the Xolotl Warrior is greyed out. Before, must have on either cleared the other,
  and only the Stable itself, not the rows in it, counted. Must lack still greys out nothing. No civilisation has
  the Xolotl Warrior and anything in the Stable, so the greying out never hides a choice that lists anyone.
- **The Stable stays open.** A greyed-out item is closed and cannot be opened, but the Stable holds the Xolotl
  Warrior, which would then vanish as it is marked. So an item that holds the item it excludes stays open, and its
  arrow still works, by mouse, by keyboard and with **Expand all**. Only its box is greyed out. The rows in it are
  closed, as greyed-out items are.
- **Code.** In `js/model.js`, the new `oppose()` gives each item on either side of an `"excludes"` pair the
  other side as its opponents, and `barred()` greys out an item when an alternative or an opponent is marked must
  have. The new `locked()` is `barred()` without the items that hold their rival, and `js/nodetree.js` uses it to
  close items and block their arrows. `mark()` no longer clears rivals, as a greyed-out item cannot be marked. In
  `style.css`, the grey and the blocked pointer now apply to the box and the arrow that are disabled, not to the
  whole row, so the Stable's arrow stays usable.
- **Tests.** Test 21 is rewritten for the greying out, both ways, and for the Stable staying open with a working
  arrow. Test 22 reads the grey from the box, where it now is. `js/tests/behaviour.js` is at 400 lines, the most
  Rule 25 allows: Test 21 no longer checks that marking the Xolotl Warrior opens no row above it, as marking it no
  longer opens or clears anything.
- **Mutation runs.** Test 21 fails, and no other test does, with each of these: no `oppose()`; greying out one way
  only; the Stable closing like other greyed-out items; the Stable's arrow marked disabled; and the old style rule
  on the whole row, which blocks the Stable's arrow.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, marking the Xolotl Warrior greys out the Stable and its 16 rows, keeps it
  in sight with one filter and 6 civilisations, closes the Knight line, and leaves the Stable's arrow working; the
  Stable and the Knight cannot then be marked. Marking the Paladin or the Stable greys out the Xolotl Warrior,
  which cannot then be marked, and must lack on both greys out nothing.
- **Documents.** `TESTS.md`: Test 21, and the places of the tests after it in `js/tests/behaviour.js`.
  `MAINTAINER.md`: How marking works.

## 2026-10-26: the Options window has Cancel and OK, and a roomier look with Simple UI

### What changed

- **No Close button.** The Options window no longer has **Close**. With Simple UI it
  now has **Cancel** and **OK** on the right, as it already had without Simple UI. The `close` text of the window is
  gone from `data.json` and every language file; the report window's **Close** is a different text and stays.
- **What Cancel and OK do with Simple UI.** Every change still takes effect at once, as requirements 11 and 15 ask:
  choosing a language changes the page, and ticking a box does what it says. When the window opens,
  `js/optionshandler.js` notes every choice. **Cancel**, and Escape through the window's `cancel` event, put back
  every choice that changed since, the language too. **OK** keeps them. Unticking Simple UI turns the pictures on at
  once, and **Cancel** then brings Simple UI back. Without Simple UI nothing changes: changes wait for **OK**.
- **A language still loading.** A language file can still be on its way when **Cancel** is pressed. The language
  choice now counts the language last chosen, loaded or not, so **Cancel** asks for the old language again, and the
  late file no longer switches the page.
- **Size and spacing with Simple UI.** The window is 10 pixels larger on every side: 532 by 500 pixels instead of
  512 by 480 in a full-HD window. In a small browser window it keeps 9 pixels from its sides, instead of 19, and 6
  from its top and bottom, instead of 16.
  There are 5 more pixels between each row and the next, from the title to the buttons: 13 instead of 8 between the
  title, the Language row, the boxes and the buttons, and between a box and the line explaining Include, and 5
  instead of 0 between Simple UI and Include. The window's side padding grows by the same 10 pixels, so the Simple
  UI box stays exactly where it is when it is unticked and the window switches to its picture look (Rule 18,
  Test 52). The look without Simple UI is unchanged. `style.css` is at 400 lines, the most Rule 25 allows.
- **Tests.** Test 46 now checks, with Simple UI, that only **Cancel** and **OK** are shown; that **Cancel** closes the
  window, returns focus and undoes Include and a language change; that **OK** closes it, returns focus and keeps
  Include; and that the `cancel` event of Escape undoes Include.
- **Mutation runs.** Test 46 fails with each of these: **Cancel** undoing nothing; Escape undoing nothing; **Cancel**
  and **OK** hidden with Simple UI again; and **Cancel** leaving the language alone.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800,
  800 by 1100 and 500 by 900. In Chrome, with real clicks and the Escape key: ticking Include and pressing Escape
  unticks it again; choosing German and pressing Escape brings English back; unticking Simple UI and pressing
  **Cancel** brings Simple UI back; ticking Include and pressing **OK** keeps it. Each time, focus returns to the
  Options button. The window and its rows were measured before and after.
- **Documents.** `TESTS.md`: Test 46, and the places of the tests after it in `js/tests/interface.js`.
  `MAINTAINER.md`: Simple UI and the pictures.

### Questions

1. **Requirements 8 and 16.** They still name a **Close** button, which this change removes, and Test 46 now checks
   **Cancel** and **OK** instead. Requirement 8 could end with "a Cancel and an OK button", and requirement 16 could
   say that **Cancel** undoes the changes made in the window and closes it, and **OK** keeps them and closes it.
2. **Marks under a removed item.** With Simple UI, unticking Include takes away the unique items at once, and their
   marks with them. **Cancel** brings the items back, but not their marks. Should it bring the marks back too?

## 2026-10-26: with Simple UI too, changes in Options wait for OK, and focus outlines there show whole

### What changed

- **Changes wait for OK with Simple UI too.** The Options window now works the same
  with or without Simple UI. Ticking or unticking a box, by a click or with Space, and choosing a language only show
  in the window. **OK** applies them and closes it; **Cancel**, Escape and closing the window in any other way drop
  them, and the window opens again showing what applies. This replaces what the previous entry describes: **Cancel**
  no longer undoes anything, because nothing has changed yet. In `js/optionshandler.js`, a box and the language list
  no longer apply a change at once with Simple UI, and the code that noted the choices when the window opened, and
  put them back on **Cancel** or Escape, is gone.
- **A language still loading.** The language choice still counts the language last chosen, loaded or not. When
  **OK** applies a language whose file is still on its way, the window opens again showing that language, and a file
  that arrives after another language was chosen does not switch the page.
- **Focus outlines in Options.** The focus outline of a box (Simple UI, Include, Include Regionals and, without
  Simple UI, Tooltips) and of a language in the language menu was drawn 2 pixels outside the element. The scrolling
  lists around them cut it off at the sides and the top, so only its bottom line showed, with and without Simple UI.
  They now have the tree's outline, 3 pixels wide and drawn just inside their edges, which shows whole. Screenshots in
  Chrome before and after: Simple UI and Include focused, with Simple UI in light and dark and without it, and a
  language focused in the open menu.
- **The audit sees it.** The focus outline test now also fails when an element around a focused one that scrolls or
  clips its contents cuts off the outline. The focus checks now also run with the Options window open and with its
  language menu open; those two audits skipped them before. While the window is open, the checks focus only what is
  in it, because the page behind it cannot take focus.
- **Tests.** Tests 35, 44, 46, 52 and 80 now press **OK** before they expect a change, and Tests 35, 46, 52 and 80
  check that nothing changed before it. Test 46 checks with Simple UI that **Cancel** and closing the window drop a
  box change and a language choice, and that the window then opens showing what applies. `pick()` in
  `js/tests/helpers.js`, which the tests use to change the language, now presses **OK**. Test 51 no longer says
  "instead of Close" in its name, since there is no Close in either look now.
- **New numbers.** The focus checks now first run in the audit with the language menu open, which comes before the
  test of Down and End in that menu. So Test 76 is now the focus outline test, Test 77 the test that nothing covers
  focus, and Test 78 the test of Down and End in the language menu (they were 77, 78 and 76).
- **Mutation runs.** Each of these fails the tests named: a box change applied at once with Simple UI again (Tests
  46, 52 and 80); a language choice applied at once (Tests 35, 46 and 51); the boxes and languages without the inside
  outline (Test 76); and only the languages without it (Test 76).
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900.
- **Kept as it is.** The extra 10 pixels of side padding with Simple UI were added so that unticking Simple UI, which
  then switched to the picture look at once, did not move its box (Rule 18). That switch now waits for **OK**, which
  also closes the window. The padding stays: it keeps the window's contents where they are in both looks, so only the
  window itself grows by 10 pixels.
- **Documents.** `TESTS.md`: Tests 35, 44, 46, 52, 76, 77, 78 and 80, the line numbers of the tests in
  `js/tests/interface.js`, `js/tests/pictures.js` and `js/tests/audit.js`, and Test 90's line numbers in
  `js/tests/static.js`, which were out of date. The entries of Tests 21, 22, 46 and 77 had grown past the 120
  characters `TESTS.md` allows for each part; they are one line each again. `MAINTAINER.md`: the Options window with
  and without Simple UI, and why its focus outlines are drawn inside.

### Questions

1. **Requirements 11 and 15.** Requirement 11 says the page changes to the language the user clicks, and requirement
   15 that the box's effect is true when the box shows its tick. Both now wait for **OK**. Requirement 11
   could end with "once the user clicks OK", and requirement 15 could say "after the user clicks OK".
2. **The earlier questions.** Question 1 of the previous entry, about requirements 8 and 16 and the **Close** button,
   still stands. Its question 2, about **Cancel** not bringing back marks, no longer applies: **Cancel** now never
   takes anything away.

## 2026-10-26: with Simple UI, Cancel and OK are the same size

- With Simple UI the **OK** button is now the same size as **Cancel**: both take the
  width of the wider one, in every language, and stay on the right, 8 pixels apart. One new rule in `style.css` lays
  them out as a grid of equal columns. Without Simple UI nothing changed. No tests or other documents changed.
  All 99 tests pass in Chrome, in light and dark colours, at 1920 by 1080, 1280 by 800, 800 by 1100 and 500 by
  900, and both buttons were measured in all 17 languages.

## 2026-10-26: the focus outline test is gone

- Test 76 ("focus shows a thick outline with a contrast of at least 3:1, which nothing
  cuts off") is deleted as a false positive, together with its check for cut-off outlines in `js/tests/audit.js`.
  The outlines of the Options window stay drawn inside their edges. Tests 77 to 99 are now Tests 76 to 98, and
  `TESTS.md` is renumbered to match; `MAINTAINER.md` no longer says the audit checks outlines.

## 2026-10-26: unique units sit straight in their buildings, except at the Castle

### What changed

- **No more Unique Units groups, except the Castle's.** The Unique Units groups of the Barracks, the
  Archery Range, the Stable, the Siege Workshop, the Dock, the Monastery and the Fortified Church are gone from
  `data.json`. Their units moved up one level, in the same place and order: the Grenadier's parent is now the Archery
  Range, the Missionary's the Monastery, and the Warrior Priest's the Fortified Church. The Castle keeps its Unique
  Units group, and its Unique Technologies group is unchanged. The `uniqueUnits` text stays in every language, as
  the Castle's group still uses it.
- **Still left out by default.** All 33 moved units are unique in aoe2techtree's data (`reach` in `pictures`), so
  without the group they are still left out until **Include Unique and Universal** is ticked.
- **Not lent to stand-ins.** A stand-in shows what is in the building it replaces, except its unique groups and its
  `"own"` rows. Out of its group, the Missionary would then have shown under the Fortified Church too. `common()` in
  `js/model.js` now also leaves out unique items, so the Missionary stays the Monastery's. Test 22 already expected
  this, as it counts only common and regional rows as lent.
- **Mutation run.** Without the new check for unique items, Test 22 fails, and no other test.
- **Checked.** All 98 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900. A script checked that `data.json` keeps every item and changes nothing outside the tree.
- **Documents.** `MAINTAINER.md`: where a new unique unit goes, what a stand-in does not show, and which groups are
  left out by default. `TESTS.md` and the name of Test 22 now say that a stand-in holds what it replaces but its
  unique items and groups.

## 2026-10-26: the Castle's unique groups are headings without checkboxes

### What changed

- **New order in the Castle.** The Castle's Unique Units group is now its first row, and its Unique
  Technologies group sits between the Trebuchet and Hoardings: Unique Units, Petard, Trebuchet, Unique
  Technologies, Hoardings, Conscription, Sappers, Spies/Treason. Only the order in `data.json` changed.
- **Headings, not checkboxes.** A group inside an item, which now means only these two, opens and closes but has
  no checkbox. `js/nodetree.js` builds its row without the checkbox role, the tab stop, the checked state and the
  box. A click or a right-click on its row marks nothing, so the tooltip about marking no longer shows over it with
  the pictures on, and a click on its name opens or closes it, as its arrow does. Its arrow is its only control: it
  is a button named after the group that says whether the group is open, and the arrow keys and Enter in Find stop
  on it. Marking the Castle still marks everything in both groups. Top-level groups, such as Economy, keep their
  checkboxes.
- **New Test 54.** It checks that such a group has no checkbox role, tab stop or box; that a click on its name or
  its arrow opens and closes it; that a right-click marks nothing; and that Down from the row above reaches its
  arrow. Tests 54 to 98 are now Tests 55 to 99.
- **Mutation runs.** Test 54 fails, and no other test does, with each of these: the row keeping the checkbox role
  and tab stop; its row marking again on a right-click; the arrow keys going to the row instead of its arrow; and a
  click on its name doing nothing. A right-click sent only as a `contextmenu` event did not catch the second one,
  as the page ignores that event for a moment after a touch; the test now sends pointer events, as Test 16 does.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900. Screenshots of the opened Castle with Simple UI and with the pictures show both headings
  with an arrow and no box.
- **Documents.** `TESTS.md`: the new Test 54, the numbers after it, and the lines of Test 99 in `js/tests/run.js`.
  `MAINTAINER.md`: headings in "How marking works".

## 2026-10-26: upgrades and variants moved into their lines

### What changed

- **Upgrades under what they upgrade.** In `data.json`, the Imperial Skirmisher is now under the Elite Skirmisher and
  the Imperial Camel Rider under the Heavy Camel Rider, instead of being rows of their own in the Archery Range and
  the Stable.
- **Variants in their lines.** The Legionary is now under the Long Swordsman, the Savar under the Cavalier and the
  Winged Hussar under the Light Cavalry, each naming with `"replaces"` the upgrade it stands in for: the Two-Handed
  Swordsman, the Paladin and the Hussar. Must have on one greys out the other (requirement 37).
- **The Camel Scout above the Camel Rider.** The Camel Scout, which only the Gurjaras have, is now the top of the
  Camel Rider line. It is the first unit or technology above another that some civilisations with the one below lack.
  Three changes in `js/model.js` keep the line working:
  - Must have passes up only while the civilisations with the marked item all have the item above (`covers()` in
    `prerequisites()`), so marking the Camel Rider lists its 13 civilisations, not only the Gurjaras. Requirement 34
    was amended in this session to allow such unique edge cases. For the same reason, must lack on the Camel Scout no
    longer clears must have on the Camel Rider.
  - A mark passes down only to the items that the same civilisations have, not just as many (`passedTo()`). Otherwise
    marking the Camel Scout (the Gurjaras) would also mark the Imperial Camel Rider (the Hindustanis), and list no
    civilisation. In every other line an item's civilisations are among those of the item above, so the two rules
    agree there.
  - A unique item left out by default leaves the rows under it in its place (`lift()` in `prune()`), so the Camel
    Rider line stays in the Stable while **Include Unique and Universal** is unticked. Such rows keep their full path
    (`via`), so their marks and open state survive ticking and unticking the box.
- **Test 22.** Marking the Legionary also marks the Militia line above it, which greys out the Champi Scout, as it
  replaces the Militia. The test expected only the marked item's own alternatives; it now expects those of every item
  marked must have. It compares only items that are variants, as the Xolotl Warrior also greys out when the Savar or
  the Winged Hussar, in the Stable, is marked.
- **Test 24.** It now also takes the first item whose civilisations the item above does not all have, the Camel
  Rider, and checks that marking the item above marks only that, that must have on the item does not pass up, that
  must lack above keeps it, and that with Include unticked the item stands in the place of the one above, still
  marked. `sameCount` in `js/tests/behaviour.js` is now `sameCivs`, and compares civilisations.
- **Mutation runs.** Test 24 fails, and no other test, with each of these: must have passing up to every item above;
  must lack clearing every must have below; marks passing down by count; unique items taking the rows under them
  away; lifted rows losing their path. Test 22 fails without the greying of variants.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900.
- **Documents.** `MAINTAINER.md`: where a unique upgrade goes, the Legionary, the Savar and the Winged Hussar among
  the stand-ins, marks passing down to the same civilisations, where must have stops, and the rows a left-out unique
  item leaves. `TESTS.md`: Tests 22 and 24, and the lines of Tests 22 to 32 in `js/tests/behaviour.js`.

### Questions

1. **Requirement 29.** It gives the same mark to items with an equal number of civilisations. Marks now pass down
   only to items with the same civilisations, as in the Camel Scout line an equal number (one) means different
   civilisations. Requirement 29 could say "of the same compatible civilisations" instead of "of equal number of
   compatible civilisations".
2. **Clearing the Camel Scout.** Clearing an item still clears everything under it, so clearing must have on the
   Camel Scout also clears must have on the Camel Rider, which does not depend on it. Should clearing leave such
   items alone, as must lack now does?

## 2026-10-26: no count on empty roots, and every civilisation listed without filters

### What changed

- **No count on a root at 0.** A top-level row, such as Economy, Military or Fortifications, no longer shows its
  number when no civilisation fits it, as no civilisation has everything in Economy or Military even by default.
  `count()` in `js/nodetree.js` empties both the number and the text for screen readers. Rows inside the tree still
  show 0.
- **Every civilisation without filters.** With nothing marked, the Civilisations pane now lists all civilisations and
  says so in its heading, instead of none and a hint. `listCivs()` in `js/stringbuilder.js` always lists the
  civilisations that fit the marks, which are all of them when nothing is marked. The hint text `start` is gone from
  `data.json` and every language file; `noMatch` still shows when the marks fit no civilisation.
- **Tests.** Tests 25, 27 and 28 expect no number on a root at 0. Test 57 expects every civilisation to be listed,
  and no hint, once the last filter is cleared.
- **Mutation runs.** With roots at 0 showing their number, Tests 25, 27 and 28 fail, and no other test. With nothing
  listed while nothing is marked, Test 57 fails, and no other test.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900.
- **Documents.** `TESTS.md`: Tests 25 and 57, and the lines of Tests 25 to 32 in `js/tests/behaviour.js`.

## 2026-10-27: Cancel and OK in the corner of the Options parchment, and no shadow on button text

### What changed

- **No shadow on button text.** Without Simple UI, the text of the picture buttons (**Clear**, **Expand all**,
  **Collapse all**, the language button and its languages, **Cancel** and **OK**) no longer has a shadow: the
  `text-shadow` is gone from the `.pictures .tool` rule in `style.css`. The civilisations' names on tiles keep their
  `drop-shadow`, the only shadow left on text.
- **Cancel and OK on the parchment.** In a window at least 588 pixels high, where the Options window shows its
  parchment, **Cancel** and **OK** are no longer inside the framed panel. They sit below it, in the parchment's bottom
  right corner, with **OK** ending at the panel's right edge, and they are as far from the parchment picture's bottom
  edge as from its right edge: 58 pixels in a full-HD window, about 43 from the torn paper itself. In the picture
  (652 by 688) the paper starts 15 pixels in from the right edge and 14 from the bottom, so the buttons are also
  equally far from the paper, to within a pixel. The form is `position: absolute`, and a new `--drop` in `style.css`
  says how far below the window's box the buttons end, worked out from the picture's size and place on the backdrop.
- **The panel moved up.** The panel and its contents moved up by about 21 pixels in a full-HD window and no longer
  hold the row of buttons: the panel now starts 32 pixels below the title (about 8 of which the title's frame takes)
  and ends 24 pixels above **Cancel** and **OK**. The window's top and bottom padding are worked out from the
  parchment, so both gaps are the same at every window size and only the panel's height changes. Below about 550
  pixels wide, where the parchment is relatively smaller, the panel is shorter (393 pixels instead of 445 at 500
  wide) and starts 7 pixels lower than before. For this the title is now `position: absolute`, at the same place as
  before, so that the top padding moves only the panel.
- **Unchanged.** With Simple UI the window looks as before. In a window less than 588 pixels high, where the
  parchment is left out, only the text shadow is gone. `style.css` has 396 lines of code.
- **Test 51.** Wherever the parchment shows, it now also checks that the panel lies between the title and **Cancel**
  and **OK**, and that **OK** is as far from the parchment picture's right edge as from its bottom edge, to half a
  pixel. It reads the picture's size and place from the window's backdrop and loads the picture for its proportions,
  so `confirming()` in `js/tests/pictures.js` is now `async`. It also checks that no button on the page has a text
  shadow.
- **Mutation runs.** Test 51 fails, and no other test does, with each of these: the text shadow back on the buttons;
  **Cancel** and **OK** back in the panel; the buttons 10 pixels higher than their corner; and, at 500 by 900, the
  panel reaching down to the bottom of the window, or up into the title. In a full-HD window the last two leave
  enough room, so they fail only in the narrower window.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900. Screenshots of the Options window were checked at those sizes and at 2560 by 1440, 1280 by
  740 and 1280 by 700. Screenshots with Simple UI are the same, byte for byte, before and after.
- **Documents.** `TESTS.md`: Test 51, and the lines of Tests 47 to 52 in `js/tests/pictures.js`. `MAINTAINER.md`:
  where the Options window shows **Cancel** and **OK**, and which text has a shadow.

### Questions

1. **Low windows.** Below 588 pixels high the Options window has no parchment, so **Cancel** and **OK** stay at the
   bottom of the panel. Should they also leave the panel there, for example just below it?
2. **Civilisation names in the list.** Only the names on tiles have a shadow; the names in the list view have none.
   Should the list's names get the same shadow?
