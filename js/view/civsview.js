import { data } from "../model/data/datahandler.js";
import { words, collator, plural, fill, nameOf, civName } from "../model/texts.js";
import { civFile, cellOf } from "../model/icons.js";
import { items, filtersOf, entryOf, matchingCivs } from "../model/model.js";
import { $, clone, simple, place, demand, changesNames } from "./toolkit.js";

const NEEDS = ["unchip"];

const CLEAR_LABEL = { has: "clearHas", lacks: "clearLacks" };

export let view;

let shared = new Set();

let actions = null;

let focusAfter = null;

const filterOfChip = new WeakMap();

export function startCivsView(controller) {
  actions = demand(controller, NEEDS);
  $("chips").addEventListener("click", onChip);
}

function onChip(e) {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  focusAfter = [...chipsShown()].indexOf(chip);
  actions.unchip(filterOfChip.get(chip));
}

function refocusChip(at) {
  const chips = chipsShown();
  (chips[at] || chips[at - 1] || $("civTitle")).focus();
}

const chipsShown = () => $("chips").querySelectorAll(".chip");

export const civsView = { update: () => listCivs() };

function listCivs() {
  const named = matchingCivs().map((civ) => [civName(civ), civ]).sort(byName);
  $("count").textContent = plural("compatible", named.length);
  $("civs").replaceChildren(...named.map(civEntry));
  $("none").hidden = named.length > 0;
  $("none").textContent = words.ui.noMatch;
}

const byName = ([a], [b]) => collator.compare(a, b);

function civEntry([name, civ]) {
  const li = clone("civTemplate");
  const link = li.querySelector(".civ");
  link.querySelector(".civ-name").textContent = name;
  if (!simple()) {
    link.href = `${data.source.url}#${civ}`;
    link.prepend(civIcon(civ));
  }
  return li;
}

const civIcon = (civ) => place(clone("civIconTemplate"), cellOf(data.civs, civ, civFile));

export function setView(choice) {
  view = choice;
  $("civs").classList.toggle("tiles", choice === "tile");
}

export const filtersView = {
  update: (change) => {
    if (changesNames(change)) shared = sharedNames();
    listFilters();
  },
};

function sharedNames() {
  const seen = new Map();
  for (const item of items.filter((each) => !each.original)) {
    const name = nameOf(item);
    seen.set(name, (seen.get(name) ?? 0) + 1);
  }
  return new Set([...seen].filter(([, n]) => n > 1).map(([name]) => name));
}

function listFilters() {
  const filters = filtersOf();
  $("ticked").hidden = !filters.length;
  $("chips").replaceChildren(...filters.map(chipEntry));
  if (focusAfter !== null) refocusChip(focusAfter);
  focusAfter = null;
}

function chipEntry(filter) {
  const { item, mark } = filter;
  const li = clone("chipTemplate");
  const chip = li.querySelector(".chip");
  const name = chipName(filter);
  chip.dataset.i = item.i;
  chip.dataset.state = mark;
  filterOfChip.set(chip, filter);
  li.querySelector(".chip-label").textContent = fill(words.ui[CLEAR_LABEL[mark]], { name });
  li.querySelector(".chip-name").textContent = name;
  return li;
}

export function chipName(filter) {
  const { named, full } = entryOf(filter);
  const itemName = nameOf(named);
  const name = shared.has(itemName) && named.parent
    ? fill(words.ui.inParent, { name: itemName, parent: nameOf(named.parent) })
    : itemName;
  return full ? fill(words.ui.full, { name }) : name;
}

export const nameIsShared = (name) => shared.has(name);
