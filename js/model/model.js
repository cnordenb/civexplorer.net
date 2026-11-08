import { recall, remember, keepInAddress } from "./datahandler.js";
import { ALL, size, civsOf } from "./civsets.js";
import { useLanguage } from "./texts.js";
import { items, roots, buildItems, reachOf } from "./itemtree.js";

export { items, roots };
export let include = false;
export let regional = true;
let matching = 0n;

const observers = new Set();

export const subscribe = (observer) => {
  observers.add(observer);
};

const notify = (change) => observers.forEach((observer) => observer.update(change));

export function startModel(code) {
  include = recall("include") === "true";
  regional = recall("regional") !== "false";
  useLanguage(code);
  rebuild();
}

export const setInclude = (on) => {
  include = on;
  remember("include", String(on));
  rebuild();
  notify("tree");
};

export const setRegional = (on) => {
  regional = on;
  remember("regional", String(on));
  rebuild();
  notify("tree");
};

export const setLanguage = (code) => {
  useLanguage(code);
  remember("language", code);
  keepInAddress("lng", code);
  notify("language");
};

function rebuild() {
  const marks = new Map(items.map((item) => [item.path, item.self]));
  buildItems({ include, regionals: regional });
  for (const item of items) {
    item.self = marks.get(item.path) ?? null;
  }
  shareMarksWithOriginals();
  updateMatching();
}

function shareMarksWithOriginals() {
  for (const copy of items.filter((each) => each.copy && !each.group)) {
    const original = items.find((each) => !each.copy && each.key === copy.key);
    if (!original) continue;
    copy.original = original;
    Object.defineProperty(copy, "self", { get: () => original.self, set: (mark) => { original.self = mark; } });
  }
}

function updateMatching() {
  matching = items.filter((item) => item.self)
    .reduce((m, item) => m & (item.self === "has" ? item.set : ~item.set), ALL);
}

export const toReveal = (item, kind) => (barred(item) || current(item) === kind ? [] : spreadOf(item));

export function mark(item, kind) {
  if (barred(item)) return;
  const next = current(item) === kind ? null : kind;
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

export function unmarkLine(item, kind) {
  const kept = items.filter((each) => keepsOwnFilter(each, each.self));
  const line = lineOf(item);
  if (line.length > 1) line.filter((each) => each.self === kind).forEach((each) => { each.self = null; });
  else setMark(item, null);
  kept.forEach((each) => { each.self = "has"; });
  marksChanged();
}

const marksChanged = () => {
  updateMatching();
  notify("marks");
};

export const barred = (item) => item.self !== "has"
  && [...item.alternatives, ...item.opponents].some((other) => other.self === "has");

const current = (item) => (isUnitOrTech(item) ? item.self : state(item));

const spreadOf = (item) => [...chainOf(item), ...(isUnitOrTech(item) ? passedTo(item) : descendants(item))];

function applyMark(item, kind) {
  if (!isUnitOrTech(item) || !kind) return setMark(item, kind);
  if (kind === "lacks") {
    descendants(item).filter((each) => each.self === "has" && prerequisites(each).includes(item))
      .forEach((each) => { each.self = null; });
  }
  passedTo(item).forEach((each) => { each.self = kind; });
}

function setMark(item, mark, top = item) {
  if (!item.group) item.self = mark;
  for (const kid of item.kids) {
    if (!kid.rivals.includes(top)) setMark(kid, mark, top);
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

const descendants = (item) => item.kids.flatMap((kid) => [kid, ...descendants(kid)]);

export const behind = (item) => !!item.parent && (locked(item.parent) || behind(item.parent));

export const locked = (item) => barred(item) && !item.rivals.some((rival) => isInside(rival, item));

const isInside = (item, top) => !!item.parent && (item.parent === top || isInside(item.parent, top));

export function state(item, top = item) {
  const parts = item.kids.filter((kid) => !kid.rivals.includes(top)).map((kid) => state(kid, top));
  if (!item.group) parts.push(item.self);
  return parts.every((part) => part === parts[0]) ? parts[0] : "mixed";
}

export function boxState(item) {
  if (!isUnitOrTech(item) || !item.self) return state(item);
  return descendants(item).every((each) => !each.self || each.self === item.self) ? item.self : "mixed";
}

export const countOf = (item) => ({
  withItem: size(matching & (item.group ? item.all : item.set)),
  withBranch: size(matching & item.all),
});

export const matchingCivs = () => civsOf(matching);

export function filtersOf() {
  const covered = (item, mark) => items.some((each) => (each === item || each.original === item) && each.parent
    && state(each.parent) === mark && !keepsOwnFilter(each.parent, mark));

  const marked = items.filter((item) => !item.original && markOf(item) && !covered(item, markOf(item))
    && !keepsOwnFilter(item, markOf(item))).map((item) => ({ item, mark: markOf(item), line: lineOf(item) }));

  const depth = ({ item, line }) => line.indexOf(item);

  const outranks = (other, filter) => other !== filter && other.mark === filter.mark && other.line[0] === filter.line[0]
    && (filter.mark === "has" ? depth(other) > depth(filter) : depth(other) < depth(filter));

  const lone = items.filter((item) => !item.original && keepsOwnFilter(item, item.self))
    .map((item) => ({ item, mark: "has", line: lineOf(item), lone: true }));
  return [...lone, ...marked.filter((filter) => !marked.some((other) => outranks(other, filter)))]
    .sort((a, b) => a.item.i - b.item.i);
}

export const chipOf = ({ item, mark, lone }) => ({
  named: (mark === "has" && !lone && lineOf(item).findLast((each) => each.self === "has" && !isLoneUnique(each)))
    || item,
  full: !isUnitOrTech(item) && item.kids.length > 1 && state(item) === "has",
});

const markOf = (item) => (["has", "lacks"].includes(state(item)) ? state(item) : item.self);

const keepsOwnFilter = (item, mark) => mark === "has" && isLoneUnique(item);

const isLoneUnique = (item) => isUnique(item) && !lineOf(item).every(isUnique);

const isUnique = (item) => reachOf(item.key) === "unique";

export function lineOf(item) {
  let root = item;
  while (root.parent && !root.parent.group && root.parent.kids.length === 1) {
    root = root.parent;
  }
  if (!lineEnd(root)) return [item];
  const line = [root];
  while (line.at(-1).kids.length) {
    line.push(line.at(-1).kids[0]);
  }
  return line;
}

export const lineEnd = (item) => {
  const end = itemChain(item).at(-1);
  return item.group || end.kids.length ? null : end;
};

export const chainOf = (item) => chainWhile(item, () => true);

const itemChain = (item) => chainWhile(item, (kid) => !kid.group);

const chainWhile = (item, takes) => {
  const chain = [item];
  while (chain.at(-1).kids.length === 1 && takes(chain.at(-1).kids[0])) {
    chain.push(chain.at(-1).kids[0]);
  }
  return chain;
};

export const isUnitOrTech = (item) => !item.group && ancestors(item).some((p) => !p.group || p.lines);

export const ancestors = (item) => {
  const above = [];
  for (let p = item.parent; p; p = p.parent) {
    above.push(p);
  }
  return above;
};
