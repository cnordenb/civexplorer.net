import { data, ALL, setOf, size, words, nameOf, fill } from "./datahandler.js";

export const items = [];
export const roots = [];
export let include = false;
export let regional = true;
export let matching = 0n;
export let shared = new Set();

export const setIncluded = (on) => {
  include = on;
};

export const setRegionals = (on) => {
  regional = on;
};

function collect(nodes, parent) {
  for (const node of nodes) {
    if (node.item && !(node.item in data.availability)) throw new Error(`no availability for ${node.item}`);
    const key = node.item ?? node.group;
    const item = {
      i: items.length, key, path: parent ? `${parent.path}|${key}` : key, group: !node.item, lines: !!node.lines,
      set: node.item ? setOf(data.availability[node.item]) : ALL, self: null, kids: [], parent, original: null,
      excludes: node.excludes, rivals: [], opponents: [], replaces: node.replaces, alternatives: [], copy: !!node.copy,
    };
    (parent ? parent.kids : roots).push(item);
    items.push(item);
    collect(node.kids ?? [], item);
  }
}

export const whole = (item) => (item.all ??= item.kids.reduce((s, kid) => s & whole(kid), item.set));

function prune(nodes, every = false, regionals = true) {
  return nodes.flatMap((node) => {
    const reach = data.pictures[node.item]?.reach;
    if ((!every && (node.unique || reach === "unique")) || (!regionals && reach === "regional")) return [];
    const kids = prune(node.kids ?? [], every, regionals);
    const rule = node.item && data.availability[node.item];
    const civs = rule ? size(setOf(rule)) : 0;
    if (!kids.length && (node.group || (!every && (civs === 1 || civs >= data.civs.length - 1)))) return [];
    return [{ ...node, kids }];
  });
}

const lent = (kid) => !kid.unique && !kid.own && data.pictures[kid.item]?.reach !== "unique";

const common = (node) => ({ ...node, copy: true, kids: (node.kids ?? []).filter(lent).map(common) });

function borrowed(nodes, key, line = false) {
  for (const node of nodes) {
    if (node.item === key) return line ? [] : common(node).kids;
    const found = borrowed(node.kids ?? [], key, line || !!node.item || !!node.lines);
    if (found) return found;
  }
  return null;
}

const named = (link) => [link ?? []].flat();

const variants = (nodes) => nodes.map((node) => {
  const originals = named(node.replaces).flatMap((key) => borrowed(data.tree, key) ?? []);
  return { ...node, kids: [...variants(node.kids ?? []), ...originals] };
});

function twin() {
  for (const copy of items.filter((each) => each.copy && !each.group)) {
    const original = items.find((each) => !each.copy && each.key === copy.key);
    if (!original) continue;
    copy.original = original;
    Object.defineProperty(copy, "self", { get: () => original.self, set: (mark) => { original.self = mark; } });
  }
}

function pair(link, list) {
  for (const item of items) for (const key of named(item[link])) {
    const other = items.find((each) => !each.group && each.key === key);
    if (!other) continue;
    item[list].push(other);
    other[list].push(item);
  }
}

const side = (item, rival) => (item === rival ? [] : [item, ...item.kids.flatMap((kid) => side(kid, rival))]);

function oppose() {
  for (const item of items) for (const rival of item.rivals) {
    for (const each of side(item, rival)) each.opponents.push(...side(rival, item));
  }
}

function siblings() {
  for (const item of items.filter((each) => each.replaces)) {
    const others = item.alternatives.filter((each) => named(item.replaces).includes(each.key))
      .flatMap((each) => each.alternatives);
    for (const other of others) if (other !== item && !item.alternatives.includes(other)) item.alternatives.push(other);
  }
}

export function rebuild() {
  const marks = new Map(items.map((item) => [item.path, item.self]));
  items.length = 0;
  roots.length = 0;
  collect(prune(variants(data.tree), include, regional), null);
  items.forEach(whole);
  pair("excludes", "rivals");
  oppose();
  pair("replaces", "alternatives");
  siblings();
  for (const item of items) item.self = marks.get(item.path) ?? null;
  twin();
}

export const barred = (item) => item.self !== "has"
  && [...item.alternatives, ...item.opponents].some((other) => other.self === "has");

const within = (item, top) => !!item.parent && (item.parent === top || within(item.parent, top));

export const locked = (item) => barred(item) && !item.rivals.some((rival) => within(rival, item));

export function setMark(item, mark, top = item) {
  if (!item.group) item.self = mark;
  for (const kid of item.kids) if (!kid.rivals.includes(top)) setMark(kid, mark, top);
}

export function state(item, top = item) {
  const parts = item.kids.filter((kid) => !kid.rivals.includes(top)).map((kid) => state(kid, top));
  if (!item.group) parts.push(item.self);
  return parts.every((part) => part === parts[0]) ? parts[0] : "mixed";
}

export const isUnitOrTech = (item) => {
  for (let p = item.parent; p; p = p.parent) if (!p.group || p.lines) return !item.group;
  return false;
};

const descendants = (item) => item.kids.flatMap((kid) => [kid, ...descendants(kid)]);

function prerequisites(item) {
  const above = [];
  for (let p = item.parent; p && isUnitOrTech(p); p = p.parent) above.push(p);
  return above;
}

function passedTo(item) {
  const line = [item];
  while (line.at(-1).kids.length === 1 && !line.at(-1).kids[0].group) line.push(line.at(-1).kids[0]);
  return line.filter((each) => size(each.set) === size(item.set));
}

const current = (item) => (isUnitOrTech(item) ? item.self : state(item));

function put(item, kind) {
  if (!isUnitOrTech(item) || !kind) return setMark(item, kind);
  if (kind === "lacks") {
    descendants(item).filter((each) => each.self === "has").forEach((each) => { each.self = null; });
  }
  passedTo(item).forEach((each) => { each.self = kind; });
}

const reached = (item) => [...chainOf(item), ...(isUnitOrTech(item) ? passedTo(item) : descendants(item))];

export function mark(item, kind) {
  const next = current(item) === kind ? null : kind;
  put(item, next);
  if (next === "has") prerequisites(item).forEach((each) => { each.self = "has"; });
  return next ? reached(item) : [];
}

export function boxState(item) {
  if (!isUnitOrTech(item) || !item.self) return state(item);
  return descendants(item).every((each) => !each.self || each.self === item.self) ? item.self : "mixed";
}

export function fit() {
  const marked = items.filter((item) => item.self);
  matching = marked.reduce((m, item) => m & (item.self === "has" ? item.set : ~item.set), ALL);
  return marked;
}

export const markOf = (item) => (["has", "lacks"].includes(state(item)) ? state(item) : item.self);

export const lineEnd = (item) => {
  let end = item;
  while (end.kids.length === 1 && !end.kids[0].group) end = end.kids[0];
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

export function chainOf(item) {
  const chain = [item];
  while (chain.at(-1).kids.length === 1) chain.push(chain.at(-1).kids[0]);
  return chain;
}

const unique = (item) => data.pictures[item.key]?.reach === "unique";

const alone = (item) => unique(item) && !lineOf(item).every(unique);

const held = (item, mark) => mark === "has" && alone(item);

export function filtersOf() {
  const covered = (item, mark) => items.some((each) => (each === item || each.original === item) && each.parent
    && state(each.parent) === mark && !held(each.parent, mark));

  const marked = items.filter((item) => !item.original && markOf(item) && !covered(item, markOf(item))
    && !held(item, markOf(item))).map((item) => ({ item, mark: markOf(item), line: lineOf(item) }));

  const depth = ({ item, line }) => line.indexOf(item);

  const outranks = (other, filter) => other !== filter && other.mark === filter.mark && other.line[0] === filter.line[0]
    && (filter.mark === "has" ? depth(other) > depth(filter) : depth(other) < depth(filter));

  const own = items.filter((item) => !item.original && held(item, item.self))
    .map((item) => ({ item, mark: "has", line: lineOf(item), own: true }));
  return [...own, ...marked.filter((filter) => !marked.some((other) => outranks(other, filter)))]
    .sort((a, b) => a.item.i - b.item.i);
}

export function share() {
  const seen = new Map();
  for (const item of items.filter((each) => !each.original)) seen.set(nameOf(item), (seen.get(nameOf(item)) ?? 0) + 1);
  shared = new Set([...seen].filter(([, n]) => n > 1).map(([name]) => name));
}

export function chipName(item, kind, own = false) {
  const unit = isUnitOrTech(item);
  const named = (kind === "has" && !own && lineOf(item).findLast((each) => each.self === "has" && !alone(each)))
    || item;
  const name = shared.has(nameOf(named)) && named.parent
    ? fill(words.ui.inParent, { name: nameOf(named), parent: nameOf(named.parent) })
    : nameOf(named);
  return !unit && item.kids.length > 1 && state(item) === "has" ? fill(words.ui.full, { name }) : name;
}

export function unmarkLine(item, kind, own = false) {
  const kept = own ? [] : items.filter((each) => held(each, each.self));
  const line = lineOf(item);
  if (own) item.self = null;
  else if (line.length > 1) line.filter((each) => each.self === kind).forEach((each) => { each.self = null; });
  else setMark(item, null);
  kept.forEach((each) => { each.self = "has"; });
}
