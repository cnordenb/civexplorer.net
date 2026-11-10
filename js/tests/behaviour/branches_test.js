import { fill, words, nameOf } from "../../model/texts.js";
import { items, branchState, lineOf, lineEnd } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { shown, rowOf } from "../../view/treeview.js";
import { check, same, keyDown, tap, reset, fixtures, nodeOf, openTo, drawn } from "../helpers_test.js";
import { ANNOUNCED, DASH, DEEPEST, STOPS, marks, chipNames, boxOf, below } from "./samples_test.js";

const WHOLE = "marking: marking a building or top-level group marks everything in it";
const OPENS = "marking: marking a building or top-level group opens everything it marks";

export function branches() {
  buildingMarks();
  lineFilters();
  singleLines();
  groupMarks();
}

function buildingMarks() {
  reset();
  const { branch } = fixtures();
  openTo(branch);
  const inside = closedInside(branch);
  tap(nodeOf(branch));
  check(WHOLE, branchState(branch) === "has" && inside.every((item) => item.group || item.self === "has"));
  check(OPENS, inside.every(shown));
  check("filters: a fully marked building with several rows in it is named Full",
    same(chipNames(), [fill(words.ui.full, { name: nameOf(branch) })]));
  tap(nodeOf(branch.kids[0]));
  check(DASH, branchState(branch) === "mixed" && drawn(boxOf(nodeOf(branch))) === marks.mixed);
  check(ANNOUNCED, nodeOf(branch).getAttribute("aria-checked") === "mixed");
}

function lineFilters() {
  reset();
  const { line } = fixtures();
  tap(nodeOf(line));
  check(DEEPEST, same(chipNames(), [nameOf(lineOf(line).findLast((item) => item.self === "has"))]));
  tap(nodeOf(lineEnd(line)));
  check(DEEPEST, same(chipNames(), [nameOf(lineEnd(line))]));
  keyDown(nodeOf(lineEnd(line)), "x");
  $("chips").querySelector("[data-state=has]")?.click();
  check("filters: a line's filter button clears its mark from the whole line",
    lineOf(line).every((item) => item === lineEnd(line) || item.self === null));
  check("filters: a line's filter button leaves the line's other kind of mark", lineEnd(line).self === "lacks");
}

function singleLines() {
  const { headed, lone, walled } = fixtures();
  check("filters: a fully marked building heading a single line is named after the line's last item",
    same(markedAlone(headed), [nameOf(lineEnd(headed))]));
  check("filters: a marked building with nothing in it is named plainly", same(markedAlone(lone), [nameOf(lone)]));
  if (!walled) throw new Error("data.json has no line in a group of lines for the tests");
  reset();
  tap(nodeOf(walled));
  check(STOPS, walled.self === "has" && walled.kids[0].self === null);
  const walls = lineOf(walled);
  for (const item of walls) {
    if (item.self !== "has") tap(nodeOf(item));
  }
  check(DEEPEST, same(chipNames(), [nameOf(walls.at(-1))]));
}

function markedAlone(item) {
  reset();
  tap(nodeOf(item));
  return chipNames();
}

function groupMarks() {
  reset();
  const { group } = fixtures();
  const inside = closedInside(group);
  tap(nodeOf(group));
  check(WHOLE, branchState(group) === "has" && group.self === null);
  check(OPENS, inside.every(shown));
  check("marking: marking a top-level group greys out nothing in it",
    inside.every((item) => !rowOf(item).entry.classList.contains("barred")));
  reset();
}

function closedInside(top) {
  const inside = items.filter((item) => below(item, top));
  if (inside.some(shown)) throw new Error(`${nameOf(top)} is open before it is marked`);
  return inside;
}
