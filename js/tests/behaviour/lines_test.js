import { allCivs, size } from "../../model/civsets.js";
import { nameOf } from "../../model/texts.js";
import { items, lineOf, lineEnd, isUnitOrTech } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { isOpen, shown } from "../../view/treeview.js";
import { chooseInclude } from "../../controller/optionshandler.js";
import {
  check, keyDown, tap, reset, onlyChildren, fixtures, byPath, nodeOf, twistyOf, openTo, drawn, NAMES,
} from "../helpers_test.js";
import {
  LISTED, ANNOUNCED, DASH, DEEPEST, PASSES, STOPS, marks, listedAre, chipNames, boxOf, below,
} from "./samples_test.js";

const BEFORE = "marking: must have passes up a line to the items above it";
const NO_BUILDING = "marking: must have passes up to no building";
const AGAIN = "marking: marking a line's top again with its mark clears the marks it passed down";

export function lineTops() {
  reset();
  const { line } = fixtures();
  const chain = lineOf(line);
  const run = sameCivs(line);
  if (run.length === chain.length) throw new Error(`the line of ${nameOf(line)} has the same civilisations all along`);

  const passed = (kind) => run.every((item) => item.self === kind);

  const stopped = () => chain.every((item) => run.includes(item) || item.self === null);

  tap(nodeOf(line));
  check(PASSES, passed("has"));
  check(STOPS, stopped());
  check(ANNOUNCED, nodeOf(line).getAttribute("aria-checked") === "true");
  check(LISTED, listedAre(run.reduce((s, item) => s & item.set, allCivs)));
  tap(nodeOf(line));
  check(AGAIN, chain.every((item) => item.self === null));
  keyDown(nodeOf(line), "x");
  check(PASSES, passed("lacks"));
  check(STOPS, stopped());
  check(LISTED, listedAre(run.reduce((s, item) => s & ~item.set, allCivs)));
  keyDown(nodeOf(line), "x");
  check(AGAIN, chain.every((item) => item.self === null));
  tap(nodeOf(lineEnd(line)));
  check(BEFORE, chain.every((item) => item.self === "has"));
  check(DEEPEST, chipNames().join() === nameOf(lineEnd(line)));
  check(LISTED, listedAre(lineEnd(line).set));
  keyDown(nodeOf(line), "x");
  check("marking: must lack on an item clears the must-have marks below it that need it",
    chain.every((item) => item.self !== "has"));
  reset();
}

export function parents() {
  reset();
  const { branch, loose, without } = fixtures();
  const inside = items.filter((item) => !item.group && below(item, branch));
  if (!inside.some((item) => item.kids.length)) throw new Error(`${nameOf(branch)} holds no line for the tests`);
  for (const leaf of inside.filter((item) => !item.kids.length)) {
    tap(nodeOf(leaf));
  }
  check(BEFORE, inside.every((item) => item.self === "has"));
  check(NO_BUILDING, branch.self === null);
  check(DASH, drawn(boxOf(nodeOf(branch))) === marks.mixed);
  check(ANNOUNCED, nodeOf(branch).getAttribute("aria-checked") === "mixed");
  $("clear").click();
  keyDown(nodeOf(loose), "x");
  for (const item of items.filter((each) => !each.group && below(each, loose))) {
    if (item.self !== "has") tap(nodeOf(item));
  }
  check(NO_BUILDING, loose.self === "lacks");
  check(LISTED, listedAre(without(loose)));
  $("clear").click();
}

export function lines() {
  reset();
  const { line, even, uneven } = fixtures();
  if (!even || !uneven) throw new Error("data.json has no item inside a line for the tests");
  openTo(line);
  if (isOpen(line)) throw new Error(`${nameOf(line)} is open before it is marked`);
  tap(nodeOf(line));
  check("marking: marking a closed unit or technology opens it to its first fork or its end",
    lineOf(line).every((item) => shown(item) && (!twistyOf(item) || isOpen(item))));
  $("clear").click();
  evenLine(even);
  unevenLine(uneven);
  beyond();
  $("clear").click();
}

function evenLine(even) {
  const run = sameCivs(even);
  const before = lineOf(even).slice(0, lineOf(even).indexOf(even)).filter(isUnitOrTech);
  if (run.length < 2 || !before.length) throw new Error(`${nameOf(even)} is no inner item of a line for the tests`);
  tap(nodeOf(even));
  check(BEFORE, before.every((item) => item.self === "has"));
  check(PASSES, run.every((item) => item.self === "has"));
  check(STOPS, marked().every((item) => run.includes(item) || before.includes(item)));
  $("clear").click();
}

function unevenLine(uneven) {
  const run = sameCivs(uneven);
  keyDown(nodeOf(uneven), "x");
  check(PASSES, run.every((item) => item.self === "lacks"));
  check(STOPS, marked().every((item) => run.includes(item) || !below(item, uneven)));
  check("marking: must lack passes up to nothing", marked().every((item) => item === uneven || below(item, uneven)));
  check(LISTED, listedAre(run.reduce((s, item) => s & ~item.set, allCivs)));
  $("clear").click();
}

function beyond() {
  chooseInclude(true);
  const item = items.find((each) => each.parent && isUnitOrTech(each.parent) && size(each.set & ~each.parent.set));
  if (!item) throw new Error("no unit or technology in data.json has an item with civilisations it lacks");
  const above = item.parent;
  openTo(item);
  tap(nodeOf(above));
  check(STOPS, items.filter((each) => each.self).length === 1);
  $("clear").click();
  tap(nodeOf(item));
  check("marking: must have passes up to no item that lacks some of its civilisations", above.self === null);
  keyDown(nodeOf(above), "x");
  check("marking: must lack above an item with other civilisations keeps its must have",
    item.self === "has" && above.self === "lacks");
  check(LISTED, listedAre(item.set & ~above.set & allCivs));
  chooseInclude(false);
  check("options: rows under a left-out unique item take its place",
    byPath(above.path) || byPath(item.path)?.parent === byPath(above.parent.path));
  check(NAMES.marksKept, byPath(item.path)?.self === "has");
}

const sameCivs = (item) => onlyChildren(item, (kid) => kid.group).filter((each) => each.set === item.set);

const marked = () => items.filter((item) => item.self && !item.original);
