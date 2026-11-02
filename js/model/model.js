import { data, recall, remember, keepInAddress } from "./datahandler.js";
import { ALL, setOf, size, civsOf } from "./civsets.js";
import { useLanguage } from "./texts.js";

export const items = [];
export const roots = [];
export let include = false;
export let regional = true;
let matching = 0n;

const observers = new Set();

export const subscribe = (observer) => {
  observers.add(observer);
};

export const unsubscribe = (observer) => {
  observers.delete(observer);
};

const notify = (change) => observers.forEach((observer) => observer.update(change));

export const setIncluded = (on) => {
  include = on;
  remember("include", String(on));
  rebuild();
  notify("tree");
};

export const setRegionals = (on) => {
  regional = on;
  remember("regional", String(on));
  rebuild();
  notify("tree");
};

function collect(nodes, parent) {
  for (const node of nodes) {
    if (node.item && !(node.item in data.availability)) throw new Error(`no availability for ${node.item}`);
    const key = node.item ?? node.group;
    const path = [parent?.path, ...(node.via ?? []), key].filter(Boolean).join("|");
    const item = {
      i: items.length, key, path, group: !node.item, lines: !!node.lines,
      set: node.item ? setOf(data.availability[node.item]) : ALL, self: null, kids: [], parent, original: null,
      excludes: node.excludes, rivals: [], opponents: [], replaces: node.replaces, alternatives: [], copy: !!node.copy,
    };
    (parent ? parent.kids : roots).push(item);
    items.push(item);
    collect(node.kids ?? [], item);
  }
}

export const whole = (item) => (item.all ??= item.kids.reduce((s, kid) => s & whole(kid), item.set));

const liftedKids = (node, kids) => kids.filter((kid) => !kid.copy)
  .map((kid) => ({ ...kid, via: [node.item, ...(kid.via ?? [])] }));

function prune(nodes, every = false, regionals = true) {
  return nodes.flatMap((node) => {
    const reach = data.pictures[node.item]?.reach;
    if ((!every && node.unique) || (!regionals && reach === "regional")) return [];
    const kids = prune(node.kids ?? [], every, regionals);
    if (!every && reach === "unique") return liftedKids(node, kids);
    const rule = node.item && data.availability[node.item];
    const civs = rule ? size(setOf(rule)) : 0;
    if (!kids.length && (node.group || (!every && (civs === 1 || civs >= data.civs.length - 1)))) return [];
    return [{ ...node, kids }];
  });
}

const isLendable = (kid) => !kid.unique && !kid.own && data.pictures[kid.item]?.reach !== "unique";

const lentCopy = (node) => ({ ...node, copy: true, kids: (node.kids ?? []).filter(isLendable).map(lentCopy) });

const placesIn = (nodes, inLine = false) => nodes.flatMap((node) => [
  { node, inLine }, ...placesIn(node.kids ?? [], inLine || !!node.item || !!node.lines),
]);

const borrowedKids = (places, key) => {
  const place = places.find(({ node }) => node.item === key);
  return !place || place.inLine ? [] : lentCopy(place.node).kids;
};

const keysIn = (link) => [link ?? []].flat();

const withBorrowedKids = (nodes, places = placesIn(data.tree)) => nodes.map((node) => {
  const originals = keysIn(node.replaces).flatMap((key) => borrowedKids(places, key));
  return { ...node, kids: [...withBorrowedKids(node.kids ?? [], places), ...originals] };
});

function shareMarksWithOriginals() {
  for (const copy of items.filter((each) => each.copy && !each.group)) {
    const original = items.find((each) => !each.copy && each.key === copy.key);
    if (!original) continue;
    copy.original = original;
    Object.defineProperty(copy, "self", { get: () => original.self, set: (mark) => { original.self = mark; } });
  }
}

function linkBothWays(link, list) {
  for (const item of items) for (const key of keysIn(item[link])) {
    const other = items.find((each) => !each.group && each.key === key);
    if (!other) continue;
    item[list].push(other);
    other[list].push(item);
  }
}

const branchWithout = (item, rival) => (item === rival
  ? []
  : [item, ...item.kids.flatMap((kid) => branchWithout(kid, rival))]);

function addOpponents() {
  for (const item of items) for (const rival of item.rivals) {
    for (const each of branchWithout(item, rival)) each.opponents.push(...branchWithout(rival, item));
  }
}

function addSiblingAlternatives() {
  for (const item of items.filter((each) => each.replaces)) {
    const others = item.alternatives.filter((each) => keysIn(item.replaces).includes(each.key))
      .flatMap((each) => each.alternatives);
    for (const other of others) if (other !== item && !item.alternatives.includes(other)) item.alternatives.push(other);
  }
}

function rebuild() {
  const marks = new Map(items.map((item) => [item.path, item.self]));
  items.length = 0;
  roots.length = 0;
  collect(prune(withBorrowedKids(data.tree), include, regional), null);
  items.forEach(whole);
  linkBothWays("excludes", "rivals");
  addOpponents();
  linkBothWays("replaces", "alternatives");
  addSiblingAlternatives();
  for (const item of items) item.self = marks.get(item.path) ?? null;
  shareMarksWithOriginals();
  updateMatching();
}

export function startModel(code) {
  include = recall("include") === "true";
  regional = recall("regional") !== "false";
  useLanguage(code);
  rebuild();
}

export const chooseLanguage = (code) => {
  useLanguage(code);
  remember("language", code);
  keepInAddress("lng", code);
  notify("language");
};

export const barred = (item) => item.self !== "has"
  && [...item.alternatives, ...item.opponents].some((other) => other.self === "has");

const isInside = (item, top) => !!item.parent && (item.parent === top || isInside(item.parent, top));

export const locked = (item) => barred(item) && !item.rivals.some((rival) => isInside(rival, item));

export const behind = (item) => !!item.parent && (locked(item.parent) || behind(item.parent));

function setMark(item, mark, top = item) {
  if (!item.group) item.self = mark;
  for (const kid of item.kids) if (!kid.rivals.includes(top)) setMark(kid, mark, top);
}

export function state(item, top = item) {
  const parts = item.kids.filter((kid) => !kid.rivals.includes(top)).map((kid) => state(kid, top));
  if (!item.group) parts.push(item.self);
  return parts.every((part) => part === parts[0]) ? parts[0] : "mixed";
}

export const ancestors = (item) => {
  const above = [];
  for (let p = item.parent; p; p = p.parent) above.push(p);
  return above;
};

export const isUnitOrTech = (item) => !item.group && ancestors(item).some((p) => !p.group || p.lines);

const descendants = (item) => item.kids.flatMap((kid) => [kid, ...descendants(kid)]);

const covers = (above, item) => !(item.set & ~above.set);

function prerequisites(item) {
  const above = [];
  for (let p = item.parent; p && isUnitOrTech(p) && covers(p, item); p = p.parent) above.push(p);
  return above;
}

const chainWhile = (item, takes) => {
  const chain = [item];
  while (chain.at(-1).kids.length === 1 && takes(chain.at(-1).kids[0])) chain.push(chain.at(-1).kids[0]);
  return chain;
};

const itemChain = (item) => chainWhile(item, (kid) => !kid.group);

export const chainOf = (item) => chainWhile(item, () => true);

function passedTo(item) {
  return itemChain(item).filter((each) => each.set === item.set);
}

const current = (item) => (isUnitOrTech(item) ? item.self : state(item));

function applyMark(item, kind) {
  if (!isUnitOrTech(item) || !kind) return setMark(item, kind);
  if (kind === "lacks") {
    descendants(item).filter((each) => each.self === "has" && prerequisites(each).includes(item))
      .forEach((each) => { each.self = null; });
  }
  passedTo(item).forEach((each) => { each.self = kind; });
}

const spreadOf = (item) => [...chainOf(item), ...(isUnitOrTech(item) ? passedTo(item) : descendants(item))];

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

export function boxState(item) {
  if (!isUnitOrTech(item) || !item.self) return state(item);
  return descendants(item).every((each) => !each.self || each.self === item.self) ? item.self : "mixed";
}

function updateMatching() {
  matching = items.filter((item) => item.self)
    .reduce((m, item) => m & (item.self === "has" ? item.set : ~item.set), ALL);
}

const marksChanged = () => {
  updateMatching();
  notify("marks");
};

export const countOf = (item) => ({
  own: size(matching & (item.group ? item.all : item.set)),
  all: size(matching & item.all),
});

export const matchingCivs = () => civsOf(matching);

const markOf = (item) => (["has", "lacks"].includes(state(item)) ? state(item) : item.self);

export const lineEnd = (item) => {
  const end = itemChain(item).at(-1);
  return item.group || end.kids.length ? null : end;
};

export function lineOf(item) {
  let root = item;
  while (root.parent && !root.parent.group && root.parent.kids.length === 1) root = root.parent;
  if (!lineEnd(root)) return [item];
  const line = [root];
  while (line.at(-1).kids.length) line.push(line.at(-1).kids[0]);
  return line;
}

const isUnique = (item) => data.pictures[item.key]?.reach === "unique";

const isLoneUnique = (item) => isUnique(item) && !lineOf(item).every(isUnique);

const keepsOwnFilter = (item, mark) => mark === "has" && isLoneUnique(item);

export function filtersOf() {
  const covered = (item, mark) => items.some((each) => (each === item || each.original === item) && each.parent
    && state(each.parent) === mark && !keepsOwnFilter(each.parent, mark));

  const marked = items.filter((item) => !item.original && markOf(item) && !covered(item, markOf(item))
    && !keepsOwnFilter(item, markOf(item))).map((item) => ({ item, mark: markOf(item), line: lineOf(item) }));

  const depth = ({ item, line }) => line.indexOf(item);

  const outranks = (other, filter) => other !== filter && other.mark === filter.mark && other.line[0] === filter.line[0]
    && (filter.mark === "has" ? depth(other) > depth(filter) : depth(other) < depth(filter));

  const own = items.filter((item) => !item.original && keepsOwnFilter(item, item.self))
    .map((item) => ({ item, mark: "has", line: lineOf(item), own: true }));
  return [...own, ...marked.filter((filter) => !marked.some((other) => outranks(other, filter)))]
    .sort((a, b) => a.item.i - b.item.i);
}

export const chipOf = ({ item, mark, own }) => ({
  named: (mark === "has" && !own && lineOf(item).findLast((each) => each.self === "has" && !isLoneUnique(each)))
    || item,
  full: !isUnitOrTech(item) && item.kids.length > 1 && state(item) === "has",
});

export function unmarkOwn(item) {
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
