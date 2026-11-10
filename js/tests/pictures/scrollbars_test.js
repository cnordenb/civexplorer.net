import { items } from "../../model/model.js";
import { $, simple } from "../../view/toolkit.js";
import { barsByBox, LINE_PX } from "../../view/pictures/scrollbars.js";
import { languageOptions, setMenu } from "../../view/optionsview.js";
import { chooseSimple } from "../../controller/optionshandler.js";
import { check, expect, describe, rendered, tap, reset, box, need, nodeOf } from "../helpers_test.js";
import { grade, scale, urlsOf, fitBars, withGrades } from "./picturetools_test.js";

const IMAGE_TIMEOUT_MS = 10000;
const WHEEL_PX = 100;
const ENDINGS = [3, 2];
const KNOBS = [3, 1];
const COMBO_ARROW = { sd: [19, 14], "4k": [35, 28] };
const SHOWN = "pictures: a list has the game's scroll bar exactly while it scrolls";
const ROOM = "pictures: a scroll bar takes only the room kept for it";
const BAR_TESTS = {
  "pictures: the scroll bars' pictures load": unloadedSheets,
  "pictures: a scroll bar runs along its list's right edge": offEdge,
  [ROOM]: outOfRoom,
  "pictures: a scroll bar's parts show their own pictures, unstretched": wrongSprites,
  "pictures: a scroll bar's arrows, body and knob are equally wide": unequal,
  "pictures: a scroll bar's arrows and knob keep their pictures' proportions": misshapen,
  "pictures: a scroll bar's knob sits where its list is scrolled to": strayKnob,
};

export async function scrollBarTests() {
  const list = $("tree").parentElement;
  const [bar, wide] = [barsByBox().get(list), box($("tree")).width];
  expect("pictures: the game's scroll bars hide the browser's own", ownBars("none"));
  await barStates("with every branch closed");
  $("expandAll").click();
  tap(nodeOf(items.find((item) => !item.group)));
  fitBars();
  if (list.scrollHeight - list.clientHeight < 1) throw new Error("the tree does not scroll with every branch open");
  await barStates("with every branch open and a filter");
  check(ROOM, box($("tree")).width === wide, `the tree got narrower as its bar came: ${box($("tree")).width}`);
  list.scrollTop = list.scrollHeight;
  await barStates("scrolled to the end");
  scrollTests(list, bar);
  $("optionsButton").click();
  await barStates("in Options");
  setMenu(true);
  await barStates("with the language list open");
  expect("pictures: the language list's scroll bar has the combo box's arrows", withGrades(comboArrows));
  languageWheel();
  reset();
  chooseSimple(true);
  fitBars();
  expect("options: with Simple UI, the lists show the browser's own scroll bars", ownBars("auto"));
  expect("options: with Simple UI, no list shows the game's scroll bar", [...barsByBox()]
    .filter(([, each]) => !each.hidden).map(([each]) => describe(each)));
}

const ownBars = (width) => [...barsByBox().keys()].filter((list) => getComputedStyle(list).scrollbarWidth !== width)
  .map((list) => `${describe(list)} has scrollbar-width ${getComputedStyle(list).scrollbarWidth}`);

async function barStates(when) {
  fitBars();
  const bars = [...barsByBox()].map(([list, bar]) => ({
    list, bar, shows: !simple() && rendered(list) && list.scrollHeight - list.clientHeight >= 1,
  }));
  expect(SHOWN, bars.filter(({ bar, shows }) => bar.hidden === shows)
    .map(({ list, shows }) => `${describe(list)} has ${shows ? "no" : "a"} bar ${when}`));
  const shown = await Promise.all(bars.filter(({ bar, shows }) => shows && !bar.hidden).map(partsOf));
  for (const [name, problems] of Object.entries(BAR_TESTS)) {
    expect(name, shown.flatMap(problems).map((problem) => `${problem} ${when}`));
  }
}

async function partsOf({ list, bar }) {
  const [up, track, down] = bar.children;
  const knob = track.firstElementChild;
  const [endings, knobs] = [sheetOf(up), sheetOf(knob)];
  const unloaded = await loaded([endings, knobs]);
  return {
    list, up, track, knob, down, unloaded, name: describe(list), menu: list === $("languageList"),
    style: getComputedStyle(list), outer: box(bar), inner: box(list),
    ends: frameShape(endings, ...ENDINGS), grip: frameShape(knobs, ...KNOBS),
  };
}

const sheetOf = (el) => Object.assign(new Image(), { src: urlsOf(getComputedStyle(el))[0] });

function loaded(images) {
  let timer = 0;
  const late = new Promise((done) => {
    timer = setTimeout(done, IMAGE_TIMEOUT_MS);
  });
  return Promise.race([Promise.all(images.map(settled)), late]).finally(() => clearTimeout(timer))
    .then(() => images.filter((img) => !img.naturalWidth));
}

const settled = (img) => img.complete || new Promise((done) => ["load", "error"]
  .forEach((type) => img.addEventListener(type, done)));

const frameShape = (sheet, columns, rows) => (sheet.naturalHeight / rows) / (sheet.naturalWidth / columns);

function unloadedSheets({ name, unloaded }) {
  return need(!unloaded.length, `${name}'s ${unloaded.map((img) => img.src.split("/").pop()).join(", ")} did not load`);
}

function offEdge({ name, list, style, outer, inner }) {
  const edge = inner.right - parseFloat(style.borderRightWidth);
  return need(Math.abs(outer.right - edge) < 0.5 && Math.abs(outer.top - inner.top - list.clientTop) < 0.5
    && Math.abs(outer.height - list.clientHeight) < 1, `${name}'s bar is not along its right edge`);
}

function outOfRoom({ name, style, outer, inner }) {
  const edge = inner.right - parseFloat(style.borderRightWidth);
  return need(outer.left > edge - parseFloat(style.paddingRight) - 0.5, `${name}'s bar is not in the room kept for it`);
}

function wrongSprites({ name, menu, up, track, knob, down }) {
  const ending = menu ? "combobox_arrow_atlas.webp" : `scrollbarendings_${scale()}.webp`;
  const wanted = [
    [up, `${ending} 300% 200% no-repeat 0px 0px`],
    [track, "scrollbar.webp 100% auto repeat-y 0px 0px"],
    [knob, `scrollbarknob_${scale()}.webp 300% 100% no-repeat 0px 0px`],
    [down, `${ending} 300% 200% no-repeat 0px 100%`],
  ];
  return wanted.filter(([el, look]) => sprite(el) !== look).map(([el]) => `${name}'s ${el.className} is ${sprite(el)}`);
}

function sprite(el) {
  const style = getComputedStyle(el);
  return [urlsOf(style)[0]?.split("/").pop(), style.backgroundSize, style.backgroundRepeat, style.backgroundPosition]
    .join(" ");
}

function unequal({ name, menu, up, track, knob, down, outer }) {
  return need([track, knob, ...(menu ? [] : [up, down])].every((el) => el.hidden
    || Math.abs(box(el).width - outer.width) < 0.01), `${name}'s arrows, body and knob are not equally wide`);
}

function misshapen({ name, menu, up, knob, down, ends, grip }) {
  const shape = (el) => box(el).height / box(el).width;

  return need((menu || [up, down].every((el) => Math.abs(shape(el) - ends) < 0.005))
    && (knob.hidden || Math.abs(shape(knob) - grip) < 0.005), `${name}'s arrows or knob are out of proportion`);
}

function strayKnob({ name, list, track, knob }) {
  const at = box(track).top + (box(track).height - box(knob).height) * list.scrollTop
    / (list.scrollHeight - list.clientHeight);
  return need(knob.hidden || Math.abs(box(knob).top - at) < 1, `${name}'s knob is not where it is scrolled to`);
}

function scrollTests(list, bar) {
  const down = bar.lastElementChild;

  const press = (kind) => down.dispatchEvent(new PointerEvent(kind, { bubbles: true, button: 0 }));

  list.scrollTop = 0;
  press("pointerdown");
  press("pointerup");
  check("pictures: a scroll bar's down arrow scrolls its list a line at once", Math.abs(list.scrollTop - LINE_PX) < 1,
    `to ${list.scrollTop}`);
  const from = list.scrollTop;
  bar.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: WHEEL_PX }));
  check("pictures: the wheel over a scroll bar scrolls its list at once",
    Math.abs(list.scrollTop - from - WHEEL_PX) < 1, `from ${from} to ${list.scrollTop}`);
}

function comboArrows(board) {
  const bar = barsByBox().get($("languageList"));
  const outer = box(bar);
  const [wide, high] = COMBO_ARROW[grade()].map((side) => (grade() === "4k" ? side / devicePixelRatio : side));
  return [bar.firstElementChild, bar.lastElementChild].filter((el) => Math.abs(box(el).width - wide) >= 0.5
    || Math.abs(box(el).height - high) >= 0.5 || Math.abs(box(el).left + box(el).right - outer.left - outer.right) >= 1)
    .map((el) => `${el.className} is ${box(el).width} by ${box(el).height} with ${board}`);
}

function languageWheel() {
  const [menu, from, entry] = [$("languageList"), $("languageList").scrollTop, languageOptions()[0].offsetHeight];
  menu.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: WHEEL_PX }));
  check("pictures: the wheel scrolls the language list by one language at once",
    Math.abs(menu.scrollTop - Math.min(from + entry, menu.scrollHeight - menu.clientHeight)) < 1,
    `from ${from} to ${menu.scrollTop}, not by ${entry}`);
}
