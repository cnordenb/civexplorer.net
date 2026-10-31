# Decisions

- [Rules, and how they are read](#rules-and-how-they-are-read)
- [Data and languages](#data-and-languages)
- [Marking](#marking)
- [The tree's shape](#the-trees-shape)
- [Variants](#variants)
- [Layout and controls](#layout-and-controls)
- [Pictures and Simple UI](#pictures-and-simple-ui)
- [Code and files](#code-and-files)
- [Tests](#tests)
- [Documents](#documents)

The decisions recorded in the development log in [DEVLOG/](DEVLOG/DEVLOG1.md), by subject (Rule 34). Each ends with the
day it was made, and the time where the log has one, as a link to its entry in the log; the log's entries carry a time
only from 2026-10-31 on. Where a later decision replaced an earlier one, the earlier one is named after it, with its own
link.

## Rules, and how they are read

- **Texts in `index.html`.** The title, the meta description, the `<noscript>` message, the message shown when the data
  cannot load and the "×" on the filter buttons stay in `index.html`, in English, as they must be there before or
  without JavaScript (Rules 1 and 2). [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
- **The updater is not a build.** It refreshes `data.json` in the browser, at `index.html?update` (Rules 13 to 15).
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
- **No page scrolling.** The document never scrolls; the panes scroll inside themselves (Rule 12).
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
- **Rule 18** is read as: a control must not move away from under the user while it is used, as opening a branch has to
  move the rows below it.
  [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **Rules 24 and 25** count lines of code: `data.json`, the language files and the documents are data and text, not
  code, and blank lines do not count. [2026-10-19](DEVLOG/DEVLOG1.md#a-blank-line-around-every-function)
  [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **Rule 22.** WCAG 2.2 AAA is required only with Simple UI on, so the tests run with Simple UI on.
  [2026-10-21](DEVLOG/DEVLOG2.md#the-page-sits-on-the-parchment-and-wcag-applies-to-simple-ui)
- **Rule 26** is checked by a step in `.github/workflows/tests.yml`, as a page in a browser cannot list folders.
  [2026-10-21](DEVLOG/DEVLOG2.md#no-320-by-256-window-and-test-82-checks-rules-23-to-26)
- **Rule 11**, as amended, allows the loading picture's turning, and no other animation.
  [2026-10-27](DEVLOG/DEVLOG4.md#a-loading-screen-without-simple-ui)
- **Rule 16** covers the style sheets as it covers the scripts.
  [2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars)
- **Rule 8** names `DEVLOG.md`; it is read as naming the log, in whichever part.
  [2026-10-31 00:48:46](DEVLOG/DEVLOG5.md#004846-the-log-in-parts)
- **Requirements 13, 24, 25 and 26.** The checkbox of requirement 13 is Include Unique and Universal; a building node
  (24) is an item with no item above it; the deepest descendant node (25) is the deepest item of the line marked must
  have; and unmarked counts as one of the values of requirement 26, so a branch with one marked and one unmarked item
  shows the dash. [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **Requirement 27** is rescinded, and with it the exception for the top of a line in requirement 30: every item follows
  requirements 29 and 30. Replaced: requirement 27 read as passing the mark of the top of a line to the whole line.
  [2026-10-22](DEVLOG/DEVLOG3.md#the-decisions-carried-out) [2026-10-22](DEVLOG/DEVLOG3.md#requirement-27-rescinded)
- **Requirements 24, 25 and 30** apply to the walls and towers under Fortifications as to units and technologies: a
  marked tower line is named after its deepest item, such as "Keep", and a mark passes only to towers of the same count.
  [2026-10-22](DEVLOG/DEVLOG3.md#requirements-24-25-and-30-amended-for-fortifications)
- **The pictures' exception.** `REQUIREMENTS.md` has an exception for the look with the pictures on, which is that of
  commit `fa11988`; with Simple UI the page looks as the requirements describe. Replaced: the requirements' look in both
  modes. [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
  [2026-10-22](DEVLOG/DEVLOG3.md#answers-to-the-questions-above)

## Data and languages

- **17 languages**, those of aoe2techtree.net, in its order and under its `?lng=` codes. The choice is kept in the
  address and in local storage, and `lang` uses proper language tags such as `ja` and `pt-BR`.
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
- **The language changes in place**, without reloading, from a menu of buttons rather than a `<select>`, which would
  switch language on every arrow key (WCAG 3.2.2). The menu closes on a click, and sits in the Options window.
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
  [2026-10-19](DEVLOG/DEVLOG1.md#a-cogwheel-button-with-the-language-menu-in-the-options-window)
  [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **English by default** (requirement 10), unless the address or an earlier choice says otherwise. Replaced: the
  browser's language on a first visit.
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
  [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **Abbreviations are written out**, such as "technologies" for "techs" (WCAG 3.1.4).
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
- **The data comes from aoe2techtree.net** through the updater, which keeps the hand-made parts: the tree's shape, the
  page's text, `overrides` and `ignore`. The game's names are used, and `overrides` corrects shortened ones.
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
- **The legal notice** stays in English in every language, marked `lang="en"`.
  [2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles)
- **Hand-made items** are added in `extras` in `data.json`, as the Xolotl Warrior is.
  [2026-10-23](DEVLOG/DEVLOG3.md#the-xolotl-warrior-which-excludes-the-stable)
- **The footer links to the project**, with the text and address in `source.project`.
  [2026-10-22](DEVLOG/DEVLOG3.md#the-footer-links-to-the-project)

## Marking

- **Marks never pass up** from a unit or technology: an item keeps the mark it was given or passed down. Replaced: an
  item marked when everything under it is, and the `optional` flag that kept the Mill and other buildings from that.
  [2026-10-19](DEVLOG/DEVLOG1.md#an-item-is-marked-when-everything-under-it-is)
  [2026-10-19](DEVLOG/DEVLOG1.md#optional-items-an-exception-to-the-marking-rule)
  [2026-10-22](DEVLOG/DEVLOG3.md#the-decisions-carried-out)
- **Buildings and groups** pass a mark to everything in them. [2026-10-22](DEVLOG/DEVLOG3.md#requirement-27-rescinded)
- **In a line of only children**, a mark passes down only to the items that the same civilisations have (requirements 29
  and 30), further down too, past an item with others. Replaced: the items with as many civilisations.
  [2026-10-19](DEVLOG/DEVLOG1.md#marking-opens-what-it-marks-requirements-28-to-31)
  [2026-10-22](DEVLOG/DEVLOG3.md#requirement-27-rescinded)
  [2026-10-26](DEVLOG/DEVLOG4.md#upgrades-and-variants-moved-into-their-lines)
- **Must have passes up** to an item's prerequisites, never to a building, and only while the item above has all of the
  marked item's civilisations; must lack never passes up (requirement 34).
  [2026-10-24](DEVLOG/DEVLOG3.md#must-have-passes-up-to-an-items-prerequisites-requirement-34)
  [2026-10-26](DEVLOG/DEVLOG4.md#upgrades-and-variants-moved-into-their-lines)
- **Marking opens what it marks** (requirements 28 to 31), and opening a branch opens each only child below it.
  [2026-10-19](DEVLOG/DEVLOG1.md#opening-a-branch-opens-its-whole-line)
  [2026-10-19](DEVLOG/DEVLOG1.md#marking-opens-what-it-marks-requirements-28-to-31)
- **Buildings by position.** `data.json` has no type field: an item with no item above it is a building, every other a
  unit or technology. [2026-10-19](DEVLOG/DEVLOG1.md#marking-opens-what-it-marks-requirements-28-to-31)
- **"Full"** names a fully marked building, top-level row or group only when it has something under it; a building
  heading a single line is named after its deepest item instead (requirement 24). Replaced: "Full" for a building at the
  top of a line. [2026-10-19](DEVLOG/DEVLOG1.md#a-building-at-the-top-of-a-line-is-named-full)
  [2026-10-22](DEVLOG/DEVLOG3.md#the-decisions-carried-out)
  [2026-10-24](DEVLOG/DEVLOG3.md#a-building-heading-a-single-line-is-named-after-its-deepest-item)
- **Greyed out, not hidden.** An item that cannot go with a marked one is greyed out, at half opacity and
  `aria-disabled`, and stays in the keyboard order, so no row moves. An item marked must have is never greyed out.
  Replaced: hiding it.
  [2026-10-24](DEVLOG/DEVLOG3.md#the-fortified-church-is-a-top-level-row-and-it-and-the-monastery-hide-each-other)
  [2026-10-24](DEVLOG/DEVLOG3.md#greyed-out-instead-of-hidden)
  [2026-10-24](DEVLOG/DEVLOG3.md#the-drop-off-site-variants-hold-what-they-replace-as-the-fortified-church-does)
- **Two numbers on a closed item**: its own count, and that of everything under it.
  [2026-10-19](DEVLOG/DEVLOG1.md#two-numbers-on-closed-items)

## The tree's shape

- **A shorter tree by default.** Unique items, universal items and items only one civilisation has are left out until
  Include Unique and Universal is ticked in the Options window. Items that all civilisations but one have count as
  universal. [2026-10-19](DEVLOG/DEVLOG1.md#a-shorter-tree-by-default-and-an-options-window)
  [2026-10-24](DEVLOG/DEVLOG3.md#items-all-civilisations-but-one-have-count-as-universal)
- **Include Regionals**, named with the game's word, is ticked by default.
  [2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip)
- **Top-level rows**: the Dock, the Monastery and the Fortified Church.
  [2026-10-19](DEVLOG/DEVLOG1.md#the-dock-is-a-top-level-row)
  [2026-10-24](DEVLOG/DEVLOG3.md#the-monastery-is-a-top-level-row)
  [2026-10-24](DEVLOG/DEVLOG3.md#the-fortified-church-is-a-top-level-row-and-it-and-the-monastery-hide-each-other)
- **A flatter tree.** The groups Drop-off Sites, General Infantry and Shock Infantry are gone, unique buildings have no
  group, and unique units sit straight in their buildings, except at the Castle, whose unique groups are headings
  without checkboxes.
  [2026-10-21](DEVLOG/DEVLOG2.md#one-line-search-messages-pinned-filters-one-cursor-seven-tiles-and-a-flatter-tree)
  [2026-10-25](DEVLOG/DEVLOG4.md#the-pasture-the-harbor-and-the-donjon-are-variants-too-and-unique-buildings-have-no-group)
  [2026-10-26](DEVLOG/DEVLOG4.md#unique-units-sit-straight-in-their-buildings-except-at-the-castle)
  [2026-10-26](DEVLOG/DEVLOG4.md#the-castles-unique-groups-are-headings-without-checkboxes)
- **Unique upgrades and variants sit in their lines**, as the Legionary does in the Militia line, and the Camel Scout
  tops the Camel Rider line. [2026-10-26](DEVLOG/DEVLOG4.md#upgrades-and-variants-moved-into-their-lines)
- **A unique item has its own filter** (requirement 36).
  [2026-10-26](DEVLOG/DEVLOG4.md#a-unique-item-has-its-own-filter-requirement-36)
- **The Domestication line stays the Mill's**, with `own: true`, rather than rows that no variant's civilisation has
  being left out by themselves. [2026-10-26](DEVLOG/DEVLOG4.md#the-domestication-line-stays-the-mills)
- **The Harbor** is the first row under the Dock, not a variant of it. Replaced: a variant of the Dock.
  [2026-10-25](DEVLOG/DEVLOG4.md#the-pasture-the-harbor-and-the-donjon-are-variants-too-and-unique-buildings-have-no-group)
  [2026-10-26](DEVLOG/DEVLOG4.md#a-variant-greys-out-every-alternative-requirement-37)
- **The Xolotl Warrior** is the first row under the Stable; it and the Stable grey each other out, and the Stable stays
  open. Replaced: the Xolotl Warrior excluding the Stable, then clearing it.
  [2026-10-23](DEVLOG/DEVLOG3.md#the-xolotl-warrior-which-excludes-the-stable)
  [2026-10-24](DEVLOG/DEVLOG3.md#the-xolotl-warrior-clears-the-stable)
  [2026-10-26](DEVLOG/DEVLOG4.md#the-xolotl-warrior-and-the-stable-grey-each-other-out)
- **No count on empty roots**, and every civilisation is listed while no filter is set.
  [2026-10-26](DEVLOG/DEVLOG4.md#no-count-on-empty-roots-and-every-civilisation-listed-without-filters)

## Variants

- **A variant holds the rows of what it replaces**, as the Fortified Church holds the Monastery's; the shared rows are
  the same items, with one filter. `replaces` takes a list.
  [2026-10-24](DEVLOG/DEVLOG3.md#the-fortified-church-holds-the-monasterys-rows)
  [2026-10-24](DEVLOG/DEVLOG3.md#the-drop-off-site-variants-hold-what-they-replace-as-the-fortified-church-does)
- **A variant greys out every alternative** (requirement 37): what it replaces, and the other variants of that.
  [2026-10-26](DEVLOG/DEVLOG4.md#a-variant-greys-out-every-alternative-requirement-37)
- **The variants**: the Fortified Church; the Mule Cart, the Settlement and the Folwark; the Pasture and the Donjon; the
  Varangian Guard and the Fire Lancer for the Eagle Scout, the Champi Scout for the Militia and the Armored Elephant for
  the Battering Ram; Cranequins and Parthian Tactics; the Dromon, the Catapult Galleon and the Lou Chuan for the Cannon
  Galleon; and the Rocket Cart for the Mangonel.
  [2026-10-24](DEVLOG/DEVLOG3.md#the-fortified-church-is-a-top-level-row-and-it-and-the-monastery-hide-each-other)
  [2026-10-24](DEVLOG/DEVLOG3.md#the-drop-off-site-variants-hold-what-they-replace-as-the-fortified-church-does)
  [2026-10-25](DEVLOG/DEVLOG4.md#the-pasture-the-harbor-and-the-donjon-are-variants-too-and-unique-buildings-have-no-group)
  [2026-10-26](DEVLOG/DEVLOG4.md#a-variant-greys-out-every-alternative-requirement-37)
  [2026-10-26](DEVLOG/DEVLOG4.md#cranequins-and-parthian-tactics-are-variants-too)
  [2026-10-26](DEVLOG/DEVLOG4.md#the-dromon-the-catapult-galleon-and-the-lou-chuan-are-cannon-galleon-variants)
  [2026-10-26](DEVLOG/DEVLOG4.md#the-mangonel-and-the-rocket-cart-are-variants)

## Layout and controls

- **The Options window** opens from a cogwheel button, holds the language menu and the settings, and keeps its size.
  [2026-10-19](DEVLOG/DEVLOG1.md#a-shorter-tree-by-default-and-an-options-window)
  [2026-10-19](DEVLOG/DEVLOG1.md#a-cogwheel-button-with-the-language-menu-in-the-options-window)
  [2026-10-19](DEVLOG/DEVLOG1.md#the-options-window-keeps-its-size)
- **Cancel and OK** in the Options window, with Simple UI too: nothing on the page changes until OK, and Cancel or
  Escape throws the changes away. With Simple UI the two are the same size; without it they sit in the parchment's
  bottom corner. Replaced: Simple UI keeping Close, with its changes taking effect at once.
  [2026-10-22](DEVLOG/DEVLOG3.md#cancel-and-ok-in-the-options-window-with-the-pictures)
  [2026-10-26](DEVLOG/DEVLOG4.md#the-options-window-has-cancel-and-ok-and-a-roomier-look-with-simple-ui)
  [2026-10-26](DEVLOG/DEVLOG4.md#with-simple-ui-too-changes-in-options-wait-for-ok-and-focus-outlines-there-show-whole)
  [2026-10-26](DEVLOG/DEVLOG4.md#with-simple-ui-cancel-and-ok-are-the-same-size)
  [2026-10-27](DEVLOG/DEVLOG4.md#cancel-and-ok-in-the-corner-of-the-options-parchment-and-no-shadow-on-button-text)
- **Two tree buttons**: Clear, and Expand all or Collapse all.
  [2026-10-22](DEVLOG/DEVLOG3.md#two-tree-buttons-with-the-pictures)
- **The report window** scrolls only its list, keeping its title and Close in view; Close is plain and on the right.
  [2026-10-22](DEVLOG/DEVLOG3.md#the-report-window-keeps-its-title-and-close-button-in-view)
  [2026-10-22](DEVLOG/DEVLOG3.md#the-report-windows-close-button-plain-and-on-the-right)
- **The Find box** is 325 pixels wide, or as wide as its pane if that is narrower; its messages show to its right, on
  one line; and Find scrolls only the tree.
  [2026-10-21](DEVLOG/DEVLOG2.md#a-find-box-of-fixed-width-and-the-tooltip-by-the-cursor)
  [2026-10-21](DEVLOG/DEVLOG2.md#search-messages-beside-the-box)
  [2026-10-21](DEVLOG/DEVLOG2.md#one-line-search-messages-pinned-filters-one-cursor-seven-tiles-and-a-flatter-tree)
  [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **The filters are pinned** above the list of civilisations.
  [2026-10-21](DEVLOG/DEVLOG2.md#one-line-search-messages-pinned-filters-one-cursor-seven-tiles-and-a-flatter-tree)
- **Civ view**: List or Tile, with six tiles to a row.
  [2026-10-21](DEVLOG/DEVLOG2.md#civ-view-and-the-search-message-by-the-panes-edge)
  [2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles)
- **The footer** spans the page between the panes' outer edges, with Simple UI too, and is hidden on phones.
  [2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles)
  [2026-10-21](DEVLOG/DEVLOG2.md#simple-ui-a-full-width-footer-and-civilisations-without-links)
  [2026-10-21](DEVLOG/DEVLOG2.md#no-footer-on-phones)
- **Civilisations link to aoe2techtree.net** without Simple UI only, each opening in a new tab.
  [2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles)
  [2026-10-21](DEVLOG/DEVLOG2.md#simple-ui-a-full-width-footer-and-civilisations-without-links)
  [2026-10-31 13:43:37](DEVLOG/DEVLOG5.md#134337-tooltips-on-every-control-civilisations-in-a-new-tab-and-the-combo-box-in-its-corner)
- **On phones** the two panes are equal halves of fixed height (requirement 35, Rule 18). Replaced: the phone layout of
  2026-10-21. [2026-10-21](DEVLOG/DEVLOG2.md#the-phone-layout-and-test-15)
  [2026-10-24](DEVLOG/DEVLOG3.md#phone-panes-of-equal-fixed-height-requirement-35-rule-18)
- **The loading screen** shows without Simple UI, on a first visit and on leaving Simple UI, until every picture has
  loaded, with no time limit. Its picture is the first one asked for and stands still with reduced motion, and its text
  is translated. [2026-10-27](DEVLOG/DEVLOG4.md#a-loading-screen-without-simple-ui)
  [2026-10-27](DEVLOG/DEVLOG4.md#the-loading-picture-first-the-loading-screen-on-leaving-simple-ui-and-every-picture-waited-for)
- **The game's scroll bars** show whenever a pane's content scrolls, 20 pixels wide, and their room is kept; the report
  window keeps the browser's.
  [2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars)

## Pictures and Simple UI

- **Simple UI** shows the page without pictures. It is a box in the Options window, remembered, and off on a first
  visit. [2026-10-21](DEVLOG/DEVLOG2.md#background-pictures-and-a-simple-ui-option-requirements-32-and-33-rule-22)
  [2026-10-27](DEVLOG/DEVLOG4.md#a-loading-screen-without-simple-ui)
- **The background and the pictures' size** follow the screen's resolution in device pixels, one size of each picture,
  and only the background in use is waited for. A phone, under 720 CSS pixels on its shorter side, gets the full-HD
  background and the `_sd` pictures. Replaced: backgrounds by the window's size.
  [2026-10-21](DEVLOG/DEVLOG2.md#background-pictures-and-a-simple-ui-option-requirements-32-and-33-rule-22)
  [2026-10-27](DEVLOG/DEVLOG4.md#one-background-only)
  [2026-10-27](DEVLOG/DEVLOG4.md#pictures-by-the-screens-resolution-one-size-of-each)
  [2026-10-27](DEVLOG/DEVLOG4.md#phones-on-the-full-hd-pictures-and-each-picture-asked-for-once)
- **Frames are never stretched**, only repeated.
  [2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons)
- **Fonts**: "Civ Georgia" and "Civ Times", loaded from `assets/fonts/`.
  [2026-10-21](DEVLOG/DEVLOG2.md#framed-panels-with-their-own-fonts)
- **Buttons** show the game's button picture, its ends unstretched, with words in bold Georgia and no shadow on them.
  Replaced: Trajan Pro with a gold ring. [2026-10-21](DEVLOG/DEVLOG2.md#game-buttons-with-trajan-pro)
  [2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons)
  [2026-10-27](DEVLOG/DEVLOG4.md#cancel-and-ok-in-the-corner-of-the-options-parchment-and-no-shadow-on-button-text)
- **Checkboxes** show the checkbox sheet's own sprites. [2026-10-21](DEVLOG/DEVLOG2.md#checkbox-pictures)
  [2026-10-22](DEVLOG/DEVLOG3.md#answers-to-the-questions-above)
- **Cursors**: the sword, and the pointing hand over links. The `_x2` cursors are drawn at two thirds of their size, 32
  pixels as the `_x1` ones. Replaced: the sword alone; the `_x2` cursors at half their size.
  [2026-10-21](DEVLOG/DEVLOG2.md#one-line-search-messages-pinned-filters-one-cursor-seven-tiles-and-a-flatter-tree)
  [2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles)
  [2026-10-30](DEVLOG/DEVLOG5.md#the-_x2-cursors-at-half-their-size)
  [2026-10-31 00:30:03](DEVLOG/DEVLOG5.md#003003-the-_x2-cursors-at-two-thirds-of-their-size)
- **The tooltip** starts at the cursor's bottom-right corner, 32 pixels from its point with both cursors.
  [2026-10-21](DEVLOG/DEVLOG2.md#a-find-box-of-fixed-width-and-the-tooltip-by-the-cursor)
  [2026-10-31 00:30:03](DEVLOG/DEVLOG5.md#003003-the-_x2-cursors-at-two-thirds-of-their-size)
- **The Include description** is hidden with the pictures, though screen readers still read it, and Include's tooltip
  says what a click does, as the other settings' do; Simple UI keeps the sentence. Replaced: the description as
  Include's tooltip.
  [2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip)
  [2026-10-31 14:16:57](DEVLOG/DEVLOG5.md#141657-includes-tooltip-worded-as-the-other-settings)
- **Every control has a tooltip** with the pictures: what a click does, in at most 100 characters, Find's longer, or a
  link's address; it changes at once when a click changes what is under the mouse. The language box and its languages
  share "Select a language". None on a locked branch's arrow or in the report window.
  [2026-10-31 13:43:37](DEVLOG/DEVLOG5.md#134337-tooltips-on-every-control-civilisations-in-a-new-tab-and-the-combo-box-in-its-corner)
  [2026-10-31 14:14:36](DEVLOG/DEVLOG5.md#141436-the-tooltips-of-the-language-box-and-find-and-tooltips-that-follow-a-click)
  [2026-10-31 14:16:57](DEVLOG/DEVLOG5.md#141657-includes-tooltip-worded-as-the-other-settings)
- **Icons** come from atlases, the civilisations' in two sizes; the tree's icons have outlines coloured as in
  `colour_key.csv`. [2026-10-21](DEVLOG/DEVLOG2.md#icons-in-the-tree) [2026-10-27](DEVLOG/DEVLOG4.md#icons-from-atlases)
  [2026-10-27](DEVLOG/DEVLOG4.md#the-civilisations-atlas-in-two-sizes)
- **No tab icon with Simple UI**: `index.html` gives the empty icon `data:,`.
  [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **The Options window** sits on its own parchment. Its contents keep 60 pixels from the panel's left and right edges,
  120 screen pixels on 4K screens; the panel stays as wide as the window.
  [2026-10-21](DEVLOG/DEVLOG2.md#the-options-window-on-its-own-parchment)
  [2026-10-31 14:07:50](DEVLOG/DEVLOG5.md#140750-the-options-panels-contents-60-pixels-from-its-sides)
- **The language menu** is the game's combo box: its picture, 219 by 35 pixels, unstretched, with an arrow 2 pixels in
  from its right end (4 screen pixels on 4K screens), down or up, 19 by 14 pixels, or on 4K screens the picture's own 35
  by 28 screen pixels, and a list of one column right below it, as wide as it, seven languages high, in bold Georgia on
  `#d7b394` within a `#201819` outline, lying over the settings, which stay in sight. The list's scroll bar has the
  box's arrows and keeps its normal pictures, and the list scrolls a language at a time, at once. The box sits at the
  right of the window's contents. Its label ends with a colon, with Simple UI too. With Simple UI the settings still
  hide while the list is open. Replaced: the button picture on the menu and its languages, and a list without a
  background of its own; the arrow scaled with the box; the settings hidden under the list; the 4K arrow at 35 by 28 CSS
  pixels; the box at the left of its column; the box as far from the panel's right edge as from its top; the picture 290
  pixels wide; the arrow at the box's very end; the list as high as the settings' room.
  [2026-10-21](DEVLOG/DEVLOG2.md#game-buttons-with-trajan-pro)
  [2026-10-21](DEVLOG/DEVLOG2.md#the-options-window-on-its-own-parchment)
  [2026-10-31](DEVLOG/DEVLOG5.md#the-language-menu-as-the-games-combo-box)
  [2026-10-31 12:56:48](DEVLOG/DEVLOG5.md#125648-the-combo-boxs-arrow-sizes-and-the-settings-in-sight)
  [2026-10-31 13:03:07](DEVLOG/DEVLOG5.md#130307-the-4k-arrow-in-the-screens-own-pixels)
  [2026-10-31 13:43:37](DEVLOG/DEVLOG5.md#134337-tooltips-on-every-control-civilisations-in-a-new-tab-and-the-combo-box-in-its-corner)
  [2026-10-31 13:54:31](DEVLOG/DEVLOG5.md#135431-the-combo-boxs-arrow-further-in-and-the-language-lists-own-scroll-bar)
  [2026-10-31 13:59:17](DEVLOG/DEVLOG5.md#135917-seven-languages-in-sight-a-language-at-a-time)
  [2026-10-31 14:07:50](DEVLOG/DEVLOG5.md#140750-the-options-panels-contents-60-pixels-from-its-sides)

## Code and files

- **ES modules**; the tests are loaded only with `?test`, by dynamic import.
  [2026-10-19](DEVLOG/DEVLOG1.md#scriptjs-split-into-modules-in-js-rule-16)
- **Model, view and controller**: the scripts are in `js/model/`, `js/view/` and `js/controller/`, and `script.js` is in
  `js/`. Replaced: `script.js` in the main folder.
  [2026-10-19](DEVLOG/DEVLOG1.md#a-documentation-folder-and-scriptjs-in-the-main-folder)
  [2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars)
- **Two style sheets**: `css/base.css`, the layout and Simple UI, and `css/pictures.css`, every rule with a picture or a
  font.
  [2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars)
- **`js/ui.js` split in three**, with dependencies one way only.
  [2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three)
- **A blank line before and after every function.** [2026-10-19](DEVLOG/DEVLOG1.md#a-blank-line-around-every-function)
- **`documentation/`** holds the documents; `README.md` is the only Markdown file in the main folder.
  [2026-10-19](DEVLOG/DEVLOG1.md#a-documentation-folder-and-scriptjs-in-the-main-folder)
- **The test scripts end in `_test.js`**, so that no two files share a name (Rule 29).
  [2026-10-30](DEVLOG/DEVLOG5.md#the-test-scripts-end-in-_testjs)

## Tests

- **Tests run in the page**, at `index.html?test`, and on GitHub on every push and pull request, in the Chrome of
  GitHub's Ubuntu runners, with no GitHub Actions (Rule 14).
  [2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd)
- **At most 100 tests** (Rule 17), merged where needed. [2026-10-19](DEVLOG/DEVLOG1.md#at-most-100-tests-rule-17)
- **The tests run in the order of `TESTS.md`'s categories**: functional, accessibility, maintainability.
  [2026-10-19](DEVLOG/DEVLOG1.md#the-tests-run-in-the-order-of-testsmds-categories)
- **Tests are named by number** in the report and GitHub's log. [2026-10-21](DEVLOG/DEVLOG2.md#tests-named-by-number)
- **Only the window the tests open in.** The test windows of 360 by 640, 390 by 844 and 320 by 256 are gone, so 400 %
  zoom is tried by hand. [2026-10-21](DEVLOG/DEVLOG2.md#fewer-test-windows-and-three-tests-removed)
  [2026-10-21](DEVLOG/DEVLOG2.md#no-320-by-256-window-and-test-82-checks-rules-23-to-26)
- **Tests removed**: Tests 49, 50 and 52, on the pictures, and the focus outline test and Test 53, on the loading
  screen, as false positives. [2026-10-21](DEVLOG/DEVLOG2.md#fewer-test-windows-and-three-tests-removed)
  [2026-10-26](DEVLOG/DEVLOG4.md#the-focus-outline-test-is-gone) [2026-10-27](DEVLOG/DEVLOG4.md#test-53-removed)

## Documents

- **`TESTS.md`** describes each test in short fields of at most 120 characters (Rule 19).
  [2026-10-19](DEVLOG/DEVLOG1.md#testsmd-filled-in-rule-19)
- **`MAINTAINER.md`** starts with the update guide, with its table of contents under the title and no heading of its
  own, then explains how the code works, with a UML diagram (Rule 27).
  [2026-10-19](DEVLOG/DEVLOG1.md#maintainermd-explains-the-code)
  [2026-10-22](DEVLOG/DEVLOG3.md#maintainermd-rewritten-for-rule-27)
- **`code_docu.pdf`** describes the code folder by folder: a chapter for each folder, a subchapter for each file, and a
  section for each function. Replaced: a chapter for each file. [2026-10-19](DEVLOG/DEVLOG1.md#code_docupdf)
  [2026-10-30](DEVLOG/DEVLOG5.md#code_docupdf-made-again) [2026-10-31](DEVLOG/DEVLOG5.md#code_docupdf-by-folder)
- **The development log** is in `documentation/DEVLOG/`, in parts of at most 1000 lines that never split a day, each a
  list of days with links; this file lists its decisions.
  [2026-10-31 00:48:46](DEVLOG/DEVLOG5.md#004846-the-log-in-parts)
  [2026-10-31 01:42:40](DEVLOG/DEVLOG5.md#014240-decisionsmd)
- **`TERMINOLOGY.md`** defines the project's terms, one a line of at most 120 characters, in lower case but where it
  quotes the page, each line using only terms defined above it.
  [2026-10-31 12:47:21](DEVLOG/DEVLOG5.md#124721-terminologymd)
