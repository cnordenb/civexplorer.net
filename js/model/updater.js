import { data, load, loadLanguages, firstLanguage, pack } from "./data/datahandler.js";
import { treeKeys } from "./itemtree.js";
import { fill } from "./texts.js";
import { iconFile, byFile } from "./icons.js";

const LINE_WIDTH = 120;
const ABBREVIATION = /[\p{L}\p{N}_]\.(\s|$)|\bE-|-\s/u;

const GAME_UPDATE = /Update\s*<a\b[^>]*\bhref="([^"]+)"[^>]*>\s*(\d+)\s*<\/a>/;

export async function fetchUpdate() {
  await loadLanguages();
  const { messages, fresh } = refresh(data, await fetchUpstream());
  if (!fresh) return { messages, blocked: true, counts: null, files: [] };
  return { messages, blocked: false, counts: countsOf(fresh), files: changedFiles(data, fresh) };
}

async function fetchUpstream() {
  const get = async (path) => JSON.parse(await load(data.source.data + path));

  const techtree = await get("data.json");
  const civs = Object.keys(techtree.civs).sort();
  const [trees, strings, page] = await Promise.all([
    keyedBy(civs, (civ) => get(`trees/${civ.toUpperCase()}.json`)),
    keyedBy(Object.keys(data.languages), (code) => get(`locales/${code}/strings.json`)),
    load(data.source.url),
  ]);
  return { civs, techtree, trees, strings, page };
}

async function keyedBy(keys, fetchOne) {
  return new Map(await Promise.all(keys.map(async (key) => [key, await fetchOne(key)])));
}

const countsOf = (fresh) => ({
  civs: fresh.civs.length,
  items: Object.keys(fresh.availability).length,
  languages: Object.keys(fresh.languages).length,
});

function changedFiles(current, fresh) {
  const before = new Map(pack(current).map(({ path, value }) => [path, toJson(value)]));
  return pack(fresh).map(({ path, value }) => ({ path, json: toJson(value) }))
    .filter(({ path, json }) => path === "data.json" || json !== before.get(path));
}

function refresh(current, upstream) {
  const messages = [];

  const say = (key, values) => messages.push(fill(current.tools[key], values));

  const { nodes, owners, pictures, sourced } = gather(upstream, current.extras);
  const keys = treeKeys(current.tree, "item");
  const problems = treeProblems(keys, nodes);
  [...sourced, ...problems].forEach(([key, values]) => say(key, values));
  if (problems.length) return { messages, fresh: null };
  const fresh = freshData(current, upstream.civs, { keys, nodes, owners, pictures });
  const icons = iconsFor(fresh.icons.atlas, fresh.pictures);
  fresh.icons = { ...fresh.icons, atlas: icons.atlas };
  fresh.text = translated(current, fresh, { keys, nodes, techtree: upstream.techtree, strings: upstream.strings });
  const update = gameUpdate(current, upstream.page);
  fresh.source.update = update.update;
  [
    ...icons.news, ...update.news, ...civChanges(current, fresh), ...availabilityChanges(current, fresh, keys),
    ...unowned(keys, owners), ...renames(current, fresh), ...unplaced(current, keys, nodes),
    ...missingText(fresh).map((problem) => ["missingText", problem]),
  ].forEach(([key, values]) => say(key, values));
  return { messages, fresh };
}

function gather({ civs, trees }, extras) {
  const game = fromTrees(civs, trees);
  const sourced = Object.keys(extras).filter((name) => game.nodes.has(name)).map((name) => ["sourced", { name }]);
  for (const [name, extra] of Object.entries(extras)) {
    const { node, owners, counts } = fromExtra(name, extra);
    game.nodes.set(name, node);
    game.owners.set(name, owners);
    game.pictures.set(name, counts);
  }
  return { ...game, sourced };
}

function fromTrees(civs, trees) {
  const nodes = new Map();
  const owners = new Map();
  const pictures = new Map();
  for (const civ of civs) {
    for (const node of [...trees.get(civ).buildings, ...trees.get(civ).units_techs].map(fromGame)) {
      if (!nodes.has(node.name)) {
        nodes.set(node.name, node);
        owners.set(node.name, new Set());
        pictures.set(node.name, new Map());
      }
      if (node.available) owners.get(node.name).add(civ);
      const counts = pictures.get(node.name);
      if (node.kind === nodes.get(node.name).kind) counts.set(node.picture, (counts.get(node.picture) ?? 0) + 1);
    }
  }
  return { nodes, owners, pictures };
}

const fromGame = (node) => ({
  name: node.name,
  nameId: node.name_string_id,
  helpId: node.help_string_id,
  kind: node.use_type.toLowerCase(),
  reach: /^(Regional|Unique)/.exec(node.node_type)?.[1].toLowerCase() ?? "common",
  picture: node.picture_index,
  available: node.node_status !== "NotAvailable",
});

export const fromExtra = (name, extra) => ({
  node: {
    name, nameId: extra.nameId, helpId: null, kind: extra.kind, reach: extra.reach, picture: extra.picture,
    available: true,
  },
  owners: new Set(extra.has),
  counts: new Map([[extra.picture, 1]]),
});

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function treeProblems(keys, nodes) {
  const duplicates = [...new Set(keys.filter((key, i) => keys.indexOf(key) !== i))].sort();
  const unknown = keys.filter((key) => !nodes.has(key));
  return [...duplicates.map((name) => ["duplicate", { name }]), ...unknown.map((name) => ["unknown", { name }])];
}

function freshData(current, civs, { keys, nodes, owners, pictures }) {
  const fresh = structuredClone(current);
  fresh.civs = civs;
  fresh.availability = Object.fromEntries(keys.map((key) => [key, availabilityOf(owners.get(key), civs)]));
  fresh.pictures = Object.fromEntries(keys.map((key) => [key, pictureOf(nodes.get(key), pictures.get(key))]));
  return fresh;
}

export function availabilityOf(owners, civs) {
  const having = civs.filter((civ) => owners.has(civ));
  const lacking = civs.filter((civ) => !owners.has(civ));
  if (!lacking.length) return "all";
  return having.length <= lacking.length ? { has: having } : { lacks: lacking };
}

export function pictureOf(node, counts) {
  const [picture] = [...counts].reduce((best, each) => (each[1] > best[1] ? each : best));
  return { kind: node.kind, picture, reach: node.reach };
}

function iconsFor(known, pictures) {
  const atlas = structuredClone(known);
  const news = [];
  for (const [name, sprite] of Object.entries(pictures)) {
    const list = (atlas[sprite.kind] ??= []);
    if (list.includes(sprite.picture)) continue;
    list.push(sprite.picture);
    list.sort(byFile);
    news.push(["icon", { name, file: iconFile(sprite) }]);
  }
  return { atlas, news };
}

function translated(current, fresh, { keys, nodes, techtree, strings }) {
  const texts = Object.entries(current.languages).map(([code, settings]) => {
    const naming = { strings: strings.get(code), settings, offset: current.source.helpOffset };
    const overrides = current.overrides[code] ?? {};

    const gameName = (civ) => capitalise(joinLines(naming.strings[techtree.civs[civ].name_string_id] ?? "", settings));

    return [code, {
      ...fresh.text[code],
      civs: Object.fromEntries(fresh.civs.map((civ) => [civ, overrides[civ] || gameName(civ) || civ])),
      items: Object.fromEntries(keys.map((key) => [key, overrides[key] || localName(nodes.get(key), naming) || key])),
    }];
  });
  return { ...fresh.text, ...Object.fromEntries(texts) };
}

export function joinLines(text, settings) {
  let joined = "";
  for (const part of text.split("<br>").map((piece) => piece.trim())) {
    if (!part) continue;
    if (!joined) joined = part;
    else if (!settings.spaces) joined += part;
    else if (joined.endsWith("-") && settings.mergeHyphens && isLower(part[0])) joined = joined.slice(0, -1) + part;
    else if (joined.endsWith("-")) joined += part;
    else joined += ` ${part}`;
  }
  return joined.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ").trim();
}

const isLower = (char) => !!char && char !== char.toUpperCase() && char === char.toLowerCase();

function localName(node, { strings, settings, offset }) {
  const label = joinLines(strings[node.nameId] ?? "", settings);
  if (label && !ABBREVIATION.test(label)) return capitalise(label);
  const bold = /<b>(.*?)<\/b>/.exec(strings[node.helpId - offset] ?? "");
  return capitalise(bold ? joinLines(bold[1], settings) : label);
}

function gameUpdate(current, page) {
  const before = current.source.update;
  const found = GAME_UPDATE.exec(page);
  if (!found) return { update: before, news: [["noUpdate", { source: current.source.name, number: before.number }]] };
  const update = { number: Number(found[2]), url: found[1].replaceAll("&amp;", "&") };
  return { update, news: update.number === before.number ? [] : [["newUpdate", update]] };
}

const civChanges = (current, fresh) => [
  ...fresh.civs.filter((civ) => !current.civs.includes(civ)).map((name) => ["civAdded", { name }]),
  ...current.civs.filter((civ) => !fresh.civs.includes(civ)).map((name) => ["civRemoved", { name }]),
];

const availabilityChanges = (current, fresh, keys) => keys.filter((key) => key in current.availability
  && JSON.stringify(current.availability[key]) !== JSON.stringify(fresh.availability[key]))
  .map((name) => ["changed", { name }]);

const unowned = (keys, owners) => keys.filter((key) => !owners.get(key).size).map((name) => ["nobody", { name }]);

function renames(current, fresh) {
  const renamesIn = (code, section) => Object.entries(fresh.text[code][section])
    .filter(([key, name]) => ![undefined, name].includes(current.text[code]?.[section]?.[key]));

  return Object.entries(current.languages).flatMap(([code, { name: language }]) => ["civs", "items"]
    .flatMap((section) => renamesIn(code, section)).map(([key, name]) => ["renamed", { language, key, name }]));
}

const unplaced = (current, keys, nodes) => [...nodes.keys()]
  .filter((name) => !keys.includes(name) && !current.ignore.includes(name)).sort()
  .map((name) => ["unplaced", { name }]);

export function missingText(siteData) {
  const codes = Object.keys(siteData.languages);
  const reference = siteData.text[firstLanguage(siteData)];
  const groups = [...new Set(treeKeys(siteData.tree, "group"))];
  return codes.flatMap((code) => {
    const text = siteData.text[code] ?? {};
    return [
      ...Object.keys(reference.ui).filter((key) => !text.ui?.[key]),
      ...groups.filter((key) => !text.groups?.[key]),
    ].map((name) => ({ language: siteData.languages[code].name, name }));
  });
}

export function toJson(value, indent = "") {
  const inner = `${indent}  `;

  const rows = (list) => `[\n${list.map((item) => inner + toJson(item, inner)).join(",\n")}\n${indent}]`;

  if (isScalar(value) || isFlatList(value)) return oneLine(value);
  if (Array.isArray(value)) return rows(value);
  const entries = Object.entries(value);
  const simple = entries.every(([, item]) => isScalar(item) || isFlatList(item));
  if (simple && (entries.length === 1 || indent.length + oneLine(value).length <= LINE_WIDTH)) return oneLine(value);
  const head = entries.slice(0, -1);
  const [lastKey, last] = entries[entries.length - 1];
  if (Array.isArray(last) && head.every(([, item]) => isScalar(item))) {
    const opening = head.map(([key, item]) => `${oneLine(key)}: ${oneLine(item)}, `).join("");
    return `{${opening}${oneLine(lastKey)}: ${rows(last)}}`;
  }
  const members = entries.map(([key, item]) => `${inner}${oneLine(key)}: ${toJson(item, inner)}`);
  return `{\n${members.join(",\n")}\n${indent}}`;
}

const isScalar = (value) => value === null || typeof value !== "object";

const isFlatList = (value) => Array.isArray(value) && value.every(isScalar);

function oneLine(value) {
  if (Array.isArray(value)) return `[${value.map(oneLine).join(", ")}]`;
  if (isScalar(value)) return JSON.stringify(value);
  return `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${oneLine(item)}`).join(", ")}}`;
}
