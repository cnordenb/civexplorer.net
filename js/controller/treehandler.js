import { plain, nameOf } from "../model/texts.js";
import {
  items, toggleMark, toReveal, clear, unmarkLone, unmarkLine, chainOf, ancestors, locked, behind,
} from "../model/model.js";
import {
  isOpen, shown, setOpen, focusRow, focusTwisty, highlight, reveal, findText, startTreeView,
} from "../view/treeview.js";
import { startCivsView } from "../view/civsview.js";

const GESTURES = { click: "has", hold: "lacks", menu: "lacks" };

const MARK_KEYS = { " ": "has", x: "lacks", X: "lacks" };

let found = [];

export function startTree() {
  startTreeView({ gesture, branch, key, find, enter, clear, expandAll, collapseAll, redrawn });
  startCivsView({ unchip });
}

const gesture = (item, how) => toggle(item, GESTURES[how]);

function toggle(item, mark) {
  for (const each of toReveal(item, mark)) {
    for (let p = each.parent; p && p !== item.parent; p = p.parent) {
      setOpen(p, true);
    }
  }
  toggleMark(item, mark);
}

const branch = (item) => (isOpen(item) ? setOpen(item, false) : expand(item));

function expand(item) {
  if (!locked(item)) chainOf(item).forEach((each) => setOpen(each, true));
}

function key(item, keyPress) {
  const action = keyAction(keyPress);
  if (!action) return;
  action(item, keyPress.onTwisty ? focusTwisty : focusRow);
  keyPress.consume();
}

function keyAction({ key: name, shift, modified, onTwisty }) {
  if (modified) return null;
  const mark = !onTwisty && MARK_KEYS[name];
  if (mark) return (item) => toggle(item, mark);
  if (shift) return null;
  if (MOVES[name]) return (item, focusOn) => moveFocus(item, MOVES[name], focusOn);
  return BRANCH_KEYS[name] ?? null;
}

function moveFocus(item, move, focusOn) {
  const to = move(item, items.filter(shown));
  if (to) focusOn(to);
}

const MOVES = {
  ArrowDown: (item, rows) => rows[rows.indexOf(item) + 1],
  ArrowUp: (item, rows) => rows[rows.indexOf(item) - 1],
  Home: (item, rows) => rows[0],
  End: (item, rows) => rows.at(-1),
};

const BRANCH_KEYS = { ArrowRight: enterOrExpand, ArrowLeft: leaveOrCollapse };

function enterOrExpand(item, focusOn) {
  if (isOpen(item)) focusOn(item.kids[0]);
  else expand(item);
}

function leaveOrCollapse(item, focusOn) {
  if (isOpen(item)) setOpen(item, false);
  else if (item.parent) focusOn(item.parent);
}

function find(text) {
  highlightMatches(text);
  showMatches();
}

function highlightMatches(text) {
  const searched = plain(text);
  found = searched ? items.filter((item) => !behind(item) && plain(nameOf(item)).includes(searched)) : [];
  highlight(found, searched);
}

function showMatches() {
  if (!found.length) return;
  const toOpen = new Set(found.flatMap(ancestors));
  for (const item of items) {
    setOpen(item, toOpen.has(item));
  }
  reveal(found[0]);
}

function enter() {
  if (!found.length) return;
  ancestors(found[0]).forEach((p) => setOpen(p, true));
  focusRow(found[0]);
}

const expandAll = () => items.filter((item) => !locked(item)).forEach((item) => setOpen(item, true));

const collapseAll = () => items.forEach((item) => setOpen(item, false));

function unchip({ item, mark, lone }) {
  if (lone) unmarkLone(item);
  else unmarkLine(item, mark);
}

function redrawn(change) {
  if (change === "marks") highlightMatches(findText());
  else if (change !== "look") find(findText());
}
