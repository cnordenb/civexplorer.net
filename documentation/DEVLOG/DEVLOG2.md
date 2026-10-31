# Development log, part 2

- [2026-10-21](#2026-10-21)

Part 2 of the development log. It follows [part 1](DEVLOG1.md) and goes on in [part 3](DEVLOG3.md). The decisions made
in the log are listed in [DECISIONS.md](../DECISIONS.md).

## 2026-10-21

### Background pictures, and a Simple UI option (requirements 32 and 33, rule 22)

#### What changed

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

### The page sits on the parchment, and WCAG applies to Simple UI

#### What changed

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

### A picture for the Options button

#### What changed

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

### Picture cursors

#### What changed

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

### Game buttons with Trajan Pro

#### What changed

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

### Checkbox pictures

#### What changed

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

### The title in its frame

#### What changed

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

### Framed panels with their own fonts

#### What changed

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

### A thinner frame for the tree

#### What changed

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

### Unstretched frames, new buttons, a Find box, a tooltip and civilisation icons

#### What changed

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

### A Find box of fixed width, and the tooltip by the cursor

#### What changed

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

### Search messages beside the box

#### What changed

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

### No focus ring on the Find box

#### What changed

- **No white ring.** As decided, the Find box no longer shows the white ring around it while you type, with the
  pictures on. The ring was the focus outline, which is white in dark colours and black in light ones. The text
  cursor still shows where you type. With Simple UI the ring stays, as WCAG 2.2 asks for a visible focus.
- **Tests.** Test 53 checks that the box has no outline while it has focus, after the cross empties it.
- **Checked.** All 100 tests pass in Chrome, in light and dark colours, in all four window sizes.

### Civ view, and the search message by the pane's edge

#### What changed

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

### one-line search messages, pinned filters, one cursor, seven tiles and a flatter tree

#### What changed

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

### A full-width footer, civilisation links, the pointing hand and six tiles

#### What changed

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

### Simple UI: a full-width footer, and civilisations without links

#### What changed

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

### The Options window on its own parchment

#### What changed

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

### Icons in the tree

#### What changed

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

### Include Regionals, and the Include description as a tooltip

#### What changed

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

### The phone layout, and Test 15

#### What changed

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

### No footer on phones

#### What changed

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

### Tests named by number

#### What changed

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

### Test 54 failing on GitHub, and Test 51 at 125%

#### What changed

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

### Fewer test windows, and three tests removed

#### What changed

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

### No 320 by 256 window, and Test 82 checks Rules 23 to 26

#### What changed

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
