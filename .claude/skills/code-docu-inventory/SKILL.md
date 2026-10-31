---
name: code-docu-inventory
description: >-
  List the functions of AoE2 Civ Explorer's scripts for code_docu.pdf: each top-level function and object with its
  lines, whether it is exported, the functions it calls and those that call it, and which tests of TESTS.md each test
  function belongs to. Use this skill when code_docu.pdf is being made or updated (with the code-docu skill) and the
  descriptions in desc/ have to be matched to the code, or when a section's "Called by" or "Calls" list looks wrong.
---

# The inventory of the scripts

`scripts/inventory.mjs` parses every script with acorn and lists what `code_docu.pdf` documents. `gen.mjs` of the
`code-docu` skill imports it; run it alone to see what the PDF will say about a script before writing its
descriptions. Rule 36 allows acorn here, for code_docu.pdf only.

acorn has to be installed in the work folder first, which the `code-docu` skill's `preflight.mjs` does:

```
node .claude/skills/code-docu/scripts/preflight.mjs "$WORK"
```

## The list of functions

```
node .claude/skills/code-docu-inventory/scripts/inventory.mjs "$REPO" "$WORK" pictures
```

The third argument keeps the scripts whose path contains it; without it, every `.js` file under `js/` is listed. For
each script it prints the lines of its top-level code and what that code calls, then a line per function or object:

```
34-39 -tipFor(target) -> nodetree.js#itemAt pictures.js#branchTip <- pictures.js#wireTip
```

`+` is exported, `-` internal, `{obj}` an object; after `->` the functions it calls, after `<-` those that call it,
and a key ending in `#` is a script's top-level code.

## What counts

- **A section** is a function declaration, or a `const` or `let` whose value is a function or an object literal, at
  the top level of a script. Anything defined inside a function is part of that function.
- **A call** is any mention of a function's name in the body, called or not, as long as it names a function of the
  same script, one it imports, or one it imports with `import("…").then(({ … }) => …)`. A function handed on to be
  called later, such as an event handler, thus counts as called by the function that hands it on. Names of the
  browser's own functions are not listed.
- **Lines** are those of the file as it is on disk, from the first line of the declaration to its last.

If a call is missing, look at how the name reaches the caller: a name that comes through an object (`view.show()`)
or a string is not followed, and the description can say so in words.

## The tests' functions

```
node .claude/skills/code-docu-inventory/scripts/testmap.mjs "$REPO" "$WORK" pictures_test
```

For each function in `js/tests/`, it lists the tests whose lines in `documentation/TESTS.md` ("File residence")
cover it, and the names it passes to `check()` and `expect()`. Use it to describe what each test function checks.
Its last line names every test whose lines run past the end of its file, a sign that `TESTS.md` was not updated
after the file changed; fix those in `TESTS.md`, not in the descriptions.
