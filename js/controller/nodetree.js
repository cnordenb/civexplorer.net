import { plain, nameOf } from "../model/texts.js";
import {
  items, mark, toReveal, clear, unmarkOwn, unmarkLine, chainOf, ancestors, locked, behind,
} from "../model/model.js";
import { isOpen, shown, setOpen, focus, highlight, reveal, findText, startTreeView } from "../view/treeview.js";

const GESTURES = { click: "has", hold: "lacks", menu: "lacks" };

const MARK_KEYS = { " ": "has", x: "lacks", X: "lacks" };

let found = [];

const expand = (item) => {
  if (!locked(item)) chainOf(item).forEach((each) => setOpen(each, true));
};

const branch = (item) => (isOpen(item) ? setOpen(item, false) : expand(item));

function toggle(item, kind) {
  for (const each of toReveal(item, kind)) {
    for (let p = each.parent; p && p !== item.parent; p = p.parent) setOpen(p, true);
  }
  mark(item, kind);
}

const gesture = (item, how) => toggle(item, GESTURES[how]);

function search(text) {
  found = text ? items.filter((item) => !behind(item) && plain(nameOf(item)).includes(text)) : [];
  highlight(found, text);
}

function find(typed) {
  const text = plain(typed);
  search(text);
  if (!found.length) return;
  const open = new Set();
  found.flatMap(ancestors).forEach((p) => open.add(p));
  for (const item of items) setOpen(item, open.has(item));
  reveal(found[0]);
}

const redrawn = (change) => {
  if (change === "marks") search(plain(findText()));
  else if (change !== "look") find(findText());
};

const enter = () => {
  if (!found.length) return;
  ancestors(found[0]).forEach((p) => setOpen(p, true));
  focus(found[0]);
};

function moveRight(item) {
  if (isOpen(item)) return item.kids[0];
  expand(item);
  return null;
}

function moveLeft(item) {
  if (!isOpen(item)) return item.parent;
  setOpen(item, false);
  return null;
}

const MOVES = {
  ArrowDown: (item, rows) => rows[rows.indexOf(item) + 1],
  ArrowUp: (item, rows) => rows[rows.indexOf(item) - 1],
  Home: (item, rows) => rows[0],
  End: (item, rows) => rows.at(-1),
  ArrowRight: moveRight,
  ArrowLeft: moveLeft,
};

function key(item, typed) {
  if (typed.modified) return false;
  const kind = !typed.onTwisty && MARK_KEYS[typed.key];
  if (kind) {
    toggle(item, kind);
    return true;
  }
  const move = MOVES[typed.key];
  if (typed.shift || !move) return false;
  const to = move(item, items.filter(shown));
  if (to) focus(to, typed.onTwisty);
  return true;
}

const unchip = (item, kind, own) => (own ? unmarkOwn(item) : unmarkLine(item, kind));

const expandAll = () => items.filter((item) => !locked(item)).forEach((item) => setOpen(item, true));

const collapseAll = () => items.forEach((item) => setOpen(item, false));

export const startTree = () => startTreeView({
  gesture, branch, key, find, enter, clear, expandAll, collapseAll, unchip, redrawn,
});
