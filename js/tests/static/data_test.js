import { data } from "../../model/data/datahandler.js";
import { treeKeys } from "../../model/itemtree.js";
import { availabilityOf, pictureOf, fromExtra } from "../../model/updater.js";
import { expect, need, codes, keys } from "../helpers_test.js";

const KNOWN = ["item", "group", "kids", "unique", "lines", "own", "excludes", "replaces"];
const LINKS = ["excludes", "replaces"];
const REACHES = ["common", "regional", "unique"];
const FOOTER = {
  name: (source) => !!source.name,
  url: (source) => !!source.url,
  "update.number": (source) => Number.isInteger(source.update?.number),
  "update.url": (source) => String(source.update?.url).startsWith("https:"),
};
const UPDATER = {
  data: (source) => !!source.data,
  helpOffset: (source) => Number.isInteger(source.helpOffset),
};

export function textTests() {
  const languages = codes();
  const groups = [...new Set(treeKeys(data.tree, "group"))];
  expect("data: each language has every interface text",
    languages.flatMap((code) => missing(code, "ui", Object.keys(data.text[languages[0]].ui))));
  expect("data: each language names every row of the tree",
    languages.flatMap((code) => [...missing(code, "groups", groups), ...missing(code, "items", keys())]));
  expect("data: each language names every civilisation", languages.flatMap((code) => missing(code, "civs", data.civs)));
}

const missing = (code, part, names) => names.filter((name) => !data.text[code]?.[part]?.[name])
  .map((name) => `${code}: ${name}`);

export function dataTests() {
  const all = keys();
  treeTests(all);
  itemTests(all);
  textDataTests(all);
  sourceDataTests();
}

function treeTests(all) {
  const nodes = nodesOf(data.tree);

  const rows = (odd) => nodes.filter(odd).map((node) => node.item ?? node.group);

  expect("data: each item is in the tree once", all.filter((key, i) => all.indexOf(key) !== i));
  expect("data: the tree uses only known fields",
    rows((node) => Object.keys(node).some((key) => !KNOWN.includes(key))));
  expect("data: only groups are marked unique", rows(misflagged("unique", "group")));
  expect("data: only groups are marked lines", rows(misflagged("lines", "group")));
  expect("data: only items are marked own", rows(misflagged("own", "item")));
  expect("data: each item's excludes or replaces names other items of the tree", rows((node) => LINKS
    .some((link) => link in node && (!node.item || !linksOf(node, link).length
      || linksOf(node, link).some((key) => key === node.item || !all.includes(key))))));
}

const nodesOf = (list) => list.flatMap((node) => [node, ...nodesOf(node.kids ?? [])]);

const misflagged = (flag, kind) => (node) => flag in node && (node[flag] !== true || !node[kind]);

const linksOf = (node, link) => [node[link]].flat();

function itemTests(all) {
  const extras = Object.entries(data.extras && typeof data.extras === "object" ? data.extras : {});
  expect("data: each item's availability names only known civilisations",
    all.filter((key) => !knownCivs(data.availability[key])));
  expect("data: each item has an icon",
    all.filter((key) => !data.pictures[key]?.kind || !Number.isInteger(data.pictures[key]?.picture)));
  expect("data: each item says whether it is common, regional or unique",
    all.filter((key) => !REACHES.includes(data.pictures[key]?.reach)));
  expect("data: each extra is a tree item with a name number and known civilisations", [
    ...need(data.extras && typeof data.extras === "object", "extras"),
    ...extras.filter(([key, extra]) => !all.includes(key) || !Number.isInteger(extra.nameId)
      || !Array.isArray(extra.has) || extra.has.some((civ) => !data.civs.includes(civ))).map(([key]) => key),
  ]);
  expect("data: data.json stores each extra as the updater writes it",
    extras.filter(([key, extra]) => !kept(key, extra)).map(([key]) => key));
}

const knownCivs = (rule) => rule === "all"
  || (rule?.has ?? rule?.lacks ?? [null]).every((civ) => data.civs.includes(civ));

function kept(key, extra) {
  const { node, owners, counts } = fromExtra(key, extra);
  return alike(availabilityOf(owners, data.civs), data.availability[key])
    && alike(pictureOf(node, counts), data.pictures[key]);
}

const alike = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function textDataTests(all) {
  const languages = codes();
  const english = data.text[languages[0]].ui;
  expect("data: counted texts have an 'other' form", languages.flatMap((code) => Object.entries(data.text[code].ui)
    .filter(([, value]) => typeof value === "object" && !value.other).map(([key]) => `${code}: ${key}`)));
  expect("data: translations keep the same placeholders", languages.flatMap((code) => Object.entries(english)
    .filter(([key, value]) => holes(value) !== holes(data.text[code].ui[key])).map(([key]) => `${code}: ${key}`)));
  expect("data: every override names a known item or civilisation", languages.flatMap((code) => Object
    .keys(data.overrides[code] ?? {}).filter((key) => !all.includes(key) && !data.civs.includes(key))
    .map((key) => `${code}: ${key}`)));
}

const holes = (value) => [...new Set(JSON.stringify(value ?? "").match(/\{\w+\}/g) ?? [])].sort().join();

function sourceDataTests() {
  const source = data.source ?? {};
  expect("data: the source the footer names is filled in", unfilled(FOOTER, source));
  expect("data: the updater's source is filled in", unfilled(UPDATER, source));
  expect("data: no tool text is empty", Object.entries(data.tools).filter(([, text]) => !text).map(([key]) => key));
  expect("data: the ignore list is a list of names",
    need(Array.isArray(data.ignore) && data.ignore.every((name) => typeof name === "string"), "ignore"));
}

const unfilled = (fields, source) => Object.entries(fields).filter(([, filled]) => !filled(source))
  .map(([field]) => `source.${field}`);
