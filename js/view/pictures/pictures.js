import { attempt } from "../../model/data/datahandler.js";
import { $, clone, simple } from "../toolkit.js";
import { startTips } from "./tooltips.js";
import { startBars } from "./scrollbars.js";

const PHONE_SIDE = 720;

const ULTRAWIDE_RATIO = 2;

const QHD = { wide: 2560, high: 1440 };

const FHD = { wide: 1920, high: 1080 };

const LINK = /url\("([^"]+)"\)/g;

const SIZED = /\/backgrounds\/(fhd|qhd|uhd|ultrawide)\.webp$|_(sd|4k|x1|x2)\.webp$/;

const GRADES = { sd: ["sd", "x1"], "4k": ["4k", "x2"] };

let opening = Promise.resolve();

let round = 0;

const preloaded = new Map();

let spinner = null;

export function startPictures() {
  startTips();
  startBars();
}

export function startScreen() {
  Object.assign(document.documentElement.dataset, screenPictures());
  document.documentElement.style.setProperty("--pixel", `${1 / devicePixelRatio}px`);
}

export function applySimple(on) {
  const coming = !on && simple();
  if (on || coming) setLoading(coming);
  document.documentElement.classList.toggle("pictures", !on);
  if (coming) pictureFiles(appliesToRoot).forEach(preload);
}

export function screenPictures(width = screen.width, height = screen.height, ratio = devicePixelRatio) {
  const background = backgroundFor(width, height, ratio);
  return { background, assets: background === "uhd" || background === "ultrawide" ? "4k" : "sd" };
}

function backgroundFor(width, height, ratio) {
  const [wide, high] = [width, height].map((side) => Math.round(side * ratio));
  if (Math.min(width, height) < PHONE_SIDE) return "fhd";
  if (wide > high * ULTRAWIDE_RATIO) return "ultrawide";
  if (beyond(wide, high, QHD)) return "uhd";
  return beyond(wide, high, FHD) ? "qhd" : "fhd";
}

const beyond = (wide, high, limit) => wide > limit.wide || high > limit.high;

const pictureFiles = (use = () => true) => [...new Set([...document.styleSheets]
  .flatMap((sheet) => attempt(() => filesOf(sheet, use)) ?? []))].filter(fits);

const filesOf = (sheet, use) => rulesIn(sheet.cssRules).filter((rule) => rule.selectorText && use(rule.selectorText))
  .flatMap((rule) => linksIn(rule.cssText, sheet.href));

const rulesIn = (rules) => [...rules].flatMap((rule) => [rule, ...rulesIn(rule.cssRules ?? [])]);

const linksIn = (text, base) => [...text.matchAll(LINK)].map(([, src]) => new URL(src, base).href);

function fits(src) {
  const [, board, grade] = SIZED.exec(src) ?? [];
  const { background, assets } = document.documentElement.dataset;
  return board ? board === background : !grade || !!GRADES[assets]?.includes(grade);
}

const appliesToRoot = (selector) => [document.documentElement, document.body]
  .some((el) => attempt(() => el.matches(selector)));

function preload(src) {
  if (!preloaded.has(src)) preloaded.set(src, Object.assign(new Image(), { src }));
  return preloaded.get(src);
}

export function hideLoadingWhenReady() {
  if (simple()) return opening;
  const pictures = [...new Set(onPage().concat(pictureFiles()))].map(preload);
  const fonts = [...document.fonts];
  if (ready(pictures, fonts)) {
    setLoading(false);
    return opening;
  }
  if ($("loading").hidden) return opening;
  const mine = ++round;
  opening = Promise.all([...pictures.map(done), ...fonts.map((face) => face.load().catch(() => null))])
    .then(() => mine === round && setLoading(false));
  return opening;
}

const onPage = () => [...document.images].filter((img) => !$("loading").contains(img)).map((img) => img.src);

const ready = (pictures, fonts) => pictures.every((img) => img.complete)
  && fonts.every((face) => /loaded|error/.test(face.status));

const done = (img) => img.decode().catch(() => null);

export function setLoading(on) {
  if (on) $("loading").append(spinner ??= loadSpinner(clone("spinnerTemplate")));
  else spinner?.remove();
  $("loading").hidden = !on;
  for (const id of ["top", "content"]) {
    $(id).inert = on;
  }
}

const loadSpinner = (img) => Object.assign(img, { src: img.dataset.src });
