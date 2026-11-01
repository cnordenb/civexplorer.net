import { plain, nameOf } from "../model/datahandler.js";
import { items, mark, reach, clear, unmarkLine, chainOf, barred, locked, behind } from "../model/model.js";
import { isOpen, shown, setOpen, focus, highlight, reveal, findText, startTreeView } from "../view/treeview.js";

const GESTURES = { click: "has", hold: "lacks", menu: "lacks" };

let found = [];

const expand = (item) => {
  if (!locked(item)) chainOf(item).forEach((each) => setOpen(each, true));
};

const branch = (item) => (isOpen(item) ? setOpen(item, false) : expand(item));

function toggle(item, kind) {
  if (barred(item)) return;
  for (const each of reach(item, kind)) {
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
  for (const item of found) for (let p = item.parent; p; p = p.parent) open.add(p);
  for (const item of items) setOpen(item, open.has(item));
  reveal(found[0]);
}

const redrawn = (change) => {
  if (change === "marks") search(plain(findText()));
  else if (change !== "look") find(findText());
};

const enter = () => {
  if (!found.length) return;
  for (let p = found[0].parent; p; p = p.parent) setOpen(p, true);
  focus(found[0]);
};

function key(item, typed) {
  if (typed.modified) return false;
  const kind = !typed.onTwisty && { " ": "has", x: "lacks", X: "lacks" }[typed.key];
  if (kind) {
    toggle(item, kind);
    return true;
  }
  if (typed.shift) return false;
  const rows = items.filter(shown);
  const at = rows.indexOf(item);
  let to = null;
  if (typed.key === "ArrowDown") to = rows[at + 1];
  else if (typed.key === "ArrowUp") to = rows[at - 1];
  else if (typed.key === "Home") to = rows[0];
  else if (typed.key === "End") to = rows[rows.length - 1];
  else if (typed.key === "ArrowRight") isOpen(item) ? (to = item.kids[0]) : expand(item);
  else if (typed.key === "ArrowLeft") isOpen(item) ? setOpen(item, false) : (to = item.parent);
  else return false;
  if (to) focus(to, typed.onTwisty);
  return true;
}

const expandAll = () => items.filter((item) => !locked(item)).forEach((item) => setOpen(item, true));

const collapseAll = () => items.forEach((item) => setOpen(item, false));

export const startTree = () => startTreeView({
  gesture, branch, key, find, enter, clear, expandAll, collapseAll, unchip: unmarkLine, redrawn,
});
