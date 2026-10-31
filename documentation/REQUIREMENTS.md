# Requirements
0. These requirements will apply to desktop at 16:9 in English. The UI particulars apply to simple UI mode. Node behaviour requirements always apply.
1. aoe2civexplorer's user interface (henceforth: "the page") will have four discernable sections: header non the page's top side, input panel (node tree) on the page's left side, output panel (civ list) on the page's right side, and footer on the page's bottom side.
2. The header will contain, in left-to-right order: a title consisting of the phrase "Explore Age of Empires II civilisations by technology availability" and an options button.
3. The input panel will contain, in top-down order: a header section titled "Buildings, units and technologies" and three buttons "clear", "Expand all", "Collapse all", a search bar labelled "Find", a checkbox legend "[v] Must have: left-click or Space. [x] Must lack: right-click, long press or X.", a node tree expandible rightwards with each node having a checkbox before its name and compatible civilisations count label on the right side of the input panel.
4. The output panel will contain, in top-down order: a header section titled "Civilisations" and displaying the number of currently displayed civilisations as "n compatible civilisations" where n is the number concerned, a list of civilisations compatible with the selected node filter.
5. The footer will contain a label "Data from aoe2techtree.net, Month Year" where Month Year is the time when the data was last updated.
6. The Options button will be a cogwheel instead of a string label.
7. An Options window will open when the user left-clicks the Options button.
8. The Options window will contain, in top-down order: a title "Options", a drop-down menu labelled "Language", a checkbox labelled "Include Unique and Universal", a "Close" button.
9. The dropdown-menu will expand to show multiple language options when the user left-clicks it.
10. The default value of the language dropdown-menu will be English.
11. The language of the page will change to the language the user left-clicks.
12. The dropdown-menu will close when the user left-clicks.
13. The default value of the checkbox in the Options window will be off.
14. The Options window's checkbox will display a green tick when the user left-clicks it.
15. The effect described by the Options window's checkbox description will be true when the checkbox displays a green tick.
16. The Options window will close when the user left-clicks the Close button.
17. All node checkboxes in the input panel will be cleared of their values when the user left-clicks the Clear button.
18. All nodes will be expanded when the user left-clicks the Expand all button.
19. All nodes will be collapsed when the user left-clicks the Collapse all button.
20. A node will be automatically expanded to and highlighted in yellow when the user inputs its name in the search bar.
21. There will be a label to the right of the search bar indicating how many nodes match the user's search input.
22. A summary "Filters:" list will appear in the output panel between its header and civ list when one or more node checkboxes has been assigned a value.
23. The Filters list will display a node and its checkbox value as either a green tick or a red x.
24. Root nodes and building nodes which have multiple child nodes will have adjective "Full " in their Filters list entry when enabled. This requirement does not apply to Fortifications' descendant nodes.
25. Unit nodes and technology nodes which possess descendant nodes will when enabled have their Filters list entry titled as the deepest descendant node. This requirement also applies to Fortifications.
26. A node which possesses multiple descendant nodes of multiple assigned values will have its checkbox ticked with a white dash.
27. (RESCINDED.)
28. A node will automatically expand to either the first level of multiple child nodes or to the deepest descendant node when the user assigns its checkbox a value.
29. All descendant nodes of the same compatible civilisations in a line of single descendant nodes will be assigned the same value as the one the user assigns to a node.
30. A node will not be automatically assigned a value if the assigned value is given to a unit node or technology node of different number of compatible civilisations. This requirement also applies to Fortifications.
31. A node will be expanded to if it is automatically assigned a value. This requirement may be flouted for building variant edge cases where the same node has to occur multiple times in several branches.
32. Options window will contain a "Simple UI" checkbox.
33. The page will not use any images upon the user enabling the Simple UI checkbox.
34. A prerequisite node will be automatically enabled if a descendant node is enabled. This requirement does not apply to building nodes nor to root nodes nor to unique node edge cases.
35. Input panel or output panel will not resize upon user interaction - such as node being assigned value - other than resizing the window.
36. A unique node will always have its own filter entry if enabled. This does not apply for lines where every individual node is unique (eg. Gbeto does not require its own filter entry while Elite Gbeto is enabled).
37. Variant branches are mutually exclusive and when one of them is enabled, all alternative branches will be greyed out. Variant branches are for example: monastery variants (eg. Fortified Church), drop-off site variants (NB: such a variant can replace one (eg. Folwark) or more (eg. Settlement) drop-off sites), shock infantry (Eagle/Varangian/Fire), ram variants (eg. Armored Elephant), unique replacements (eg. Donjon over watch tower-line, Pasture over Farm). 