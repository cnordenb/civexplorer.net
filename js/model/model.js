import { recallSetting, rememberSetting, remember, keepInAddress } from "./data/datahandler.js";
import { allCivs, size, civsOf } from "./civsets.js";
import { useLanguage } from "./texts.js";
import {
  items, roots, buildItems, reachOf, lineOf, lineEnd, endsInLine, chainOf, itemChain, ancestors, descendants,
  isUnitOrTech,
} from "./itemtree.js";

export { items, roots, lineOf, lineEnd, endsInLine, chainOf, ancestors, isUnitOrTech };
export let include;
export let regional;
let matching = 0n;

const observers = new Set();

export function subscribe(observer) {
  observers.add(observer);
}

const notify = (change) => observers.forEach((observer) => observer.update(change));

export function startModel(code) {
  include = recallSetting("include");
  regional = recallSetting("regional");
  useLanguage(code);
  rebuild();
}

export function setInclude(on) {
  include = on;
  saveAndRebuild("include", on);
}

export function setRegional(on) {
  regional = on;
  saveAndRebuild("regional", on);
}

function saveAndRebuild(key, on) {
  rememberSetting(key, on);
  rebuild();
  notify("tree");
}

export function setLanguage(code) {
  useLanguage(code);
  remember("language", code);
  keepInAddress("lng", code);
  notify("language");
}

function rebuild() {
  const marks = new Map(items.map((item) => [item.path, item.self]));
  buildItems({ include, regional });
  for (const item of items) {
    item.self = marks.get(item.path) ?? null;
  }
  shareMarksWithOriginals();
  updateMatching();
}

function shareMarksWithOriginals() {
  for (const copy of items.filter((each) => each.original)) {
    const { original } = copy;
    Object.defineProperty(copy, "self", { get: () => original.self, set: (mark) => { original.self = mark; } });
  }
}

function updateMatching() {
  matching = items.filter((item) => item.self)
    .reduce((m, item) => m & (item.self === "has" ? item.set : ~item.set), allCivs);
}

export const toReveal = (item, mark) => (barred(item) || toggleState(item) === mark ? [] : spreadOf(item));

export function toggleMark(item, mark) {
  if (barred(item)) return;
  const next = toggleState(item) === mark ? null : mark;
  applyMark(item, next);
  if (next === "has") prerequisites(item).forEach((each) => { each.self = "has"; });
  marksChanged();
}

export function clear() {
  roots.forEach((item) => setMark(item, null));
  marksChanged();
}

export function unmarkLone(item) {
  item.self = null;
  marksChanged();
}

export function unmarkLine(item, mark) {
  keepingLoneFilters(() => {
    const line = lineOf(item);
    if (line.length > 1) line.filter((each) => each.self === mark).forEach((each) => { each.self = null; });
    else setMark(item, null);
  });
  marksChanged();
}

function keepingLoneFilters(change) {
  const kept = items.filter((each) => keepsOwnFilter(each, each.self));
  change();
  kept.forEach((each) => { each.self = "has"; });
}

function marksChanged() {
  updateMatching();
  notify("marks");
}

export const barred = (item) => item.self !== "has"
  && [...item.alternatives, ...item.opponents].some((other) => other.self === "has");

const toggleState = (item) => (isUnitOrTech(item) ? item.self : branchState(item));

const spreadOf = (item) => [...chainOf(item), ...(isUnitOrTech(item) ? passedTo(item) : descendants(item))];

function applyMark(item, mark) {
  if (!isUnitOrTech(item) || !mark) return setMark(item, mark);
  if (mark === "lacks") {
    descendants(item).filter((each) => each.self === "has" && prerequisites(each).includes(item))
      .forEach((each) => { each.self = null; });
  }
  passedTo(item).forEach((each) => { each.self = mark; });
}

const setMark = (item, mark) => setMarkUnder(item, mark, item);

function setMarkUnder(item, mark, top) {
  if (!item.group) item.self = mark;
  for (const kid of item.kids) {
    if (!kid.rivals.includes(top)) setMarkUnder(kid, mark, top);
  }
}

function passedTo(item) {
  return itemChain(item).filter((each) => each.set === item.set);
}

function prerequisites(item) {
  const above = [];
  for (let p = item.parent; p && isUnitOrTech(p) && covers(p, item); p = p.parent) {
    above.push(p);
  }
  return above;
}

const covers = (above, item) => !(item.set & ~above.set);

export const behind = (item) => !!item.parent && (locked(item.parent) || behind(item.parent));

export const locked = (item) => barred(item) && !item.rivals.some((rival) => isInside(rival, item));

const isInside = (item, top) => !!item.parent && (item.parent === top || isInside(item.parent, top));

export const branchState = (item) => stateUnder(item, item);

function stateUnder(item, top) {
  const parts = item.kids.filter((kid) => !kid.rivals.includes(top)).map((kid) => stateUnder(kid, top));
  if (!item.group) parts.push(item.self);
  return parts.every((part) => part === parts[0]) ? parts[0] : "mixed";
}

export function checkboxState(item) {
  if (!isUnitOrTech(item) || !item.self) return branchState(item);
  return descendants(item).every((each) => !each.self || each.self === item.self) ? item.self : "mixed";
}

export const countOf = (item) => ({
  withItem: size(matching & (item.group ? item.all : item.set)),
  withBranch: size(matching & item.all),
});

export const matchingCivs = () => civsOf(matching);

export function filtersOf() {
  return [...loneFilters(), ...topFilters(markedFilters())].sort(byIndex);
}

const loneFilters = () => items.filter((item) => !item.original && keepsOwnFilter(item, item.self))
  .map((item) => ({ item, mark: "has", line: lineOf(item), lone: true }));

const topFilters = (marked) => marked.filter((filter) => !marked.some((other) => outranks(other, filter)));

const outranks = (other, filter) => other !== filter && other.mark === filter.mark && other.line[0] === filter.line[0]
  && (filter.mark === "has" ? depth(other) > depth(filter) : depth(other) < depth(filter));

const depth = ({ item, line }) => line.indexOf(item);

const markedFilters = () => items.filter((item) => !item.original).map((item) => ({ item, mark: filterMark(item) }))
  .filter(({ item, mark }) => mark && !covered(item, mark) && !keepsOwnFilter(item, mark))
  .map(({ item, mark }) => ({ item, mark, line: lineOf(item) }));

const covered = (item, mark) => items.some((each) => (each === item || each.original === item) && each.parent
  && branchState(each.parent) === mark && !keepsOwnFilter(each.parent, mark));

const byIndex = (a, b) => a.item.i - b.item.i;

export const entryOf = ({ item, mark, lone }) => ({
  named: (mark === "has" && !lone && lineOf(item).findLast((each) => each.self === "has" && !isLoneUnique(each)))
    || item,
  full: !isUnitOrTech(item) && item.kids.length > 1 && branchState(item) === "has",
});

const filterMark = (item) => (["has", "lacks"].includes(branchState(item)) ? branchState(item) : item.self);

const keepsOwnFilter = (item, mark) => mark === "has" && isLoneUnique(item);

const isLoneUnique = (item) => isUnique(item) && !lineOf(item).every(isUnique);

const isUnique = (item) => reachOf(item.key) === "unique";
