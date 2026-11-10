import { data } from "../../model/data/datahandler.js";
import { nameOf } from "../../model/texts.js";
import { items, branchState, isUnitOrTech, toggleMark } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { isOpen, setOpen, shown } from "../../view/treeview.js";
import { chooseInclude } from "../../controller/optionshandler.js";
import { check, same, keyDown, tap, reset, fixtures, nodeOf, twistyOf, openTo } from "../helpers_test.js";
import { LISTED, listedAre, chipNames, below } from "./samples_test.js";

const EXCLUDES = "marking: must have on an item greys out the branch it excludes";
const EXCLUDED = "marking: must have in an excluded branch greys out the item excluding it";
const CLOSES = "marking: greying out a branch closes it";
const UNMARKABLE = "marking: a greyed-out item cannot be marked";
const GREYS = "marking: must have on a variant greys out exactly its alternatives";
const FREES = "marking: clearing a variant frees its alternatives";
const SHARED = ["common", "regional"];
const FULL_OPACITY = 1;

export function rivals() {
  reset();
  const { rival } = fixtures();
  const other = rival?.rivals[0];
  if (!other) throw new Error("no item in data.json excludes another");
  const theirs = side(other, rival);
  openTo(rival);
  tap(nodeOf(rival));
  check(EXCLUDES, same(greyedItems(), theirs));
  check("marking: an item that excludes the branch it is in stays in sight", shown(rival));
  check(CLOSES, theirs.slice(1).every((item) => !isOpen(item)));
  check(LISTED, listedAre(rival.set));
  twistyOf(other).click();
  const shut = !isOpen(other);
  twistyOf(other).click();
  check("marking: the arrow of a greyed-out branch that holds a marked item still works", shut && isOpen(other)
    && twistyOf(other).ariaDisabled !== "true" && getComputedStyle(twistyOf(other)).pointerEvents !== "none");
  for (const item of theirs) {
    tap(nodeOf(item));
  }
  check(UNMARKABLE, rival.self === "has" && theirs.every((item) => !item.self));
  for (const by of [other, theirs.findLast((item) => !item.group && item.parent !== other)]) {
    excludedBy(by, rival);
  }
  $("clear").click();
  keyDown(nodeOf(rival), "x");
  keyDown(nodeOf(other), "x");
  check("marking: must lack on either side of an exclusion greys out nothing",
    !greyedItems().length && rival.self === "lacks" && branchState(other) === "lacks");
  reset();
}

function excludedBy(by, rival) {
  $("clear").click();
  tap(nodeOf(by));
  check(EXCLUDED, same(greyedItems(), [rival]), nameOf(by));
  tap(nodeOf(rival));
  check(UNMARKABLE, rival.self === null);
  toggleMark(rival, "has");
  toggleMark(rival, "lacks");
  check("marking: the model itself refuses a mark on a greyed-out item", rival.self === null);
}

export function standIns() {
  reset();
  const item = items.find((each) => each.replaces && each.alternatives.length);
  const other = item?.alternatives[0];
  if (!other) throw new Error("no item in data.json replaces another");
  for (const each of [item, other]) {
    openTo(each);
  }
  setOpen(item, true);
  sharedRow(item, other);
  shuts(other, item);
  tap(nodeOf(item));
  check(FREES, item.self === null && !greyed(other));
  shuts(item, other);
  tap(nodeOf(other));
  check(FREES, !greyed(item));
  chooseInclude(true);
  borrowedRows();
  variants();
  chooseInclude(false);
  reset();
}

function sharedRow(item, other) {
  const copy = items.find((each) => each.original && below(each, item) && !each.kids.length);
  if (!copy) throw new Error(`${nameOf(item)} holds no row of ${nameOf(other)} for the tests`);
  tap(nodeOf(copy));
  check("marking: marking a shared row marks it in both buildings", copy.original.self === "has");
  check("marking: marking a shared row opens nothing in the other building", !isOpen(other));
  check("filters: a shared row has one plain filter button", same(chipNames(), [nameOf(copy)]));
  $("clear").click();
}

function shuts(each, by) {
  setOpen(each, true);
  tap(nodeOf(by));
  if (by.self !== "has") throw new Error(`${nameOf(by)} cannot be marked for the tests`);
  check(CLOSES, !isOpen(each));
  check(GREYS, greyed(each) && !greyed(by), nameOf(each));
  tap(nodeOf(each));
  keyDown(nodeOf(each), "x");
  check(UNMARKABLE, each.self === null);
  twistyOf(each)?.click();
  check("marking: a greyed-out branch's arrow does not open it", !isOpen(each));
}

function borrowedRows() {
  const own = ownKeys();
  const rows = (top) => items.filter((each) => below(each, top)).map((each) => each.key)
    .filter((key) => SHARED.includes(data.pictures[key]?.reach));
  const lent = (alt) => (isUnitOrTech(alt) ? [] : rows(alt).filter((key) => !own.has(key)));
  const copies = (top) => items.filter((each) => each.copy && !each.group && below(each, top)).map((each) => each.key);
  const replacing = items.filter((each) => each.replaces);
  if (!replacing.some((each) => copies(each).length)) throw new Error("no item in data.json holds rows it replaces");
  check("tree: an item that replaces buildings also holds their common and regional rows",
    replacing.every((each) => same(copies(each),
      each.alternatives.filter((alt) => [each.replaces].flat().includes(alt.key)).flatMap(lent))));
}

function variants() {
  for (const variant of items.filter((each) => alternativesOf(each.key).length)) {
    $("clear").click();
    tap(nodeOf(variant));
    const marked = items.filter((each) => each.self === "has").map((each) => each.key);
    const barred = [...new Set(marked.flatMap(alternativesOf))].filter((key) => !marked.includes(key)).sort();
    const greys = greyedItems().map((each) => each.key).sort().filter((key) => alternativesOf(key).length);
    check(GREYS, same(greys, barred), nameOf(variant));
  }
}

function ownKeys() {
  const under = (nodes, inside) => nodes.flatMap((node) => [
    ...(node.item && (inside || node.own) ? [node.item] : []), ...under(node.kids ?? [], inside || node.own === true),
  ]);

  return new Set(under(data.tree, false));
}

function alternativesOf(key) {
  const named = (node) => [node?.replaces ?? []].flat();
  const nodes = (list) => list.flatMap((node) => [node, ...nodes(node.kids ?? [])]);
  const variantNodes = nodes(data.tree).filter((node) => node.replaces);
  const own = named(variantNodes.find((node) => node.item === key));
  const others = variantNodes.filter((node) => node.item !== key
    && (named(node).includes(key) || named(node).some((each) => own.includes(each))));
  return [...new Set([...own, ...others.map((node) => node.item)])].sort();
}

const side = (top, skip) => (top === skip ? [] : [top, ...top.kids.flatMap((kid) => side(kid, skip))]);

const greyedItems = () => items.filter((item) => nodeOf(item).ariaDisabled === "true");

const greyed = (item) => nodeOf(item).getAttribute("aria-disabled") === "true"
  && Number(getComputedStyle(nodeOf(item)).opacity) < FULL_OPACITY;
