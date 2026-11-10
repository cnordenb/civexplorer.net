import { attempt, recall } from "../../model/data/datahandler.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { TIP_MARGIN, TIP_GAP } from "../../view/pictures/tooltips.js";
import { setMenu } from "../../view/optionsview.js";
import {
  check, expect, describe, rendered, tap, type, reset, ui, box, fixtures, nodeOf, NAMES,
} from "../helpers_test.js";
import { fitBars } from "./picturetools_test.js";

const TIP_LIMIT = 100;
const TIP_OFFSET = 32;
const TIP_COLOUR = "rgb(215, 179, 148)";
const INSET_PX = 5;
const CONTROLS = "button, a[href], input, .node, .option, .view, .bar > *, .bar-knob";

export function tooltipTests() {
  treeTipTests();
  includeTipTests();
  silentTipTests();
  everyTipTests();
}

function treeTipTests() {
  const [x, y] = inside(nodeOf(items[0]));
  hover(nodeOf(items[0]), x, y);
  const tip = box($("tip"));
  const followsX = Math.abs(tip.left - x - TIP_OFFSET) < 1 || Math.abs(tip.right - innerWidth + TIP_MARGIN) < 1;
  const followsY = Math.abs(tip.top - y - TIP_OFFSET) < 1 || Math.abs(tip.bottom - y + TIP_GAP) < 1;
  check("pictures: the tooltip over a tree row says how to mark it",
    !$("tip").hidden && $("tip").textContent === ui().nodeTip, $("tip").textContent);
  check("pictures: the tooltip has its parchment colour", getComputedStyle($("tip")).backgroundColor === TIP_COLOUR,
    getComputedStyle($("tip")).backgroundColor);
  check("pictures: the tooltip starts at the cursor's bottom-right corner where there is room", followsX && followsY,
    `at ${Math.round(tip.left)},${Math.round(tip.top)} for a pointer at ${Math.round(x)},${Math.round(y)}`);
  check("pictures: the tooltip stays inside the window", tip.left >= TIP_MARGIN - 0.5
    && tip.right <= innerWidth - TIP_MARGIN + 0.5, `from ${Math.round(tip.left)} to ${Math.round(tip.right)}`);
}

function includeTipTests() {
  hover($("count"), 0, 0);
  $("optionsButton").click();
  hover($("include"), ...inside($("include")));
  check("pictures: the tooltip shows over the Options window", !$("tip").hidden && $("options").contains($("tip")));
  check("pictures: Include's tooltip says what a click does", $("tip").textContent === ui().includeTip,
    $("tip").textContent);
  check("pictures: Include's description is hidden from sight", box($("includeHint")).width <= 1,
    `${box($("includeHint")).width} pixels wide`);
  check("pictures: Include is described by its hidden description",
    $("include").getAttribute("aria-describedby") === "includeHint");
}

function silentTipTests() {
  $("tooltips").click();
  $("optionsOk").click();
  hover(nodeOf(items[0]), ...inside(nodeOf(items[0])));
  check("pictures: with Tooltips unticked, no tooltip shows", $("tip").hidden, $("tip").textContent);
  check(NAMES.remembered, recall("tooltips") === "false" || attempt(() => localStorage) === null, "Tooltips");
  $("optionsButton").click();
  $("tooltips").click();
  $("optionsOk").click();
}

function everyTipTests() {
  $("expandAll").click();
  tap(nodeOf(fixtures().partial));
  type("a");
  fitBars();
  const tips = tipsOver(document.body);
  $("optionsButton").click();
  fitBars();
  tips.push(...tipsOver($("options")));
  setMenu(true);
  fitBars();
  tips.push(...tipsOver($("language")));
  reset();
  const [links, others] = [tips.filter(({ el }) => el.matches("a")), tips.filter(({ el }) => !el.matches("a"))];
  expect(`pictures: every control has a tooltip, of at most ${TIP_LIMIT} characters but for Find's`, unique(others
    .filter(({ el, text }) => !text || (text.length > TIP_LIMIT && el.id !== "find")).map(({ el }) => describe(el))));
  expect("pictures: a link's tooltip is its address", unique(links.filter(({ el, text }) => text !== el.href)
    .map(({ el, text }) => `${describe(el)} shows "${text}"`)));
}

function tipsOver(scope) {
  const controls = [...scope.querySelectorAll(CONTROLS)]
    .filter((el) => rendered(el) && el.ariaDisabled !== "true" && !el.closest("#report"));
  const tips = [];
  for (const el of controls) {
    hover(el, box(el).left + 1, box(el).top + 1);
    tips.push({ el, text: $("tip").hidden ? "" : $("tip").textContent });
  }
  return tips;
}

const inside = (el) => [box(el).left + INSET_PX, box(el).top + INSET_PX];

const hover = (el, x, y) => el.dispatchEvent(new PointerEvent("pointermove",
  { bubbles: true, pointerType: "mouse", clientX: x, clientY: y }));

const unique = (names) => [...new Set(names)];
