import { allCivs, size } from "../../model/civsets.js";
import { fill, words, numbers, nameOf, plural } from "../../model/texts.js";
import { items, roots } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { isOpen, rowOf } from "../../view/treeview.js";
import {
  root, check, expect, keyDown, tap, reset, listed, chainOf, fixtures, nodeOf, twistyOf, box, NAMES,
} from "../helpers_test.js";

const HALF_PX = 0.5;
const SCROLL_SLACK_PX = 1;
const FAR_DOWN_PX = 1e6;

export function crowding() {
  reset();
  const panes = document.querySelector(".panes");
  const [tree, civs] = panes.querySelectorAll(".pane");
  const sizes = () => [tree, civs].map((pane) => `${box(pane).width} by ${box(pane).height}`).join(", ");
  const spots = () => [tree, civs].map((pane) => `${box(pane).left}, ${box(pane).top}`).join("; ");
  const [sized, placed] = [sizes(), spots()];
  $("expandAll").click();
  const most = items.filter((item) => !item.group && !item.kids.length)
    .reduce((best, item) => (size(item.set) > size(best.set) ? item : best));
  tap(nodeOf(most));
  if (listed().length !== size(most.set)) throw new Error(`${listed().length} civilisations listed`);
  const list = $("civScroll");
  const fixed = getComputedStyle(panes).display === "grid";
  const top = box(civs).top;
  list.scrollTop = FAR_DOWN_PX;
  check(NAMES.noScroll, root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth,
    `the page is ${root.scrollWidth} by ${root.scrollHeight}`);
  expect("layout: each pane keeps its header inside it", [tree, civs]
    .filter((pane) => box(pane.querySelector(".pane-head")).bottom > box(pane).bottom + HALF_PX)
    .map((pane) => `${pane.querySelector("h2").id} sticks out`));
  check("layout: the two panes do not overlap",
    box(tree).bottom <= box(civs).top + HALF_PX || box(tree).right <= box(civs).left + HALF_PX);
  check("layout: the civilisations' list scrolls inside its pane",
    !scrolls(list) || (list.scrollTop > 0 && box(civs).top === top));
  check("layout: the two panes are the same height", !fixed || Math.abs(box(tree).height - box(civs).height) <= HALF_PX,
    `panes of ${box(tree).height} and ${box(civs).height} pixels`);
  check("layout: marking or opening resizes neither pane", !fixed || sizes() === sized, sizes());
  check("layout: marking or opening moves neither pane", !fixed || spots() === placed, spots());
  list.scrollTop = 0;
  reset();
}

export function counts() {
  reset();
  countKinds();
  $("expandAll").click();
  countKinds();
  const { partial, other } = fixtures();
  tap(nodeOf(partial));
  keyDown(nodeOf(other), "x");
  countKinds();
  $("collapseAll").click();
  countKinds();
  $("clear").click();
}

function countKinds() {
  const kinds = [
    ["counts: an empty top-level row shows no number", (item) => !item.parent && !ownCount(item)],
    ["counts: a closed item with contents shows its own number, then the number with all under it",
      (item) => !item.group && item.kids.length && !isOpen(item)],
    ["counts: an open item shows only its own number", (item) => !item.group && item.kids.length && isOpen(item)],
    ["counts: an item with nothing under it shows its own number", (item) => !item.group && !item.kids.length],
    ["counts: a group shows the number of civilisations with anything in it", (item) => item.group],
  ];
  const kindOf = (item) => kinds.find(([, fits]) => fits(item))[0];
  for (const [name] of kinds) {
    expect(name, items.filter((item) => kindOf(item) === name && miscounted(item)).map(nameOf));
  }
}

function miscounted(item) {
  const [text, said] = wanted(item);
  return rowOf(item).count.textContent !== text || rowOf(item).civCount.textContent !== said;
}

function wanted(item) {
  const [own, all] = [ownCount(item), size(fitting() & item.all)];
  if (!item.parent && !own) return ["", ""];
  if (item.group || !item.kids.length || isOpen(item)) return [numbers.format(own), plural("civCount", own)];
  return [fill(words.ui.range, { own: numbers.format(own), all: numbers.format(all) }),
    fill(words.ui.civRange, { own: plural("civCount", own), all: plural("civCount", all) })];
}

export function tree() {
  reset();
  $("expandAll").click();
  check("tree: Expand all opens every branch",
    items.every((item) => !twistyOf(item) || (isOpen(item) && !rowOf(item).list?.hidden)));
  $("collapseAll").click();
  check("tree: Collapse all closes every branch", items.every((item) => !isOpen(item)));
  twistyOf(roots[0]).click();
  if (!isOpen(roots[0])) throw new Error(`the arrow of ${nameOf(roots[0])} does not open it`);
  twistyOf(roots[0]).click();
  check("tree: a branch's arrow closes it", !isOpen(roots[0]) && rowOf(roots[0]).list.hidden);
  const unfolded = [];
  for (const item of items.filter((each) => twistyOf(each))) {
    $("collapseAll").click();
    twistyOf(item).click();
    if (items.some((each) => isOpen(each) !== chainOf(item).includes(each))) unfolded.push(nameOf(item));
  }
  expect("tree: opening a branch opens each only child below it, to the first fork or the end", unfolded);
  $("collapseAll").click();
}

const scrolls = (el) => el.scrollHeight > el.clientHeight + SCROLL_SLACK_PX;

const ownCount = (item) => size(fitting() & (item.group ? item.all : item.set));

const fitting = () => items.filter((item) => item.self)
  .reduce((m, item) => m & (item.self === "has" ? item.set : ~item.set), allCivs);
