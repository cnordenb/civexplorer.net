import {
  data, words, tag, collator, plural, fill, nameOf, civName, civsOf, civFile, cellOf,
} from "../model/datahandler.js";
import { items, matching, filtersOf, chipOf } from "../model/model.js";

export const $ = (id) => document.getElementById(id);

export const clone = (id) => $(id).content.firstElementChild.cloneNode(true);

export const simple = () => !document.documentElement.classList.contains("pictures");

export function place(icon, { column, row, columns, rows }) {
  icon.style.setProperty("--column", column);
  icon.style.setProperty("--row", row);
  icon.style.setProperty("--columns", columns);
  icon.style.setProperty("--rows", rows);
  return icon;
}

export function compose(node, template, values) {
  node.replaceChildren(...template.split(/(\{\w+\})/).filter(Boolean).map((part) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return key && Object.hasOwn(values, key) ? values[key] : part;
  }));
}

export function demand(actions, names) {
  const missing = names.filter((name) => typeof actions?.[name] !== "function");
  if (missing.length) throw new Error(`the controller has no ${missing.join(", ")}`);
  return actions;
}

export function writeFixed() {
  for (const node of document.querySelectorAll("[data-tool]")) node.textContent = data.tools[node.dataset.tool];
  $("sourceLink").href = data.source.url;
  $("sourceLink").textContent = data.source.name;
  $("rulesLink").href = data.source.rules.url;
  $("rulesLink").textContent = data.source.rules.name;
  $("projectLink").href = data.source.project.url;
  $("projectLink").textContent = data.source.project.name;
  compose($("notice"), data.source.notice, { rules: $("rulesLink"), project: $("projectLink") });
}

function writeTexts() {
  document.documentElement.lang = tag;
  for (const node of document.querySelectorAll("[data-text]")) node.textContent = words.ui[node.dataset.text];
  const [year, month] = data.source.updated.split("-").map(Number);
  compose($("source"), words.ui.source, {
    source: $("sourceLink"),
    date: new Intl.DateTimeFormat(tag, { year: "numeric", month: "long" }).format(new Date(year, month - 1)),
  });
}

export const textsView = {
  update: (change) => {
    if (change === "language" || change === "start") writeTexts();
  },
};

export let shared = new Set();

function share() {
  const seen = new Map();
  for (const item of items.filter((each) => !each.original)) seen.set(nameOf(item), (seen.get(nameOf(item)) ?? 0) + 1);
  shared = new Set([...seen].filter(([, n]) => n > 1).map(([name]) => name));
}

export function chipName(item, kind, own = false) {
  const { named, full } = chipOf(item, kind, own);
  const name = shared.has(nameOf(named)) && named.parent
    ? fill(words.ui.inParent, { name: nameOf(named), parent: nameOf(named.parent) })
    : nameOf(named);
  return full ? fill(words.ui.full, { name }) : name;
}

const civIcon = (civ) => place(clone("civIconTemplate"), cellOf(data.civs, civ, civFile));

function listCivs() {
  const civs = civsOf(matching).map((civ) => [civName(civ), civ]);
  $("count").textContent = plural("compatible", civs.length);
  $("civs").replaceChildren(...civs.sort(([a], [b]) => collator.compare(a, b)).map(([name, civ]) => {
    const li = clone("civTemplate");
    const link = li.firstElementChild;
    link.lastElementChild.textContent = name;
    if (!simple()) {
      link.href = `${data.source.url}#${civ}`;
      link.prepend(civIcon(civ));
    }
    return li;
  }));
  $("none").hidden = civs.length > 0;
  $("none").textContent = words.ui.noMatch;
}

export const civsView = { update: () => listCivs() };

function listFilters() {
  const filters = filtersOf();
  $("ticked").hidden = !filters.length;
  $("chips").replaceChildren(...filters.map(({ item, mark, own }) => {
    const li = clone("chipTemplate");
    const chip = li.querySelector(".chip");
    const name = chipName(item, mark, own);
    chip.dataset.i = item.i;
    chip.dataset.state = mark;
    chip.toggleAttribute("data-own", !!own);
    li.querySelector(".chip-label").textContent = fill(words.ui[mark === "has" ? "clearHas" : "clearLacks"], { name });
    li.querySelector(".chip-name").textContent = name;
    return li;
  }));
}

export const filtersView = {
  update: (change) => {
    if (change !== "marks" && change !== "look") share();
    listFilters();
  },
};

export function showPage() {
  $("top").hidden = false;
  $("content").hidden = false;
}

export function showLoadError(shown = true) {
  $("loadError").hidden = !shown;
}

let spinner = null;

const spin = (img) => Object.assign(img, { src: img.dataset.src });

export function showLoading(shown = true) {
  if (shown) $("loading").append(spinner ??= spin(clone("spinnerTemplate")));
  else spinner?.remove();
  $("loading").hidden = !shown;
  for (const id of ["top", "content"]) $(id).inert = shown;
}
