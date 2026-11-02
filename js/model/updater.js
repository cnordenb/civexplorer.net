import { data, load, treeKeys, pack } from "./datahandler.js";
import { fill } from "./texts.js";
import { iconFile, byFile } from "./icons.js";

const LINE_WIDTH = 120;
const ABBREVIATION = /[\p{L}\p{N}_]\.(\s|$)|\bE-|-\s/u;

const GAME_UPDATE = /Update\s*<a\b[^>]*\bhref="([^"]+)"[^>]*>\s*(\d+)\s*<\/a>/;

const isScalar = (value) => value === null || typeof value !== "object";

const isFlatList = (value) => Array.isArray(value) && value.every(isScalar);

const oneLine = (value) => {
  if (Array.isArray(value)) return `[${value.map(oneLine).join(", ")}]`;
  if (isScalar(value)) return JSON.stringify(value);
  return `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${oneLine(item)}`).join(", ")}}`;
};

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

const isLower = (char) => !!char && char !== char.toUpperCase() && char === char.toLowerCase();

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const fromExtra = (name, extra) => ({
  node: { name, name_string_id: extra.nameId, use_type: capitalise(extra.kind), node_type: capitalise(extra.reach) },
  owners: new Set(extra.has),
  counts: new Map([[extra.picture, 1]]),
});

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

function localName(strings, node, settings, offset) {
  const label = joinLines(strings[node.name_string_id] ?? "", settings);
  if (label && !ABBREVIATION.test(label)) return capitalise(label);
  const bold = /<b>(.*?)<\/b>/.exec(strings[node.help_string_id - offset] ?? "");
  return capitalise(bold ? joinLines(bold[1], settings) : label);
}

export function availabilityOf(owners, civs) {
  const having = civs.filter((civ) => owners.has(civ));
  const lacking = civs.filter((civ) => !owners.has(civ));
  if (!lacking.length) return "all";
  return having.length <= lacking.length ? { has: having } : { lacks: lacking };
}

export function pictureOf(node, counts) {
  const [picture] = [...counts].reduce((best, each) => (each[1] > best[1] ? each : best));
  const reach = /^(Regional|Unique)/.exec(node.node_type)?.[1].toLowerCase() ?? "common";
  return { kind: node.use_type.toLowerCase(), picture, reach };
}

export function missingText(set) {
  const codes = Object.keys(set.languages);
  const reference = set.text[codes[0]];
  const groups = [...new Set(treeKeys(set.tree, "group"))];
  return codes.flatMap((code) => {
    const text = set.text[code] ?? {};
    return [
      ...Object.keys(reference.ui).filter((key) => !text.ui?.[key]),
      ...groups.filter((key) => !text.groups?.[key]),
    ].map((name) => ({ language: set.languages[code].name, name }));
  });
}

function gather(civs, trees) {
  const nodes = new Map();
  const owners = new Map();
  const pictures = new Map();
  civs.forEach((civ, i) => {
    for (const node of [...trees[i].buildings, ...trees[i].units_techs]) {
      if (!nodes.has(node.name)) {
        nodes.set(node.name, node);
        owners.set(node.name, new Set());
        pictures.set(node.name, new Map());
      }
      if (node.node_status !== "NotAvailable") owners.get(node.name).add(civ);
      const counts = pictures.get(node.name);
      const seen = counts.get(node.picture_index) ?? 0;
      if (node.use_type === nodes.get(node.name).use_type) counts.set(node.picture_index, seen + 1);
    }
  });
  return { nodes, owners, pictures };
}

function addExtras(extras, { nodes, owners, pictures }, say) {
  for (const [name, extra] of Object.entries(extras)) {
    if (nodes.has(name)) say("sourced", { name });
    const added = fromExtra(name, extra);
    nodes.set(name, added.node);
    owners.set(name, added.owners);
    pictures.set(name, added.counts);
  }
}

function translate(current, fresh, { keys, nodes, techtree, strings }) {
  Object.entries(current.languages).forEach(([code, settings], i) => {
    const overrides = current.overrides[code] ?? {};
    const text = (fresh.text[code] ??= {});

    const gameName = (civ) => capitalise(joinLines(strings[i][techtree.civs[civ].name_string_id] ?? "", settings));

    text.civs = Object.fromEntries(fresh.civs.map((civ) => [civ, overrides[civ] || gameName(civ) || civ]));
    text.items = Object.fromEntries(keys.map((key) => [key,
      overrides[key] || localName(strings[i], nodes.get(key), settings, current.source.helpOffset) || key]));
  });
}

function compare(current, fresh, { keys, nodes, owners, say }) {
  const differs = (key, section) => JSON.stringify(current[section][key]) !== JSON.stringify(fresh[section][key]);

  fresh.civs.filter((civ) => !current.civs.includes(civ)).forEach((name) => say("civAdded", { name }));
  current.civs.filter((civ) => !fresh.civs.includes(civ)).forEach((name) => say("civRemoved", { name }));
  keys.filter((key) => key in current.availability && differs(key, "availability"))
    .forEach((name) => say("changed", { name }));
  keys.filter((key) => !owners.get(key).size).forEach((name) => say("nobody", { name }));
  for (const [code, settings] of Object.entries(current.languages)) {
    for (const section of ["civs", "items"]) {
      for (const [key, name] of Object.entries(fresh.text[code][section])) {
        const before = current.text[code]?.[section]?.[key];
        if (before !== undefined && before !== name) say("renamed", { language: settings.name, key, name });
      }
    }
  }
  [...nodes.keys()].filter((name) => !keys.includes(name) && !current.ignore.includes(name)).sort()
    .forEach((name) => say("unplaced", { name }));
  missingText(fresh).forEach((problem) => say("missingText", problem));
}

function addIcons(fresh, say) {
  for (const [name, own] of Object.entries(fresh.pictures)) {
    const atlas = (fresh.icons.atlas[own.kind] ??= []);
    if (atlas.includes(own.picture)) continue;
    atlas.push(own.picture);
    atlas.sort(byFile);
    say("icon", { name, file: iconFile(own) });
  }
}

function gameUpdate(current, page, say) {
  const found = GAME_UPDATE.exec(page);
  if (!found) {
    say("noUpdate", { source: current.source.name, number: current.source.update.number });
    return current.source.update;
  }
  const update = { number: Number(found[2]), url: found[1].replaceAll("&amp;", "&") };
  if (update.number !== current.source.update.number) say("newUpdate", update);
  return update;
}

function treeProblems(keys, nodes) {
  const duplicates = [...new Set(keys.filter((key, i) => keys.indexOf(key) !== i))].sort();
  const unknown = keys.filter((key) => !nodes.has(key));
  return [...duplicates.map((name) => ["duplicate", { name }]), ...unknown.map((name) => ["unknown", { name }])];
}

function refresh(current, upstream) {
  const { techtree, trees, strings, page } = upstream;
  const messages = [];

  const say = (key, values) => messages.push(fill(current.tools[key], values));

  const civs = Object.keys(techtree.civs).sort();
  const { nodes, owners, pictures } = gather(civs, trees);
  addExtras(current.extras, { nodes, owners, pictures }, say);
  const keys = treeKeys(current.tree, "item");
  const problems = treeProblems(keys, nodes);
  problems.forEach(([key, values]) => say(key, values));
  if (problems.length) return { messages, fresh: null };

  const fresh = structuredClone(current);
  fresh.civs = civs;
  fresh.availability = Object.fromEntries(keys.map((key) => [key, availabilityOf(owners.get(key), civs)]));
  fresh.pictures = Object.fromEntries(keys.map((key) => [key, pictureOf(nodes.get(key), pictures.get(key))]));
  addIcons(fresh, say);
  translate(current, fresh, { keys, nodes, techtree, strings });
  fresh.source.update = gameUpdate(current, page, say);
  compare(current, fresh, { keys, nodes, owners, say });
  return { messages, fresh };
}

export async function fetchUpdate() {
  const get = async (path) => JSON.parse(await load(data.source.data + path));

  const techtree = await get("data.json");
  const civs = Object.keys(techtree.civs).sort();
  const [trees, strings, page] = await Promise.all([
    Promise.all(civs.map((civ) => get(`trees/${civ.toUpperCase()}.json`))),
    Promise.all(Object.keys(data.languages).map((code) => get(`locales/${code}/strings.json`))),
    load(data.source.url),
  ]);
  const { messages, fresh } = refresh(data, { techtree, trees, strings, page });
  if (!fresh) return { messages, fresh, files: [] };
  const before = new Map(pack(data).map(({ path, value }) => [path, toJson(value)]));
  const files = pack(fresh).map(({ path, value }) => ({ path, json: toJson(value) }))
    .filter(({ path, json }) => path === "data.json" || json !== before.get(path));
  return { messages, fresh, files };
}
