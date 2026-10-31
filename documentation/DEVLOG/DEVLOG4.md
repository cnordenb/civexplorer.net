# Development log, part 4

- [2026-10-25](#2026-10-25)
- [2026-10-26](#2026-10-26)
- [2026-10-27](#2026-10-27)

Part 4 of the development log. It follows [part 3](DEVLOG3.md) and goes on in [part 5](DEVLOG5.md). The decisions made
in the log are listed in [DECISIONS.md](../DECISIONS.md).

## 2026-10-25

### The Pasture, the Harbor and the Donjon are variants too, and unique buildings have no group

#### What changed

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

#### Questions

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

## 2026-10-26

### The Domestication line stays the Mill's

#### What changed

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

### A unique item has its own filter (requirement 36)

#### What changed

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

#### Questions

1. **Order.** The entries keep the order of the tree, so "Crop Rotation", from the Mill, comes before "Folwark".
   Should a unique item's entry come first instead?

### A variant greys out every alternative (requirement 37)

#### What changed

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

#### Questions

1. **Technology variants.** The list under the 2026-10-24 entry also names Cranequins and Parthian Tactics, which
   no civilisation has together. Requirement 37 does not name technology variants, so they are left as they are.
   Should Cranequins name Parthian Tactics with `"replaces"`, so that they grey each other out?
2. **The Harbor's place.** It is the first row under the Dock, above the Fishing Ship. Should it go elsewhere,
   such as last?

### Cranequins and Parthian Tactics are variants too

#### What changed

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

### The Dromon, the Catapult Galleon and the Lou Chuan are Cannon Galleon variants

#### What changed

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

### The Mangonel and the Rocket Cart are variants

#### What changed

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

### The Xolotl Warrior and the Stable grey each other out

#### What changed

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

### The Options window has Cancel and OK, and a roomier look with Simple UI

#### What changed

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

#### Questions

1. **Requirements 8 and 16.** They still name a **Close** button, which this change removes, and Test 46 now checks
   **Cancel** and **OK** instead. Requirement 8 could end with "a Cancel and an OK button", and requirement 16 could
   say that **Cancel** undoes the changes made in the window and closes it, and **OK** keeps them and closes it.
2. **Marks under a removed item.** With Simple UI, unticking Include takes away the unique items at once, and their
   marks with them. **Cancel** brings the items back, but not their marks. Should it bring the marks back too?

### With Simple UI too, changes in Options wait for OK, and focus outlines there show whole

#### What changed

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

#### Questions

1. **Requirements 11 and 15.** Requirement 11 says the page changes to the language the user clicks, and requirement
   15 that the box's effect is true when the box shows its tick. Both now wait for **OK**. Requirement 11
   could end with "once the user clicks OK", and requirement 15 could say "after the user clicks OK".
2. **The earlier questions.** Question 1 of the previous entry, about requirements 8 and 16 and the **Close** button,
   still stands. Its question 2, about **Cancel** not bringing back marks, no longer applies: **Cancel** now never
   takes anything away.

### With Simple UI, Cancel and OK are the same size

- With Simple UI the **OK** button is now the same size as **Cancel**: both take the
  width of the wider one, in every language, and stay on the right, 8 pixels apart. One new rule in `style.css` lays
  them out as a grid of equal columns. Without Simple UI nothing changed. No tests or other documents changed.
  All 99 tests pass in Chrome, in light and dark colours, at 1920 by 1080, 1280 by 800, 800 by 1100 and 500 by
  900, and both buttons were measured in all 17 languages.

### The focus outline test is gone

- Test 76 ("focus shows a thick outline with a contrast of at least 3:1, which nothing
  cuts off") is deleted as a false positive, together with its check for cut-off outlines in `js/tests/audit.js`.
  The outlines of the Options window stay drawn inside their edges. Tests 77 to 99 are now Tests 76 to 98, and
  `TESTS.md` is renumbered to match; `MAINTAINER.md` no longer says the audit checks outlines.

### Unique units sit straight in their buildings, except at the Castle

#### What changed

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

### The Castle's unique groups are headings without checkboxes

#### What changed

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

### Upgrades and variants moved into their lines

#### What changed

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

#### Questions

1. **Requirement 29.** It gives the same mark to items with an equal number of civilisations. Marks now pass down
   only to items with the same civilisations, as in the Camel Scout line an equal number (one) means different
   civilisations. Requirement 29 could say "of the same compatible civilisations" instead of "of equal number of
   compatible civilisations".
2. **Clearing the Camel Scout.** Clearing an item still clears everything under it, so clearing must have on the
   Camel Scout also clears must have on the Camel Rider, which does not depend on it. Should clearing leave such
   items alone, as must lack now does?

### No count on empty roots, and every civilisation listed without filters

#### What changed

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

## 2026-10-27

### Cancel and OK in the corner of the Options parchment, and no shadow on button text

#### What changed

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

#### Questions

1. **Low windows.** Below 588 pixels high the Options window has no parchment, so **Cancel** and **OK** stay at the
   bottom of the panel. Should they also leave the panel there, for example just below it?
2. **Civilisation names in the list.** Only the names on tiles have a shadow; the names in the list view have none.
   Should the list's names get the same shadow?

### A loading screen without Simple UI

#### What changed

- **Loading screen.** Without Simple UI, the page now opens on a grey screen (`#595959`) that says "Loading image
  assets..." in white, above `assets/images/ui/loading.webp`, 96 pixels wide and turning once a second. It covers the
  whole window, and the page under it is inert, so neither a click nor a key reaches it. It goes away once every
  picture the page uses has loaded and been decoded, and the fonts too, so that the whole page shows at once.
  - **Which pictures.** Every `<img>` on the page (the tree's and the civilisations' icons, 250 in a full-HD window)
    and every picture the stylesheet gives any element, shown or not, at the current window size: backgrounds,
    frames, buttons, checkboxes, cursors, and the Options window's parchment and radio buttons. `pictureFiles()` in
    `js/pictures.js` reads them from the computed styles of every element, its `::before` and `::after`, and a
    dialog's `::backdrop`. With 2,625 elements in a full-HD window, that takes about 120 milliseconds.
  - **How long.** Opened from disk in a full-HD window, the screen shows 32 milliseconds after the page starts and
    goes 439 milliseconds later, when all 250 icons are complete. Served over HTTP throttled to 250 kB/s with 150
    milliseconds of latency, it shows after 0.67 seconds and goes after 14.5 seconds, as the last icon completes.
    Until the scripts have run, the page is blank in its usual background, as before.
  - **Never with Simple UI.** `script.js` shows the screen only without Simple UI, and turning Simple UI on hides it
    (`setSimple()`), so the tests, which turn Simple UI on, run without it. If `data.json` cannot load, the screen goes
    and the load error shows.
  - **Its text** is in `index.html`, in English, with `lang="en"`, like the load error, as it shows before
    `data.json` and the language files have loaded.
- **First visits.** A first visit already opened without Simple UI, as no saved choice meant Simple UI off. The rule
  now has a name, `savedSimple()` in `js/optionshandler.js`, which `script.js` uses and Test 53 checks.
- **The one animation.** The picture turns with a CSS animation, `@keyframes spin`, which Rule 11, amended in this
  session, allows for a small loading icon as the site loads. Test 87 (formerly 86) now allows exactly this one: the
  `.pictures .loading::after` rule with `animation: spin`, and the `spin` keyframes. Any other animation or
  transition in the stylesheet still fails it, and Test 77 still finds nothing moving on the page with Simple UI.
- **Sizes.** `style.css` has 399 lines of code. `js/` already holds 7 files, so the new code is in `js/pictures.js`,
  `js/stringbuilder.js` and `js/optionshandler.js`.
- **Test 53 (new).** It checks that with no saved choice the page opens without Simple UI; that turning Simple UI on
  hides the screen, which then does not show; that without Simple UI the screen covers the window in grey, with its
  text above the turning picture, and leaves the page inert; that it waits for a picture added just before it is
  told to finish (a fresh copy of an icon) and for every picture the stylesheet gives a shown element; and that it
  then goes, gives the page back and leaves nothing moving. It is the last of the pictures tests, so Tests 53 to 99
  are now Tests 54 to 100. There are 100 tests, the most Rule 17 allows.
- **Mutation runs.** Test 53 fails, and no other test does, with each of these: the screen never shown; nothing
  waited for; the screen shown with Simple UI; Simple UI on a first visit; the picture standing still; Simple UI
  leaving the screen up; the page under it not inert. With the cursors left out of the pictures waited for, Test 53
  fails, and so does Test 85, as that change joined two lines into one too long. Test 87 fails, and no other test,
  with a transition added to the buttons.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900. A first visit and a visit with Simple UI saved were traced in Chrome: the first shows the
  screen until every icon is complete, the second never shows it. Two screenshots of the screen a moment apart differ,
  as the picture turns.
- **Documents.** `TESTS.md`: the new Test 53, Tests 54 to 100 renumbered, Test 87, and the lines of Tests 47 to 53
  in `js/tests/pictures.js` and of the tests in `js/tests/static.js`. `MAINTAINER.md`: the loading screen and first
  visits in "Simple UI and the pictures", `index.html`, `script.js` and `js/pictures.js` in "How the code works",
  the UML diagram, and `loading.webp` in Assets. `code_docu.pdf` was not rebuilt; it does not describe the new
  functions.

#### Questions

1. **Reduced motion.** Should the picture stand still for visitors whose system asks for less motion
   (`prefers-reduced-motion`)? Windows asks for it when its animation effects are turned off.
2. **Translation.** "Loading image assets..." is in English only, as it shows before any language file has loaded.
   Should it switch to the visitor's language once that file is in? That adds a text to `data.json` and to every
   language file.
3. **Pictures for later.** Pictures the page does not use when it opens are not waited for: the cross that clears
   **Find**, the box of a civilisation tile while the list view is chosen, and the pictures for other window sizes.
   Should the screen wait for these too?
4. **A picture that never comes.** The screen waits as long as a picture is on its way, with no time limit. Should
   it give up after some seconds and show the page as it is?
5. **Before the scripts run.** The screen is hidden in `index.html` and shown by the scripts, which only then know
   whether Simple UI is on, so a slow connection shows a blank page first (0.67 seconds in the throttled trace).
   Shown from `index.html` instead, it would come at once, but flash for a moment for visitors with Simple UI.

### The loading picture first, the loading screen on leaving Simple UI, and every picture waited for

#### What changed

- **Answers.** Of the questions in the entry before: the picture stands still with reduced motion (1); the text is
  translated (2); every picture is waited for, the Options parchment's too (3); there is no time limit (4). Question
  5 is put again below, more plainly.
- **The loading picture first.** It was the third picture the browser asked for, after `cursor_normal_x1.webp` and
  `ultrawide.webp`, as it was the background of a `.pictures .loading::after` rule, found with all the others. It is
  now an `<img class="spinner">` in a template (`spinnerTemplate`). `showLoading()` puts it on the loading screen and
  takes it off again, and `setSimple()` calls it before it sets the `pictures` class, so the browser asks for it
  before any other picture. Traced over HTTP, `loading.webp` is now the first of 250 picture requests, both on a
  first visit and on leaving Simple UI. With Simple UI it is not on the page at all.
- **Leaving Simple UI.** Unticking Simple UI and pressing OK now also shows the loading screen until every picture
  has loaded, unless all of them have loaded already: then the screen is shown and hidden again in the same task,
  before anything is drawn, so it never shows. From a local HTTP server, unthrottled and with nothing cached, it
  showed for 0.62 seconds; switching Simple UI off and on again after that, it did not show. With the pictures only
  in the browser's disk cache (a new browser after a visit without Simple UI, the server sending `max-age=600`), it
  showed for about 0.4 seconds, while the 250 pictures came from the disk.
  - **Kept pictures.** Each picture loaded is kept in an `Image` (`kept` in `js/optionshandler.js`). Without that,
    Chrome forgot pictures a few seconds after nothing on the page used them, as with Simple UI on, and the screen
    showed again on the next switch. In the tests, which switch often, it then stayed up for 1.4 seconds during the
    pictures tests, with the page inert under it.
  - **Moved.** The loading code moved from `js/pictures.js` to `js/optionshandler.js`, as `setSimple()` needs it and
    `js/optionshandler.js` may not import `js/pictures.js`. `startLoading()` is gone: `setSimple()` shows the screen
    whenever Simple UI goes off, on opening too. `script.js` calls `finishLoading()` once the page has started.
- **Every picture waited for.** `pictureFiles()` now reads the `url()` of every rule in `style.css`, inside media
  queries too, from `document.styleSheets`, instead of the computed styles of the elements. So the screen also waits
  for the pictures of every window size and screen, the 4K ones too, the cross of **Find**, the civilisation tiles'
  box, and the Options parchment and radio buttons: 27 files, 3.2 MB in all, of which the four backgrounds are 2.8
  MB and only one of them shows at a time. Every font in the stylesheet is loaded too.
- **Reduced motion.** The picture turns only in `@media (prefers-reduced-motion: no-preference)`, so it stands still
  for visitors whose system asks for less motion. Test 87 now allows the animation only inside that media query.
- **Translation.** The text is now `loading` in the texts of `data.json` and of every language file, in a
  `<span data-text="loading">`, so it shows in the visitor's language once that file has loaded, and in English until
  then. It no longer has `lang="en"`, as it follows the page's language. In German it is "Bildressourcen werden
  geladen...", in French "Chargement des ressources d'image...", in Japanese "画像アセットを読み込み中...".
- **Sizes.** `style.css` stays at 399 lines of code: its two `.pictures .load-error` rules are now one.
- **Test 53** now also checks that the loading picture is the first picture put on the page, before the `pictures`
  class; that leaving Simple UI with every picture loaded leaves the screen hidden; that leaving it with a new picture
  on the page shows the screen until that picture is in; that the text changes with the language; that the picture
  turns unless reduced motion is asked for; that every picture named in `style.css` is waited for, and every font;
  and that the loading picture is off the page with Simple UI and once the screen has gone.
- **Mutation runs.** Test 53 fails with each of these: the `pictures` class set before the loading picture; the text
  not translated; only the top-level rules read, so the pictures in media queries are left out; the loading picture
  never put on the screen; reduced motion turned round (Test 87 fails too); the screen not let go at once when every
  picture has loaded (Test 52 fails too); and `finishLoading()` not called on leaving Simple UI (Test 52 fails too).
  The loading picture left on the page with Simple UI fails Tests 52, 53 and 77. An animation outside the media query
  fails Test 87 alone.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900, and with reduced motion forced at 1280 by 800. Over a throttled connection, the screen
  showed the German text above the turning picture, and with reduced motion forced, the Japanese text above the
  picture with no animation running.
- **Documents.** `TESTS.md`: Test 53, the lines of Tests 47 to 53 in `js/tests/pictures.js` and of the tests in
  `js/tests/static.js`, and Tests 47 to 53 (not 52) turning Simple UI off. `MAINTAINER.md`: the loading screen in
  "Simple UI and the pictures", `script.js`, `js/optionshandler.js` and `js/pictures.js` in "How the code works", and
  the UML diagram.

#### Questions

1. **Disk cache.** Pictures that are only in the browser's disk cache take a moment to load, so the screen shows for
   that moment (about 0.4 seconds) on opening and on leaving Simple UI. Should the screen wait a fraction of a
   second before it shows, so that a load that quick shows none? Meanwhile the page would stay blank on opening, or
   keep Simple UI's look on leaving it.
2. **Before the scripts run.** Until the scripts have run, the page cannot know whether Simple UI is on, so on a slow
   connection it is blank for a moment before the screen comes (0.67 seconds in the throttled trace). Should the
   screen be up from the very start instead, in `index.html`? Then it would come at once, but visitors with Simple UI
   would see it flash before their page.
3. **Download size.** Waiting for every picture means that every visit without Simple UI downloads all 27 pictures,
   3.2 MB, the backgrounds and 4K pictures of other screens too. Should only those of the current screen be waited
   for, with the rest still loaded, just not waited for?
4. **Translations.** The 16 translations of "Loading image assets..." have not been read by native speakers.

### One background only

#### What changed

- **One background.** The loading screen waited for all four backgrounds, `fhd.webp`, `qhd.webp`, `uhd.webp` and
  `ultrawide.webp`, so every visit without Simple UI downloaded all four, 2.8 MB. Only one is loaded now.
  `pictureFiles()` leaves out the pictures of `body` rules, which are the backgrounds and nothing else, and takes the
  one that `body` shows, from its computed style. `style.css` is unchanged and still picks the background by the
  window's inner size in CSS pixels: `ultrawide.webp` when it is wider than 16:9, otherwise `uhd.webp` above 2560 by
  1440, `qhd.webp` above 1920 by 1080, and `fhd.webp` for anything smaller. Traced over HTTP, a 1920 by 1080 window
  downloads `ultrawide.webp` and no other background, and a 1600 by 1200 window `fhd.webp` alone, on a first visit
  and on leaving Simple UI: 247 picture requests instead of 250. The other pictures are all still waited for, 0.44
  MB with every size of each.
- **The loading picture still first.** Reading the computed style of `body` makes the browser work out the page's
  styles there and then, and it asks for their pictures, the cursor and the background, at once, while the loading
  picture's request waits for a microtask. The trace showed it on leaving Simple UI, with `cursor_normal_x1.webp`
  first. `finishLoading()` now notes the pictures on the page at once and does the rest one microtask later, and the
  loading picture is first again in both traces. With every picture loaded already, the screen still never shows, as
  microtasks run before anything is drawn.
  - **Why at once.** The pictures tests turn Include on straight after leaving Simple UI, which adds icons that were
    never loaded. Looked for a microtask later, those were waited for too, and the screen stayed up, with the page
    inert, under Tests 49 and 50.
- **Resizing.** A window resized across one of the limits still gets the other background, as the media queries pick
  it while the page is open; the loading screen does not show for that.
- **Tests.** Test 53 now checks that, of the four backgrounds, only the one `body` shows is waited for, and every other
  picture in `style.css` still is. Test 52 waits for the loading screen before it checks that every picture came
  back, as the screen now goes a microtask after OK. Which picture the browser asks for first cannot be seen from a
  page opened from disk, so that was checked in the trace; Test 53 checks that the loading picture is put on the page
  before the `pictures` class.
- **Mutation runs.** Test 53 fails, and no other test, with all four backgrounds waited for, and with the one shown
  left out.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900, and with reduced motion forced at 1280 by 800.
- **Documents.** `TESTS.md`: Test 53, and the lines of Tests 48 to 53. `MAINTAINER.md`: the loading screen in "Simple
  UI and the pictures", and the backgrounds in Assets.

#### Questions

1. **What picks the background.** It is the window's inner size in CSS pixels, through media queries, as set on
   2026-10-21. Other measures a script can read on opening:
   - **The screen's resolution**, in device pixels (`screen.width` and `screen.height` times `devicePixelRatio`).
     It does not change when the window is resized or maximised, so one background serves the whole visit, and a
     sharp screen gets a sharp picture: a 4K screen at 200 % scaling is 1920 by 1080 in CSS pixels, so it now gets
     `fhd.webp` at half its sharpness, unless the window is wider than 16:9. A small window on a big screen would
     download the big picture.
   - **The inner size in device pixels** (CSS pixels times `devicePixelRatio`): sharp on sharp screens, but it still
     changes as the window is resized.
   - **The window's outer size**, which counts the tabs and toolbars, so it says less about what the background has to
     cover than the inner size does.

   Which should it be? On a full-HD screen, a maximised browser's inner size is wider than 16:9 because of its tabs
   and address bar, so it now gets `ultrawide.webp`, 5120 by 2160 and 1.27 MB, the largest; by the screen's shape it
   would get `fhd.webp`, 0.2 MB.

### Pictures by the screen's resolution, one size of each

#### What changed

- **The screen's resolution.** The background, and with it every other picture's size, now goes by the screen's
  resolution in device pixels, `screen.width` and `screen.height` times `devicePixelRatio`, which answers Question 1
  of the entry before. `screenPictures()` in `js/optionshandler.js` works it out once, as Simple UI is first set on
  opening, and puts it on `<html>` as `data-background` (`fhd`, `qhd`, `uhd` or `ultrawide`) and `data-assets` (`sd`
  or `4k`). The limits are those the media queries had: `ultrawide` for a screen wider than 16:9, otherwise `uhd`
  above 2560 by 1440, `qhd` above 1920 by 1080, and `fhd` for anything smaller. A maximised browser on a full-HD
  screen now gets `fhd.webp`, 0.2 MB, where its inner size got `ultrawide.webp`, 1.27 MB.
- **One size of each picture.** `_4k` pictures and `_x2` cursors come only with `uhd` or `ultrawide`, and `_sd` and
  `_x1` ones with `fhd` or `qhd`, so a page never downloads both sizes of one picture. Before, the sizes went by
  the window, with two limits: the Options button, the title's frame, the boxes and the tiles turned 4K above 1920
  by 1080 or on a sharp screen, and the cursors and the tree's buttons only above 2560 by 1440. A visit without
  Simple UI now downloads 16 interface pictures: 0.31 MB on a full-HD screen, 0.49 MB on a QHD one, 1.27 MB on a 4K
  one and 1.59 MB on an ultrawide one, the loading picture included; the entry before downloaded every size of each,
  0.44 MB besides the background.
- **`style.css`.** Every media query that picked a picture by the window's size is now a rule starting with
  `.pictures[data-background="..."]` or `.pictures[data-assets="4k"]`; the plain rules still name `fhd.webp` and the
  `_sd` and `_x1` pictures. The tooltip's reach, 48 pixels with the larger cursor, follows `data-assets` too. The
  file went from 399 to 383 lines.
- **Resizing.** Resizing the window or zooming changes neither attribute, so the page keeps one background and one
  size of each picture for the whole visit, and the loading screen has nothing to wait for then.
- **The loader.** `pictureFiles()` now leaves out the backgrounds and sizes that the two attributes do not choose,
  by the pictures' names, and reads no computed style. The microtask in `finishLoading()` from the entry before is
  gone with it, as is the wait for the loading screen in Test 52; the loading picture is still the first picture
  asked for.
- **Tests.** Headless Chrome reports an 800 by 600 screen, whatever the window, so a run only ever sees `fhd` and
  `sd` by itself. Test 47 therefore checks the choice for eight screens through `screenPictures()`, among them
  1536 by 864 at 125 %, 1920 by 1080 at 200 %, 2560 by 1080 and a phone, against a separate working-out in
  `js/tests/helpers.js`; then it sets each of the four choices on `<html>` in turn and checks that every picture
  shown, the Options parchment's too, is of that background and size, and that `body` shows that background. The
  Options button, tree buttons, checkboxes, cursors and tooltip tests go by `data-assets` instead of the window's
  size. Test 53 checks, for all four choices, that the loader waits for exactly the pictures in `style.css` of that
  background and size.
- **Traced.** Over HTTP with the screen emulated, 1920 by 1080, and 1536 by 864 at 125 %, get `fhd` and `sd`; 2560
  by 1440 gets `qhd` and `sd`; 1920 by 1080 at 200 % gets `uhd` and `4k`; 2560 by 1080 and 3440 by 1440 get
  `ultrawide` and `4k`. Each asks for `loading.webp` first, then exactly one background and one size of each
  picture.
- **Mutation runs.** Test 47 fails with the ratio left out of the resolution, with QHD counted as 4K, and with the
  4K checkbox rule removed; Test 53 with every picture waited for again; Tests 47, 48, 50 and 51 with the attributes
  never set.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900, and with reduced motion forced at 1280 by 800. With QHD, 4K and ultrawide screens emulated
  over the debugging protocol, all pass but Test 34, which fails there with the plain full-HD screen too, as a page
  driven that way has no window focus for the language menu.
- **Documents.** `TESTS.md`: Tests 47 and 53, and the lines of Tests 47 to 53. `MAINTAINER.md`: the screen's
  choice and the loader in "Simple UI and the pictures", `screenPictures()` and `pictureFiles()` in the diagram, and
  the sizes in Assets.

#### Questions

1. **Phones.** A phone's screen is small in CSS pixels but sharp: 390 by 844 at 300 % is 1170 by 2532, taller than
   1440, so it gets `uhd.webp` and the 4K pictures, 1.27 MB. Should phones count the longer side against the longer
   limit, or go by width alone, so that they get `qhd.webp` or `fhd.webp` instead?

### Phones on the full-HD pictures, and each picture asked for once

#### What changed

- **Phones.** A phone now gets `fhd.webp` with the `_sd` pictures and `_x1` cursors, which answers Question 1 of the
  entry before. A phone is a screen under 720 CSS pixels on its shorter side, in either orientation, the width below
  which the page turns to its narrow layout. A 390 by 844 phone at 300 % got `uhd.webp` and the 4K pictures, 1.27 MB,
  and now gets 0.31 MB. A tablet of 768 by 1024 at 200 % is not a phone, and still gets `uhd`.
- **16:9 laptops.** Headless Firefox reports a 1366 by 768 screen, a common laptop screen, which is a hair wider than
  16:9 (1.779 against 1.778), so it got `ultrawide.webp` and the 4K pictures, 1.59 MB. `ultrawide` now takes a screen
  more than twice as wide as it is high: 21:9 screens such as 2560 by 1080 and 3440 by 1440 are 2.37 and 2.39 and
  still get it, and 1366 by 768 gets `fhd`.
- **The loading picture in Firefox.** Firefox listed `loading.webp` twice on every visit without Simple UI, once
  downloaded and once from its cache with 0 bytes; Chrome listed it once. Traces of headless Firefox over WebDriver
  BiDi showed two causes:
  - Firefox's HTML parser downloads the `src` of an `<img>` inside a `<template>` before any script runs, as a test
    page holding nothing but the template showed, and the spinner then took the picture from the cache. That download
    came with Simple UI too, which never shows the picture. The template now names the picture in `data-src`, and
    `showLoading()` sets `src` as it makes the spinner.
  - `finishLoading()` loaded every picture on the page into an `Image`, the spinner's too, and Firefox lists a picture
    again when something new starts using it after it has loaded. The loading picture is left out now, as the screen
    has no reason to wait for its own picture. With the template changed alone, Firefox still listed it twice.
- **The background and the cursor in Firefox.** For the same reason, Firefox at times listed `fhd.webp` and
  `cursor_normal_x1.webp` twice, when they had loaded before `data.json` and the loader's `Image`s came after.
  `setSimple()` now makes the `Image`s of the pictures in rules for `<html>` and `<body>` as it puts on the `pictures`
  class, while the browser is still loading them: `pictureFiles()` takes a test for the rules' selectors, and
  `Element.matches()` picks those rules without reading any computed style, so the loading picture is still the first
  picture asked for. Making every `Image` that early was tried and was worse: Firefox then listed most pictures twice,
  as the page starts using them only once `data.json` has loaded and they have too.
- **Traced.** Headless Firefox over HTTP, with and without cache headers, three times each: 16 requests on a visit
  without Simple UI, each picture once and `loading.webp` first; none on a visit with Simple UI; and 16 on leaving it,
  `loading.webp` first. Headless Chrome, with the cache on and off, and on leaving Simple UI: the same. With screens
  emulated in Chrome, 390 by 844 and 844 by 390 at 300 % and 1366 by 768 get `fhd`, 768 by 1024 and 1920 by 1080 at
  200 % get `uhd`, and 2560 by 1080 gets `ultrawide`.
- **Tests.** Test 47 checks the choice for 11 screens, with 1366 by 768, a phone both ways round and a tablet added.
  Test 87 fails if an `<img>` in a template has a `src` or `srcset`. That each picture is asked for once cannot be
  seen from inside the page, and Chrome never asked twice, so the traces checked that.
- **Mutation runs.** Test 47 fails, and no other test, with phones not stepped down, and with `ultrawide` back at
  wider than 16:9; Test 87 alone with `src` back in the spinner's template.
- **Checked.** All 100 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900, and with reduced motion forced at 1280 by 800.
- **Documents.** `TESTS.md`: Tests 47 and 87, and the lines of Tests 1, 2, 56 and 82 to 98. `MAINTAINER.md`: the
  phone and ultrawide limits, and the template and the loader's `Image`s, in "Simple UI and the pictures".

### Test 53 removed

#### What changed

- **Test 53.** The loading screen's test, Test 53 in `js/tests/pictures.js`, is removed as a false positive, with the
  code only it used: `added()`, `spinnerFirst()`, `screenLooks()` and `loadingLooks()` in `js/tests/pictures.js`, and
  `unwaited()` in `js/tests/helpers.js`, with the imports that went with them. The suite has 99 tests now.
- **Numbers.** Tests 54 to 100 are now Tests 53 to 99, as a test's number is its place in the order.
- **Checked.** All 99 tests pass in Chrome on Windows, in light colours, at 1280 by 800.
- **Documents.** `TESTS.md`: Test 53 gone, the tests after it renumbered, "Tests 47 to 52" for the tests that turn
  Simple UI off, and the lines of Tests 47 to 52.

### Icons from atlases

#### What changed

- **Atlases.** The tree's icons and the civilisations' icons now come from five WebP atlases, one per folder:
  `icons/civs/atlas/civicon_atlas.webp` and `icons/nodes/{building,misc,tech,unit}/atlas/{kind}icon_atlas.webp`.
  Each holds every PNG of its folder in alphabetical order of file names, row by row. Matching every PNG against
  every cell in Chrome showed that the order is that of the file names as text (`0`, `10`, `100`, `101` … `11`), not
  as numbers, and that each PNG has a cell of its own: 48 by 48 pixels in the tree's atlases and 60 by 60 in the
  civilisations', 8 by 7 cells for 56 civilisations and 51 buildings, 2 by 2 for 3 groups, 11 by 11 for 121
  technologies and 18 by 18 for 316 units. That is as many columns as the square root of the number, rounded up,
  and as many rows as that needs; the page works the grid out the same way, so a bigger atlas needs no change.
- **Downloads.** A visit without Simple UI downloads 5 atlases, 0.59 MB, where it downloaded 419 PNGs, 2.01 MB.
  The atlases hold the pictures no item uses as well.
- **The page.** An icon is now an empty `<span>` in its template instead of an `<img>`. `cellOf()` in
  `js/datahandler.js` finds its column and row, and `place()` in `js/stringbuilder.js` gives them to the span as
  `--column`, `--row`, `--columns` and `--rows`, the one kind of style a script may set. In `style.css`, a rule per
  kind names the atlas, and one rule for both kinds of icon sizes it to the grid and moves it to the cell, inside the
  outline (`content-box`). `iconFile()` is now only for the updater's messages.
- **The data.** An atlas holds pictures that no item uses (237 of 316 units are used), so a cell cannot be worked out
  from `pictures`. `icons.atlas` in `data.json` lists the pictures in each atlas of the tree, taken from the folders.
  The civilisations' atlas goes by `civs` and the names in `icons`, as it holds every civilisation and nothing else.
  `icons.folder`, the civilisations' folder, was only used for their PNGs, and is gone.
- **The updater.** It adds a picture that an item now uses to `icons.atlas`, and says "New icon for …" only then;
  before, it said so whenever an item's picture entry changed, its reach too.
- **The PNGs.** They stay, as the atlases are built from them; the page no longer uses them.
- **Tests.** Test 48 checks each icon in the tree and in the civilisation list: its atlas, its size and position in
  the grid, worked out again from the file names, and `content-box`; and that each atlas is as large as its grid. It
  cannot see what a cell shows, as the tests cannot read a picture's pixels in a page opened from disk; that was
  checked with screenshots in Chrome and Firefox, of the tree expanded, the list and the tiles.
- **Traced.** Firefox asks for each atlas once on opening, with 21 pictures in all. The first time the tree is
  expanded, it lists the technologies' and the units' atlases again, from its cache with 0 bytes: the loader loads
  them on opening, and only then does an icon use them, which Firefox lists (see the entry on each picture asked for
  once). The PNGs, as `<img>`s, loaded even in closed branches, so they were not listed again.
- **Mutation runs.** Test 48 fails with the atlases' order by number instead of by file name, with a column too
  many, without `content-box`, and with the units' atlas named for the technologies.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900, and with reduced motion forced at 1280 by 800.
- **Documents.** `TESTS.md`: Test 48, and the lines of Tests 49 to 52. `MAINTAINER.md`: new icons and civilisations
  in the update guide, `icons` in the data, the extras' icons, the atlases in Assets, and the diagram.

#### Questions

1. **The civilisations' cells.** The tiles show a civilisation's icon at 72.5 pixels in a 1600 by 1000 window, and
   larger in larger windows, with twice as many device pixels on a 4K screen; the atlas has 60 by 60 pixels per cell,
   and the PNGs had 104. Should the civilisations' atlas have larger cells, or a `_4k` one?
2. **The PNGs.** 566 PNGs stay in the repository as the atlases' sources. Should they go, with the atlases built
   from elsewhere? Then a new icon would have to be put into an atlas without them.
3. **Firefox's second listing.** Should the technologies' and units' atlases be used from the start, so that Firefox
   does not list them again when the tree is first expanded? The Options window's parchment is listed again in the
   same way when the window is first opened.
4. **Unused PNGs.** `assets/images/icons/nodes/` holds 19 PNGs of 100 by 100 pixels, such as `barracks.png` and
   `paladin.png`, that nothing uses and no atlas holds. Are they still needed?

### The civilisations' atlas in two sizes

#### What changed

- **Two sizes.** The civilisations' atlas now comes as `civicon_atlas_x1.webp`, 480 by 420 with 60 by 60 pixels to a
  cell, and `civicon_atlas_x2.webp`, 832 by 728 with 104 by 104, the PNGs' own size; the old atlas is the `_x1` one
  renamed. This answers Question 1 of the entry before. `style.css` names `_x1` in `.pictures .civ-icon`, and
  `_x2` in a `.pictures[data-assets="4k"]` rule, so a 4K or ultrawide screen gets `_x2`, as with the cursors, and
  any other screen `_x1`. The loader goes by the `_x1` and `_x2` names, so it waits for the one the screen uses.
- **Same cells.** Matching every PNG against every cell in Chrome found the same 8 by 7 grid in the same order in
  both.
- **Traced.** Over HTTP with the screen emulated in Chrome, 1920 by 1080 and 2560 by 1440 ask for
  `civicon_atlas_x1.webp` and 1920 by 1080 at 200 % and 3440 by 1440 for `civicon_atlas_x2.webp`, never both.
- **Tests.** Test 48 takes the atlas and the cell size by `data-assets`. Test 47, which shows every picture under
  each of the four choices, now covers the civilisations' atlas too.
- **Mutation run.** Test 47 fails, and no other test, with the `_x2` rule taken out.
- **Checked.** All 99 tests pass in Chrome on Windows, in light and dark colours, at 1920 by 1080, 1280 by 800, 800
  by 1100 and 500 by 900, and with reduced motion forced at 1280 by 800. With a 4K screen emulated over the
  debugging protocol, all pass but Test 34, which fails there with any screen, as such a page has no window focus.
- **Documents.** `TESTS.md`: the lines of Tests 48 to 52. `MAINTAINER.md`: the two sizes in Assets.
