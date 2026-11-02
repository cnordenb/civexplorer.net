---
name: data-update
description: >-
  Put the updater's new data in place for AoE2 Civ Explorer (civexplorer.net): run index.html?update headless in
  Chrome, read its report, save the data.json and locales/*.json it offers, run the tests and log it. Use this skill
  when the user asks to update the data, apply or download what the updater found or detected, bring the page up to
  a new game patch or update, or take in new or changed data from aoe2techtree.net.
---

# Putting the updater's data in place

The updater (`index.html?update`, code in `js/model/updater.js`) fetches aoe2techtree.net's data and its page, which
names the game update, compares them with `data.json` and offers new files. `MAINTAINER.md`'s first chapter, "Updating
Civ Explorer after a game patch", is the human version of this skill; follow it where this file is silent.

## 1. Run the updater

```
node --experimental-websocket .claude/skills/data-update/scripts/download.mjs "$REPO" "$SCRATCH/update"
```

Node 22+ needs no flag. `CHROME` overrides the Chrome path, and a third argument the debugging port (9361). The script
serves the repo on 127.0.0.1, opens `?update` in headless Chrome and prints:

- `status:` the report's summary, and `report:` each line of the report;
- `file: <path>: …` for each file offered, saved under the second argument at the same path, with each changed value
  as `.text.items.Herbalism: "old" -> "new"`. "same values, new order or wrapping" is the updater's own layout.

It exits with 1 when the updater offered nothing (blocked or failed). With `"$REPO"` as the second argument the files
are saved in place, keeping each file's line endings; `git diff` and `git checkout` then show and undo them.

## 2. Read the report

`MAINTAINER.md`, step 4, says which lines need work and what to do. Lines that ask for a decision (where a new item
goes in the tree, an icon, a wrong name) are the user's: ask, or in autonomous work log them as questions in the
DEVLOG. After any change to `data.json`, run step 1 again. *The game update could not be read* means aoe2techtree.net
changed its page: fix `GAME_UPDATE` in `js/model/updater.js`, or set `source.update` in `data.json` by hand.

## 3. Save, test, record

1. Run step 1 with `"$REPO"` as the second argument.
2. Run the tests in the six windows of `.github/workflows/tests.yml` (light `=1` and dark `=0`, at `1920,1080`,
   `1000,1000` and `720,1280`): Chrome with `--headless=new --no-sandbox --disable-gpu
   --allow-file-access-from-files --user-data-dir=<fresh folder> --blink-settings=preferredColorScheme=<n>
   --window-size=<size> --enable-logging=stderr --v=0 "<file URL of index.html>?test"`, in the background, until
   its log has `"tests: passed"` or `"tests: failed"` (about 10 seconds); the line before it is the summary.
3. Log it in the last part of `documentation/DEVLOG/` (Rules 28 to 35): the game update, the report's lines in short,
   the files that changed, and the tests. `code_docu.pdf` only when asked.
4. Never commit (Rule 0).
