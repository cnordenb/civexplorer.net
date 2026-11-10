# Tests

This project strives to have sensible testing. The goal is not to have 100% test coverage but to have tests which _sufficiently_ ensure the functional completeness, functional correctness, maintainability, and accessibility of aoe2civexplorer. For more guidelines on software quality and accessibility, see [ISO/IEC 25010:2011](https://cdn.standards.iteh.ai/samples/35733/2ca18b477b7845a5b8cae39d6de0c098/ISO-IEC-25010-2011.pdf), [ISO/IEC 25010:2023](https://cdn.standards.iteh.ai/samples/78176/13ff8ea97048443f99318920757df124/ISO-IEC-25010-2023.pdf) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

This document lists each test, its purpose, and in which test file it resides. This document is an effort to mitigate redundant tests and ensure test quality. It is intended as an aid in the trouble-shooting of potential false positives.

Test descriptions must remain brief and parameters (eg. Purpose) may not exceed 120 characters. Tests are ordered in order of their execution.

Each test has one purpose (Rule 17): a requirement of `REQUIREMENTS.md`, a rule of `RULES.md` (WCAG 2.2 under Rule 3),
or a bug that once was, with the DEVLOG entry that records it. A behaviour of the page that no requirement names, such
as the picture look, Include Regionals or the updater, is tested under Rule 4, which asks for tests that the page
still works, with the entry where the behaviour was decided; a decision about the code's structure is tested under
Rule 6. No two tests test the same thing. A test may check its one thing in several places, such as "the page does
not scroll", which runs with the tree all open, without Simple UI and in every state the audits reach; its entry names
every place.

The test report and the GitHub check name each test by its number here, such as "Test 15 failed". The number is worked out
while the tests run: it is the test's place in the order the tests first run in the main window. So when a test is added,
removed or moved, renumber this document to match.

If a group of tests throws, as `fixtures()` does when `data.json` lacks a case that a test needs, the report shows "the
tests ran to the end" failed, with the group's name and the error. That line has no number.

WCAG 2.2 AAA is only required with Simple UI on, so the tests run with Simple UI on. The tests of the picture look
("pictures: …") turn it off.

## Table of contents per category

### Data

- [Test 1](#test-1): Each language has every interface text
- [Test 2](#test-2): Each language names every row of the tree
- [Test 3](#test-3): Each language names every civilisation
- [Test 267](#test-267): Each item is in the tree once
- [Test 268](#test-268): The tree uses only known fields
- [Test 269](#test-269): Only groups are marked unique
- [Test 270](#test-270): Only groups are marked lines
- [Test 271](#test-271): Only items are marked own
- [Test 272](#test-272): Each item's excludes or replaces names other items of the tree
- [Test 273](#test-273): Each item's availability names only known civilisations
- [Test 274](#test-274): Each item has an icon
- [Test 275](#test-275): Each item says whether it is common, regional or unique
- [Test 276](#test-276): Each extra is a tree item with a name number and known civilisations
- [Test 277](#test-277): Data.json stores each extra as the updater writes it
- [Test 278](#test-278): Counted texts have an 'other' form
- [Test 279](#test-279): Translations keep the same placeholders
- [Test 280](#test-280): Every override names a known item or civilisation
- [Test 281](#test-281): The source the footer names is filled in
- [Test 282](#test-282): The updater's source is filled in
- [Test 283](#test-283): No tool text is empty
- [Test 284](#test-284): The ignore list is a list of names

### Marking

- [Test 4](#test-4): A click marks an item must have
- [Test 10](#test-10): X marks an item must lack
- [Test 11](#test-11): A box shows a green tick for must have, a red cross for must lack
- [Test 13](#test-13): The menu key marks an item must lack
- [Test 14](#test-14): The browser's menu does not open over an item
- [Test 15](#test-15): Space on a must-have item clears it
- [Test 16](#test-16): Space marks an item must have
- [Test 17](#test-17): Clear removes every mark
- [Test 18](#test-18): Marking a building or top-level group marks everything in it
- [Test 19](#test-19): Marking a building or top-level group opens everything it marks
- [Test 21](#test-21): A partly marked branch shows a white dash
- [Test 27](#test-27): A mark passes down a line to no item with other civilisations
- [Test 28](#test-28): Marking a top-level group greys out nothing in it
- [Test 36](#test-36): A long press marks an item must lack
- [Test 37](#test-37): A right-click on a must-lack item clears it
- [Test 38](#test-38): A right-click marks an item must lack
- [Test 39](#test-39): A mark passes down a line to each item with the same civilisations
- [Test 40](#test-40): Marking a line's top again with its mark clears the marks it passed down
- [Test 41](#test-41): Must have passes up a line to the items above it
- [Test 42](#test-42): Must lack on an item clears the must-have marks below it that need it
- [Test 43](#test-43): Must have passes up to no building
- [Test 44](#test-44): Must have on an item greys out the branch it excludes
- [Test 45](#test-45): An item that excludes the branch it is in stays in sight
- [Test 46](#test-46): Greying out a branch closes it
- [Test 47](#test-47): The arrow of a greyed-out branch that holds a marked item still works
- [Test 48](#test-48): A greyed-out item cannot be marked
- [Test 49](#test-49): Must have in an excluded branch greys out the item excluding it
- [Test 50](#test-50): The model itself refuses a mark on a greyed-out item
- [Test 51](#test-51): Must lack on either side of an exclusion greys out nothing
- [Test 52](#test-52): Marking a shared row marks it in both buildings
- [Test 53](#test-53): Marking a shared row opens nothing in the other building
- [Test 55](#test-55): Must have on a variant greys out exactly its alternatives
- [Test 56](#test-56): A greyed-out branch's arrow does not open it
- [Test 57](#test-57): Clearing a variant frees its alternatives
- [Test 59](#test-59): Marking a closed unit or technology opens it to its first fork or its end
- [Test 60](#test-60): Must lack passes up to nothing
- [Test 61](#test-61): Must have passes up to no item that lacks some of its civilisations
- [Test 62](#test-62): Must lack above an item with other civilisations keeps its must have

### Filters

- [Test 5](#test-5): The civilisations listed are exactly those that fit the marks
- [Test 8](#test-8): Marking an item adds one filter button
- [Test 12](#test-12): A filter button shows its mark as a green tick or a red cross
- [Test 20](#test-20): A fully marked building with several rows in it is named Full
- [Test 22](#test-22): A line's filter button is named after its deepest must-have item
- [Test 23](#test-23): A line's filter button clears its mark from the whole line
- [Test 24](#test-24): A line's filter button leaves the line's other kind of mark
- [Test 25](#test-25): A fully marked building heading a single line is named after the line's last item
- [Test 26](#test-26): A marked building with nothing in it is named plainly
- [Test 54](#test-54): A shared row has one plain filter button
- [Test 185](#test-185): A marked unique item has its own filter button
- [Test 186](#test-186): A unique item's own filter button clears only that item
- [Test 187](#test-187): A line's or group's filter button leaves its unique item marked
- [Test 188](#test-188): A wholly unique line has one filter button
- [Test 193](#test-193): Clearing a filter moves focus to the next filter button
- [Test 194](#test-194): Clearing the last filter moves focus to the civilisations heading
- [Test 195](#test-195): With no filter, every civilisation is listed
- [Test 196](#test-196): With no filter, the Filters list is hidden

### Counts

- [Test 6](#test-6): The civilisations' header counts the civilisations that fit
- [Test 65](#test-65): An empty top-level row shows no number
- [Test 66](#test-66): A closed item with contents shows its own number, then the number with all under it
- [Test 67](#test-67): An open item shows only its own number
- [Test 68](#test-68): An item with nothing under it shows its own number
- [Test 69](#test-69): A group shows the number of civilisations with anything in it

### Accessibility

- [Test 7](#test-7): Each row tells screen readers its mark
- [Test 9](#test-9): A filter button's name says which mark of which item it clears
- [Test 208](#test-208): The page has a title
- [Test 209](#test-209): The page's language is set
- [Test 210](#test-210): Every language tag is valid
- [Test 211](#test-211): Each language choice is marked with its language
- [Test 212](#test-212): The page has one header, main and footer
- [Test 213](#test-213): The page has one main heading
- [Test 214](#test-214): Every heading has text
- [Test 215](#test-215): No heading skips a level
- [Test 216](#test-216): Every ARIA reference points to exactly one element
- [Test 217](#test-217): Checkboxes, branches and the language menu say what state they are in
- [Test 218](#test-218): Every control has a name
- [Test 219](#test-219): Every control's name contains its visible text
- [Test 220](#test-220): Text has a contrast of at least 7:1, or 4.5:1 when large
- [Test 221](#test-221): Control borders have a contrast of at least 3:1
- [Test 222](#test-222): Targets are at least 44 by 44 pixels
- [Test 227](#test-227): Nothing covers what has focus

### Layout

- [Test 29](#test-29): The page does not scroll
- [Test 30](#test-30): Each pane keeps its header inside it
- [Test 31](#test-31): The two panes do not overlap
- [Test 32](#test-32): The civilisations' list scrolls inside its pane
- [Test 33](#test-33): The two panes are the same height
- [Test 34](#test-34): Marking or opening resizes neither pane
- [Test 35](#test-35): Marking or opening moves neither pane
- [Test 103](#test-103): The footer is as wide as the panes
- [Test 104](#test-104): On a phone, the footer is hidden
- [Test 223](#test-223): Nothing sticks out sideways
- [Test 224](#test-224): No text is justified
- [Test 225](#test-225): Text has a line spacing of at least 1.5
- [Test 231](#test-231): With wider text spacing, nothing sticks out sideways
- [Test 235](#test-235): The popup about a language moves and resizes no pane

### The tree

- [Test 58](#test-58): An item that replaces buildings also holds their common and regional rows
- [Test 70](#test-70): Expand all opens every branch
- [Test 71](#test-71): Collapse all closes every branch
- [Test 72](#test-72): A branch's arrow closes it
- [Test 73](#test-73): Opening a branch opens each only child below it, to the first fork or the end
- [Test 189](#test-189): A group inside a building has no checkbox
- [Test 190](#test-190): A click on a heading's name opens it
- [Test 191](#test-191): A heading marks nothing when clicked or right-clicked

### Options

- [Test 63](#test-63): Rows under a left-out unique item take its place
- [Test 64](#test-64): A change to what the tree shows keeps the marks
- [Test 82](#test-82): Opening the window puts focus on the language button
- [Test 88](#test-88): The language menu never changes the window's size
- [Test 92](#test-92): A change in the window waits for OK
- [Test 107](#test-107): The tree shows the items Include adds only while Include is ticked
- [Test 108](#test-108): The tree shows regional items only while Include Regionals is ticked
- [Test 109](#test-109): The Options button opens the Options window
- [Test 110](#test-110): Include is unticked when the window first opens
- [Test 111](#test-111): Include Regionals is ticked when the window first opens
- [Test 112](#test-112): The window's buttons are Cancel and OK
- [Test 113](#test-113): A click on Include shows a green tick
- [Test 114](#test-114): Cancel or OK closes the window
- [Test 115](#test-115): Closing the window returns focus to the Options button
- [Test 116](#test-116): The choices are remembered
- [Test 117](#test-117): Closing the window without OK throws away the changes
- [Test 118](#test-118): The window opens showing the settings in use
- [Test 164](#test-164): Ticking or unticking Simple UI never moves its box
- [Test 165](#test-165): Ticking Simple UI takes every image away on OK
- [Test 166](#test-166): The civilisations are links only without Simple UI
- [Test 167](#test-167): With Simple UI, the title is the full sentence alone
- [Test 168](#test-168): Unticking Simple UI brings every image back on OK
- [Test 183](#test-183): With Simple UI, the lists show the browser's own scroll bars
- [Test 184](#test-184): With Simple UI, no list shows the game's scroll bar

### Find

- [Test 74](#test-74): Exactly the items whose names match are highlighted
- [Test 75](#test-75): A match is highlighted in yellow
- [Test 76](#test-76): The tree opens down to every match
- [Test 77](#test-77): The label says how many items match
- [Test 78](#test-78): The number found sits on one line right of the search box
- [Test 79](#test-79): A match leaves the results once a mark greys out its branch
- [Test 80](#test-80): Emptying the search box clears the label
- [Test 207](#test-207): Enter goes to the first match

### The language menu

- [Test 81](#test-81): It is in the Options window
- [Test 83](#test-83): A click on its button opens it
- [Test 84](#test-84): It offers every language by its name
- [Test 85](#test-85): It marks the language in use
- [Test 86](#test-86): Escape closes it
- [Test 87](#test-87): Closing it with Escape or a choice returns focus to its button
- [Test 89](#test-89): A left-click in its list or outside it closes it
- [Test 90](#test-90): Moving focus out of it closes it
- [Test 91](#test-91): Its button names the chosen language
- [Test 93](#test-93): Without a choice, the page starts in English
- [Test 94](#test-94): The chosen language is kept in the address
- [Test 228](#test-228): Down on its button opens it at the language in use
- [Test 229](#test-229): Down goes to the next language
- [Test 230](#test-230): End goes to the last language

### Languages

- [Test 95](#test-95): The page's text is in the chosen language
- [Test 96](#test-96): The tree is in the chosen language
- [Test 97](#test-97): No placeholders are left in the text
- [Test 98](#test-98): The footer names the game update in the chosen language
- [Test 99](#test-99): The footer gives Microsoft's notice in English
- [Test 100](#test-100): The footer names the data's source
- [Test 101](#test-101): The footer's links lead where data.json says
- [Test 102](#test-102): Microsoft's notice is marked as English
- [Test 105](#test-105): The civilisations are named in the chosen language
- [Test 106](#test-106): The civilisations are sorted in the chosen language's order
- [Test 233](#test-233): A language that cannot load opens a popup that says so
- [Test 234](#test-234): A language that cannot load leaves the page and Options in the language in use
- [Test 236](#test-236): OK closes the popup about a language

### The picture look

- [Test 119](#test-119): The page picks its pictures by the screen's resolution
- [Test 120](#test-120): The page shows the background its screen was given
- [Test 121](#test-121): Every picture shown is of the screen's size and background
- [Test 122](#test-122): The header, panes and footer lie on the parchment
- [Test 123](#test-123): The cursor is the sword, or the pointing hand over links
- [Test 124](#test-124): The _x2 cursors are drawn as large as the _x1 ones
- [Test 125](#test-125): The Options button shows its picture
- [Test 126](#test-126): The Options button at rest shows its normal picture
- [Test 127](#test-127): The Options button has its gold ring
- [Test 128](#test-128): Every checkbox shows its state's picture from the checkbox sheet
- [Test 129](#test-129): The Civ view's radio buttons show their pictures from their sheet
- [Test 130](#test-130): A row has an icon exactly when its item or group has a picture
- [Test 131](#test-131): Every tree icon shows its own cell of its atlas
- [Test 132](#test-132): Every tree icon sits between its checkbox and its name
- [Test 133](#test-133): Every tree icon is 44 pixels square
- [Test 134](#test-134): Every tree icon has the outline colour_key.csv gives it
- [Test 135](#test-135): Every civilisation link begins with its icon
- [Test 136](#test-136): Every civilisation's icon shows its own cell of the atlas
- [Test 137](#test-137): Every icon atlas is as large as its grid of cells
- [Test 138](#test-138): The Find box has the text field's frame, repeated, not stretched
- [Test 139](#test-139): Find shows the search icon while empty, the clearing cross otherwise
- [Test 140](#test-140): The Find box is 325 pixels wide, or what its pane can spare
- [Test 141](#test-141): The number found is aligned right
- [Test 142](#test-142): Typing in Find never changes the box's width
- [Test 143](#test-143): The cross clears the search
- [Test 144](#test-144): The cross hands focus to the Find box
- [Test 145](#test-145): The focused Find box shows no focus outline
- [Test 146](#test-146): The tooltip over a tree row says how to mark it
- [Test 147](#test-147): The tooltip has its parchment colour
- [Test 148](#test-148): The tooltip starts at the cursor's bottom-right corner where there is room
- [Test 149](#test-149): The tooltip stays inside the window
- [Test 150](#test-150): The tooltip shows over the Options window
- [Test 151](#test-151): Include's tooltip says what a click does
- [Test 152](#test-152): Include's description is hidden from sight
- [Test 153](#test-153): Include is described by its hidden description
- [Test 154](#test-154): With Tooltips unticked, no tooltip shows
- [Test 155](#test-155): Every control has a tooltip, of at most 100 characters but for Find's
- [Test 156](#test-156): A link's tooltip is its address
- [Test 157](#test-157): Collapse all takes Expand all's place exactly while a top branch is open
- [Test 158](#test-158): The tree's two buttons fill its pane's width side by side
- [Test 159](#test-159): Each tree button shows the whole button picture
- [Test 160](#test-160): No tree button cuts its caption, in any language
- [Test 161](#test-161): The tree's toggle button never moves when it changes
- [Test 162](#test-162): The tree's toggle button keeps focus when it changes
- [Test 163](#test-163): The tree's buttons keep their size and place in every language
- [Test 169](#test-169): OK shows the civilisations in the Civ view chosen
- [Test 170](#test-170): The game's scroll bars hide the browser's own
- [Test 171](#test-171): A list has the game's scroll bar exactly while it scrolls
- [Test 172](#test-172): The scroll bars' pictures load
- [Test 173](#test-173): A scroll bar runs along its list's right edge
- [Test 174](#test-174): A scroll bar takes only the room kept for it
- [Test 175](#test-175): A scroll bar's parts show their own pictures, unstretched
- [Test 176](#test-176): A scroll bar's arrows, body and knob are equally wide
- [Test 177](#test-177): A scroll bar's arrows and knob keep their pictures' proportions
- [Test 178](#test-178): A scroll bar's knob sits where its list is scrolled to
- [Test 179](#test-179): A scroll bar's down arrow scrolls its list a line at once
- [Test 180](#test-180): The wheel over a scroll bar scrolls its list at once
- [Test 181](#test-181): The language list's scroll bar has the combo box's arrows
- [Test 182](#test-182): The wheel scrolls the language list by one language at once

### Keyboard

- [Test 192](#test-192): Down from the row above a heading reaches its arrow
- [Test 197](#test-197): Right opens a line all the way down
- [Test 198](#test-198): Up on the first item keeps focus there
- [Test 199](#test-199): Down goes to the next item
- [Test 200](#test-200): Up goes to the item above
- [Test 201](#test-201): Right on an open branch goes to its first item
- [Test 202](#test-202): Left on an item goes to the branch above it
- [Test 203](#test-203): Left on an open branch closes it
- [Test 204](#test-204): End goes to the last item
- [Test 205](#test-205): Home goes to the first item
- [Test 206](#test-206): On an arrow, Down goes to the next arrow
- [Test 232](#test-232): Space ticks or unticks a box in the Options window
- [Test 237](#test-237): OK in the popup about a language gives the focus back to the Options button

### Rules

- [Test 226](#test-226): With Simple UI, the page shows no image
- [Test 238](#test-238): No comments in the code
- [Test 239](#test-239): The scripts set no styles but numbers for CSS custom properties
- [Test 240](#test-240): The scripts build no markup
- [Test 241](#test-241): The tests load only when testing
- [Test 242](#test-242): Every other script loads with the page
- [Test 243](#test-243): No two files share a name
- [Test 244](#test-244): The code has no dependencies
- [Test 245](#test-245): No file has over 400 lines of code
- [Test 246](#test-246): No function has over 60 lines of code
- [Test 247](#test-247): No line of a script is over 120 characters
- [Test 248](#test-248): A top-level function with statements is a function declaration
- [Test 249](#test-249): Only the views touch the page
- [Test 250](#test-250): Only js/model/data/ touches the address
- [Test 251](#test-251): Only js/model/data/ loads or stores data
- [Test 252](#test-252): The model imports only the model
- [Test 253](#test-253): No view imports a controller
- [Test 254](#test-254): Only the model works on its sets
- [Test 255](#test-255): Only page.js observes the model
- [Test 256](#test-256): Only the model notifies its observers
- [Test 257](#test-257): The model's state holds no texts
- [Test 258](#test-258): No item holds a page element
- [Test 259](#test-259): No view stores data
- [Test 260](#test-260): Only the model saves or restores its own state
- [Test 261](#test-261): No view decides a mark
- [Test 262](#test-262): No image in a template has a source
- [Test 263](#test-263): Only the picture look's style rules name pictures
- [Test 264](#test-264): The page plays no sounds
- [Test 265](#test-265): Nothing moves but the loading spin
- [Test 266](#test-266): The scripts hold no game data

### The updater and its report

- [Test 285](#test-285): The writer puts each language in its own file
- [Test 286](#test-286): The writer keeps every value
- [Test 287](#test-287): Availability is stored in its shortest form
- [Test 288](#test-288): Stored names are already tidy
- [Test 289](#test-289): The report opens with focus on Close
- [Test 290](#test-290): Only the report's list scrolls
- [Test 291](#test-291): Scrolling the report's list keeps its title, count and Close in place
- [Test 292](#test-292): The report keeps its title, count and Close on screen
- [Test 293](#test-293): The report's download links scroll with its list
- [Test 294](#test-294): The report's Close sits on the right
- [Test 295](#test-295): The report's Close is the plain button, with or without Simple UI

## Test 1

### File residence:
`js/tests/static/data_test.js`, lines 23-24 and 30-31, in `textTests()`

### Purpose:
Requirement 11: the data for the page's interface texts in each language

### Assertion expectation:
every language has a non-empty text for each key of the first language's `ui`.

## Test 2

### File residence:
`js/tests/static/data_test.js`, lines 25-26, in `textTests()`

### Purpose:
Requirement 11: the data for the names of the tree's rows in each language

### Assertion expectation:
every language has a non-empty name for each group of `data.tree` and each item.

## Test 3

### File residence:
`js/tests/static/data_test.js`, line 27, in `textTests()`

### Purpose:
Requirement 11: the data for the civilisations' names in each language

### Assertion expectation:
every language has a non-empty name for each civilisation of `data.civs`.

## Test 4

### File residence:
`js/tests/behaviour/marking_test.js`, line 37, in `marking()`

### Purpose:
Requirement 3: must have by left-click

### Assertion expectation:
A click on a leaf with some civilisations marks it must have.

## Test 5

### File residence:
`js/tests/behaviour/marking_test.js`, lines 38, 49, in `marking()`; `js/tests/behaviour/lines_test.js`, lines 33, 39,
45, in `lineTops()`; line 70, in `parents()`; line 107, in `unevenLine()`; line 125, in `beyond()`;
`js/tests/behaviour/greying_test.js`, line 30, in `rivals()`

### Purpose:
Requirement 4: the list of civilisations compatible with the selected node filter

### Assertion expectation:
In seven marked states, the names listed, sorted, equal the civilisations of the marks' set (order is another test's).

## Test 6

### File residence:
`js/tests/behaviour/marking_test.js`, lines 39-40, in `marking()`

### Purpose:
Requirement 4: the header shows "n compatible civilisations"

### Assertion expectation:
With one item marked must have, the header reads the plural "compatible" text for its number of civilisations.

## Test 7

### File residence:
`js/tests/behaviour/marking_test.js`, lines 41, 48, in `marking()`; `js/tests/behaviour/branches_test.js`, line 30, in
`buildingMarks()`; `js/tests/behaviour/lines_test.js`, line 32, in `lineTops()`; line 63, in `parents()`

### Purpose:
Rule 3, WCAG 4.1.2: a row's value is exposed to assistive technology

### Assertion expectation:
`aria-checked` is "true" on must-have rows and "mixed" on partly marked branches; a must-lack row says so in its hidden
text.

## Test 8

### File residence:
`js/tests/behaviour/marking_test.js`, line 42, in `marking()`

### Purpose:
Requirement 22: the Filters list appears once a node has a value

### Assertion expectation:
After one mark, Filters is shown and holds one button.

## Test 9

### File residence:
`js/tests/behaviour/marking_test.js`, lines 43-45, in `marking()`

### Purpose:
Rule 3, WCAG 2.4.6: a filter button's label describes what it does

### Assertion expectation:
The button's hidden label is the "Clear must have" text with the filter's name.

## Test 10

### File residence:
`js/tests/behaviour/marking_test.js`, line 47, in `marking()`

### Purpose:
Requirement 3: must lack by X

### Assertion expectation:
X on an item marks it must lack.

## Test 11

### File residence:
`js/tests/behaviour/marking_test.js`, lines 51-52, in `marking()`

### Purpose:
Requirement 3: the legend's [v] must have and [x] must lack, on each node's checkbox

### Assertion expectation:
With Simple UI, the boxes of a must-have row, a must-lack row and the legend draw the green tick or red cross.

## Test 12

### File residence:
`js/tests/behaviour/marking_test.js`, lines 53-54, in `marking()`

### Purpose:
Requirement 23: each filter shows its value as a green tick or a red x

### Assertion expectation:
With Simple UI and one must-have and one must-lack filter, the buttons' boxes draw a green tick and a red cross.

## Test 13

### File residence:
`js/tests/behaviour/marking_test.js`, line 67, in `menuKey()`

### Purpose:
Rule 4: the menu key marks must lack, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
A bare `contextmenu` event on an item marks it must lack.

## Test 14

### File residence:
`js/tests/behaviour/marking_test.js`, line 68, in `menuKey()`; line 85, in `gestures()`

### Purpose:
Rule 4: no browser menu opens over an item, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
The `contextmenu` of the menu key and of a right-click on an item is cancelled.

## Test 15

### File residence:
`js/tests/behaviour/marking_test.js`, line 57, in `marking()`

### Purpose:
Rule 4: a mark given again is cleared, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#marking-opens-what-it-marks-requirements-28-to-31))

### Assertion expectation:
Space on a must-have item leaves it unmarked.

## Test 16

### File residence:
`js/tests/behaviour/marking_test.js`, line 59, in `marking()`

### Purpose:
Requirement 3: must have by Space

### Assertion expectation:
Space on an unmarked item marks it must have.

## Test 17

### File residence:
`js/tests/behaviour/marking_test.js`, line 61, in `marking()`

### Purpose:
Requirement 17: Clear clears every node checkbox

### Assertion expectation:
After must-have and must-lack marks, Clear leaves no item marked and no row with a state.

## Test 18

### File residence:
`js/tests/behaviour/branches_test.js`, line 24, in `buildingMarks()`; line 74, in `groupMarks()`

### Purpose:
Rule 4: a building or group passes its mark to all in it, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#requirement-27-rescinded))

### Assertion expectation:
After a click on a building, or a top-level group, its branch state is must have, and every item in it is.

## Test 19

### File residence:
`js/tests/behaviour/branches_test.js`, line 25, in `buildingMarks()`; line 75, in `groupMarks()`

### Purpose:
Requirement 31: a node given a value automatically is expanded to

### Assertion expectation:
Everything in the closed building, or top-level group, is shown once it is marked.

## Test 20

### File residence:
`js/tests/behaviour/branches_test.js`, lines 26-27, in `buildingMarks()`

### Purpose:
Requirement 24: "Full" for a building with multiple child nodes

### Assertion expectation:
The one filter of a marked building with several rows reads "Full" and its name.

## Test 21

### File residence:
`js/tests/behaviour/branches_test.js`, line 29, in `buildingMarks()`; `js/tests/behaviour/lines_test.js`, line 62, in
`parents()`

### Purpose:
Requirement 26: a white dash for descendants of several values

### Assertion expectation:
A building with one row cleared, or with all but itself marked, has state mixed and its box draws a white dash.

## Test 22

### File residence:
`js/tests/behaviour/branches_test.js`, lines 37, 39, in `lineFilters()`; line 60, in `singleLines()`;
`js/tests/behaviour/lines_test.js`, line 44, in `lineTops()`

### Purpose:
Requirement 25: a line's filter entry is titled as its deepest descendant, in Fortifications too

### Assertion expectation:
The one filter of a marked line, a line marked from its end, and a line in a group of lines, names its deepest must-have
item.

## Test 23

### File residence:
`js/tests/behaviour/branches_test.js`, lines 42-43, in `lineFilters()`

### Purpose:
Rule 4: a filter button clears its kind of mark from its line, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
With the end must lack and the rest must have, the must-have button leaves the rest unmarked.

## Test 24

### File residence:
`js/tests/behaviour/branches_test.js`, line 44, in `lineFilters()`

### Purpose:
Rule 4: a filter button clears only its kind of mark, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
With the end must lack and the rest must have, the must-have button leaves the end must lack.

## Test 25

### File residence:
`js/tests/behaviour/branches_test.js`, lines 49-50, in `singleLines()`

### Purpose:
Requirement 24: no "Full" for a building with a single child node

### Assertion expectation:
Marking a building whose one row starts a single line gives one filter named after the line's end.

## Test 26

### File residence:
`js/tests/behaviour/branches_test.js`, line 51, in `singleLines()`

### Purpose:
Requirement 24: no "Full" for a building without child nodes

### Assertion expectation:
Marking a building with no rows gives one filter with its own name.

## Test 27

### File residence:
`js/tests/behaviour/branches_test.js`, line 55, in `singleLines()`; `js/tests/behaviour/lines_test.js`, lines 31, 38, in
`lineTops()`; line 97, in `evenLine()`; line 105, in `unevenLine()`; line 118, in `beyond()`

### Purpose:
Requirement 30: no value passes to a unit or technology of another civilisation count

### Assertion expectation:
At a line's top, inside a line, in a group of lines and above a unique edge case, no item with other civilisations below
the marked one is marked.

## Test 28

### File residence:
`js/tests/behaviour/branches_test.js`, lines 76-77, in `groupMarks()`

### Purpose:
Regression: marking a group greyed out what it marked ([2026-10-24](DEVLOG/DEVLOG3.md#the-drop-off-site-variants-hold-what-they-replace-as-the-fortified-church-does))

### Assertion expectation:
After a click on a top-level group, no row in it has the class `barred`.

## Test 29

### File residence:
`js/tests/pictures/pictures_test.js`, lines 47-48, in `screenTests()`; `js/tests/audit_test.js`, lines 119-120, in
`layoutChecks()`; `js/tests/behaviour/tree_test.js`, lines 30-31, in `crowding()`

### Purpose:
Rule 12: no page scrolling

### Assertion expectation:
The page is no higher and no wider than the window, without Simple UI at the start and in every audit. With everything
open and the most civilisations listed, the page is no larger than the window (audit checks the other states).

## Test 30

### File residence:
`js/tests/behaviour/tree_test.js`, lines 32-34, in `crowding()`

### Purpose:
Regression: on a phone the tree's header spilled over the other pane ([2026-10-21](DEVLOG/DEVLOG2.md#the-phone-layout-and-test-15))

### Assertion expectation:
With everything open and the most civilisations listed, each pane's header ends within the pane.

## Test 31

### File residence:
`js/tests/behaviour/tree_test.js`, lines 35-36, in `crowding()`

### Purpose:
Regression: on a phone the tree pane was crushed under the other ([2026-10-21](DEVLOG/DEVLOG2.md#the-phone-layout-and-test-15))

### Assertion expectation:
In the same state, the tree pane ends above or left of the civilisations pane.

## Test 32

### File residence:
`js/tests/behaviour/tree_test.js`, lines 37-38, in `crowding()`

### Purpose:
Regression: on a phone the list did not scroll in its pane ([2026-10-21](DEVLOG/DEVLOG2.md#the-phone-layout-and-test-15))

### Assertion expectation:
In the same state, a list taller than its box scrolls while the civilisations pane stays put.

## Test 33

### File residence:
`js/tests/behaviour/tree_test.js`, lines 39-40, in `crowding()`

### Purpose:
Regression: phone panes of unequal height ([2026-10-24](DEVLOG/DEVLOG3.md#phone-panes-of-equal-fixed-height-requirement-35-rule-18))

### Assertion expectation:
Where the panes are in a grid, they differ in height by half a pixel at most.

## Test 34

### File residence:
`js/tests/behaviour/tree_test.js`, line 41, in `crowding()`

### Purpose:
Requirement 35: no panel resizes upon user interaction

### Assertion expectation:
Where the panes are in a grid, Expand all and a mark leave both panes' width and height as they were.

## Test 35

### File residence:
`js/tests/behaviour/tree_test.js`, line 42, in `crowding()`

### Purpose:
Rule 18: no UI element moves upon user interaction

### Assertion expectation:
Where the panes are in a grid, Expand all and a mark leave both panes' left and top edges where they were.

## Test 36

### File residence:
`js/tests/behaviour/marking_test.js`, line 82, in `gestures()`

### Purpose:
Requirement 3: must lack by long press

### Assertion expectation:
A touch held past `LONG_PRESS_MS` marks the item must lack.

## Test 37

### File residence:
`js/tests/behaviour/marking_test.js`, line 84, in `gestures()`

### Purpose:
Rule 4: a mark given again is cleared, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#marking-opens-what-it-marks-requirements-28-to-31))

### Assertion expectation:
A right-click by pointer events on a must-lack item leaves it unmarked.

## Test 38

### File residence:
`js/tests/behaviour/marking_test.js`, line 87, in `gestures()`

### Purpose:
Requirement 3: must lack by right-click

### Assertion expectation:
A right-click by pointer events on an unmarked item marks it must lack.

## Test 39

### File residence:
`js/tests/behaviour/lines_test.js`, lines 30, 37, in `lineTops()`; line 96, in `evenLine()`; line 104, in `unevenLine()`

### Purpose:
Requirement 29: descendants with the same civilisations get the same value

### Assertion expectation:
Must have or must lack at a line's top, or inside a line, marks each only child below with the same civilisations.

## Test 40

### File residence:
`js/tests/behaviour/lines_test.js`, lines 35, 41, in `lineTops()`

### Purpose:
Regression: a second click on a line's top marked it again ([2026-10-19](DEVLOG/DEVLOG1.md#marking-opens-what-it-marks-requirements-28-to-31))

### Assertion expectation:
A second click, or a second X, on a marked line's top leaves the whole line unmarked.

## Test 41

### File residence:
`js/tests/behaviour/lines_test.js`, line 43, in `lineTops()`; line 60, in `parents()`; line 95, in `evenLine()`

### Purpose:
Requirement 34: a prerequisite node is enabled with its descendant

### Assertion expectation:
Must have on a line's end, inside a line, or on every end in a building, marks every unit or technology above.

## Test 42

### File residence:
`js/tests/behaviour/lines_test.js`, lines 47-48, in `lineTops()`

### Purpose:
Regression: X on a fully marked line did nothing ([2026-10-19](DEVLOG/DEVLOG1.md#marking-opens-what-it-marks-requirements-28-to-31))

### Assertion expectation:
X on the top of a line marked must have to its end leaves no item of the line must have.

## Test 43

### File residence:
`js/tests/behaviour/lines_test.js`, lines 61, 69, in `parents()`

### Purpose:
Requirement 34: not for building nodes

### Assertion expectation:
A building stays unmarked when all in it is marked, and stays must lack when all under it is marked must have.

## Test 44

### File residence:
`js/tests/behaviour/greying_test.js`, line 27, in `rivals()`

### Purpose:
Rule 4: an item and the branch it excludes grey each other out, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-xolotl-warrior-and-the-stable-grey-each-other-out))

### Assertion expectation:
Must have on an item that excludes its building greys out exactly that building and all in it but the item.

## Test 45

### File residence:
`js/tests/behaviour/greying_test.js`, line 28, in `rivals()`

### Purpose:
Rule 4: a branch holding its own rival stays open, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-xolotl-warrior-and-the-stable-grey-each-other-out))

### Assertion expectation:
The marked item is still shown after its building is greyed out.

## Test 46

### File residence:
`js/tests/behaviour/greying_test.js`, line 29, in `rivals()`; line 99, in `shuts()`

### Purpose:
Rule 4: a greyed-out branch closes, as decided ([2026-10-24](DEVLOG/DEVLOG3.md#greyed-out-instead-of-hidden))

### Assertion expectation:
Every row greyed out by an excluding item, and an open variant greyed out by another, is closed.

## Test 47

### File residence:
`js/tests/behaviour/greying_test.js`, lines 34-35, in `rivals()`

### Purpose:
Rule 4: the arrow of a branch holding its rival still works, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-xolotl-warrior-and-the-stable-grey-each-other-out))

### Assertion expectation:
The greyed-out building's arrow, not disabled and taking the pointer, closes it and opens it again.

## Test 48

### File residence:
`js/tests/behaviour/greying_test.js`, line 39, in `rivals()`; line 56, in `excludedBy()`; line 103, in `shuts()`

### Purpose:
Requirement 37: variant branches are mutually exclusive

### Assertion expectation:
Clicks and X on greyed-out rows, of an excluded branch, an excluding item or a variant, leave them unmarked.

## Test 49

### File residence:
`js/tests/behaviour/greying_test.js`, line 54, in `excludedBy()`

### Purpose:
Rule 4: an item and the branch it excludes grey each other out, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-xolotl-warrior-and-the-stable-grey-each-other-out))

### Assertion expectation:
Must have on the excluded building, or on a row deep in it, greys out exactly the excluding item.

## Test 50

### File residence:
`js/tests/behaviour/greying_test.js`, line 59, in `excludedBy()`

### Purpose:
Rule 6: the model guards its own marks, as decided ([2026-11-02](DEVLOG/DEVLOG6.md#004414-the-model-guards-its-own-marks-and-saves-its-own-state))

### Assertion expectation:
`toggleMark()` called directly with must have or must lack leaves a greyed-out item unmarked.

## Test 51

### File residence:
`js/tests/behaviour/greying_test.js`, lines 46-47, in `rivals()`

### Purpose:
Rule 4: must lack greys out nothing, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-xolotl-warrior-and-the-stable-grey-each-other-out))

### Assertion expectation:
With the excluding item and the excluded building both must lack, no row is greyed out.

## Test 52

### File residence:
`js/tests/behaviour/greying_test.js`, line 89, in `sharedRow()`

### Purpose:
Regression: a shared row was two items with two marks ([2026-10-24](DEVLOG/DEVLOG3.md#one-devotion-not-two))

### Assertion expectation:
A click on a stand-in's copy of a row marks the original must have too.

## Test 53

### File residence:
`js/tests/behaviour/greying_test.js`, line 90, in `sharedRow()`

### Purpose:
Rule 4: a shared row opens nothing in the other building, as decided ([2026-10-24](DEVLOG/DEVLOG3.md#one-devotion-not-two))

### Assertion expectation:
After the click, the building the original is in stays closed.

## Test 54

### File residence:
`js/tests/behaviour/greying_test.js`, line 91, in `sharedRow()`

### Purpose:
Regression: a shared row was two items with two marks ([2026-10-24](DEVLOG/DEVLOG3.md#one-devotion-not-two))

### Assertion expectation:
After the click, Filters holds one button, with the row's own name.

## Test 55

### File residence:
`js/tests/behaviour/greying_test.js`, line 100, in `shuts()`; line 128, in `variants()`

### Purpose:
Requirement 37: when a variant is enabled, all alternative branches are greyed out

### Assertion expectation:
For every variant, the greyed-out variants are exactly the alternatives of all marked items; the greyed one is faded.

## Test 56

### File residence:
`js/tests/behaviour/greying_test.js`, line 105, in `shuts()`

### Purpose:
Rule 4: a greyed-out branch cannot be opened, as decided ([2026-10-24](DEVLOG/DEVLOG3.md#greyed-out-instead-of-hidden))

### Assertion expectation:
A click on a greyed-out variant's arrow leaves it closed.

## Test 57

### File residence:
`js/tests/behaviour/greying_test.js`, lines 74, 77, in `standIns()`

### Purpose:
Requirement 37: alternatives are greyed out only while a variant is enabled

### Assertion expectation:
Clearing either variant's must have leaves the other not greyed out.

## Test 58

### File residence:
`js/tests/behaviour/greying_test.js`, lines 116-118, in `borrowedRows()`

### Purpose:
Rule 4: a stand-in holds the rows of what it replaces, as decided ([2026-10-24](DEVLOG/DEVLOG3.md#the-fortified-church-holds-the-monasterys-rows))

### Assertion expectation:
With Include ticked, each stand-in's copies are exactly the common and regional rows that what it replaces lends.

## Test 59

### File residence:
`js/tests/behaviour/lines_test.js`, lines 81-82, in `lines()`

### Purpose:
Requirement 28: a node given a value expands to its first fork or deepest descendant

### Assertion expectation:
After a click on a closed line's top, every item of its line is shown and every one with an arrow is open.

## Test 60

### File residence:
`js/tests/behaviour/lines_test.js`, line 106, in `unevenLine()`

### Purpose:
Rule 4: must lack never passes up, as decided ([2026-10-24](DEVLOG/DEVLOG3.md#must-have-passes-up-to-an-items-prerequisites-requirement-34))

### Assertion expectation:
X inside a line marks nothing outside the item's own branch.

## Test 61

### File residence:
`js/tests/behaviour/lines_test.js`, line 121, in `beyond()`

### Purpose:
Requirement 34: not for unique node edge cases

### Assertion expectation:
Must have on an item with civilisations the item above lacks leaves the item above unmarked.

## Test 62

### File residence:
`js/tests/behaviour/lines_test.js`, lines 123-124, in `beyond()`

### Purpose:
Requirement 34: a unique edge case keeps its own value

### Assertion expectation:
X on that item above leaves the item below it must have.

## Test 63

### File residence:
`js/tests/behaviour/lines_test.js`, lines 127-128, in `beyond()`

### Purpose:
Rule 4: rows under a left-out unique item stay in its place, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#upgrades-and-variants-moved-into-their-lines))

### Assertion expectation:
With Include unticked, the item below a left-out unique item hangs where that item was.

## Test 64

### File residence:
`js/tests/interface/menu_test.js`, line 21, in `menuTests()`; `js/tests/interface/options_test.js`, line 54, in
`optionKeys()`; line 78, in `confirmingOptions()`; line 81, in `confirmingOptions()`;
`js/tests/behaviour/lines_test.js`, line 129, in `beyond()`

### Purpose:
Rule 4: marks are kept when the options change, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#a-shorter-tree-by-default-and-an-options-window))

### Assertion expectation:
After a language change, Include, Include Regionals and Space on both boxes, the marked item stays must have and the
list still fits the mark. Shared name: behaviour checks it too. The item below the left-out unique item is still must
have once Include is unticked (the interface tests share it).

## Test 65

### File residence:
`js/tests/behaviour/tree_test.js`, lines 63, 72, in `countKinds()`

### Purpose:
Rule 4: no count on an empty top-level row, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#no-count-on-empty-roots-and-every-civilisation-listed-without-filters))

### Assertion expectation:
Closed, open and with marks, every top-level row no civilisation fits has an empty count and hidden text.

## Test 66

### File residence:
`js/tests/behaviour/tree_test.js`, lines 64-65, 72, in `countKinds()`

### Purpose:
Rule 4: two numbers on a closed item, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#two-numbers-on-closed-items))

### Assertion expectation:
Closed, with and without marks, every item with rows shows the range text of the fitting civilisations.

## Test 67

### File residence:
`js/tests/behaviour/tree_test.js`, lines 66, 72, in `countKinds()`

### Purpose:
Requirement 3: each node's compatible civilisations count

### Assertion expectation:
Open, with and without marks, every item with rows shows the number of fitting civilisations with it.

## Test 68

### File residence:
`js/tests/behaviour/tree_test.js`, lines 67, 72, in `countKinds()`

### Purpose:
Requirement 3: each node's compatible civilisations count

### Assertion expectation:
In every state, every item without rows shows the number of fitting civilisations with it.

## Test 69

### File residence:
`js/tests/behaviour/tree_test.js`, lines 68, 72, in `countKinds()`

### Purpose:
Requirement 3: each node's compatible civilisations count

### Assertion expectation:
In every state, every group shows the number of fitting civilisations with anything in it.

## Test 70

### File residence:
`js/tests/behaviour/tree_test.js`, lines 92-93, in `tree()`

### Purpose:
Requirement 18: Expand all expands all nodes

### Assertion expectation:
After Expand all, every row with an arrow is open and its list shown.

## Test 71

### File residence:
`js/tests/behaviour/tree_test.js`, line 95, in `tree()`

### Purpose:
Requirement 19: Collapse all collapses all nodes

### Assertion expectation:
After Collapse all, no row is open.

## Test 72

### File residence:
`js/tests/behaviour/tree_test.js`, line 99, in `tree()`

### Purpose:
Requirement 3: an expandable node tree

### Assertion expectation:
A second click on the first top-level row's arrow closes it and hides its list.

## Test 73

### File residence:
`js/tests/behaviour/tree_test.js`, line 106, in `tree()`

### Purpose:
Rule 4: opening a branch opens its whole line, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#opening-a-branch-opens-its-whole-line))

### Assertion expectation:
For every row with an arrow, its arrow from all closed opens exactly the row and its only children with arrows.

## Test 74

### File residence:
`js/tests/behaviour/finding_test.js`, lines 18, 27, in `finding()`

### Purpose:
Requirement 20: a node whose name is input is highlighted

### Assertion expectation:
With a name typed, exactly the items containing it are lit; with a word nothing contains, none is.

## Test 75

### File residence:
`js/tests/behaviour/finding_test.js`, lines 19-20, in `finding()`

### Purpose:
Requirement 20: highlighted in yellow

### Assertion expectation:
Every match's row background is yellow.

## Test 76

### File residence:
`js/tests/behaviour/finding_test.js`, line 21, in `finding()`

### Purpose:
Requirement 20: a node whose name is input is expanded to

### Assertion expectation:
Every match is shown.

## Test 77

### File residence:
`js/tests/behaviour/finding_test.js`, lines 22, 26, in `finding()`

### Purpose:
Requirement 21: a label shows how many nodes match

### Assertion expectation:
The label reads the plural "found" text for the number of matches, or the none-found text.

## Test 78

### File residence:
`js/tests/behaviour/finding_test.js`, lines 23, 28, in `finding()`; `js/tests/pictures/findbox_test.js`, lines 29 and
32, in `findBoxTests()` (shared: `NAMES.findBeside`, `beside()`)

### Purpose:
Requirement 21: the label is to the right of the search bar

### Assertion expectation:
With matches and without, the label starts right of the box, overlaps it vertically and is one line high (shared).
Without Simple UI, with a match and with none found, `#found` is right of `#find`, on its row, one line high.

## Test 79

### File residence:
`js/tests/behaviour/finding_test.js`, lines 49-50, in `dropsGreyed()`

### Purpose:
Regression: Find kept a match that a mark had greyed out ([2026-11-01](DEVLOG/DEVLOG5.md#121745-the-rest-of-model-view-and-controller-put-in-its-place))

### Assertion expectation:
A match in a branch that a mark then greys out loses its highlight, and the label counts the matches left.

## Test 80

### File residence:
`js/tests/behaviour/finding_test.js`, line 30, in `finding()`

### Purpose:
Requirement 21: the label counts what is input

### Assertion expectation:
With the search box emptied, the label is empty.

## Test 81

### File residence:
`js/tests/interface/menu_test.js`, line 47, in `menuOpening()`

### Purpose:
Requirement 8: the Options window holds a Language menu

### Assertion expectation:
The Options window contains the language button.

## Test 82

### File residence:
`js/tests/interface/menu_test.js`, line 48, in `menuOpening()`

### Purpose:
Rule 3, WCAG 2.4.3: focus starts on the window's first control

### Assertion expectation:
After a click on the Options button, the language button has focus.

## Test 83

### File residence:
`js/tests/interface/menu_test.js`, line 52, in `menuOpening()`

### Purpose:
Requirement 9: a left-click expands the menu

### Assertion expectation:
After a click on the language button, the language list is shown.

## Test 84

### File residence:
`js/tests/interface/menu_test.js`, lines 53-54, in `menuOpening()`

### Purpose:
Requirement 9: the menu shows the language options

### Assertion expectation:
The list has one option per language of data.json, each showing that language's name.

## Test 85

### File residence:
`js/tests/interface/menu_test.js`, lines 55-57, in `menuOpening()`

### Purpose:
Rule 3, WCAG 1.3.1: the language in use is marked in the code

### Assertion expectation:
Only the option of the language in use has aria-current="true".

## Test 86

### File residence:
`js/tests/interface/menu_test.js`, line 65, in `menuClosing()`

### Purpose:
Rule 3, WCAG 2.1.1: the menu closes from the keyboard

### Assertion expectation:
Escape on a focused language hides the list.

## Test 87

### File residence:
`js/tests/interface/menu_test.js`, line 66, in `menuClosing()`; line 86, in `menuChoosing()`

### Purpose:
Rule 3, WCAG 2.4.3: focus returns to the button that opened the menu

### Assertion expectation:
After Escape on a focused language, and after a click on a language, the language button has focus.

## Test 88

### File residence:
`js/tests/interface/menu_test.js`, line 68, in `menuClosing()`

### Purpose:
Rule 18: opening or closing the menu moves nothing on the screen

### Assertion expectation:
The Options window's width and height are the same before, while and after the menu is open.

## Test 89

### File residence:
`js/tests/interface/menu_test.js`, line 71, in `menuClosing()`; line 77, in `menuClosing()`; line 85, in
`menuChoosing()`

### Purpose:
Requirement 12: the menu closes when the user left-clicks

### Assertion expectation:
The list is hidden after a click between its languages, a left pointerdown on the window's title, and a choice.

## Test 90

### File residence:
`js/tests/interface/menu_test.js`, line 74, in `menuClosing()`

### Purpose:
Rule 4: the menu closes when focus leaves it, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#a-cogwheel-button-with-the-language-menu-in-the-options-window))

### Assertion expectation:
Focus moved to a button of the window outside the menu hides the list.

## Test 91

### File residence:
`js/tests/interface/menu_test.js`, line 87, in `menuChoosing()`

### Purpose:
Rule 3, WCAG 4.1.2: the button's name gives the chosen language

### Assertion expectation:
After a choice, the button's accessible name contains the chosen language's name.

## Test 92

### File residence:
`js/tests/interface/menu_test.js`, line 88, in `menuChoosing()`; `js/tests/interface/options_test.js`, line 44, in
`optionKeys()`; line 71, in `openingOptions()`

### Purpose:
Rule 4: changes in Options wait for OK, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#with-simple-ui-too-changes-in-options-wait-for-ok-and-focus-outlines-there-show-whole))

### Assertion expectation:
Before OK, a chosen language leaves the page's lang, and Include ticked by click or Space leaves the tree's items.

## Test 93

### File residence:
`js/tests/interface/menu_test.js`, line 90, in `menuChoosing()`

### Purpose:
Requirement 10: the menu's default is English

### Assertion expectation:
With no stored language and a German browser, the page takes the address's lng if valid, else English.

## Test 94

### File residence:
`js/tests/interface/menu_test.js`, lines 91-92, in `menuChoosing()`

### Purpose:
Rule 4: the chosen language is kept in the address, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
After OK, the address's lng is the chosen language (not checked on file://).

## Test 95

### File residence:
`js/tests/interface/languages_test.js`, lines 25-26, in `languageTests()`

### Purpose:
Requirement 11: the page's language changes to the language the user left-clicks

### Assertion expectation:
Every [data-text] element shows its key's text in the chosen language; a failure names the keys.

## Test 96

### File residence:
`js/tests/interface/languages_test.js`, lines 27-29, in `languageTests()`

### Purpose:
Requirement 11: the page's language changes to the language the user left-clicks

### Assertion expectation:
Every row's label is its item's or group's name in the chosen language; a failure names the items.

## Test 97

### File residence:
`js/tests/interface/languages_test.js`, lines 30-31, in `languageTests()`

### Purpose:
Rule 4: no placeholder is shown, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
No visible text holds { or }.

## Test 98

### File residence:
`js/tests/interface/languages_test.js`, lines 40-41, in `footerTexts()`

### Purpose:
Requirement 5: the footer names the update the data is from

### Assertion expectation:
#updateLink is in #source and reads the chosen language's update text with the update's number.

## Test 99

### File residence:
`js/tests/interface/languages_test.js`, lines 42-43, in `footerTexts()`

### Purpose:
Rule 4: the footer gives Microsoft's notice in English, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles))

### Assertion expectation:
#notice reads data.json's notice with the rules' and the project's names filled in.

## Test 100

### File residence:
`js/tests/interface/languages_test.js`, lines 47-48, in `footerOnce()`

### Purpose:
Requirement 5: the footer says where the data is from

### Assertion expectation:
#sourceLink is in #source and shows data.json's source name.

## Test 101

### File residence:
`js/tests/interface/languages_test.js`, lines 49-51, in `footerOnce()`

### Purpose:
Rule 4: the footer links the source, notes, rules and project, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles))

### Assertion expectation:
Each of the four footer links is in its span with the href data.json gives it; a failure names the links.

## Test 102

### File residence:
`js/tests/interface/languages_test.js`, line 52, in `footerOnce()`

### Purpose:
Rule 3, WCAG 3.1.2: the English notice is marked with its language

### Assertion expectation:
#notice has lang="en".

## Test 103

### File residence:
`js/tests/interface/languages_test.js`, line 53, in `footerOnce()`; `js/tests/pictures/pictures_test.js`, line 49, in
`screenTests()` (shared: `NAMES.footerWide`, `footerAsWide()`)

### Purpose:
Rule 4: the footer spans the panes, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#simple-ui-a-full-width-footer-and-civilisations-without-links))

### Assertion expectation:
footerAsWide(): off a phone, the footer is as wide as the panes, within a pixel. Shared name: pictures too. Without
Simple UI, off phones, `.foot` is as wide as `.panes`, to within 1 pixel.

## Test 104

### File residence:
`js/tests/interface/languages_test.js`, line 54, in `footerOnce()`; `js/tests/pictures/pictures_test.js`, line 50, in
`screenTests()` (shared: `NAMES.footerHidden`, `footerHidden()`)

### Purpose:
Rule 4: phones show no footer, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#no-footer-on-phones))

### Assertion expectation:
footerHidden(): on a phone, the footer is not displayed. Shared name: pictures too. Without Simple UI, on a phone
layout, `.foot` has `display: none`.

## Test 105

### File residence:
`js/tests/interface/languages_test.js`, lines 60-61, in `civList()`

### Purpose:
Requirement 11: the page's language changes to the language the user left-clicks

### Assertion expectation:
The list is not empty and each name in it is a civilisation's name in the chosen language.

## Test 106

### File residence:
`js/tests/interface/languages_test.js`, lines 62-63, in `civList()`

### Purpose:
Rule 4: civilisations are sorted in the language's order, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
The listed names are in the order of the chosen language's collator.

## Test 107

### File residence:
`js/tests/interface/options_test.js`, line 26, in `optionTests()`; line 52, in `optionKeys()`; line 77, in
`confirmingOptions()`

### Purpose:
Requirement 15: the checkbox's description is true when it is ticked

### Assertion expectation:
Unticked: no unique item, and no leaf that all, all but one or one civilisation has; ticked: every item.

## Test 108

### File residence:
`js/tests/interface/options_test.js`, line 27, in `optionTests()`; line 46, in `optionKeys()`; line 53, in
`optionKeys()`; line 80, in `confirmingOptions()`; line 85, in `confirmingOptions()`

### Purpose:
Rule 4: Include Regionals shows the regional items, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip))

### Assertion expectation:
Ticked, regional items are shown (all of them once ticked again); unticked, exactly the tree without them.

## Test 109

### File residence:
`js/tests/interface/options_test.js`, line 63, in `openingOptions()`

### Purpose:
Requirement 7: a left-click on the Options button opens the Options window

### Assertion expectation:
After a click on the Options button, the Options dialog is open.

## Test 110

### File residence:
`js/tests/interface/options_test.js`, line 64, in `openingOptions()`

### Purpose:
Requirement 13: the checkbox is off by default

### Assertion expectation:
On the first opening, Include is not ticked.

## Test 111

### File residence:
`js/tests/interface/options_test.js`, line 65, in `openingOptions()`

### Purpose:
Rule 4: Include Regionals is on by default, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip))

### Assertion expectation:
On the first opening, Include Regionals is ticked.

## Test 112

### File residence:
`js/tests/interface/options_test.js`, lines 66-67, in `openingOptions()`

### Purpose:
Requirement 16: the window has a Cancel and an OK button

### Assertion expectation:
The rendered buttons in OK's row are Cancel and OK, in that order.

## Test 113

### File residence:
`js/tests/interface/options_test.js`, lines 68-70, in `openingOptions()`

### Purpose:
Requirement 14: the checkbox shows a green tick when left-clicked

### Assertion expectation:
After a click, Include is ticked and its box is drawn as the must-have tick (drawn() is marks.has).

## Test 114

### File residence:
`js/tests/interface/options_test.js`, line 109, in `closedAndFocused()`

### Purpose:
Requirement 16: the window closes on a left-click on Cancel or OK

### Assertion expectation:
After OK, and after Cancel, the Options dialog is closed.

## Test 115

### File residence:
`js/tests/interface/options_test.js`, line 110, in `closedAndFocused()`

### Purpose:
Rule 3, WCAG 2.4.3: closing the window returns focus to the button that opened it

### Assertion expectation:
After OK, and after Cancel, the Options button has focus.

## Test 116

### File residence:
`js/tests/interface/options_test.js`, line 82, in `confirmingOptions()`; line 83, in `confirmingOptions()`;
`js/tests/pictures/tooltips_test.js`, line 58, in `silentTipTests()`; `js/tests/pictures/pictures_test.js`, line 128, in
`simpleUiTests()`; line 160, in `civViewTests()`

### Purpose:
Rule 4: the options are stored for the next visit, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#a-shorter-tree-by-default-and-an-options-window))

### Assertion expectation:
After OK, include is stored as "true" and regional as "false" (passes where storage is blocked). Shared name: pictures
checks it too. `tooltips` is stored as "false" after Tooltips is unticked, `simple` as "true" after Simple UI is ticked,
`civView` as "tile" after Tile is chosen, unless the browser has no storage.

## Test 117

### File residence:
`js/tests/interface/options_test.js`, line 97, in `cancellingOptions()`; line 102, in `cancellingOptions()`

### Purpose:
Rule 4: closing the window without OK drops its changes, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#with-simple-ui-too-changes-in-options-wait-for-ok-and-focus-outlines-there-show-whole))

### Assertion expectation:
After Cancel, and after closing the dialog, the tree's items and the language are as before.

## Test 118

### File residence:
`js/tests/interface/options_test.js`, line 99, in `cancellingOptions()`; line 104, in `cancellingOptions()`

### Purpose:
Rule 4: the window reopens showing the settings in use, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#cancel-and-ok-in-the-options-window-with-the-pictures))

### Assertion expectation:
Reopened after Cancel, Include and the language button show what is in use; after closing, Include does.

## Test 119

### File residence:
`js/tests/pictures/pictures_test.js`, lines 51-54, in `screenTests()`, with `misjudged()` and `fitted()` in
`js/tests/pictures/picturetools_test.js`, lines 37-50

### Purpose:
Regression: a 1366 by 768 laptop given the ultrawide pictures ([2026-10-27](DEVLOG/DEVLOG4.md#phones-on-the-full-hd-pictures-and-each-picture-asked-for-once))

### Assertion expectation:
`data-background` and `data-assets` suit this screen, and `screenPictures()` judges 11 sample screens as `fitted()`
does.

## Test 120

### File residence:
`js/tests/pictures/pictures_test.js`, lines 55-56, in `screenTests()`, with `withGrades()`

### Purpose:
Rule 4: the background by the screen's resolution, as decided ([2026-10-27](DEVLOG/DEVLOG4.md#pictures-by-the-screens-resolution-one-size-of-each))

### Assertion expectation:
With each of the four `data-background` values, `<body>` shows `ui/backgrounds/<value>.webp`.

## Test 121

### File residence:
`js/tests/pictures/pictures_test.js`, line 57, in `screenTests()`, with `wrongSizes()`, lines 65-72

### Purpose:
Rule 4: one size of each picture, by the screen's resolution, as decided ([2026-10-27](DEVLOG/DEVLOG4.md#pictures-by-the-screens-resolution-one-size-of-each))

### Assertion expectation:
With Options open, under each of the four grades, every picture named in a style, `::backdrop` included, is the grade's
background or its `_sd`/`_x1` or `_4k`/`_x2` size.

## Test 122

### File residence:
`js/tests/pictures/pictures_test.js`, line 58, in `screenTests()`, with `offParchment()`, lines 74-94

### Purpose:
Rule 4: the page on the parchment, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#the-page-sits-on-the-parchment-and-wcag-applies-to-simple-ui))

### Assertion expectation:
The header, `#content`, the panes and the footer lie within the parchment's `--left` to `--bottom` shares of the
background.

## Test 123

### File residence:
`js/tests/pictures/pictures_test.js`, line 59, in `screenTests()`, with `strayCursors()`, lines 96-101

### Purpose:
Rule 4: the sword cursor, the pointing hand over links, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles))

### Assertion expectation:
Every element shown has `cursor_pointing` inside a civilisation or footer link, `cursor_normal` elsewhere.

## Test 124

### File residence:
`js/tests/pictures/pictures_test.js`, lines 60-61, in `screenTests()`, with `bigCursors()`, lines 103-107

### Purpose:
Regression: the _x2 cursors drawn twice as large ([2026-10-30](DEVLOG/DEVLOG5.md#the-_x2-cursors-at-half-their-size))

### Assertion expectation:
Under both 4K grades, every cursor naming an `_x2` picture names it at `1.5x`.

## Test 125

### File residence:
`js/tests/pictures/pictures_test.js`, lines 111-112, in `optionsButtonTests()`

### Purpose:
Rule 4: the Options button's picture, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-picture-for-the-options-button))

### Assertion expectation:
`#optionsButton`'s background is `ui/buttons/options_sd.webp` or `_4k.webp`.

## Test 126

### File residence:
`js/tests/pictures/pictures_test.js`, lines 113-114, in `optionsButtonTests()`

### Purpose:
Rule 4: the Options button's normal picture at rest, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-picture-for-the-options-button))

### Assertion expectation:
Its `background-position` is 0 0.

## Test 127

### File residence:
`js/tests/pictures/pictures_test.js`, line 115, in `optionsButtonTests()`

### Purpose:
Rule 4: the Options button's ring, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-picture-for-the-options-button))

### Assertion expectation:
Its `box-shadow` is a 2-pixel ring of `#ee9d05`.

## Test 128

### File residence:
`js/tests/pictures/icons_test.js`, lines 48-49, in `boxTests()`, with `offSprite()`, lines 54-60

### Purpose:
Rule 4: the checkbox sheet's own sprites, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#checkbox-pictures))

### Assertion expectation:
With must have, must lack and mixed rows, every `.box` shows `checkboxes_*.webp` at 300% 300%, row 0, 50% or 100% by
state, with no drawn mark but a black dash when mixed.

## Test 129

### File residence:
`js/tests/pictures/icons_test.js`, lines 50-51, in `boxTests()`, with `offRadio()`, lines 62-67

### Purpose:
Rule 4: Civ view's radio buttons, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#civ-view-and-the-search-message-by-the-panes-edge))

### Assertion expectation:
Each `#views` input shows `radiobutton_*.webp` at 200% 200%, the top row, or the bottom one when chosen.

## Test 130

### File residence:
`js/tests/pictures/icons_test.js`, lines 32-33, in `iconTests()`

### Purpose:
Rule 4: icons in the tree, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#icons-in-the-tree))

### Assertion expectation:
With Include ticked, a row has `.node-icon` exactly when `data.pictures` or `data.icons.groups` has its key.

## Test 131

### File residence:
`js/tests/pictures/icons_test.js`, line 90, in `treeIconTests()`, with `cellIn()` and `offCell()`, lines 124-138

### Purpose:
Rule 4: icons from atlases, as decided ([2026-10-27](DEVLOG/DEVLOG4.md#icons-from-atlases))

### Assertion expectation:
Each icon shows its kind's atlas, unrepeated, in its content box, sized and placed at its picture's cell in file-name
order, row by row.

## Test 132

### File residence:
`js/tests/pictures/icons_test.js`, lines 91-93, in `treeIconTests()`

### Purpose:
Rule 4: icons in the tree, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#icons-in-the-tree))

### Assertion expectation:
Each icon's previous sibling is its row's `.box` and its next one the row's label.

## Test 133

### File residence:
`js/tests/pictures/icons_test.js`, lines 94-95, in `treeIconTests()`

### Purpose:
Rule 4: icons in the tree, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#icons-in-the-tree))

### Assertion expectation:
Each icon's computed width and height are 44px.

## Test 134

### File residence:
`js/tests/pictures/icons_test.js`, lines 96-98, in `treeIconTests()`, with `edges()`, lines 69-74

### Purpose:
Regression: common technologies kept an old outline colour ([2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip))

### Assertion expectation:
An item's icon has a solid 2-pixel border of its kind and reach's colour in `colour_key.csv`; a group's is transparent.

## Test 135

### File residence:
`js/tests/pictures/icons_test.js`, lines 118-119, in `civIconTests()`

### Purpose:
Rule 4: each civilisation's icon before its name, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
The first child of every link in `#civs` is its `.civ-icon`.

## Test 136

### File residence:
`js/tests/pictures/icons_test.js`, lines 120-121, in `civIconTests()`, with `civIcons()` and `offCell()`

### Purpose:
Rule 4: the civilisations' icons from their atlas, as decided ([2026-10-27](DEVLOG/DEVLOG4.md#the-civilisations-atlas-in-two-sizes))

### Assertion expectation:
Each `.civ-icon` shows `civicon_atlas_*.webp` at its civilisation's cell, as tree icons do.

## Test 137

### File residence:
`js/tests/pictures/icons_test.js`, line 38, in `iconTests()`, with `atlases()` and `misfit()`, lines 142-153

### Purpose:
Rule 4: icons from atlases, as decided ([2026-10-27](DEVLOG/DEVLOG4.md#icons-from-atlases))

### Assertion expectation:
Every atlas shown is its columns by rows of 48-pixel cells, or of 60 or 104 for the civilisations'.

## Test 138

### File residence:
`js/tests/pictures/findbox_test.js`, lines 17-18, in `findBoxTests()`, with `framed()`, lines 38-40

### Purpose:
Rule 4: frames repeated, never stretched, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
`#find`'s border image is `textfield_9slice.webp`, sliced 15 with fill, 15px wide, repeated.

## Test 139

### File residence:
`js/tests/pictures/findbox_test.js`, lines 19-20 and 26-27, in `findBoxTests()`

### Purpose:
Rule 4: Find's search icon and clearing cross, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
Empty: the box's `::after` shows `search.webp` and `#clearFind` is hidden; with text: no `::after`, and `#clearFind`
shows `clear_search.webp`.

## Test 140

### File residence:
`js/tests/pictures/findbox_test.js`, lines 21-22, in `findBoxTests()`

### Purpose:
Regression: the Find box narrower than 325 pixels at 1920 by 1080 ([2026-10-21](DEVLOG/DEVLOG2.md#civ-view-and-the-search-message-by-the-panes-edge))

### Assertion expectation:
`#find` is the lesser of 325 pixels and its `.find` row less 96, to within 1 pixel.

## Test 141

### File residence:
`js/tests/pictures/findbox_test.js`, lines 23-24, in `findBoxTests()`

### Purpose:
Rule 4: the number found aligned right, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#civ-view-and-the-search-message-by-the-panes-edge))

### Assertion expectation:
`#found` has `text-align: right`.

## Test 142

### File residence:
`js/tests/pictures/findbox_test.js`, lines 28 and 31, in `findBoxTests()`

### Purpose:
Rule 18: the Find box keeps its size while one types

### Assertion expectation:
With a match and with none found, `#find` is exactly as wide as when empty.

## Test 143

### File residence:
`js/tests/pictures/findbox_test.js`, lines 44-45, in `crossTests()`

### Purpose:
Rule 4: Find's clearing cross, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
After a click on `#clearFind`, `#find` is empty, no row is `.found` and the cross is hidden.

## Test 144

### File residence:
`js/tests/pictures/findbox_test.js`, lines 46-47, in `crossTests()`

### Purpose:
Rule 4: Find's clearing cross, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
After the click, `#find` has focus.

## Test 145

### File residence:
`js/tests/pictures/findbox_test.js`, lines 48-50, in `crossTests()`

### Purpose:
Rule 4: no focus ring on the Find box, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#no-focus-ring-on-the-find-box))

### Assertion expectation:
With `#find` focused, its `outline-style` is `none`.

## Test 146

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 30-31, in `treeTipTests()`

### Purpose:
Rule 4: the tooltip over the tree, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
With the mouse over the first row, `#tip` shows `nodeTip`.

## Test 147

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 32-33, in `treeTipTests()`

### Purpose:
Rule 4: the tooltip's look, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
`#tip`'s background is `#d7b394`.

## Test 148

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 34-35, in `treeTipTests()`

### Purpose:
Rule 4: the tooltip by the cursor, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-find-box-of-fixed-width-and-the-tooltip-by-the-cursor))

### Assertion expectation:
Its top-left is 32 pixels right of and below the pointer, or it ends at the window's right margin, or sits 8 pixels
above the pointer.

## Test 149

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 36-37, in `treeTipTests()`

### Purpose:
Rule 4: the tooltip moves in from the window's edges, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#unstretched-frames-new-buttons-a-find-box-a-tooltip-and-civilisation-icons))

### Assertion expectation:
`#tip` keeps `TIP_MARGIN` from the window's left and right edges.

## Test 150

### File residence:
`js/tests/pictures/tooltips_test.js`, line 44, in `includeTipTests()`

### Purpose:
Rule 4: the tooltip over the Options window, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip))

### Assertion expectation:
With the mouse over Include, `#tip` shows and lies inside the open `#options`.

## Test 151

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 45-46, in `includeTipTests()`

### Purpose:
Rule 4: Include's tooltip worded as the others, as decided ([2026-10-31](DEVLOG/DEVLOG5.md#141657-includes-tooltip-worded-as-the-other-settings))

### Assertion expectation:
`#tip` shows `includeTip`.

## Test 152

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 47-48, in `includeTipTests()`

### Purpose:
Rule 4: Include's description hidden with the pictures, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip))

### Assertion expectation:
`#includeHint` is at most 1 pixel wide.

## Test 153

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 49-50, in `includeTipTests()`

### Purpose:
Rule 4: screen readers still read Include's description, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#include-regionals-and-the-include-description-as-a-tooltip))

### Assertion expectation:
`#include` has `aria-describedby="includeHint"`.

## Test 154

### File residence:
`js/tests/pictures/tooltips_test.js`, line 57, in `silentTipTests()`

### Purpose:
Rule 4: the Tooltips setting, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#compliance-with-rulesmd-and-requirementsmd-and-jsuijs-split-in-three))

### Assertion expectation:
After Tooltips is unticked and OK pressed, `#tip` stays hidden with the mouse over a row.

## Test 155

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 78-79, in `everyTipTests()`, with `tipsOver()`, lines 84-93

### Purpose:
Rule 4: a tooltip on every control, as decided ([2026-10-31](DEVLOG/DEVLOG5.md#134337-tooltips-on-every-control-civilisations-in-a-new-tab-and-the-combo-box-in-its-corner))

### Assertion expectation:
With all open, a mark and a search, then in Options and its language list, every enabled control but a link shows a
tooltip, of at most 100 characters unless it is `#find`.

## Test 156

### File residence:
`js/tests/pictures/tooltips_test.js`, lines 80-81, in `everyTipTests()`

### Purpose:
Rule 4: a link's tooltip shows its address, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#a-full-width-footer-civilisation-links-the-pointing-hand-and-six-tiles))

### Assertion expectation:
In the same states, the tooltip over every link is its `href`.

## Test 157

### File residence:
`js/tests/pictures/treebuttons_test.js`, lines 14, 19 and 22, in `treeButtonTests()`, with `showing()`

### Purpose:
Rule 4: two tree buttons with the pictures, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#two-tree-buttons-with-the-pictures))

### Assertion expectation:
Clear and Expand all show with every branch closed and with a mark or an inner branch open; Clear and Collapse all after
Expand all.

## Test 158

### File residence:
`js/tests/pictures/treebuttons_test.js`, lines 40-43, in `sideBySide()`

### Purpose:
Rule 4: two tree buttons with the pictures, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#two-tree-buttons-with-the-pictures))

### Assertion expectation:
The two run from the pane head's left padding to its right one, level and equally wide.

## Test 159

### File residence:
`js/tests/pictures/treebuttons_test.js`, lines 47-48, in `looks()`, with `cut()`, lines 71-74

### Purpose:
Rule 4: two tree buttons with the pictures, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#two-tree-buttons-with-the-pictures))

### Assertion expectation:
In every language, closed and open, each shows `button_*.webp` at 100% 300%, no end caps, in its 290 by 50 proportions.

## Test 160

### File residence:
`js/tests/pictures/treebuttons_test.js`, lines 49-51, in `looks()`

### Purpose:
Rule 4: two tree buttons with the pictures, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#two-tree-buttons-with-the-pictures))

### Assertion expectation:
In the same states, each button's caption fits its width.

## Test 161

### File residence:
`js/tests/pictures/treebuttons_test.js`, lines 24-25, in `treeButtonTests()`

### Purpose:
Rule 18: the tree's buttons stay put when Expand all turns to Collapse all

### Assertion expectation:
After Expand all, the buttons shown have the same places and sizes as with every branch closed.

## Test 162

### File residence:
`js/tests/pictures/treebuttons_test.js`, lines 26 and 28, in `treeButtonTests()`

### Purpose:
Rule 4: the toggle hands focus on, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#two-tree-buttons-with-the-pictures))

### Assertion expectation:
A focused Expand all, clicked, leaves focus on Collapse all, and Collapse all on Expand all.

## Test 163

### File residence:
`js/tests/pictures/treebuttons_test.js`, lines 57-58, in `everyLanguage()`

### Purpose:
Rule 18: the tree's buttons stay put when the language changes

### Assertion expectation:
In every language, the buttons' left edges, widths and heights are those in English.

## Test 164

### File residence:
`js/tests/pictures/pictures_test.js`, lines 124 and 134, in `simpleUiTests()`

### Purpose:
Rule 18: the Simple UI box stays put when clicked

### Assertion expectation:
The Simple UI box is where it was before each click, ticking with the pictures and unticking without.

## Test 165

### File residence:
`js/tests/pictures/pictures_test.js`, line 126, in `simpleUiTests()`

### Purpose:
Requirement 33: no images with Simple UI

### Assertion expectation:
After Simple UI is ticked and OK pressed, no `<img>` and no element with a picture in its styles is left.

## Test 166

### File residence:
`js/tests/pictures/pictures_test.js`, lines 127 and 137, in `simpleUiTests()`

### Purpose:
Rule 4: civilisations without links with Simple UI, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#simple-ui-a-full-width-footer-and-civilisations-without-links))

### Assertion expectation:
With Simple UI no civilisation is a link; without it every one is.

## Test 167

### File residence:
`js/tests/pictures/pictures_test.js`, lines 129-130, in `simpleUiTests()`

### Purpose:
Requirement 2: the title is the phrase (Requirement 0: Simple UI)

### Assertion expectation:
The `<h1>` shows one part, the `title` text.

## Test 168

### File residence:
`js/tests/pictures/pictures_test.js`, lines 138-140, in `simpleUiTests()`

### Purpose:
Rule 4: Simple UI can be turned off again, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#background-pictures-and-a-simple-ui-option-requirements-32-and-33-rule-22))

### Assertion expectation:
After unticking and OK, with Options open, the elements with pictures are those before ticking.

## Test 169

### File residence:
`js/tests/pictures/pictures_test.js`, lines 162-163, in `civViewTests()`, with `pickView()`, lines 166-170, and
`sideBySide()`, lines 172-175

### Purpose:
Requirement 16: OK applies any changes, here the Civ view

### Assertion expectation:
After Tile and OK, the first two civilisations sit side by side in one row; after List and OK, they do not.

## Test 170

### File residence:
`js/tests/pictures/scrollbars_test.js`, line 29, in `scrollBarTests()`, with `ownBars()`, lines 54-55

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
Every list with a bar has `scrollbar-width: none`.

## Test 171

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 62-63, in `barStates()`

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
Closed, open with a filter, scrolled to the end, in Options and with the language list open, a bar shows exactly when
its list holds more than it shows.

## Test 172

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 98-100, `unloadedSheets()`, run by `barStates()`, lines 65-67

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
Each shown bar's arrow and knob sheets load within 10 seconds.

## Test 173

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 102-106, `offEdge()`, run by `barStates()`

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
Each shown bar ends at its list's inner right edge, from its top, as high as its client area.

## Test 174

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 108-111, `outOfRoom()`, run by `barStates()`; line 36, in
`scrollBarTests()`

### Purpose:
Rule 18: a scroll bar coming or going moves nothing in its list

### Assertion expectation:
Each shown bar lies in its list's right padding, and the tree is as wide with its bar as without.

## Test 175

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 113-128, `wrongSprites()` and `sprite()`, run by `barStates()`

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
Arrows, body and knob show their sheets' normal frames at their sizes, repeats and positions; the language list's arrows
show the combo box's.

## Test 176

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 130-133, `unequal()`, run by `barStates()`

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
Body, knob and, but on the language list, arrows are as wide as the bar.

## Test 177

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 135-140, `misshapen()`, run by `barStates()`

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
Arrows (but the language list's) and knob have the height-to-width ratio of a frame of their sheet.

## Test 178

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 142-146, `strayKnob()`, run by `barStates()`

### Purpose:
Rule 4: the game's scroll bars, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
The knob's top is as far down the body's free height as the list is scrolled, to within 1 pixel.

## Test 179

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 156-157, in `scrollTests()`

### Purpose:
Rule 11: scrolling without animation

### Assertion expectation:
A press and release on the open tree's down arrow scrolls it from 0 to `LINE_PX` at once.

## Test 180

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 160-161, in `scrollTests()`

### Purpose:
Rule 11: scrolling without animation

### Assertion expectation:
A wheel turn of 100 pixels over the tree's bar scrolls the tree 100 pixels at once.

## Test 181

### File residence:
`js/tests/pictures/scrollbars_test.js`, line 44, in `scrollBarTests()`, with `comboArrows()`, lines 164-171

### Purpose:
Rule 4: the combo box's arrows on the list's bar, as decided ([2026-10-31](DEVLOG/DEVLOG5.md#135431-the-combo-boxs-arrow-further-in-and-the-language-lists-own-scroll-bar))

### Assertion expectation:
Under all four grades, its arrows are 19 by 14 pixels, or 35 by 28 screen pixels in 4K, centred on the bar.

## Test 182

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 176-178, in `languageWheel()`

### Purpose:
Rule 11: the language list scrolls at once, without smooth scrolling

### Assertion expectation:
A wheel turn over the open list scrolls it by one language's height, or to its end, at once.

## Test 183

### File residence:
`js/tests/pictures/scrollbars_test.js`, line 49, in `scrollBarTests()`, with `ownBars()`

### Purpose:
Rule 4: the browser's scroll bars with Simple UI, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
With Simple UI, every list with a bar has `scrollbar-width: auto`.

## Test 184

### File residence:
`js/tests/pictures/scrollbars_test.js`, lines 50-51, in `scrollBarTests()`

### Purpose:
Rule 4: the browser's scroll bars with Simple UI, as decided ([2026-10-30](DEVLOG/DEVLOG5.md#two-style-sheets-in-css-the-scripts-in-model-view-and-controller-and-the-games-scroll-bars))

### Assertion expectation:
With Simple UI, every game bar is hidden.

## Test 185

### File residence:
`js/tests/interface/uniques_test.js`, line 34, in `inLine()`; line 47, in `inGroup()`

### Purpose:
Requirement 36: a unique node always has its own filter entry if enabled

### Assertion expectation:
Marked must have, the unique item has its own filter button beside its line's, and beside its full group's.

## Test 186

### File residence:
`js/tests/interface/uniques_test.js`, lines 36-37, in `inLine()`

### Purpose:
Requirement 36: a unique node always has its own filter entry if enabled

### Assertion expectation:
Its own button clears the unique item and leaves its line's last item marked, with only that filter left.

## Test 187

### File residence:
`js/tests/interface/uniques_test.js`, line 41, in `inLine()`; line 49, in `inGroup()`

### Purpose:
Requirement 36: a unique node always has its own filter entry if enabled

### Assertion expectation:
The line's or the group's filter button clears the rest and leaves the unique item marked, with only its filter.

## Test 188

### File residence:
`js/tests/interface/uniques_test.js`, lines 20-21, in `uniqueFilterTests()`

### Purpose:
Requirement 36: a line where every node is unique needs no entry per node

### Assertion expectation:
Marking the end of a wholly unique line gives one filter button, named after that end.

## Test 189

### File residence:
`js/tests/interface/headings_test.js`, lines 16-17, in `headingTests()`

### Purpose:
Requirement 3: some group nodes have no checkbox, those inside buildings, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-castles-unique-groups-are-headings-without-checkboxes))

### Assertion expectation:
The heading's row has no role, tabindex, aria-checked or box.

## Test 190

### File residence:
`js/tests/interface/headings_test.js`, line 19, in `headingTests()`

### Purpose:
Rule 4: a heading opens like a branch, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-castles-unique-groups-are-headings-without-checkboxes))

### Assertion expectation:
A click on the heading's name opens it.

## Test 191

### File residence:
`js/tests/interface/headings_test.js`, line 20, in `headingTests()`; line 24, in `headingTests()`

### Purpose:
Rule 4: a heading cannot be marked, as decided ([2026-10-26](DEVLOG/DEVLOG4.md#the-castles-unique-groups-are-headings-without-checkboxes))

### Assertion expectation:
After a click on its name, and after a right-click on it, no item is marked.

## Test 192

### File residence:
`js/tests/interface/headings_test.js`, line 29, in `headingTests()`

### Purpose:
Rule 3, WCAG 2.1.1: the keyboard reaches a heading

### Assertion expectation:
Down on the row above a heading moves focus to its arrow.

## Test 193

### File residence:
`js/tests/interface/keys_test.js`, lines 42-43, in `filterFocus()`

### Purpose:
Rule 3, WCAG 2.4.3: focus moves on when a filter button goes

### Assertion expectation:
After the first of two filter buttons is clicked, the one left has focus.

## Test 194

### File residence:
`js/tests/interface/keys_test.js`, lines 45-46, in `filterFocus()`

### Purpose:
Rule 3, WCAG 2.4.3: focus moves on when the last filter button goes

### Assertion expectation:
After the last filter button is clicked, the civilisations heading has focus.

## Test 195

### File residence:
`js/tests/interface/keys_test.js`, line 47, in `filterFocus()`

### Purpose:
Requirement 4: the output panel lists the compatible civilisations

### Assertion expectation:
With every filter cleared, every civilisation is listed, in order, and the none-found text is hidden.

## Test 196

### File residence:
`js/tests/interface/keys_test.js`, line 48, in `filterFocus()`

### Purpose:
Requirement 22: the Filters list appears only while a checkbox has a value

### Assertion expectation:
With every filter cleared, the Filters list is hidden.

## Test 197

### File residence:
`js/tests/interface/keys_test.js`, lines 56-57, in `treeMoves()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Right on a closed line opens it and each item down its chain, and nothing else.

## Test 198

### File residence:
`js/tests/interface/keys_test.js`, line 74, in `stepKeys()`

### Purpose:
Rule 4: Up on the first row keeps focus there, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
Up on the first row leaves focus on it.

## Test 199

### File residence:
`js/tests/interface/keys_test.js`, line 76, in `stepKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Down on the first row moves focus to the second.

## Test 200

### File residence:
`js/tests/interface/keys_test.js`, line 78, in `stepKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Up on the second row moves focus to the first.

## Test 201

### File residence:
`js/tests/interface/keys_test.js`, lines 85-86, in `branchKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Right on an open branch moves focus to its first child.

## Test 202

### File residence:
`js/tests/interface/keys_test.js`, line 88, in `branchKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Left on a child moves focus to its branch.

## Test 203

### File residence:
`js/tests/interface/keys_test.js`, line 90, in `branchKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Left on an open branch closes it.

## Test 204

### File residence:
`js/tests/interface/keys_test.js`, line 62, in `treeMoves()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
End moves focus to the last row.

## Test 205

### File residence:
`js/tests/interface/keys_test.js`, line 64, in `treeMoves()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Home moves focus to the first row.

## Test 206

### File residence:
`js/tests/interface/keys_test.js`, line 67, in `treeMoves()`

### Purpose:
Rule 3, WCAG 2.1.1: the tree works from the keyboard

### Assertion expectation:
Down on the first branch's arrow moves focus to the second branch's arrow.

## Test 207

### File residence:
`js/tests/interface/keys_test.js`, lines 98-99, in `findKey()`

### Purpose:
Rule 3, WCAG 2.1.1: the Find box works from the keyboard

### Assertion expectation:
Enter in the Find box moves focus to the first row whose name contains the search.

## Test 208

### File residence:
`js/tests/audit_test.js`, line 41, in `structureChecks()`

### Purpose:
Rule 3, WCAG 2.4.2: page titled

### Assertion expectation:
`document.title` is not empty.

## Test 209

### File residence:
`js/tests/audit_test.js`, line 42, in `structureChecks()`

### Purpose:
Rule 3, WCAG 3.1.1: language of page

### Assertion expectation:
`<html lang>` is the current language's tag.

## Test 210

### File residence:
`js/tests/audit_test.js`, lines 43-44, in `structureChecks()`

### Purpose:
Rule 3, WCAG 3.1.2: language of parts

### Assertion expectation:
Every `lang` attribute matches `TAG`.

## Test 211

### File residence:
`js/tests/audit_test.js`, lines 45-46, in `structureChecks()`

### Purpose:
Rule 3, WCAG 3.1.2: language of parts

### Assertion expectation:
Each language option's `lang` is its language's tag.

## Test 212

### File residence:
`js/tests/audit_test.js`, lines 47-48, in `structureChecks()`

### Purpose:
Rule 3, WCAG 1.3.1: info and relationships

### Assertion expectation:
There is exactly one `<header>`, one `<main>` and one `<footer>`.

## Test 213

### File residence:
`js/tests/audit_test.js`, line 58, in `headingChecks()`

### Purpose:
Rule 3, WCAG 1.3.1: info and relationships

### Assertion expectation:
Exactly one rendered heading is an `<h1>`.

## Test 214

### File residence:
`js/tests/audit_test.js`, line 59, in `headingChecks()`

### Purpose:
Rule 3, WCAG 2.4.6: headings and labels

### Assertion expectation:
No rendered heading is empty.

## Test 215

### File residence:
`js/tests/audit_test.js`, lines 60-61, in `headingChecks()`

### Purpose:
Rule 3, WCAG 1.3.1: info and relationships

### Assertion expectation:
No rendered heading is more than one level below the one before it.

## Test 216

### File residence:
`js/tests/audit_test.js`, line 50, in `structureChecks()`, with `unmatched()`, lines 64-72

### Purpose:
Rule 3, WCAG 4.1.2: name, role, value

### Assertion expectation:
Every id in `aria-labelledby`, `aria-controls` and `aria-describedby` is the id of exactly one element.

## Test 217

### File residence:
`js/tests/audit_test.js`, lines 77-82, in `controlChecks()`

### Purpose:
Rule 3, WCAG 4.1.2: name, role, value

### Assertion expectation:
Every checkbox has `aria-checked` true, false or mixed; every arrow and the language button have `aria-expanded`
matching their lists.

## Test 218

### File residence:
`js/tests/audit_test.js`, lines 84-85, in `controlChecks()`

### Purpose:
Rule 3, WCAG 4.1.2: name, role, value

### Assertion expectation:
Every rendered link, button, input and checkbox has an accessible name.

## Test 219

### File residence:
`js/tests/audit_test.js`, lines 86-88, in `controlChecks()`

### Purpose:
Rule 3, WCAG 2.5.3: label in name

### Assertion expectation:
Each visible text of a link, button or checkbox, letters and digits only, is in its name.

## Test 220

### File residence:
`js/tests/audit_test.js`, lines 94-101, in `colourChecks()`

### Purpose:
Rule 3, WCAG 1.4.6: contrast (enhanced)

### Assertion expectation:
Every element with text has 7:1 against its background, 4.5:1 at 24 pixels, or 18.66 bold.

## Test 221

### File residence:
`js/tests/audit_test.js`, lines 102-107, in `colourChecks()`

### Purpose:
Rule 3, WCAG 1.4.11: non-text contrast

### Assertion expectation:
Every bordered `.tool`, `.chip`, input and `.box` has 3:1 against its parent's background.

## Test 222

### File residence:
`js/tests/audit_test.js`, lines 114-118, in `layoutChecks()`

### Purpose:
Rule 3, WCAG 2.5.5: target size (enhanced)

### Assertion expectation:
Every focusable element but a link inside a sentence is at least 44 by 44 pixels.

## Test 223

### File residence:
`js/tests/audit_test.js`, lines 121-124, in `layoutChecks()`

### Purpose:
Rule 3, WCAG 1.4.10: reflow

### Assertion expectation:
No rendered element reaches past the window's left or right edge.

## Test 224

### File residence:
`js/tests/audit_test.js`, lines 125-126, in `layoutChecks()`

### Purpose:
Rule 3, WCAG 1.4.8: visual presentation

### Assertion expectation:
No rendered `<p>` or `<li>` has `text-align: justify`.

## Test 225

### File residence:
`js/tests/audit_test.js`, lines 127-130, in `layoutChecks()`

### Purpose:
Rule 3, WCAG 1.4.8: visual presentation

### Assertion expectation:
Every rendered `<p>` and `<li>` has a line height of at least 1.5 times its font size.

## Test 226

### File residence:
`js/tests/audit_test.js`, lines 35-36, in `audit()`

### Purpose:
Rule 9: no images (Rule 22: with Simple UI)

### Assertion expectation:
In every audited state, no image, media or embedding element, and no element with a picture in its styles.

## Test 227

### File residence:
`js/tests/audit_test.js`, lines 133-148, in `focusChecks()`, with `visibleCentre()`

### Purpose:
Rule 3, WCAG 2.4.12: focus not obscured (enhanced)

### Assertion expectation:
Focused in turn, every focusable element in the page or the open dialog is what lies at its visible centre.

## Test 228

### File residence:
`js/tests/interface/menu_test.js`, lines 32-33, in `menuKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the language menu works from the keyboard

### Assertion expectation:
Down on the closed menu's button opens the list with focus on the language in use.

## Test 229

### File residence:
`js/tests/interface/menu_test.js`, lines 36-37, in `menuKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the language menu works from the keyboard

### Assertion expectation:
Down moves focus to the next language.

## Test 230

### File residence:
`js/tests/interface/menu_test.js`, line 39, in `menuKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the language menu works from the keyboard

### Assertion expectation:
End moves focus to the last language.

## Test 231

### File residence:
`js/tests/interface/keys_test.js`, lines 131-134, in `textSpacing()`

### Purpose:
Rule 3, WCAG 1.4.12: wider text spacing loses nothing

### Assertion expectation:
With the text-spacing test class, the page is no wider than the window and nothing ends past its right edge.

## Test 232

### File residence:
`js/tests/interface/options_test.js`, line 43, in `optionKeys()`; line 50, in `optionKeys()`

### Purpose:
Rule 3, WCAG 2.1.1: the Options window's boxes work from the keyboard

### Assertion expectation:
Space flips Include and Include Regionals, from either state.

## Test 233

### File residence:
`js/tests/interface/options_test.js`, lines 152-153, in `languagePopupTests()`, with `failing()`, lines 167-182

### Purpose:
Rule 4: a language that cannot load says so in a popup, as decided ([2026-11-10 11:35:26](DEVLOG/DEVLOG6.md#113526-the-message-that-a-language-could-not-be-loaded-is-a-popup))

### Assertion expectation:
With the file of the next language made to fail, choosing that language and pressing OK opens the popup as a modal
window, with "The language could not be loaded." in the language in use.

## Test 234

### File residence:
`js/tests/interface/options_test.js`, lines 154-155, in `languagePopupTests()`

### Purpose:
Rule 4: a language that cannot load leaves the language in use, as decided ([2026-11-10 05:21:12](DEVLOG/DEVLOG6.md#052112-clean-code-and-head-first-design-patterns-refactoring-round-3-test-runner-view-modules-settings-start-up))

### Assertion expectation:
After the failure, the language, the page's lang and the name on the language button in Options are those of the
language in use.

## Test 235

### File residence:
`js/tests/interface/options_test.js`, lines 156 and 163, in `languagePopupTests()`, with `paneBoxes()`, lines 184-185

### Purpose:
Requirement 35: the panels keep their size when the popup opens and closes

### Assertion expectation:
While the popup is open, and after its OK, each pane has the place and size it had before the language was chosen.

## Test 236

### File residence:
`js/tests/interface/options_test.js`, line 160, in `languagePopupTests()`

### Purpose:
Rule 4: OK closes the popup, as decided ([2026-11-10 11:35:26](DEVLOG/DEVLOG6.md#113526-the-message-that-a-language-could-not-be-loaded-is-a-popup))

### Assertion expectation:
After a click on its OK, the popup is closed.

## Test 237

### File residence:
`js/tests/interface/options_test.js`, lines 161-162, in `languagePopupTests()`

### Purpose:
Rule 3, WCAG 2.4.3: closing the popup returns focus to where it was

### Assertion expectation:
After OK in the popup, the focus is on the Options button, which had it before the language was chosen.

## Test 238

### File residence:
`js/tests/static/rules_test.js`, lines 39-43, in `codeTests()`

### Purpose:
Rule 7: no comments in the code

### Assertion expectation:
index.html (up to the live-server marker, `INJECTED`) has no `<!--`, no sheet has `/*`, and no script has `/*`, or `//`
outside its strings, regular expressions and templates.

## Test 239

### File residence:
`js/tests/static/rules_test.js`, lines 44-45, in `codeTests()`

### Purpose:
Rule 2: no CSS in the JavaScript

### Assertion expectation:
no script writes to `.style` or sets a `style` attribute, but `.style.setProperty("--name", …)`.

## Test 240

### File residence:
`js/tests/static/rules_test.js`, lines 46-47, in `codeTests()`

### Purpose:
Rule 2: no HTML in the JavaScript

### Assertion expectation:
no script uses `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `createElement(` or `document.write`.

## Test 241

### File residence:
`js/tests/static/rules_test.js`, line 52, in `loadingTests()`

### Purpose:
Rule 4: visitors do not download the tests, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#scriptjs-split-into-modules-in-js-rule-16))

### Assertion expectation:
every script in `js/tests/` is reached from `js/script.js` only through an `import()`.

## Test 242

### File residence:
`js/tests/static/rules_test.js`, line 53, in `loadingTests()`

### Purpose:
Rule 6: the page's scripts load as static imports, as decided ([2026-10-19](DEVLOG/DEVLOG1.md#scriptjs-split-into-modules-in-js-rule-16))

### Assertion expectation:
every script outside `js/tests/` is reached from `js/script.js` through static imports only.

## Test 243

### File residence:
`js/tests/static/rules_test.js`, lines 54-55, in `loadingTests()`

### Purpose:
Rule 29: no two files with the same name

### Assertion expectation:
no two of the linked sheets and the scripts reached from `js/script.js` share a file name.

## Test 244

### File residence:
`js/tests/static/rules_test.js`, line 56 and lines 59-72, in `loadingTests()`

### Purpose:
Rule 14: no dependencies

### Assertion expectation:
no sheet is linked from outside the project, every import is relative and inside it, no script uses `require(`, and no
sheet has `@import` or a `url()` outside the project.

## Test 245

### File residence:
`js/tests/static/rules_test.js`, lines 78-80, in `sizeTests()`

### Purpose:
Rule 25: no file over 400 lines of code

### Assertion expectation:
index.html (up to `INJECTED`), each linked sheet and each script has at most 400 non-blank lines.

## Test 246

### File residence:
`js/tests/static/rules_test.js`, lines 81-82 and 90-100, in `sizeTests()`

### Purpose:
Rule 23: no function over 60 lines of code

### Assertion expectation:
no function body that `functionsOf()` finds in a script spans over 60 non-blank lines.

## Test 247

### File residence:
`js/tests/static/rules_test.js`, lines 83-84 and 102-105, in `sizeTests()`

### Purpose:
Rule 24: no line of code over 120 characters

### Assertion expectation:
no line of a script has over 120 characters.

## Test 248

### File residence:
`js/tests/static/rules_test.js`, lines 85-87 and 107, in `sizeTests()`

### Purpose:
Rule 6: top-level functions with statements are declarations, as decided ([2026-11-10](DEVLOG/DEVLOG6.md#052112-clean-code-and-head-first-design-patterns-refactoring-round-3-test-runner-view-modules-settings-start-up))

### Assertion expectation:
no line of a script reads `(export )const name = (async )(…) => {`.

## Test 249

### File residence:
`js/tests/static/layers_test.js`, lines 32-33, in `pageTests()`

### Purpose:
Regression: the controllers drew the tree and the Options window ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
no script outside `js/view/` and `js/tests/` names `document` or `window`, looks up or listens to elements, or uses
`classList`, `dataset`, `setAttribute` or `textContent`.

## Test 250

### File residence:
`js/tests/static/layers_test.js`, lines 34-35, in `pageTests()`

### Purpose:
Regression: optionshandler.js wrote the address bar ([2026-11-01](DEVLOG/DEVLOG5.md#121745-the-rest-of-model-view-and-controller-put-in-its-place))

### Assertion expectation:
no script outside `js/model/data/` and `js/tests/` names `history` or `location`.

## Test 251

### File residence:
`js/tests/static/layers_test.js`, lines 36-37, in `pageTests()`

### Purpose:
Rule 6: one place loads and stores data, as decided ([2026-11-02](DEVLOG/DEVLOG6.md#095157-clean-code-refactoring-names-arguments-error-handling-and-datahandlerjs-in-parts))

### Assertion expectation:
no script outside `js/model/data/` and `js/tests/` uses `fetch(`, `XMLHttpRequest` or `localStorage`.

## Test 252

### File residence:
`js/tests/static/layers_test.js`, lines 41-42, in `importTests()`

### Purpose:
Rule 6: the model knows neither view nor controller, as decided ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
every import of a script in `js/model/` is a script in `js/model/`.

## Test 253

### File residence:
`js/tests/static/layers_test.js`, lines 43-44, in `importTests()`

### Purpose:
Rule 6: the views know no controller, as decided ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
no script in `js/view/` imports a script in `js/controller/`.

## Test 254

### File residence:
`js/tests/static/layers_test.js`, lines 50-54, in `modelTests()`

### Purpose:
Regression: views worked out counts and greyed-out branches from the model's sets ([2026-11-01](DEVLOG/DEVLOG5.md#121745-the-rest-of-model-view-and-controller-put-in-its-place))

### Assertion expectation:
no script outside `js/model/` and `js/tests/` imports `civsets.js` or reads `matching`, `.set` or `.all`.

## Test 255

### File residence:
`js/tests/static/layers_test.js`, lines 55-60, in `modelTests()`

### Purpose:
Rule 6: one observer redraws the page, as decided ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
no script but `js/view/page.js` imports or calls `subscribe`.

## Test 256

### File residence:
`js/tests/static/layers_test.js`, lines 61-64, in `modelTests()`

### Purpose:
Rule 6: the model tells its observer of its changes, as decided ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
`js/model/model.js` exports `subscribe` and does not export `notify`.

## Test 257

### File residence:
`js/tests/static/layers_test.js`, lines 65-66, in `modelTests()`

### Purpose:
Regression: model.js built the filter buttons' names from the texts ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
neither `js/model/model.js` nor `js/model/itemtree.js` names `words` or `fill`.

## Test 258

### File residence:
`js/tests/static/layers_test.js`, lines 67-68, in `modelTests()`

### Purpose:
Regression: the model's items held the tree's elements ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
no value of an item in the model's `items` is a page element.

## Test 259

### File residence:
`js/tests/static/layers_test.js`, line 73, in `viewTests()`

### Purpose:
Regression: pictures.js and report.js saved settings ([2026-11-01](DEVLOG/DEVLOG5.md#030032-model-view-and-controller-as-in-head-first-design-patterns))

### Assertion expectation:
no script in `js/view/` calls `remember(` or `rememberSetting(`.

## Test 260

### File residence:
`js/tests/static/layers_test.js`, lines 74-75, in `viewTests()`

### Purpose:
Regression: optionshandler.js saved the model's settings ([2026-11-02](DEVLOG/DEVLOG6.md#004414-the-model-guards-its-own-marks-and-saves-its-own-state))

### Assertion expectation:
no script outside `js/model/` and `js/tests/` calls `keepInAddress(`, or remembers or recalls `include`, `regional` or
`language`.

## Test 261

### File residence:
`js/tests/static/layers_test.js`, line 76, in `viewTests()`

### Purpose:
Regression: treeview.js decided that a click means must have ([2026-11-01](DEVLOG/DEVLOG5.md#121745-the-rest-of-model-view-and-controller-put-in-its-place))

### Assertion expectation:
no script in `js/view/` passes `"has"` or `"lacks"` to an `actions` call.

## Test 262

### File residence:
`js/tests/static/rules_test.js`, lines 110-111, in `assetTests()`

### Purpose:
Regression: Firefox downloaded the loading picture with Simple UI ([2026-10-27](DEVLOG/DEVLOG4.md#phones-on-the-full-hd-pictures-and-each-picture-asked-for-once))

### Assertion expectation:
no `<img>` in a `<template>` of index.html has `src` or `srcset`.

## Test 263

### File residence:
`js/tests/static/rules_test.js`, lines 112-114 and 127, in `assetTests()`

### Purpose:
Rule 9: no images with Simple UI (Rule 22), in every style rule

### Assertion expectation:
every style rule with a `url()`, but `@font-face`, has only selectors that start with `.pictures` or `html.pictures`.

## Test 264

### File residence:
`js/tests/static/rules_test.js`, lines 115-118, in `assetTests()`

### Purpose:
Rule 10: no sounds

### Assertion expectation:
index.html has no `audio`, `video`, `object` or `embed` element, and no script makes `new Audio` or `new AudioContext`.

## Test 265

### File residence:
`js/tests/static/rules_test.js`, lines 119-122 and 129, in `assetTests()`

### Purpose:
Rule 11: no animations but the small loading icon

### Assertion expectation:
no sheet has `@keyframes`, `animation` or `transition` but the spinner's two rules, and no script calls `.animate(`.

## Test 266

### File residence:
`js/tests/static/rules_test.js`, lines 123-124, in `assetTests()`

### Purpose:
Rule 1: all data in data.json

### Assertion expectation:
no script holds a civilisation's or an item's name from data.json as a quoted string.

## Test 267

### File residence:
`js/tests/static/data_test.js`, line 46, in `treeTests()`

### Purpose:
Rule 4: each item is one row of the tree, as decided ([2026-10-24](DEVLOG/DEVLOG3.md#the-fortified-church-holds-the-monasterys-rows))

### Assertion expectation:
no item key is twice in `data.tree`.

## Test 268

### File residence:
`js/tests/static/data_test.js`, lines 47-48, in `treeTests()`

### Purpose:
Rule 4: the tree's rows take only the fields the code reads, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#decision-3-the-top-of-a-line))

### Assertion expectation:
every node of `data.tree` has only `item`, `group`, `kids`, `unique`, `lines`, `own`, `excludes` and `replaces`.

## Test 269

### File residence:
`js/tests/static/data_test.js`, line 49, in `treeTests()`

### Purpose:
Requirement 8: the data for the groups "Include Unique and Universal" shows

### Assertion expectation:
`unique` is `true`, and only on a group.

## Test 270

### File residence:
`js/tests/static/data_test.js`, line 50, in `treeTests()`

### Purpose:
Requirement 25: the data for Fortifications' lines

### Assertion expectation:
`lines` is `true`, and only on a group.

## Test 271

### File residence:
`js/tests/static/data_test.js`, line 51, in `treeTests()`

### Purpose:
Requirement 37: the data for the rows a variant does not take

### Assertion expectation:
`own` is `true`, and only on an item.

## Test 272

### File residence:
`js/tests/static/data_test.js`, lines 52-54, in `treeTests()`

### Purpose:
Requirement 37: the data for mutually exclusive variants

### Assertion expectation:
`excludes` and `replaces` are only on items, are not empty, and name only other items of the tree.

## Test 273

### File residence:
`js/tests/static/data_test.js`, lines 65-66 and 80-81, in `itemTests()`

### Purpose:
Requirement 4: the data for the list of compatible civilisations

### Assertion expectation:
each item's availability is `"all"`, or a `has` or `lacks` list of civilisations of `data.civs`.

## Test 274

### File residence:
`js/tests/static/data_test.js`, lines 67-68, in `itemTests()`

### Purpose:
Rule 4: an icon on each row of the tree, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#icons-in-the-tree))

### Assertion expectation:
each item has a picture with a `kind` and a whole `picture` number.

## Test 275

### File residence:
`js/tests/static/data_test.js`, lines 69-70, in `itemTests()`

### Purpose:
Requirement 8: the data for the items "Include Unique and Universal" shows

### Assertion expectation:
each item's `reach` is `common`, `regional` or `unique`.

## Test 276

### File residence:
`js/tests/static/data_test.js`, lines 71-75, in `itemTests()`

### Purpose:
Rule 4: rows the game's data lacks, as decided ([2026-10-23](DEVLOG/DEVLOG3.md#the-xolotl-warrior-which-excludes-the-stable))

### Assertion expectation:
`data.extras` is an object, and each extra is an item of the tree with a whole `nameId` and a `has` list of
civilisations of `data.civs`.

## Test 277

### File residence:
`js/tests/static/data_test.js`, lines 76-77 and 83-89, in `itemTests()`

### Purpose:
Rule 4: the updater keeps the extras, as decided ([2026-10-23](DEVLOG/DEVLOG3.md#the-xolotl-warrior-which-excludes-the-stable))

### Assertion expectation:
each extra's availability and picture in data.json are those `fromExtra()` and the updater make of it.

## Test 278

### File residence:
`js/tests/static/data_test.js`, lines 94-95, in `textDataTests()`

### Purpose:
Requirement 4: "n compatible civilisations" for any n

### Assertion expectation:
every text that is an object, in every language, has an `other` form.

## Test 279

### File residence:
`js/tests/static/data_test.js`, lines 96-97 and 103, in `textDataTests()`

### Purpose:
Requirement 11: the data for the texts in each language, with their blanks filled in

### Assertion expectation:
each `ui` text has the same `{placeholders}` in every language as in the first.

## Test 280

### File residence:
`js/tests/static/data_test.js`, lines 98-100, in `textDataTests()`

### Purpose:
Regression: names shortened or in the accusative case ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
every key of each language's `overrides` is an item or a civilisation.

## Test 281

### File residence:
`js/tests/static/data_test.js`, line 107 and lines 114-115, in `sourceDataTests()`

### Purpose:
Requirement 5: "Data from aoe2techtree.net, Update xxxxxx"

### Assertion expectation:
`data.source` has a `name`, a `url`, a whole `update.number` and an `update.url` that starts `https:`.

## Test 282

### File residence:
`js/tests/static/data_test.js`, line 108, in `sourceDataTests()`

### Purpose:
Rule 4: the updater's source, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
`data.source` has a `data` address and a whole `helpOffset`.

## Test 283

### File residence:
`js/tests/static/data_test.js`, line 109, in `sourceDataTests()`

### Purpose:
Rule 4: the texts of the test report and the updater, as decided ([2026-10-21](DEVLOG/DEVLOG2.md#tests-named-by-number))

### Assertion expectation:
no value of `data.tools` is empty.

## Test 284

### File residence:
`js/tests/static/data_test.js`, lines 110-111, in `sourceDataTests()`

### Purpose:
Rule 4: the updater's ignore list, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
`data.ignore` is an array of strings.

## Test 285

### File residence:
`js/tests/static/updates_test.js`, lines 10-11, in `updaterTests()`

### Purpose:
Rule 4: the updater writes a file per language, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
`pack(data)` writes `data.json`, then each other language to its file in `locales/`, in order.

## Test 286

### File residence:
`js/tests/static/updates_test.js`, lines 12-13 and 21-27, in `updaterTests()`

### Purpose:
Rule 4: the updater's files hold all the data, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
the written files, read back with `unpack()` and `addLanguage()`, pack to the same as `pack(data)`.

## Test 287

### File residence:
`js/tests/static/updates_test.js`, lines 14-15 and 29, in `updaterTests()`

### Purpose:
Rule 4: the updater stores availability in its shortest form, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
each item's stored availability equals `availabilityOf()` of its own civilisations.

## Test 288

### File residence:
`js/tests/static/updates_test.js`, lines 16-18, in `updaterTests()`

### Purpose:
Rule 4: the updater stores tidy names, as decided ([2026-10-18](DEVLOG/DEVLOG1.md#translations-and-making-the-project-follow-rulesmd))

### Assertion expectation:
`joinLines()` changes no item's or civilisation's name in any language.

## Test 289

### File residence:
`js/tests/interface/reporting_test.js`, line 19, in `reportTests()`

### Purpose:
Rule 3, WCAG 2.4.3: the report opens with focus on Close

### Assertion expectation:
When the report opens, Close has focus.

## Test 290

### File residence:
`js/tests/interface/reporting_test.js`, lines 21-22, in `reportTests()`

### Purpose:
Rule 4: only the report's list scrolls, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#the-report-window-keeps-its-title-and-close-button-in-view))

### Assertion expectation:
With 200 lines scrolled to the end, the list has scrolled and the report window does not overflow.

## Test 291

### File residence:
`js/tests/interface/reporting_test.js`, lines 23-24, in `reportTests()`

### Purpose:
Rule 18: scrolling the report moves no control

### Assertion expectation:
Scrolling the list to its end leaves the title, the count and Close at the same heights.

## Test 292

### File residence:
`js/tests/interface/reporting_test.js`, lines 25-26, in `reportTests()`

### Purpose:
Rule 4: the report keeps its title, count and Close in view, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#the-report-window-keeps-its-title-and-close-button-in-view))

### Assertion expectation:
With the list scrolled to its end, the title, the count and Close lie within the window's height.

## Test 293

### File residence:
`js/tests/interface/reporting_test.js`, line 27, in `reportTests()`

### Purpose:
Rule 4: the download links scroll with the list, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#the-report-window-keeps-its-title-and-close-button-in-view))

### Assertion expectation:
The download list is inside the list's scrolling box.

## Test 294

### File residence:
`js/tests/interface/reporting_test.js`, line 28, in `reportTests()`

### Purpose:
Rule 4: Close sits on the right, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#the-report-windows-close-button-plain-and-on-the-right))

### Assertion expectation:
Close's right edge is within a pixel of the list's.

## Test 295

### File residence:
`js/tests/interface/reporting_test.js`, lines 29-32, in `reportTests()`

### Purpose:
Rule 4: Close is the plain button in both looks, as decided ([2026-10-22](DEVLOG/DEVLOG3.md#the-report-windows-close-button-plain-and-on-the-right))

### Assertion expectation:
Close and its ::before and ::after look the same with and without Simple UI.
