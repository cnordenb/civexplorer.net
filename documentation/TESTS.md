# Tests

This project originally had over 6000 tests which took multiple minutes to finish. The number of tests was later reduced to under a hundred. This project strives to have sensible testing. The goal is not to have 100% test coverage but to have tests which _sufficiently_ ensure the functional completeness, functional correctness, maintainability, and accessibility of aoe2civexplorer. For more guidelines on software quality and accessibility, see [ISO/IEC 25010:2011](https://cdn.standards.iteh.ai/samples/35733/2ca18b477b7845a5b8cae39d6de0c098/ISO-IEC-25010-2011.pdf), [ISO/IEC 25010:2023](https://cdn.standards.iteh.ai/samples/78176/13ff8ea97048443f99318920757df124/ISO-IEC-25010-2023.pdf) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

This document lists each test, its purpose, and in which test file it resides. This document is an effort to mitigate redundant tests and ensure test quality. It is intended as an aid in the trouble-shooting of potential false positives.

Test descriptions must remain brief and parameters (eg. Purpose) may not exceed 120 characters. Tests are ordered in order of their execution.

The test report and the GitHub check name each test by its number here, such as "Test 15 failed". The number is worked out
while the tests run: it is the test's place in the order the tests first run in the main window. So when a test is added,
removed or moved, renumber this document to match.

WCAG 2.2 AAA is only required with Simple UI on, so the tests run with Simple UI on. Tests 47 to 52 turn it off to test the pictures.

## Table of contents per category

Functional completeness & correctness tests:

- [Test 1](#test-1): Each language has all of the page's text
- [Test 2](#test-2): Each language names every item and civ
- [Test 3](#test-3): A click marks must have and lists the civs
- [Test 4](#test-4): A marked item gets a filter button
- [Test 5](#test-5): X marks must lack
- [Test 6](#test-6): The menu key and right-click mark must lack
- [Test 7](#test-7): Space clears a mark
- [Test 8](#test-8): Marking a building marks and shows all in it
- [Test 9](#test-9): A fully marked branch reads "Full" in Filters
- [Test 10](#test-10): A partly marked branch shows a white dash, must have a green tick and must lack a red cross
- [Test 11](#test-11): A line's filter is named after its deepest mark
- [Test 12](#test-12): A line's filter button clears only its own kind of mark
- [Test 13](#test-13): A building heading a single line is named after its deepest item, not Full, as in Fortifications
- [Test 14](#test-14): Marking a top-level group marks and shows all in it, greying out nothing
- [Test 15](#test-15): Everything open and a long civ list fit the screen, on phones too, panes the same size and staying put
- [Test 16](#test-16): A long press marks must lack, and a right-click clears it
- [Test 17](#test-17): Marking the top of a line passes the mark down only at the same count
- [Test 18](#test-18): Marking a line's end marks every item before it too, with one filter
- [Test 19](#test-19): Must have passes up to every item before it, but not to a building
- [Test 20](#test-20): An item can be must lack while everything under it is must have
- [Test 21](#test-21): Must have on an item greys out the item it excludes, and the other way round
- [Test 22](#test-22): An item that replaces buildings holds their items, and must have on one greys out every alternative
- [Test 23](#test-23): Marking a unit or technology opens its line
- [Test 24](#test-24): A mark passes down only to the same civs, and must have up to items they all have
- [Test 25](#test-25): A closed item shows its own and its full count
- [Test 26](#test-26): A closed line shows its first and last counts
- [Test 27](#test-27): An open item shows only its own count
- [Test 28](#test-28): Counts follow the filters
- [Test 29](#test-29): Expand all, Collapse all and the arrows work
- [Test 30](#test-30): Opening a branch opens its only children
- [Test 31](#test-31): Find highlights in yellow, opens to and counts matches
- [Test 32](#test-32): Find reports no match, and clears when emptied
- [Test 33](#test-33): The language menu is in Options, with every language
- [Test 34](#test-34): The language menu closes on Escape, a click or leaving it, and Options keeps its size
- [Test 35](#test-35): Choosing a language changes the page on OK
- [Test 36](#test-36): English is the default, and the language is kept in the address
- [Test 37](#test-37): Marks survive a language change
- [Test 38](#test-38): The page's text is in the chosen language
- [Test 39](#test-39): The tree is in the chosen language
- [Test 40](#test-40): No placeholders are left in the text
- [Test 41](#test-41): The footer links the source, Microsoft's rules and the project, as wide as the page, hidden on phones
- [Test 42](#test-42): The civ list is translated and sorted
- [Test 43](#test-43): Unique and universal items are hidden by default, regional ones shown
- [Test 44](#test-44): On OK, ticking Include shows every item and unticking Include Regionals hides regional ones, keeping marks
- [Test 45](#test-45): The Include and Include Regionals choices are remembered
- [Test 46](#test-46): Options opens with Include unticked and Include Regionals ticked; changes wait for OK, Cancel or closing drops them
- [Test 47](#test-47): The pictures, cursors and tab icon suit the screen's resolution, one size of each, the page sits on the parchment, the footer spans it or is hidden on phones
- [Test 48](#test-48): Every checkbox and radio button shows its picture from its sheet, tree rows their outlined icons and civilisations theirs, each from its atlas
- [Test 49](#test-49): The Find box shows a search icon or a clearing cross; the tree and Include have tooltips unless turned off
- [Test 50](#test-50): Without Simple UI, the tree has Clear and Expand all, which is Collapse all while a branch is open
- [Test 51](#test-51): Without Simple UI, Cancel and OK sit in the parchment's corner, below the panel; changes wait for OK, Cancel drops them
- [Test 52](#test-52): Ticking Simple UI takes away every image and the civ links on OK, unticking brings them back on OK, its box staying put
- [Test 53](#test-53): A unique item marked must have has its own filter, unless its whole line is unique
- [Test 54](#test-54): A group inside a building has no checkbox; a click opens and closes it, and Down reaches its arrow

Accessibility tests:

- [Test 55](#test-55): Each language has a name and a valid tag
- [Test 56](#test-56): A filter button clears its item and focus moves on
- [Test 57](#test-57): Clearing the last filter moves focus and lists every civilisation
- [Test 58](#test-58): Right opens a line all the way down
- [Test 59](#test-59): Right and Left go into and out of branches
- [Test 60](#test-60): Up, Down, Home and End move through the tree
- [Test 61](#test-61): Down on an arrow goes to the next arrow
- [Test 62](#test-62): Enter goes to the first match
- [Test 63](#test-63): The page has a title and a language
- [Test 64](#test-64): Language tags are valid and choices are marked
- [Test 65](#test-65): One header, main, footer and main heading
- [Test 66](#test-66): Headings have text and skip no levels
- [Test 67](#test-67): Ids are unique and ARIA references resolve
- [Test 68](#test-68): Controls say what state they are in
- [Test 69](#test-69): Control names contain their visible text
- [Test 70](#test-70): Text contrast is at least 7:1, or 4.5:1 when large
- [Test 71](#test-71): Control borders have a contrast of at least 3:1
- [Test 72](#test-72): Targets are at least 44 by 44 pixels
- [Test 73](#test-73): The page does not scroll
- [Test 74](#test-74): Nothing sticks out sideways
- [Test 75](#test-75): Text is not justified and has 1.5 line spacing
- [Test 76](#test-76): No images, sounds, video or animations on the page
- [Test 77](#test-77): Nothing covers what has focus
- [Test 78](#test-78): Down and End move through the language menu
- [Test 79](#test-79): Wider text spacing breaks nothing
- [Test 80](#test-80): Space unticks and ticks Include and Include Regionals, and OK applies it, keeping marks

Maintainability tests:

- [Test 81](#test-81): No comments in the code
- [Test 82](#test-82): No CSS or HTML in the scripts, only numbers for CSS custom properties
- [Test 83](#test-83): script.js in the main folder, other scripts in js/, tests on demand
- [Test 84](#test-84): No file over 400 lines of code, no function over 60, no line over 120 characters
- [Test 85](#test-85): Page code stays out of script.js, datahandler.js and model.js, and data code is in datahandler.js
- [Test 86](#test-86): Images and fonts only from assets/ and without Simple UI, a blank tab icon; no sounds, animations but the loading spin, or dependencies
- [Test 87](#test-87): No game data in the scripts
- [Test 88](#test-88): Each item is in the tree once
- [Test 89](#test-89): The tree uses only known fields, and unique, lines, own, excludes and replaces are well placed
- [Test 90](#test-90): Each item's availability names known civs, and each item has an icon, as extras says
- [Test 91](#test-91): Counted texts have an "other" form
- [Test 92](#test-92): Translations keep their placeholders
- [Test 93](#test-93): Overrides name known items and civs
- [Test 94](#test-94): Source, tool texts and ignore list are filled in
- [Test 95](#test-95): The updater writes and reads back every value
- [Test 96](#test-96): Availability is stored in its shortest form
- [Test 97](#test-97): Stored names are already tidy
- [Test 98](#test-98): The report window keeps its title, count and Close in view and scrolls only its list; Close is plain, on the right
- [Test 99](#test-99): There are at most 100 tests

## Test 1

### File residence:
`js/tests/static.js`, lines 237-238

### Purpose:
Prevent missing interface text in any language.

### Assertion expectation:
Every language has every interface text English has, and a name for every group.

## Test 2

### File residence:
`js/tests/static.js`, lines 239-242

### Purpose:
Prevent untranslated items and civilisations in the tree and the civ list.

### Assertion expectation:
Every language has a name for every item and every civilisation.

## Test 3

### File residence:
`js/tests/behaviour.js`, lines 24-26

### Purpose:
Verify that a left-click marks must have and the civ list and count follow (Req. 3, 4).

### Assertion expectation:
Item is "has" and aria-checked is true; list holds its civs in order; count reads "n compatible civilisations".

## Test 4

### File residence:
`js/tests/behaviour.js`, lines 28-29

### Purpose:
Verify that the Filters list appears when an item is marked (Req. 22, 23).

### Assertion expectation:
Exactly one filter button exists, labelled with the item's name and its must-have mark.

## Test 5

### File residence:
`js/tests/behaviour.js`, lines 31-32

### Purpose:
Verify that X marks must lack (Req. 3).

### Assertion expectation:
Item is "lacks", reads ", must lack", and the civs that have it leave the list.

## Test 6

### File residence:
`js/tests/behaviour.js`, lines 33-35

### Purpose:
Verify that the menu key and right-click mark must lack (Req. 3).

### Assertion expectation:
After a contextmenu event the item is "lacks" and the browser's own menu is suppressed.

## Test 7

### File residence:
`js/tests/behaviour.js`, lines 36-37

### Purpose:
Verify that Space clears a mark from the keyboard (Req. 3, WCAG 2.1.1).

### Assertion expectation:
Space on a must-have item leaves it unmarked.

## Test 8

### File residence:
`js/tests/behaviour.js`, lines 46-47

### Purpose:
Verify Req. 24 and 31: marking a building marks everything in it, and opens the way to all of it.

### Assertion expectation:
From closed, clicking a building makes it "has", and every item below it "has" and shown.

## Test 9

### File residence:
`js/tests/behaviour.js`, line 48

### Purpose:
Verify Req. 24: a fully marked branch is listed as "Full <name>" in Filters.

### Assertion expectation:
Exactly one filter button exists, named "Full" plus the branch's name.

## Test 10

### File residence:
`js/tests/behaviour.js`, lines 50-54

### Purpose:
Verify Req. 14, 23 and 26: a mixed box shows a white dash, a must-have box a green tick, a must-lack box a red cross.

### Assertion expectation:
A branch with its first child cleared is "mixed", with a white dash; the legend's tick is green and its cross red.

## Test 11

### File residence:
`js/tests/behaviour.js`, lines 59-60

### Purpose:
Verify Req. 25: a marked line's filter entry is titled after its deepest must-have item.

### Assertion expectation:
Marking a line's top names its filter after its deepest must-have item; marking the line's end renames it so.

## Test 12

### File residence:
`js/tests/behaviour.js`, lines 63-64

### Purpose:
Ensure a filter button never clears marks it does not show.

### Assertion expectation:
With the line's last item must lack, the must-have filter button clears all others; the last item stays "lacks".

## Test 13

### File residence:
`js/tests/behaviour.js`, lines 65-79

### Purpose:
Verify Req. 24, 25 and 30: a building heading a single line is named like a line, as Fortifications' lines are.

### Assertion expectation:
A building heading a line is named after its end, not Full; plain with nothing under it; a wall line after its end.

## Test 14

### File residence:
`js/tests/behaviour.js`, lines 85-87

### Purpose:
Verify that a top-level group passes its mark to everything in it and shows it all (Req. 31), stand-ins too.

### Assertion expectation:
From closed, a click on the group makes its state "has", without a mark of its own; all in it shows, none greyed.

## Test 15

### File residence:
`js/tests/behaviour.js`, lines 90-127

### Purpose:
Verify that a full tree and civ list never stretch the page, and that marking never resizes a pane (Req. 35, rule 18).

### Assertion expectation:
No page scroll; headers inside panes; no overlap; list scrolls in place; panes equally high and as before marking.

## Test 16

### File residence:
`js/tests/behaviour.js`, lines 144-145

### Purpose:
Verify marking by long press and right-click (Req. 3).

### Assertion expectation:
A 600 ms touch press marks the item "lacks"; a right-click on it then clears it.

## Test 17

### File residence:
`js/tests/behaviour.js`, lines 150-165

### Purpose:
Verify Req. 29 and 30 at the top of a line, which Req. 27 no longer exempts: a mark passes down only at equal counts.

### Assertion expectation:
A click on a line's top marks it and its equal counts "has", X "lacks", with the right lists; again clears them.

## Test 18

### File residence:
`js/tests/behaviour.js`, lines 166-169

### Purpose:
Verify Req. 34: must have on a line's last item also marks every item before it, its prerequisites.

### Assertion expectation:
After a click on a line's end, the whole line is "has", with one filter named after the end; the list fits the end.

## Test 19

### File residence:
`js/tests/behaviour.js`, lines 174-179

### Purpose:
Verify Req. 34 and its exception: must have passes up to the prerequisites, never to the building above them.

### Assertion expectation:
After clicks on every leaf in a building, everything in it is "has"; the building is unmarked and shows a dash.

## Test 20

### File residence:
`js/tests/behaviour.js`, lines 181-184

### Purpose:
Allow searching for civs that get a building's contents elsewhere, such as Two-Man Saw without a Lumber Camp.

### Assertion expectation:
With a building must lack and everything under it must have, the list is not empty and is correct.

## Test 21

### File residence:
`js/tests/behaviour.js`, lines 188-229

### Purpose:
Enforce the Xolotl rule: must have on the Xolotl Warrior, or on the Stable or anything in it, greys out the other.

### Assertion expectation:
Only the other side greys out, unmarkable; the Xolotl stays in sight and the Stable's arrow works; X greys nothing.

## Test 22

### File residence:
`js/tests/behaviour.js`, lines 231-292

### Purpose:
Verify Req. 37: a stand-in, such as the Mule Cart, holds what it replaces, and must have on one greys out the rest.

### Assertion expectation:
Holds the non-own, non-unique rows it replaces; one mark and filter; greys out only marked items' variants till cleared.

## Test 23

### File residence:
`js/tests/behaviour.js`, lines 315-319

### Purpose:
Verify Req. 28 and 31: marking a unit or technology opens it, showing every item marked with it.

### Assertion expectation:
Clicking a closed line item opens it down to the end of its line, so every item below it is shown.

## Test 24

### File residence:
`js/tests/behaviour.js`, lines 294-310 and 321-337

### Purpose:
Verify Req. 13, 29, 30 and 34: a mark passes down only to the same civs; must have passes up to items they all have.

### Assertion expectation:
Click marks same-civ items below and above; X marks nothing above nor clears below; left-out unique items lift rows.

## Test 25

### File residence:
`js/tests/behaviour.js`, line 363

### Purpose:
Verify each item's compatible civilisations count (Req. 3).

### Assertion expectation:
Closed items with contents show "own–all", other items their own count, roots at 0 nothing; also to screen readers.

## Test 26

### File residence:
`js/tests/behaviour.js`, lines 364-365

### Purpose:
Verify that a closed upgrade line shows the range from its first item to its last upgrade.

### Assertion expectation:
The line's count reads its first item's civ count, then its last item's civ count.

## Test 27

### File residence:
`js/tests/behaviour.js`, lines 366-367

### Purpose:
Avoid a misleading range once an item's contents are visible.

### Assertion expectation:
After Expand all, every item shows only its own count.

## Test 28

### File residence:
`js/tests/behaviour.js`, lines 368-373

### Purpose:
Verify that the counts follow the active filters (Req. 3).

### Assertion expectation:
With a must-have and a must-lack mark, open and closed items count only the civs that fit the filters.

## Test 29

### File residence:
`js/tests/behaviour.js`, lines 386-387

### Purpose:
Verify Req. 18 and 19, and each branch's arrow.

### Assertion expectation:
Expand all opens every branch, Collapse all closes every branch, and a branch's arrow opens and closes it.

## Test 30

### File residence:
`js/tests/behaviour.js`, lines 388-393

### Purpose:
Save clicks by opening a line of only children in one step.

### Assertion expectation:
For every branch, its arrow opens exactly the chain of only children below it, and nothing else.

## Test 31

### File residence:
`js/tests/behaviour.js`, lines 401-405

### Purpose:
Verify Req. 20 and 21: the search highlights its matches in yellow, opens to them and counts them.

### Assertion expectation:
Exactly the matches are highlighted in yellow and shown; the number shows on one line right of the search bar.

## Test 32

### File residence:
`js/tests/behaviour.js`, lines 409-410

### Purpose:
Verify the search's feedback for no matches and for an empty search (Req. 21).

### Assertion expectation:
A search without matches says none found, on one line right of the search bar; emptying it empties the label.

## Test 33

### File residence:
`js/tests/interface.js`, lines 39-44

### Purpose:
Verify Req. 8 and 9: the Language menu is in the Options window and offers every language.

### Assertion expectation:
Options opens with focus on the menu, which opens to one option per language, each in its own language, current marked.

## Test 34

### File residence:
`js/tests/interface.js`, lines 53-55

### Purpose:
Verify Req. 12 and Rule 18: the language menu closes cleanly and nothing moves.

### Assertion expectation:
Escape closes it and refocuses its button; a click in it or leaving it closes it; the Options window never resizes.

## Test 35

### File residence:
`js/tests/interface.js`, lines 56-65

### Purpose:
Verify Req. 11, the change waiting for OK: the page changes to the chosen language.

### Assertion expectation:
The menu closes, refocuses its button and names the language, the page unchanged; on OK its lang and title change.

## Test 36

### File residence:
`js/tests/interface.js`, lines 16-24 and 66-67

### Purpose:
Verify Req. 10, and keep the chosen language when the link is shared or the page reloaded.

### Assertion expectation:
Without a choice the page picks English, even for a German browser; the address holds lng=<choice>, but not as a file.

## Test 37

### File residence:
`js/tests/interface.js`, lines 68-69

### Purpose:
Ensure changing the language never loses the user's marks.

### Assertion expectation:
After a language change the marked item is still "has" and the civ list is unchanged.

## Test 38

### File residence:
`js/tests/interface.js`, lines 82-83

### Purpose:
Verify Req. 11 for all interface text, in every language.

### Assertion expectation:
Every element with data-text shows the chosen language's text for its key.

## Test 39

### File residence:
`js/tests/interface.js`, lines 84-85

### Purpose:
Verify Req. 11 for the tree, in every language.

### Assertion expectation:
Every tree label shows the chosen language's item or group name.

## Test 40

### File residence:
`js/tests/interface.js`, lines 86-87

### Purpose:
Catch unfilled {placeholders} shown to users.

### Assertion expectation:
No visible text on the page contains { or }.

## Test 41

### File residence:
`js/tests/interface.js`, lines 89-94

### Purpose:
Verify Req. 5: the footer credits the data source, gives Microsoft's notice in English, and links the project's code.

### Assertion expectation:
Links to source, rules and project from data.json; notice marked English; footer spans the panes, or hidden on a phone.

## Test 42

### File residence:
`js/tests/interface.js`, lines 97-98

### Purpose:
Verify that the civ list is translated and sorted alphabetically in every language (Req. 4).

### Assertion expectation:
With a must-have and a must-lack mark, the list holds the right civs' names, sorted in the chosen language.

## Test 43

### File residence:
`js/tests/interface.js`, lines 107-110

### Purpose:
Verify Req. 13 and 15: by default the tree leaves out unique and universal items, and shows regional ones.

### Assertion expectation:
No unique item, grouped or not, shown; some regional one is; every shown leaf is held by, and missing from, 2+ civs.

## Test 44

### File residence:
`js/tests/interface.js`, lines 111-114, 118 and 124-136

### Purpose:
Verify Req. 14 and 15, and Include Regionals: on OK each box adds or removes its items and keeps marks.

### Assertion expectation:
Include: every item shown. Unticked Regionals: no regional item or item under one. Mark and civ list unchanged.

## Test 45

### File residence:
`js/tests/interface.js`, lines 132 and 137

### Purpose:
Keep the Include Unique and Universal and the Include Regionals choices for the next visit.

### Assertion expectation:
Browser storage holds include=true and regional=false after the clicks. Passes when the browser offers no storage.

## Test 46

### File residence:
`js/tests/interface.js`, lines 115-127 and 138-156

### Purpose:
Verify Req. 7 and 13, Cancel and OK in place of Req. 16's Close, and that focus returns on closing (WCAG 2.4.3).

### Assertion expectation:
Include unticked, Regionals ticked, only Cancel and OK; OK applies, Cancel or closing drops changes; focus returns.

## Test 47

### File residence:
`js/tests/pictures.js`, lines 47-110

### Purpose:
Verify that without Simple UI the pictures and cursors suit the screen's resolution, one size of each, on the parchment.

### Assertion expectation:
Choice for 11 screens; all 4 shown right; sword, pointing on links; Options, ring; tab icon; on parchment; footer.

## Test 48

### File residence:
`js/tests/pictures.js`, lines 112-181 and 370-373

### Purpose:
Verify that without Simple UI boxes show their sheets, and rows and civilisations their icons, each from its atlas.

### Assertion expectation:
Boxes: row by state, no marks but a dash. Icons: cell by file name, atlas sized to match, 44px, CSV outline.

## Test 49

### File residence:
`js/tests/pictures.js`, lines 183-232 and 375-377

### Purpose:
Verify that without Simple UI Find clears with its cross, and tooltips show over the tree and Include unless turned off.

### Assertion expectation:
325px field, no ring, status beside it; clearing cross; tip at the cursor; Include's hint as a tip; none if off.

## Test 50

### File residence:
`js/tests/pictures.js`, lines 18-23, 234-279 and 379-382

### Purpose:
Verify that without Simple UI Expand all turns into Collapse all in place while a branch is open, and hands focus on.

### Assertion expectation:
Clear and Expand all, or Collapse all with a top branch open; side by side, pane-wide; whole sprite; text fits.

## Test 51

### File residence:
`js/tests/pictures.js`, lines 18-45, 281-323 and 384-386

### Purpose:
Verify that without Simple UI Cancel and OK sit in the parchment's corner and changes wait for OK, or Cancel drops them.

### Assertion expectation:
Side by side below the panel, as far from the parchment's right as its bottom; whole sprite; no text shadow; OK applies.

## Test 52

### File residence:
`js/tests/pictures.js`, lines 325-358 and 388-389

### Purpose:
Verify Req. 2, 32 and 33, and Rules 18 and 22: Simple UI turns every image and civ link off and back on, each on OK.

### Assertion expectation:
Ticking: nothing till OK; then no image, tab icon or civ link, full title, saved. Unticking: all back on OK, box still.

## Test 53

### File residence:
`js/tests/interface.js`, lines 356-394

### Purpose:
Verify Req. 36: a unique item marked must have always has its own filter entry.

### Assertion expectation:
A unique item atop others: its own filter and its line's; each, or a full group's, clears only itself. Unique line: one.

## Test 54

### File residence:
`js/tests/interface.js`, lines 396-425

### Purpose:
Verify that a group inside a building, such as the Castle's Unique Units, is a heading, not a checkbox.

### Assertion expectation:
No checkbox role, tab stop or box; its name and arrow open and close it; right-click marks nothing; Down reaches it.

## Test 55

### File residence:
`js/tests/static.js`, lines 246-247

### Purpose:
Keep the language menu and the page's lang attributes correct (WCAG 3.1.1, 3.1.2).

### Assertion expectation:
Every language has a name and a well-formed language tag.

## Test 56

### File residence:
`js/tests/interface.js`, lines 259-261

### Purpose:
Verify that filter buttons remove filters without losing keyboard focus (WCAG 2.4.3).

### Assertion expectation:
Clicking the first filter button clears its item and moves focus to the next filter button.

## Test 57

### File residence:
`js/tests/interface.js`, lines 263-265

### Purpose:
Keep focus sensible, and list every civilisation, once no filters remain (WCAG 2.4.3).

### Assertion expectation:
Focus is on the Civilisations heading, every civilisation is listed, no hint shows and the Filters list is hidden.

## Test 58

### File residence:
`js/tests/interface.js`, lines 272-273

### Purpose:
Give keyboard users the same one-step opening of a line (WCAG 2.1.1).

### Assertion expectation:
Right on a line's first item opens exactly that line's chain of only children.

## Test 59

### File residence:
`js/tests/interface.js`, lines 287-288

### Purpose:
Verify keyboard navigation into and out of branches (WCAG 2.1.1).

### Assertion expectation:
Right opens a branch, Right again focuses its first child, Left returns to the branch, Left again closes it.

## Test 60

### File residence:
`js/tests/interface.js`, lines 292-293

### Purpose:
Verify keyboard movement through the tree (WCAG 2.1.1).

### Assertion expectation:
Up on the first item stays put, Down moves to the next, End focuses the last top item and Home the first.

## Test 61

### File residence:
`js/tests/interface.js`, lines 294-296

### Purpose:
Let keyboard users move between branch arrows directly.

### Assertion expectation:
Down on the first branch's arrow focuses the second branch's arrow.

## Test 62

### File residence:
`js/tests/interface.js`, lines 304-305

### Purpose:
Let keyboard users jump from the search bar to the results (WCAG 2.1.1).

### Assertion expectation:
Enter in the search bar focuses the first match.

## Test 63

### File residence:
`js/tests/audit.js`, lines 77-78

### Purpose:
WCAG 2.4.2 and 3.1.1: the page has a title and states its language.

### Assertion expectation:
The page title is not empty and the page's lang is the current language's tag.

## Test 64

### File residence:
`js/tests/audit.js`, lines 79-82

### Purpose:
WCAG 3.1.2: screen readers pronounce each language's name in that language.

### Assertion expectation:
Every lang attribute is well formed, and each language option's lang is that language's tag.

## Test 65

### File residence:
`js/tests/audit.js`, lines 84-86

### Purpose:
WCAG 1.3.1: landmarks and a main heading let assistive technology find its way around the page.

### Assertion expectation:
There is exactly one header, one main, one footer and one visible h1.

## Test 66

### File residence:
`js/tests/audit.js`, lines 87-88

### Purpose:
WCAG 1.3.1 and 2.4.10: the headings form a clear outline.

### Assertion expectation:
Every visible heading has text and is at most one level below the heading before it.

## Test 67

### File residence:
`js/tests/audit.js`, lines 95-98

### Purpose:
WCAG 4.1.2: labels and relationships resolve for assistive technology.

### Assertion expectation:
No id repeats, and every id in aria-labelledby, aria-controls and aria-describedby exists.

## Test 68

### File residence:
`js/tests/audit.js`, lines 104-109

### Purpose:
WCAG 4.1.2: assistive technology can read each control's state.

### Assertion expectation:
Checkboxes have aria-checked true, false or mixed; arrows and the menu button have aria-expanded matching the screen.

## Test 69

### File residence:
`js/tests/audit.js`, lines 111-115

### Purpose:
WCAG 2.5.3 and 4.1.2: every control has a name matching what users see.

### Assertion expectation:
Every control has an accessible name, and, except for text inputs, that name contains its visible text.

## Test 70

### File residence:
`js/tests/audit.js`, lines 121-127

### Purpose:
WCAG 1.4.6 (AAA): text has enhanced contrast.

### Assertion expectation:
All visible text has a contrast of at least 7:1 with its background, or 4.5:1 for large text.

## Test 71

### File residence:
`js/tests/audit.js`, lines 128-133

### Purpose:
WCAG 1.4.11: the edges of controls are visible.

### Assertion expectation:
Buttons, filter buttons, inputs and checkboxes with a border have a border contrast of at least 3:1.

## Test 72

### File residence:
`js/tests/audit.js`, lines 139-142

### Purpose:
WCAG 2.5.5 (AAA): targets are large enough to hit.

### Assertion expectation:
Every focusable control, except links inside running text, is at least 44 by 44 CSS pixels.

## Test 73

### File residence:
`js/tests/audit.js`, lines 143-144

### Purpose:
Enforce Rule 12: no page scrolling.

### Assertion expectation:
The page is no taller and no wider than the window.

## Test 74

### File residence:
`js/tests/audit.js`, lines 145-148

### Purpose:
WCAG 1.4.10: content reflows without scrolling sideways.

### Assertion expectation:
No visible element extends past the left or right edge of the window.

## Test 75

### File residence:
`js/tests/audit.js`, lines 149-154

### Purpose:
WCAG 1.4.8 (AAA): text is presented readably.

### Assertion expectation:
No paragraph or list item is justified, and each has a line height of at least 1.5 times its font size.

## Test 76

### File residence:
`js/tests/audit.js`, lines 157-166

### Purpose:
Enforce Rules 9, 10, 11 and 22 on the page as rendered, with Simple UI on.

### Assertion expectation:
No media elements or tab icon, no images in CSS, the page's own background included, no animations or transitions.

## Test 77

### File residence:
`js/tests/audit.js`, lines 44-57, 65-70 and 73

### Purpose:
WCAG 2.4.12 (AAA): nothing hides the element that has focus.

### Assertion expectation:
Each focused element's visible centre hits it, or, for a greyed-out row that clicks pass through, the row's branch.

## Test 78

### File residence:
`js/tests/interface.js`, lines 182-183

### Purpose:
Verify keyboard use of the language menu (WCAG 2.1.1).

### Assertion expectation:
Down on the menu button opens the menu at the current language; Down moves one on; End reaches the last language.

## Test 79

### File residence:
`js/tests/interface.js`, lines 205-208

### Purpose:
WCAG 1.4.12: wider text spacing set by the user does not break the layout.

### Assertion expectation:
With WCAG's text spacing applied, the page and every element stay within the window's width.

## Test 80

### File residence:
`js/tests/interface.js`, lines 220-234

### Purpose:
Verify that the Include Unique and Universal and Include Regionals boxes work from the keyboard (WCAG 2.1.1).

### Assertion expectation:
Space flips both boxes, the tree unchanged till OK, which applies them; flipping back and OK restores it; marks kept.

## Test 81

### File residence:
`js/tests/static.js`, lines 200-204

### Purpose:
Enforce Rule 7: no comments in the code.

### Assertion expectation:
index.html, style.css and every script hold no comment markers. The comment live-server injects is ignored.

## Test 82

### File residence:
`js/tests/static.js`, lines 205-206

### Purpose:
Enforce Rule 2: no CSS or HTML inside the JavaScript.

### Assertion expectation:
No inline styles but setProperty("--name", number); no HTML strings, createElement or document.write.

## Test 83

### File residence:
`js/tests/static.js`, lines 207-213

### Purpose:
Enforce Rules 2 and 16, and keep the tests out of what visitors download.

### Assertion expectation:
script.js is in the main folder and every other script in js/; imports point into js/; only js/tests/ loads on demand.

## Test 84

### File residence:
`js/tests/static.js`, lines 42-161 and 214-215

### Purpose:
Verify Rules 23, 24 and 25: functions, lines and files stay small enough to read. GitHub checks Rule 26.

### Assertion expectation:
index.html, style.css and every script: at most 400 lines of code, functions at most 60, lines at most 120 characters.

## Test 85

### File residence:
`js/tests/static.js`, lines 216-222

### Purpose:
Keep page code out of script.js, datahandler.js and model.js, and data loading and storage in datahandler.js.

### Assertion expectation:
script.js, datahandler.js and model.js never touch the page; only datahandler.js uses fetch or localStorage.

## Test 86

### File residence:
`js/tests/static.js`, lines 168-189 and 223-230

### Purpose:
Enforce Rules 9, 10, 11 (but for the loading spin), 14 and 22 in the source files.

### Assertion expectation:
img only in templates, no src; blank tab icon; url() to assets/images/ in .pictures, assets/fonts/ in @font-face; etc.

## Test 87

### File residence:
`js/tests/static.js`, lines 231-232

### Purpose:
Enforce Rule 1: game data lives only in data.json.

### Assertion expectation:
No civilisation or item name from data.json appears as a quoted string in any script.

## Test 88

### File residence:
`js/tests/static.js`, line 269

### Purpose:
Prevent duplicate items in the tree, which would break counts and marking.

### Assertion expectation:
Every item appears exactly once in the tree in data.json.

## Test 89

### File residence:
`js/tests/static.js`, lines 279-282

### Purpose:
Catch misspelt, stale or misplaced fields in the tree in data.json, such as the retired "optional" flag.

### Assertion expectation:
Only known fields; unique and lines are true on groups, own is true on items; excludes and replaces name other items.

## Test 90

### File residence:
`js/tests/static.js`, lines 254-266 and 283-290

### Purpose:
Ensure every item's availability names real civilisations and every item has an icon, as extras says for added items.

### Assertion expectation:
Availability is "all" or a has or lacks list of known civs; pictures gives kind, picture and reach; extras match both.

## Test 91

### File residence:
`js/tests/static.js`, lines 298-299

### Purpose:
Ensure counted texts have a fallback form for any number.

### Assertion expectation:
Every counted (plural) text in every language has an "other" form.

## Test 92

### File residence:
`js/tests/static.js`, lines 300-302

### Purpose:
Prevent translations that lose or misspell placeholders such as {n}.

### Assertion expectation:
Each interface text has the same {placeholders} in every language as in English.

## Test 93

### File residence:
`js/tests/static.js`, lines 303-305

### Purpose:
Catch stale or misspelt name corrections after a game update.

### Assertion expectation:
Every key in each language's overrides is a known item or civilisation.

## Test 94

### File residence:
`js/tests/static.js`, lines 306-311

### Purpose:
Ensure the footer, the updater and the tests have the data they need (Req. 5).

### Assertion expectation:
source has name, url, data, an integer helpOffset and a YYYY-MM date; no tool text is empty; ignore is a list of text.

## Test 95

### File residence:
`js/tests/static.js`, lines 325-327

### Purpose:
Ensure the updater writes data.json and the locale files without losing or changing data.

### Assertion expectation:
Writer outputs data.json plus one locales/ file per other language; reading them back gives identical data.

## Test 96

### File residence:
`js/tests/static.js`, lines 331-332

### Purpose:
Keep data.json compact and identical to what the updater would write.

### Assertion expectation:
Each item's availability is "all", or whichever of the has or lacks lists is shorter.

## Test 97

### File residence:
`js/tests/static.js`, lines 333-335

### Purpose:
Keep stored names identical to what the updater would write.

### Assertion expectation:
Joining lines and tidying spaces leaves every stored item and civilisation name unchanged, in every language.

## Test 98

### File residence:
`js/tests/interface.js`, lines 327-354

### Purpose:
Keep the report window usable: title, count and Close stay put and only the list scrolls; Close is plain, on the right.

### Assertion expectation:
200 lines scrolled to the end move nothing; focus starts on Close, at the right; Close looks the same without Simple UI.

## Test 99

### File residence:
`js/tests/run.js`, lines 94-95

### Purpose:
Enforce Rule 17: at most 100 tests.

### Assertion expectation:
The number of tests in the report, this one included, is at most 100.
