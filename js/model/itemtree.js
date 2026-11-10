import { data } from "./data/datahandler.js";
import { allCivs, setOf, size } from "./civsets.js";

export const items = [];

export const roots = [];

export function buildItems({ include, regional }) {
  items.length = 0;
  roots.length = 0;
  collect(prune(withBorrowedKids(data.tree, placesIn(data.tree)), { include, regional }), null);
  storeBranchSets();
  linkOriginals();
  linkRivals();
  linkAlternatives();
}

export const reachOf = (key) => data.pictures[key]?.reach;

const withBorrowedKids = (nodes, places) => nodes.map((node) => {
  const originals = keysIn(node.replaces).flatMap((key) => borrowedKids(places, key));
  return { ...node, kids: [...withBorrowedKids(node.kids ?? [], places), ...originals] };
});

const placesIn = (nodes) => placesBelow(nodes, false);

const placesBelow = (nodes, inLine) => nodes.flatMap((node) => [
  { node, inLine }, ...placesBelow(node.kids ?? [], inLine || !!node.item || !!node.lines),
]);

export const treeKeys = (nodes, key) => nodes.flatMap((node) => [
  ...(node[key] ? [node[key]] : []), ...treeKeys(node.kids ?? [], key),
]);

function borrowedKids(places, key) {
  const place = places.find(({ node }) => node.item === key);
  return !place || place.inLine ? [] : lentCopy(place.node).kids;
}

const lentCopy = (node) => ({ ...node, copy: true, kids: (node.kids ?? []).filter(isLendable).map(lentCopy) });

const isLendable = (kid) => !kid.unique && !kid.own && reachOf(kid.item) !== "unique";

const keysIn = (link) => [link ?? []].flat();

function prune(nodes, options) {
  return nodes.flatMap((node) => {
    if (isHidden(node, options)) return [];
    const kids = prune(node.kids ?? [], options);
    if (!options.include && reachOf(node.item) === "unique") return liftedKids(node, kids);
    if (isBareLeaf(node, kids, options.include)) return [];
    return [{ ...node, kids }];
  });
}

const isHidden = (node, { include, regional }) => (!include && node.unique)
  || (!regional && reachOf(node.item) === "regional");

function ownerCount(node) {
  const rule = node.item && data.availability[node.item];
  return rule ? size(setOf(rule)) : 0;
}

function tellsNothing(node) {
  const owners = ownerCount(node);
  return owners === 1 || owners >= data.civs.length - 1;
}

const isBareLeaf = (node, kids, include) => !kids.length && (node.group || (!include && tellsNothing(node)));

const liftedKids = (node, kids) => kids.filter((kid) => !kid.copy)
  .map((kid) => ({ ...kid, via: [node.item, ...(kid.via ?? [])] }));

function collect(nodes, parent) {
  for (const node of nodes) {
    if (node.item && !(node.item in data.availability)) throw new Error(`no availability for ${node.item}`);
    const item = newItem(node, parent);
    item.unitOrTech = inUnitOrTechLine(item);
    (parent ? parent.kids : roots).push(item);
    items.push(item);
    collect(node.kids ?? [], item);
  }
}

function newItem(node, parent) {
  const key = node.item ?? node.group;
  return {
    i: items.length, key, path: [parent?.path, ...(node.via ?? []), key].filter(Boolean).join("|"),
    group: !node.item, lines: !!node.lines, copy: !!node.copy, unitOrTech: false,
    set: node.item ? setOf(data.availability[node.item]) : allCivs, all: 0n,
    self: null,
    parent, kids: [], original: null,
    excludes: node.excludes, rivals: [], opponents: [], replaces: node.replaces, alternatives: [],
  };
}

const inUnitOrTechLine = (item) => !item.group && ancestors(item).some((p) => !p.group || p.lines);

function storeBranchSets() {
  for (const item of [...items].reverse()) {
    item.all = branchSetOf(item);
  }
}

const branchSetOf = (item) => item.kids.reduce((set, kid) => set & kid.all, item.set);

function linkOriginals() {
  for (const copy of items.filter((each) => each.copy && !each.group)) {
    copy.original = items.find((each) => !each.copy && each.key === copy.key) ?? null;
  }
}

function linkRivals() {
  linkBothWays("excludes", "rivals");
  addOpponents();
}

function linkAlternatives() {
  linkBothWays("replaces", "alternatives");
  addSiblingAlternatives();
}

function linkBothWays(link, list) {
  for (const item of items) {
    for (const key of keysIn(item[link])) {
      const other = items.find((each) => !each.group && each.key === key);
      if (!other) continue;
      item[list].push(other);
      other[list].push(item);
    }
  }
}

function addOpponents() {
  for (const item of items) {
    for (const rival of item.rivals) {
      opposeBranches(item, rival);
    }
  }
}

function opposeBranches(item, rival) {
  const opponents = branchWithout(rival, item);
  for (const each of branchWithout(item, rival)) {
    each.opponents.push(...opponents);
  }
}

const branchWithout = (item, rival) => (item === rival
  ? []
  : [item, ...item.kids.flatMap((kid) => branchWithout(kid, rival))]);

function addSiblingAlternatives() {
  for (const item of items.filter((each) => each.replaces)) {
    const others = item.alternatives.filter((each) => keysIn(item.replaces).includes(each.key))
      .flatMap((each) => each.alternatives);
    for (const other of others) {
      if (other !== item && !item.alternatives.includes(other)) item.alternatives.push(other);
    }
  }
}

export function lineOf(item) {
  let root = item;
  while (root.parent && !root.parent.group && root.parent.kids.length === 1) {
    root = root.parent;
  }
  if (!endsInLine(root)) return [item];
  const line = [root];
  while (line.at(-1).kids.length) {
    line.push(line.at(-1).kids[0]);
  }
  return line;
}

export const endsInLine = (item) => !item.group && !lineEnd(item).kids.length;

export const lineEnd = (item) => itemChain(item).at(-1);

export const chainOf = (item) => chainWhile(item, () => true);

export const itemChain = (item) => chainWhile(item, (kid) => !kid.group);

function chainWhile(item, takes) {
  const chain = [item];
  while (chain.at(-1).kids.length === 1 && takes(chain.at(-1).kids[0])) {
    chain.push(chain.at(-1).kids[0]);
  }
  return chain;
}

export const isUnitOrTech = (item) => item.unitOrTech;

export function ancestors(item) {
  const above = [];
  for (let p = item.parent; p; p = p.parent) {
    above.push(p);
  }
  return above;
}

export const descendants = (item) => item.kids.flatMap((kid) => [kid, ...descendants(kid)]);
