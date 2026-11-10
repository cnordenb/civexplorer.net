import { words, numbers, plural, fill, nameOf } from "../model/texts.js";
import { spriteOf, atlasOf, cellOf } from "../model/icons.js";
import { items, roots, checkboxState, barred, locked, countOf } from "../model/model.js";
import { $, clone, simple, place, compose, demand, changesNames, rebuilds } from "./toolkit.js";

export const LONG_PRESS_MS = 500;

const MENU_AFTER_TOUCH_MS = 600;

const PRESS_DRIFT_PX = 10;

const SECONDARY_BUTTON = 2;

const ARIA_CHECKED = { has: "true", mixed: "mixed" };

const NEEDS = ["gesture", "branch", "key", "find", "enter", "clear", "expandAll", "collapseAll", "redrawn"];

const rows = new Map();
let actions = null;
let press = null;
let touchEnded = -Infinity;
let swallowClick = false;

export function startTreeView(controller) {
  const tree = $("tree");
  actions = demand(controller, NEEDS);
  tree.addEventListener("keydown", onKey);
  tree.addEventListener("pointerdown", onPress);
  tree.addEventListener("pointermove", onMove);
  tree.addEventListener("pointerup", onRelease);
  tree.addEventListener("pointercancel", endPress);
  tree.addEventListener("contextmenu", onMenu);
  tree.addEventListener("click", onClick);
  wireTools();
}

function onKey(e) {
  const item = items[e.target.dataset.i];
  if (!item) return;
  const modified = e.altKey || e.ctrlKey || e.metaKey;
  const onTwisty = e.target === rows.get(item).twisty;
  actions.key(item, { key: e.key, shift: e.shiftKey, modified, onTwisty, consume: () => e.preventDefault() });
}

function onPress(e) {
  swallowClick = false;
  endPress();
  const item = itemAt(e.target);
  const secondary = e.button === SECONDARY_BUTTON;
  const touch = e.pointerType === "touch";
  if (!item || (!secondary && !touch)) return;
  const node = rows.get(item).node;
  press = { item, node, id: e.pointerId, x: e.clientX, y: e.clientY, touch, ready: secondary };
  if (press.ready) return;
  press.timer = setTimeout(() => {
    press.ready = true;
    press.node.classList.add("pressed");
  }, LONG_PRESS_MS);
}

function onMove(e) {
  if (press && e.pointerId === press.id && drifted(e)) endPress();
}

const drifted = (e) => Math.hypot(e.clientX - press.x, e.clientY - press.y) > PRESS_DRIFT_PX;

function endPress() {
  if (!press) return;
  clearTimeout(press.timer);
  press.node.classList.remove("pressed");
  if (press.touch) touchEnded = performance.now();
  press = null;
}

export function itemAt(target) {
  const item = items[target.closest?.(".node")?.dataset.i];
  return item && !heading(item) ? item : undefined;
}

const heading = (item) => item.group && !!item.parent;

export function branchAt(target) {
  const twisty = target.closest?.(".twisty");
  const branch = items[(twisty ?? target.closest?.(".node"))?.dataset.i];
  return branch && (twisty || heading(branch)) ? branch : null;
}

function onRelease(e) {
  if (!press || e.pointerId !== press.id) return;
  const { item, ready } = press;
  endPress();
  if (!ready || itemAt(e.target) !== item) return;
  actions.gesture(item, "hold");
  swallowClick = true;
}

function onMenu(e) {
  const item = itemAt(e.target);
  if (!item) return;
  e.preventDefault();
  if (menuHandledElsewhere(e)) return;
  actions.gesture(item, "menu");
}

const menuHandledElsewhere = (e) => e.button === SECONDARY_BUTTON || !!press || justTouched();

const justTouched = () => performance.now() - touchEnded < MENU_AFTER_TOUCH_MS;

function onClick(e) {
  const branch = branchAt(e.target);
  if (branch) {
    actions.branch(branch);
    return;
  }
  const item = itemAt(e.target);
  if (item && !swallowClick) actions.gesture(item, "click");
}

function wireTools() {
  handOffFocus("expandAll", "collapseAll", () => actions.expandAll());
  handOffFocus("collapseAll", "expandAll", () => actions.collapseAll());
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
}

const handOffFocus = (from, to, act) => $(from).addEventListener("click", () => {
  const focused = document.activeElement === $(from);
  act();
  if (focused && !$(from).checkVisibility()) $(to).focus();
});

export const findText = () => $("find").value;

export const treeView = {
  update: (change) => {
    if (rebuilds(change)) replant();
    if (change === "look") items.forEach(dress);
    if (changesNames(change)) label();
    items.filter(locked).forEach((item) => setOpen(item, false));
    paint();
    items.forEach(showCounts);
    actions.redrawn(change);
  },
};

function replant() {
  const openPaths = new Set([...rows].filter(([, row]) => opened(row)).map(([item]) => item.path));
  endPress();
  rows.clear();
  $("tree").replaceChildren();
  build(roots, $("tree"));
  items.forEach(dress);
  for (const item of items) {
    if (openPaths.has(item.path)) setOpen(item, true);
  }
}

const opened = (row) => row?.twisty?.getAttribute("aria-expanded") === "true";

function build(list, ul) {
  for (const item of list) {
    const row = newRow(clone("itemTemplate"), item);
    rows.set(item, row);
    if (heading(item)) makeHeading(row);
    buildBranch(row, item);
    ul.append(row.entry);
  }
}

function newRow(li, item) {
  const row = {
    entry: li,
    node: li.querySelector(".node"),
    label: li.querySelector(".name"),
    lacking: li.querySelector(".lacking"),
    count: li.querySelector(".count"),
    civCount: li.querySelector(".civ-count"),
  };
  row.node.dataset.i = item.i;
  row.node.classList.toggle("group", item.group);
  row.label.id = labelId(item);
  return row;
}

const labelId = (item) => `t${item.i}`;

const kidsId = (item) => `k${item.i}`;

function makeHeading(row) {
  ["role", "tabindex", "aria-checked"].forEach((name) => row.node.removeAttribute(name));
  row.node.querySelector(".box").remove();
}

function buildBranch(row, item) {
  const twisty = row.entry.querySelector(".twisty");
  const kids = row.entry.querySelector("ul");
  if (!item.kids.length) {
    twisty.remove();
    kids.remove();
    return;
  }
  row.entry.querySelector(".gap").remove();
  row.twisty = twisty;
  twisty.dataset.i = item.i;
  twisty.setAttribute("aria-controls", kidsId(item));
  twisty.setAttribute("aria-labelledby", labelId(item));
  row.list = kids;
  kids.id = kidsId(item);
  build(item.kids, kids);
}

function dress(item) {
  const row = rows.get(item);
  const sprite = spriteOf(item);
  if (simple() || !sprite) {
    row.icon?.remove();
    return;
  }
  row.icon ??= place(clone("nodeIconTemplate"), cellOf(atlasOf(sprite.kind), sprite.picture));
  Object.assign(row.icon.dataset, sprite);
  row.label.before(row.icon);
}

export function setOpen(item, open) {
  const row = rows.get(item);
  if (!row?.twisty) return;
  row.twisty.setAttribute("aria-expanded", String(open));
  row.list.hidden = !open;
  showCounts(item);
}

function showCounts(item) {
  const row = rows.get(item);
  const { withItem, withBranch } = countOf(item);
  if (!item.parent && !withItem) {
    row.count.textContent = "";
    row.civCount.textContent = "";
    return;
  }
  const own = numbers.format(withItem);
  const ownCivs = plural("civCount", withItem);
  if (!showsRange(item)) {
    row.count.textContent = own;
    row.civCount.textContent = ownCivs;
    return;
  }
  compose(row.count, words.ui.range, { own, all: numbers.format(withBranch) });
  row.civCount.textContent = fill(words.ui.civRange, { own: ownCivs, all: plural("civCount", withBranch) });
}

const showsRange = (item) => !item.group && item.kids.length > 0 && !isOpen(item);

export const isOpen = (item) => opened(rows.get(item));

function label() {
  for (const item of items) {
    rows.get(item).label.textContent = nameOf(item);
  }
}

function paint() {
  for (const item of items) {
    const row = rows.get(item);
    paintMark(row, item);
    paintBar(row, item);
  }
}

function paintMark(row, item) {
  const isHeading = heading(item);
  const mark = isHeading ? null : checkboxState(item);
  row.node.dataset.state = mark || "";
  if (!isHeading) row.node.setAttribute("aria-checked", ARIA_CHECKED[mark] ?? "false");
  row.lacking.textContent = mark === "lacks" ? words.ui.lacking : "";
  row.node.classList.toggle("self", !!item.self);
}

function paintBar(row, item) {
  const isBarred = barred(item);
  row.entry.classList.toggle("barred", isBarred);
  row.node.ariaDisabled = isBarred ? "true" : null;
  if (row.twisty) row.twisty.ariaDisabled = locked(item) ? "true" : null;
}

export function focusRow(item) {
  const { node, twisty } = rows.get(item);
  (heading(item) ? twisty : node).focus();
}

export function focusTwisty(item) {
  const { twisty } = rows.get(item);
  if (twisty) twisty.focus();
  else focusRow(item);
}

export function highlight(found, searched) {
  for (const item of items) {
    rows.get(item).node.classList.toggle("found", found.includes(item));
  }
  $("found").textContent = foundText(found, searched);
}

function foundText(found, searched) {
  if (!searched) return "";
  return found.length ? plural("found", found.length) : words.ui.noneFound;
}

export function reveal(item) {
  const { node } = rows.get(item);
  const pane = node.closest(".scroll");
  const view = pane.getBoundingClientRect();
  const box = node.getBoundingClientRect();
  pane.scrollTop += Math.min(0, box.top - view.top) + Math.max(0, box.bottom - view.bottom);
}

export const rowOf = (item) => rows.get(item);

export const shown = (item) => !item.parent || (isOpen(item.parent) && shown(item.parent));
