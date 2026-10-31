input panel - the frame on the left hand side of the screen titled "Buildings, units and technologies"
node - a unit, building, or technology as interactive filter present in the input panel
node tree - the expandable hierarchy in which the input panel lists its nodes, kept under tree in data.json
child node - a node directly under another node in the node tree
descendant node - a node anywhere under another node in the node tree: its child nodes, theirs, and so on
branch - a node together with all of its descendant nodes
group - an entry of the node tree that holds nodes but is no unit, building or technology itself, e.g. "Economy"
root node - a node or group at the top level of the node tree, e.g. "Economy", "Dock" or "Blacksmith"
heading - a group inside a node, without checkbox, that only expands and collapses, e.g. "Unique Units" in "Castle"
building node - a node with no node above it, only groups or nothing, e.g. "Barracks" in "Military"
unit node - a node of a unit, below the building node that trains it, e.g. "Militia" or "Man-at-Arms"
technology node - a node of a technology, below the building node that researches it, e.g. "Double-Bit Axe"
line - a unit, technology, wall or tower node and the upgrades under it, e.g. "Double-Bit Axe" to "Two-Man Saw"
prerequisite - a node above another in its line, which that node needs, e.g. "Bow Saw" for "Two-Man Saw"
must have - the checkbox value of a green tick, set by left-click or space: only civilisations with the node fit
must lack - the checkbox value of a red x, set by right-click, long press or x: only civilisations without it fit
mark - must have or must lack on a node, set by hand or passed down its line or branch, must have also to prerequisites
fork - a node of a line with several child nodes, e.g. "Long Swordsman", where a mark stops passing down and expanding
dash - the white dash in a node's checkbox while its descendant nodes differ in mark, unmarked ones included
output panel - the frame on the right hand side of the screen titled "Civilisations"
civ list - the civilisations that fit every mark, listed under "Civilisations" in the output panel
civ count - the number right of a node: how many in the civ list have it, and if collapsed also its whole branch
filters list - the "Filters:" summary of every mark, between the output panel's header and the civ list
filter entry - one item of the filters list: a node, line or branch with its mark, clearing that mark when clicked
full - "Full" before a filter entry: a root node or building node with several child nodes, its whole branch must have
search bar - the "Find" field in the input panel, expanding to and highlighting in yellow every node matching its text
variant - a node standing in for one or more other nodes for some civilisations, e.g. "Fortified Church" for "Monastery"
greyed out - dimmed and unmarkable, as it cannot go with a node marked must have, e.g. "Monastery" by "Fortified Church"
alternative - a node a marked variant greys out: one it replaces, one replacing it, or another variant of the same
excludes - in data.json, a node naming one that no civilisation has with it, e.g. "Xolotl Warrior" naming "Stable"
unique node - a node aoe2techtree.net counts as unique, e.g. "Grenadier", given its own filter entry if must have
universal node - a node all but at most one civilisation has, e.g. "House", shown with "Include Unique and Universal"
regional node - a node aoe2techtree.net counts as regional, e.g. "Eagle Scout", hidden while "Include Regionals" is off
reach - a node's class in data.json, common, regional or unique, telling unique and regional nodes from the rest
options window - the "Options" window opened by the cogwheel button in the header, with language and settings
options button - the cogwheel button in the header that opens the options window
simple ui - the "Simple UI" setting in the options window: no images or fonts, the look the requirements describe
pictures - the look with simple ui off: game art, icons, cursors and fonts, all styled under the class pictures on html
parchment - the game's paper art behind the page and the options window with pictures, sized by the screen
tile - a civilisation of the civ list as its icon in a box, with pictures while "Civ view:" is set to "Tile"
tooltip - the box by the cursor with pictures, e.g. "Left-click to enable, right-click to disable", set by "Tooltips"
loading screen - the grey "Loading image assets..." screen of pictures, shown until every image has loaded
atlas - one webp per icon folder holding all its icons in a grid, from which nodes and civilisations get their icons
locale file - a json file in locales/ with the text of one language besides english, e.g. de.json for german
overrides - corrections to the game's names, english ones in data.json and the others in their locale file
updater - the tool at index.html?update that fetches aoe2techtree.net's data and offers new data.json and locale files
report window - the window in which the updater, or the tests at index.html?test, list what they found
extras - nodes added by hand in data.json, as aoe2techtree.net gives them to no civilisation, e.g. "Xolotl Warrior"
ignore - names from the game left out of the node tree, listed in data.json so the updater does not report them
