import { allCivs, size } from "../../model/civsets.js";
import { fill, words, plural } from "../../model/texts.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { chipName } from "../../view/civsview.js";
import { rowOf, LONG_PRESS_MS } from "../../view/treeview.js";
import { check, same, keyDown, tap, reset, fixtures, nodeOf, box, drawn, wait } from "../helpers_test.js";
import { LISTED, ANNOUNCED, marks, listedAre, boxOf } from "./samples_test.js";
import { branches } from "./branches_test.js";
import { crowding, counts, tree } from "./tree_test.js";
import { lineTops, parents, lines } from "./lines_test.js";
import { rivals, standIns } from "./greying_test.js";
import { finding } from "./finding_test.js";

const NO_MENU = "marking: the browser's menu does not open over an item";
const PRESS_SLACK_MS = 100;
const INSET_PX = 5;
const TOUCH_ID = 7;
const MOUSE_ID = 8;
const MAIN_BUTTON = 0;
const SECONDARY_BUTTON = 2;

export async function behaviourTests() {
  for (const test of [marking, branches, crowding]) {
    test();
  }
  await gestures();
  for (const test of [lineTops, parents, rivals, standIns, lines, counts, tree, finding]) {
    test();
  }
}

function marking() {
  reset();
  const { partial, other, third } = fixtures();
  tap(nodeOf(partial));
  check("marking: a click marks an item must have", partial.self === "has");
  check(LISTED, listedAre(partial.set));
  check("counts: the civilisations' header counts the civilisations that fit",
    $("count").textContent === plural("compatible", size(partial.set)));
  check(ANNOUNCED, nodeOf(partial).getAttribute("aria-checked") === "true");
  check("filters: marking an item adds one filter button", !$("ticked").hidden && $("chips").children.length === 1);
  check("accessibility: a filter button's name says which mark of which item it clears",
    $("chips").querySelector(".chip-label")?.textContent
      === fill(words.ui.clearHas, { name: chipName({ item: partial, mark: "has" }) }));
  keyDown(nodeOf(other), "x");
  check("marking: X marks an item must lack", other.self === "lacks");
  check(ANNOUNCED, rowOf(other).lacking.textContent === words.ui.lacking);
  check(LISTED, listedAre(partial.set & ~other.set & allCivs));
  const legend = [...document.querySelectorAll(".legend [data-state]")];
  check("marking: a box shows a green tick for must have, a red cross for must lack",
    [nodeOf(partial), nodeOf(other), ...legend].every((el) => drawn(boxOf(el)) === marks[el.dataset.state]));
  check("filters: a filter button shows its mark as a green tick or a red cross",
    same(chipMarks(), [marks.has, marks.lacks]), chipMarks().join(", "));
  menuKey(third);
  keyDown(nodeOf(partial), " ");
  check("marking: Space on a must-have item clears it", partial.self === null);
  keyDown(nodeOf(partial), " ");
  check("marking: Space marks an item must have", partial.self === "has");
  $("clear").click();
  check("marking: Clear removes every mark", items.every((item) => !item.self && !nodeOf(item).dataset.state));
}

function menuKey(item) {
  const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  nodeOf(item).dispatchEvent(menu);
  check("marking: the menu key marks an item must lack", item.self === "lacks");
  check(NO_MENU, menu.defaultPrevented);
}

async function gestures() {
  reset();
  const { third } = fixtures();
  const node = nodeOf(third);
  const { left, top } = box(node);
  const at = { bubbles: true, clientX: left + INSET_PX, clientY: top + INSET_PX };
  const touch = { ...at, pointerId: TOUCH_ID, pointerType: "touch", button: MAIN_BUTTON };
  node.dispatchEvent(new PointerEvent("pointerdown", touch));
  await wait(LONG_PRESS_MS + PRESS_SLACK_MS);
  node.dispatchEvent(new PointerEvent("pointerup", touch));
  node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  check("marking: a long press marks an item must lack", third.self === "lacks");
  const menu = rightClick(node, at);
  check("marking: a right-click on a must-lack item clears it", third.self === null);
  check(NO_MENU, menu.defaultPrevented);
  rightClick(node, at);
  check("marking: a right-click marks an item must lack", third.self === "lacks");
  reset();
}

function rightClick(node, at) {
  const mouse = { ...at, pointerId: MOUSE_ID, pointerType: "mouse", button: SECONDARY_BUTTON };
  node.dispatchEvent(new PointerEvent("pointerdown", mouse));
  node.dispatchEvent(new PointerEvent("pointerup", mouse));
  const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: SECONDARY_BUTTON });
  node.dispatchEvent(menu);
  return menu;
}

const chipMarks = () => [...$("chips").querySelectorAll(".chip")].map((chip) => drawn(boxOf(chip))).sort();
