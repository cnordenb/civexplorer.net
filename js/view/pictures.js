import { attempt, words } from "../model/datahandler.js";
import { items } from "../model/model.js";
import { $, simple, showLoading } from "./stringbuilder.js";
import { itemAt } from "./treeview.js";
import { tick, showView } from "./optionsview.js";
import { redraw } from "./page.js";
import { startBars } from "./scrollbars.js";

export let view = "list";

export function setView(choice) {
  view = choice;
  $("civs").classList.toggle("tiles", choice === "tile");
  showView(choice);
}

export let tips = true;

export function setTips(on) {
  tips = on;
  tick("tooltips", on);
}

const branchTip = (target) => {
  const twisty = target.closest?.(".twisty, .node:not([role])")?.closest(".row").querySelector(".twisty");
  if (!twisty || twisty.ariaDisabled === "true") return "";
  return words.ui[twisty.getAttribute("aria-expanded") === "true" ? "collapseTip" : "expandTip"];
};

const tipFor = (target) => {
  if (itemAt(target)) return words.ui.nodeTip;
  const tipped = target.closest?.("[data-tip]");
  if (tipped) return words.ui[tipped.dataset.tip];
  return branchTip(target) || (target.closest?.(".civs a, .foot a")?.href ?? "");
};

function wireTip() {
  const tip = $("tip");
  let mouse = null;

  const show = (target, { clientX: x, clientY: y, pointerType }) => {
    tip.textContent = simple() || !tips || pointerType !== "mouse" ? "" : tipFor(target);
    tip.hidden = !tip.textContent;
    if (tip.hidden) return;
    const host = target.closest?.("dialog[open]") ?? document.body;
    if (tip.parentElement !== host) host.append(tip);
    const reach = Number(getComputedStyle(tip).getPropertyValue("--reach"));
    const below = y + reach + tip.offsetHeight <= innerHeight - 4;
    tip.style.setProperty("--x", Math.max(4, Math.min(x + reach, innerWidth - tip.offsetWidth - 4)));
    tip.style.setProperty("--y", below ? y + reach : y - tip.offsetHeight - 8);
  };

  document.addEventListener("pointermove", (e) => {
    mouse = e;
    show(e.target, e);
  });
  document.addEventListener("click", () => {
    if (mouse) show(document.elementFromPoint(mouse.clientX, mouse.clientY) ?? document.body, mouse);
  });
  document.documentElement.addEventListener("pointerleave", () => {
    mouse = null;
    tip.hidden = true;
  });
}

export function screenPictures(width = screen.width, height = screen.height, ratio = devicePixelRatio) {
  const [wide, high] = [width, height].map((side) => Math.round(side * ratio));
  const background = Math.min(width, height) < 720 ? "fhd" : wide > high * 2 ? "ultrawide"
    : wide > 2560 || high > 1440 ? "uhd" : wide > 1920 || high > 1080 ? "qhd" : "fhd";
  return { background, assets: background === "uhd" || background === "ultrawide" ? "4k" : "sd" };
}

export let opening = Promise.resolve();

let round = 0;

const LINK = /url\("([^"]+)"\)/g;

const SIZED = /\/backgrounds\/(fhd|qhd|uhd|ultrawide)\.webp$|_(sd|4k|x1|x2)\.webp$/;

const GRADES = { sd: ["sd", "x1"], "4k": ["4k", "x2"] };

const rulesIn = (rules) => [...rules].flatMap((rule) => [rule, ...rulesIn(rule.cssRules ?? [])]);

const linksIn = (text, base) => [...text.matchAll(LINK)].map(([, src]) => new URL(src, base).href);

const filesOf = (sheet, use) => rulesIn(sheet.cssRules).filter((rule) => rule.selectorText && use(rule.selectorText))
  .flatMap((rule) => linksIn(rule.cssText, sheet.href));

const rooted = (selector) => [document.documentElement, document.body]
  .some((el) => attempt(() => el.matches(selector)));

const fits = (src) => {
  const [, board, grade] = SIZED.exec(src) ?? [];
  const { background, assets } = document.documentElement.dataset;
  return board ? board === background : !grade || !!GRADES[assets]?.includes(grade);
};

export const pictureFiles = (use = () => true) => [...new Set([...document.styleSheets]
  .flatMap((sheet) => attempt(() => filesOf(sheet, use)) ?? []))].filter(fits);

const kept = new Map();

const copy = (src) => kept.get(src) ?? kept.set(src, Object.assign(new Image(), { src })).get(src);

const onPage = () => [...document.images].filter((img) => !$("loading").contains(img)).map((img) => img.src);

const done = (img) => img.decode().catch(() => null);

const ready = (pictures, fonts) => pictures.every((img) => img.complete)
  && fonts.every((face) => /loaded|error/.test(face.status));

export function finishLoading() {
  if (simple()) return opening;
  const pictures = [...new Set(onPage().concat(pictureFiles()))].map(copy);
  const fonts = [...document.fonts];
  if (ready(pictures, fonts)) showLoading(false);
  if ($("loading").hidden) return opening;
  const mine = ++round;
  opening = Promise.all([...pictures.map(done), ...fonts.map((face) => face.load().catch(() => null))])
    .then(() => mine === round && showLoading(false));
  return opening;
}

export function applySimple(on) {
  const coming = !on && simple();
  if (!document.documentElement.dataset.assets) {
    Object.assign(document.documentElement.dataset, screenPictures());
    document.documentElement.style.setProperty("--pixel", `${1 / devicePixelRatio}px`);
  }
  if (on || coming) showLoading(coming);
  document.documentElement.classList.toggle("pictures", !on);
  if (coming) pictureFiles(rooted).forEach(copy);
  if (items.length) redraw("look");
  if (coming && items.length) finishLoading();
}

export function startPictures() {
  wireTip();
  startBars();
}
