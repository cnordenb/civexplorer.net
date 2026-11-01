import { data, words, numbers, size, plural, fill, nameOf, cellOf } from "../model/datahandler.js";
import { items, roots, matching, boxState, barred, locked } from "../model/model.js";
import { $, clone, simple, place, compose, demand } from "./stringbuilder.js";

const NEEDS = ["toggle", "branch", "key", "find", "enter", "clear", "expandAll", "collapseAll", "unchip"];

const rows = new Map();
let actions = null;
let press = null;
let touchEnded = -Infinity;
let swallowClick = false;

export const rowOf = (item) => rows.get(item);

const opened = (row) => row?.twisty?.getAttribute("aria-expanded") === "true";

export const isOpen = (item) => opened(rows.get(item));

export const shown = (item) => !item.parent || (isOpen(item.parent) && shown(item.parent));

const heading = (item) => item.group && !!item.parent;

const focusOf = (item) => (heading(item) ? rows.get(item).twisty : rows.get(item).node);

export const itemAt = (target) => {
  const item = items[target.closest?.(".node")?.dataset.i];
  return item && !heading(item) ? item : undefined;
};

function dress(item) {
  const row = rows.get(item);
  const own = item.group ? data.icons.groups[item.key] : data.pictures[item.key];
  if (simple() || !own) return row.icon?.remove();
  row.icon ??= place(clone("nodeIconTemplate"), cellOf(data.icons.atlas[own.kind], own.picture));
  Object.assign(row.icon.dataset, own);
  row.label.before(row.icon);
}

function build(list, ul) {
  for (const item of list) {
    const li = clone("itemTemplate");
    const twisty = li.querySelector(".twisty");
    const kids = li.querySelector("ul");
    const row = { entry: li };
    rows.set(item, row);
    row.node = li.querySelector(".node");
    row.label = li.querySelector(".name");
    row.lacking = li.querySelector(".lacking");
    row.count = li.querySelector(".count");
    row.civCount = li.querySelector(".civ-count");
    row.node.dataset.i = item.i;
    row.node.classList.toggle("group", item.group);
    if (heading(item)) {
      ["role", "tabindex", "aria-checked"].forEach((name) => row.node.removeAttribute(name));
      row.node.querySelector(".box").remove();
    }
    row.label.id = `t${item.i}`;
    if (item.kids.length) {
      li.querySelector(".gap").remove();
      row.twisty = twisty;
      twisty.dataset.i = item.i;
      twisty.setAttribute("aria-controls", `k${item.i}`);
      twisty.setAttribute("aria-labelledby", `t${item.i}`);
      row.list = kids;
      kids.id = `k${item.i}`;
      build(item.kids, kids);
    } else {
      twisty.remove();
      kids.remove();
    }
    ul.append(li);
  }
}

const endPress = () => {
  if (!press) return;
  clearTimeout(press.timer);
  rows.get(press.item).node.classList.remove("pressed");
  if (press.timer) touchEnded = performance.now();
  press = null;
};

function replant() {
  const open = new Set([...rows].filter(([, row]) => opened(row)).map(([item]) => item.path));
  endPress();
  rows.clear();
  $("tree").replaceChildren();
  build(roots, $("tree"));
  items.forEach(dress);
  for (const item of items) if (open.has(item.path)) setOpen(item, true);
}

function label() {
  for (const item of items) rows.get(item).label.textContent = nameOf(item);
}

function count(item) {
  const row = rows.get(item);
  const own = size(matching & (item.group ? item.all : item.set));
  const all = size(matching & item.all);
  if (!item.parent && !own) {
    row.count.textContent = "";
    row.civCount.textContent = "";
    return;
  }
  if (item.group || !item.kids.length || isOpen(item)) {
    row.count.textContent = numbers.format(own);
    row.civCount.textContent = plural("civCount", own);
    return;
  }
  compose(row.count, words.ui.range, { own: numbers.format(own), all: numbers.format(all) });
  row.civCount.textContent = fill(words.ui.civRange, { own: plural("civCount", own), all: plural("civCount", all) });
}

export function setOpen(item, open) {
  const row = rows.get(item);
  if (!row?.twisty) return;
  row.twisty.setAttribute("aria-expanded", String(open));
  row.list.hidden = !open;
  count(item);
}

function paint() {
  for (const item of items) {
    const row = rows.get(item);
    const s = heading(item) ? null : boxState(item);
    row.node.dataset.state = s || "";
    const checked = s === "has" ? "true" : s === "mixed" ? "mixed" : "false";
    if (!heading(item)) row.node.setAttribute("aria-checked", checked);
    row.lacking.textContent = s === "lacks" ? words.ui.lacking : "";
    row.node.classList.toggle("self", !!item.self);
    const shut = barred(item);
    row.entry.classList.toggle("barred", shut);
    row.node.ariaDisabled = shut ? "true" : null;
    if (row.twisty) row.twisty.ariaDisabled = locked(item) ? "true" : null;
  }
}

export const treeView = {
  update: (change) => {
    if (change === "tree" || change === "start") replant();
    if (change === "look") items.forEach(dress);
    else if (change !== "marks") label();
    items.filter(locked).forEach((item) => setOpen(item, false));
    paint();
    items.forEach(count);
  },
};

export function focus(item, onTwisty = false) {
  const { twisty } = rows.get(item);
  (onTwisty && twisty ? twisty : focusOf(item)).focus();
}

export function highlight(found, searched) {
  for (const item of items) rows.get(item).node.classList.toggle("found", found.includes(item));
  $("found").textContent = !searched ? "" : found.length ? plural("found", found.length) : words.ui.noneFound;
}

export function reveal(item) {
  const { node } = rows.get(item);
  const pane = node.closest(".scroll");
  const view = pane.getBoundingClientRect();
  const row = node.getBoundingClientRect();
  pane.scrollTop += Math.min(0, row.top - view.top) + Math.max(0, row.bottom - view.bottom);
}

export const findText = () => $("find").value;

function onKey(e) {
  const item = items[e.target.dataset.i];
  if (!item) return;
  const modified = e.altKey || e.ctrlKey || e.metaKey;
  const onTwisty = e.target === rows.get(item).twisty;
  if (actions.key(item, { key: e.key, shift: e.shiftKey, modified, onTwisty })) e.preventDefault();
}

function onPress(e) {
  swallowClick = false;
  endPress();
  const item = itemAt(e.target);
  if (!item || (e.button !== 2 && e.pointerType !== "touch")) return;
  press = { item, id: e.pointerId, x: e.clientX, y: e.clientY, ready: e.button === 2 };
  if (press.ready) return;
  press.timer = setTimeout(() => {
    press.ready = true;
    rows.get(item).node.classList.add("pressed");
  }, 500);
}

function onRelease(e) {
  if (!press || e.pointerId !== press.id) return;
  const { item, ready } = press;
  endPress();
  if (!ready || itemAt(e.target) !== item) return;
  actions.toggle(item, "lacks");
  swallowClick = true;
}

function onMenu(e) {
  const item = itemAt(e.target);
  if (!item) return;
  e.preventDefault();
  if (e.button === 2 || press || performance.now() - touchEnded < 600) return;
  actions.toggle(item, "lacks");
}

function onClick(e) {
  const twisty = e.target.closest(".twisty");
  const branch = items[(twisty ?? e.target.closest(".node"))?.dataset.i];
  if (branch && (twisty || heading(branch))) return actions.branch(branch);
  const item = itemAt(e.target);
  if (item && !swallowClick) actions.toggle(item, "has");
}

function onChip(e) {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const at = [...$("chips").querySelectorAll(".chip")].indexOf(chip);
  actions.unchip(items[chip.dataset.i], chip.dataset.state, chip.hasAttribute("data-own"));
  const chips = $("chips").querySelectorAll(".chip");
  (chips[at] || chips[at - 1] || $("civTitle")).focus();
}

function wireTools() {
  const swap = (from, to, act) => $(from).addEventListener("click", () => {
    const focused = document.activeElement === $(from);
    act();
    if (focused && !simple()) $(to).focus();
  });

  swap("expandAll", "collapseAll", () => actions.expandAll());
  swap("collapseAll", "expandAll", () => actions.collapseAll());
  $("clear").addEventListener("click", () => actions.clear());
  $("find").addEventListener("input", () => actions.find(findText()));
  $("find").addEventListener("keydown", (e) => {
    if (e.key === "Enter") actions.enter();
  });
  $("clearFind").addEventListener("click", () => {
    $("find").value = "";
    actions.find("");
    $("find").focus();
  });
  $("chips").addEventListener("click", onChip);
}

export function startTreeView(controller) {
  const tree = $("tree");
  actions = demand(controller, NEEDS);
  tree.addEventListener("keydown", onKey);
  tree.addEventListener("pointerdown", onPress);
  tree.addEventListener("pointermove", (e) => {
    if (press && e.pointerId === press.id && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) endPress();
  });
  tree.addEventListener("pointerup", onRelease);
  tree.addEventListener("pointercancel", endPress);
  tree.addEventListener("contextmenu", onMenu);
  tree.addEventListener("click", onClick);
  wireTools();
}
