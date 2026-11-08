import { data } from "./datahandler.js";
import { ALL, setOf, size } from "./civsets.js";

export const items = [];

export const roots = [];

export function buildItems({ include, regionals }) {
  items.length = 0;
  roots.length = 0;
  collect(prune(withBorrowedKids(data.tree), { include, regionals }), null);
  storeBranchSets();
  linkBothWays("excludes", "rivals");
  addOpponents();
  linkBothWays("replaces", "alternatives");
  addSiblingAlternatives();
}

export const reachOf = (key) => data.pictures[key]?.reach;

const withBorrowedKids = (nodes, places = placesIn(data.tree)) => nodes.map((node) => {
  const originals = keysIn(node.replaces).flatMap((key) => borrowedKids(places, key));
  return { ...node, kids: [...withBorrowedKids(node.kids ?? [], places), ...originals] };
});

const placesIn = (nodes, inLine = false) => nodes.flatMap((node) => [
  { node, inLine }, ...placesIn(node.kids ?? [], inLine || !!node.item || !!node.lines),
]);

const borrowedKids = (places, key) => {
  const place = places.find(({ node }) => node.item === key);
  return !place || place.inLine ? [] : lentCopy(place.node).kids;
};

const lentCopy = (node) => ({ ...node, copy: true, kids: (node.kids ?? []).filter(isLendable).map(lentCopy) });

const isLendable = (kid) => !kid.unique && !kid.own && reachOf(kid.item) !== "unique";

const keysIn = (link) => [link ?? []].flat();

function prune(nodes, { include, regionals }) {
  return nodes.flatMap((node) => {
    const reach = reachOf(node.item);
    if ((!include && node.unique) || (!regionals && reach === "regional")) return [];
    const kids = prune(node.kids ?? [], { include, regionals });
    if (!include && reach === "unique") return liftedKids(node, kids);
    const rule = node.item && data.availability[node.item];
    const civs = rule ? size(setOf(rule)) : 0;
    if (!kids.length && (node.group || (!include && (civs === 1 || civs >= data.civs.length - 1)))) return [];
    return [{ ...node, kids }];
  });
}

const liftedKids = (node, kids) => kids.filter((kid) => !kid.copy)
  .map((kid) => ({ ...kid, via: [node.item, ...(kid.via ?? [])] }));

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

function storeBranchSets() {
  for (const item of [...items].reverse()) {
    item.all = branchSetOf(item);
  }
}

const branchSetOf = (item) => item.kids.reduce((set, kid) => set & kid.all, item.set);

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
