import { attempt, recall } from "../../model/data/datahandler.js";
import { size } from "../../model/civsets.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { chooseSimple } from "../../controller/optionshandler.js";
import {
  root, check, expect, describe, rendered, everything, reset, need, ui, same, tap, nodeOf, NAMES, footerAsWide,
  footerHidden,
} from "../helpers_test.js";
import {
  GRADES, grade, picture, graded, pictured, styles, urlsOf, fitted, misjudged, fitting, withGrades,
} from "./picturetools_test.js";
import { iconTests } from "./icons_test.js";
import { findBoxTests } from "./findbox_test.js";
import { tooltipTests } from "./tooltips_test.js";
import { treeButtonTests } from "./treebuttons_test.js";
import { scrollBarTests } from "./scrollbars_test.js";

const OPTIONS_RING = "rgb(238, 157, 5) 0px 0px 0px 2px";
const X2_CURSOR = `_x2.webp")`;
const X2_DRAWN = `_x2.webp") 1.5`;
const LINKS = "options: the civilisations are links only without Simple UI";
const STILL = "options: ticking or unticking Simple UI never moves its box";

export async function pictureTests() {
  reset();
  chooseSimple(false);
  screenTests();
  await iconTests();
  findBoxTests();
  tooltipTests();
  reset();
  await document.fonts.ready;
  treeButtonTests();
  reset();
  simpleUiTests();
  reset();
  civViewTests();
  reset();
  await scrollBarTests();
  reset();
  chooseSimple(true);
}

function screenTests() {
  const [wanted, { background, assets }] = [fitted(), root.dataset];
  check(NAMES.noScroll, root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth,
    `without Simple UI, ${root.scrollWidth} by ${root.scrollHeight}`);
  check(NAMES.footerWide, footerAsWide(), "without Simple UI");
  check(NAMES.footerHidden, footerHidden(), "without Simple UI");
  expect("pictures: the page picks its pictures by the screen's resolution", [
    ...need(background === wanted && assets === GRADES[wanted], `${background} and ${assets}, not ${wanted}`),
    ...misjudged(),
  ]);
  expect("pictures: the page shows the background its screen was given", withGrades((board) => need(
    picture(getComputedStyle(document.body), `ui/backgrounds/${board}`), `no ${board}.webp with ${board}`)));
  expect("pictures: every picture shown is of the screen's size and background", wrongSizes());
  expect("pictures: the header, panes and footer lie on the parchment", offParchment());
  expect("pictures: the cursor is the sword, or the pointing hand over links", strayCursors());
  expect("pictures: the _x2 cursors are drawn as large as the _x1 ones",
    withGrades(() => (grade() === "4k" ? bigCursors() : [])));
  optionsButtonTests();
}

function wrongSizes() {
  $("optionsButton").click();
  const shown = [root, document.body, ...everything()].filter((el) => styles(el).some((style) => urlsOf(style).length));
  const wrong = withGrades((board) => shown.flatMap(styles).concat(getComputedStyle($("options"), "::backdrop"))
    .flatMap(urlsOf).filter((src) => !fitting(src, board)).map((src) => `${src.split("/").pop()} with ${board}`));
  reset();
  return wrong;
}

function offParchment() {
  const style = getComputedStyle(document.body);
  const [left, top, right, bottom] = ["--left", "--top", "--right", "--bottom"]
    .map((name) => Number(style.getPropertyValue(name)));
  const [w, h] = style.getPropertyValue("--ratio").split("/").map(Number);
  const wide = Math.max(innerWidth, innerHeight * w / h);
  const high = Math.max(innerHeight, innerWidth * h / w);

  const x = (share) => (innerWidth - wide) / 2 + wide * share;

  const y = (share) => (innerHeight - high) / 2 + high * share;

  $("content").scrollTop = 0;
  const clip = getComputedStyle($("content")).overflowY === "visible" ? Infinity : $("content")
    .getBoundingClientRect().bottom;
  return [$("top"), $("content"), ...$("content").querySelectorAll(".pane, .foot")].filter(rendered).filter((el) => {
    const edge = el.getBoundingClientRect();
    return edge.left < x(left) - 0.5 || edge.right > x(right) + 0.5 || edge.top < y(top) - 0.5
      || Math.min(edge.bottom, clip) > y(bottom) + 0.5;
  }).map((el) => `${describe(el)} is off the parchment`);
}

function strayCursors() {
  const wanted = (el) => `ui/cursors/cursor_${el.closest(".civs a, .foot a") ? "pointing" : "normal"}`;

  return [root, document.body, ...everything()].filter((el) => !graded(getComputedStyle(el).cursor, wanted(el)))
    .map((el) => `${describe(el)} has the wrong cursor`);
}

function bigCursors() {
  const big = (cursor) => cursor.includes(X2_CURSOR) && !cursor.includes(X2_DRAWN);

  return [root, document.body, ...everything()].filter((el) => big(getComputedStyle(el).cursor)).map(describe);
}

function optionsButtonTests() {
  const button = getComputedStyle($("optionsButton"));
  check("pictures: the Options button shows its picture", graded(button.backgroundImage, "ui/buttons/options"),
    button.backgroundImage.split("/").pop());
  check("pictures: the Options button at rest shows its normal picture",
    button.backgroundPosition.split(" ").every((part) => parseFloat(part) === 0), button.backgroundPosition);
  check("pictures: the Options button has its gold ring", button.boxShadow === OPTIONS_RING, button.boxShadow);
}

function simpleUiTests() {
  tap(nodeOf(items.find((item) => !item.group && size(item.set) > 0)));
  $("optionsButton").click();
  const [before, spot, civs] = [imagesShown(), simpleSpot(), $("civs").children.length];
  if (!picturesOn() || !civs || civLinks() !== civs) throw new Error("no pictures or links before Simple UI");
  $("simple").click();
  check(STILL, simpleSpot() === spot, `ticking moved it from ${spot} to ${simpleSpot()}`);
  $("optionsOk").click();
  expect("options: ticking Simple UI takes every image away on OK", imagesShown().map((name) => `${name} is left`));
  check(LINKS, civLinks() === 0, `with Simple UI, ${civLinks()} links`);
  check(NAMES.remembered, recall("simple") === "true" || attempt(() => localStorage) === null, "Simple UI");
  const title = [...document.querySelector("h1").children].filter(rendered).map((el) => el.textContent);
  check("options: with Simple UI, the title is the full sentence alone", same(title, [ui().title]), title.join(" | "));
  $("optionsButton").click();
  const unticked = simpleSpot();
  $("simple").click();
  check(STILL, simpleSpot() === unticked, `unticking moved it from ${unticked} to ${simpleSpot()}`);
  $("optionsOk").click();
  $("optionsButton").click();
  check(LINKS, civLinks() === $("civs").children.length, `without Simple UI, ${civLinks()} links`);
  const after = imagesShown();
  check("options: unticking Simple UI brings every image back on OK", same(after, before), `${after.length} images, `
    + `not ${before.length}, without ${before.filter((name) => !after.includes(name)).join(", ")}`);
}

const picturesOn = () => [describe(root), "body", describe($("optionsButton"))]
  .every((name) => imagesShown().includes(name));

const imagesShown = () => [...document.querySelectorAll("img"), root, document.body, ...everything()]
  .filter((el) => el.tagName === "IMG" || pictured(el)).map(describe);

function simpleSpot() {
  const box = $("simple").querySelector(".box").getBoundingClientRect();
  return `${box.left},${box.top}`;
}

const civLinks = () => $("civs").querySelectorAll("a[href]").length;

function civViewTests() {
  if ($("civs").children.length < 2) throw new Error("fewer than two civilisations listed");
  pickView("tile");
  const tiled = sideBySide();
  check(NAMES.remembered, recall("civView") === "tile" || attempt(() => localStorage) === null, "Civ view");
  pickView("list");
  check("pictures: OK shows the civilisations in the Civ view chosen", tiled && !sideBySide(),
    `side by side as tiles: ${tiled}; as a list: ${sideBySide()}`);
}

function pickView(choice) {
  $("optionsButton").click();
  $("views").querySelector(`input[value="${choice}"]`).click();
  $("optionsOk").click();
}

function sideBySide() {
  const [first, second] = [...$("civs").children].map((civ) => civ.getBoundingClientRect());
  return Math.abs(first.top - second.top) < 1 && second.left > first.right - 1;
}
