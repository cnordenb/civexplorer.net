import { language } from "../../model/texts.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { setOpen } from "../../view/treeview.js";
import { check, expect, describe, rendered, tap, box, same, codes, pick, nodeOf, twistyOf } from "../helpers_test.js";
import { graded, styles } from "./picturetools_test.js";

const BUTTON_RATIO = 290 / 50;
const SWAP = "pictures: Collapse all takes Expand all's place exactly while a top branch is open";
const FOCUS = "pictures: the tree's toggle button keeps focus when it changes";

export function treeButtonTests() {
  const [idle, sideways] = [spots(), spots(false)];
  showing(["clear", "expandAll"], "with every branch closed");
  sideBySide();
  looks();
  tap(nodeOf(items.find((item) => !item.group && !item.kids.length)));
  setOpen(items.find((item) => twistyOf(item) && item.parent), true);
  showing(["clear", "expandAll"], "with a mark, or a branch open inside a closed one");
  $("expandAll").focus();
  $("expandAll").click();
  showing(["clear", "collapseAll"], "with branches open");
  looks();
  check("pictures: the tree's toggle button never moves when it changes", spots() === idle,
    `from ${idle} to ${spots()}`);
  check(FOCUS, document.activeElement === $("collapseAll"), "Expand all did not hand it to Collapse all");
  $("collapseAll").click();
  check(FOCUS, document.activeElement === $("expandAll"), "Collapse all did not hand it to Expand all");
  everyLanguage(sideways);
}

const showing = (ids, when) => check(SWAP, same(shown().map((el) => el.id), ids),
  `${shown().map(describe).join(", ")} ${when}`);

function sideBySide() {
  const head = $("clear").parentElement.parentElement;
  const left = box(head).left + parseFloat(getComputedStyle(head).paddingLeft);
  const right = box(head).right - parseFloat(getComputedStyle(head).paddingRight);
  const [first, last] = shown();
  check("pictures: the tree's two buttons fill its pane's width side by side", Math.abs(box(first).left - left) < 1
    && Math.abs(box(last).right - right) < 1 && Math.abs(box(first).top - box(last).top) < 0.5
    && Math.abs(box(first).width - box(last).width) < 0.5,
  `at ${spots()}, not side by side from ${Math.round(left)} to ${Math.round(right)}`);
}

function looks() {
  expect("pictures: each tree button shows the whole button picture", shown().filter(cut)
    .map((el) => `${language}: ${describe(el)}`));
  expect("pictures: no tree button cuts its caption, in any language", shown()
    .filter((el) => el.firstElementChild.scrollWidth > el.firstElementChild.clientWidth)
    .map((el) => `${language}: ${describe(el)}`));
}

function everyLanguage(sideways) {
  for (const code of [...codes().slice(1), codes()[0]]) {
    pick(code);
    check("pictures: the tree's buttons keep their size and place in every language", spots(false) === sideways,
      `${code}: at ${spots()}`);
    looks();
    $("expandAll").click();
    looks();
    $("collapseAll").click();
  }
}

const spots = (top = true) => shown().map((el) => [box(el).left, top ? box(el).top : 0, box(el).width,
  box(el).height].map(Math.round).join()).join(" ");

const shown = () => [...$("clear").parentElement.children].filter(rendered);

const cut = (el) => !graded(getComputedStyle(el).backgroundImage, "ui/buttons/button")
  || getComputedStyle(el).backgroundSize !== "100% 300%"
  || styles(el).slice(1, 3).some((style) => style.display !== "none")
  || Math.abs(box(el).width / BUTTON_RATIO - box(el).height) > 1;
