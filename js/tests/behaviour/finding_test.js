import { words, nameOf, plural, plain } from "../../model/texts.js";
import { items, behind } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { shown } from "../../view/treeview.js";
import { check, tap, type, reset, beside, fixtures, nodeOf, NAMES } from "../helpers_test.js";

const MATCHED = "find: exactly the items whose names match are highlighted";
const COUNTED = "find: the label says how many items match";
const NONSENSE = "qqqqzzzzqqqq";
const BRIGHT = 200;
const BLUE_SHARE = 0.75;

export function finding() {
  reset();
  const { partial, rival } = fixtures();
  type(nameOf(partial));
  const matches = items.filter((item) => plain(nameOf(item)).includes(plain(nameOf(partial))));
  check(MATCHED, found(partial) && items.every((item) => found(item) === matches.includes(item)));
  check("find: a match is highlighted in yellow",
    matches.every((item) => yellow(getComputedStyle(nodeOf(item)).backgroundColor)));
  check("find: the tree opens down to every match", matches.every(shown));
  check(COUNTED, $("found").textContent === plural("found", matches.length));
  check(NAMES.findBeside, beside());
  dropsGreyed(rival);
  type(NONSENSE);
  check(COUNTED, $("found").textContent === words.ui.noneFound);
  check(MATCHED, !document.querySelector(".found"));
  check(NAMES.findBeside, beside());
  type("");
  check("find: emptying the search box clears the label", $("found").textContent === "");
  reset();
}

function dropsGreyed(rival) {
  let by = null;
  let hit = null;
  for (const each of [rival, rival?.rivals[0]].filter(Boolean)) {
    reset();
    tap(nodeOf(each));
    [by, hit] = [each, items.find(behind)];
    if (hit) break;
  }
  if (!hit) throw new Error("no mark in data.json greys out a branch with items in it");
  reset();
  type(nameOf(hit));
  if (!found(hit)) throw new Error(`${nameOf(hit)} is not found for the tests`);
  tap(nodeOf(by));
  const n = document.querySelectorAll(".node.found").length;
  check("find: a match leaves the results once a mark greys out its branch",
    !found(hit) && $("found").textContent === (n ? plural("found", n) : words.ui.noneFound), nameOf(hit));
  reset();
}

function yellow(colour) {
  const [r, g, b] = (colour.match(/[\d.]+/g) ?? []).map(Number);
  return r > BRIGHT && g > BRIGHT && b < Math.min(r, g) * BLUE_SHARE;
}

const found = (item) => nodeOf(item).classList.contains("found");
