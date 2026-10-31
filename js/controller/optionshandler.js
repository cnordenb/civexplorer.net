import {
  data, attempt, recall, remember, preferredLanguage, loadLanguage, useLanguage,
} from "../model/datahandler.js";
import { items, include, regional, setIncluded, setRegionals } from "../model/model.js";
import { $, clone, simple, writeFixed, writeTexts, label, showLoadError, showLoading } from "../view/stringbuilder.js";
import { dress, update, find, replant, startTree } from "./nodetree.js";

let chosen = null;

export const options = () => [...$("languageList").querySelectorAll("[data-language]")];

export function setMenu(open, focus) {
  $("languageButton").setAttribute("aria-expanded", String(open));
  $("languageList").hidden = !open;
  $("settings").hidden = open && simple();
  focus?.focus();
}

function buildLanguages() {
  $("languageList").replaceChildren(...Object.entries(data.languages).map(([code, { name, tag }]) => {
    const li = clone("languageTemplate");
    const option = li.querySelector("button");
    option.dataset.language = code;
    option.lang = tag;
    option.firstElementChild.textContent = name;
    return li;
  }));
}

function showLanguage(code) {
  $("languageName").textContent = data.languages[code].name;
  for (const option of options()) option.setAttribute("aria-current", String(option.dataset.language === code));
}

export function setLanguage(code) {
  chosen = code;
  useLanguage(code);
  writeTexts();
  showLanguage(code);
  label();
  update();
  if ($("find").value) find();
}

export function tick(id, on) {
  $(id).setAttribute("aria-checked", String(on));
  $(id).dataset.state = on ? "has" : "";
}

export function setInclude(on) {
  setIncluded(on);
  remember("include", String(on));
  tick("include", on);
  replant();
}

export function setRegional(on) {
  setRegionals(on);
  remember("regional", String(on));
  tick("regional", on);
  replant();
}

const showIcon = () => {
  if (data) $("icon").href = simple() ? "data:," : data.icons.favicon;
};

export const savedSimple = () => recall("simple") === "true";

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

export function setSimple(on) {
  const coming = !on && simple();
  remember("simple", String(on));
  tick("simple", on);
  if (!document.documentElement.dataset.assets) {
    Object.assign(document.documentElement.dataset, screenPictures());
    document.documentElement.style.setProperty("--pixel", `${1 / devicePixelRatio}px`);
  }
  if (on || coming) showLoading(coming);
  document.documentElement.classList.toggle("pictures", !on);
  if (coming) pictureFiles(rooted).forEach(copy);
  showIcon();
  items.forEach(dress);
  if (items.length) update();
  if (coming && items.length) finishLoading();
}

const picked = () => options().find((option) => option.getAttribute("aria-current") === "true")?.dataset.language;

export const choices = {
  language: { now: () => chosen, set: choose, shown: picked, show: showLanguage },
  include: { now: () => include, set: setInclude },
  regional: { now: () => regional, set: setRegional },
  simple: { now: simple, set: setSimple },
};

const checked = (id) => $(id).getAttribute("aria-checked") === "true";

const shownOf = (id) => (choices[id].shown ? choices[id].shown() : checked(id));

const toggle = (id) => tick(id, !checked(id));

function apply() {
  for (const [id, choice] of Object.entries(choices)) if (shownOf(id) !== choice.now()) choice.set(shownOf(id));
}

function discard() {
  for (const [id, choice] of Object.entries(choices)) (choice.show ?? ((on) => tick(id, on)))(choice.now());
}

function wireOptions() {
  const optionOf = (target) => target.closest(".option")?.id;

  $("optionsButton").addEventListener("click", () => {
    discard();
    $("options").showModal();
  });
  $("optionsOk").addEventListener("click", apply);
  $("options").addEventListener("close", () => setMenu(false));
  $("settings").addEventListener("click", (e) => optionOf(e.target) && toggle(optionOf(e.target)));
  $("settings").addEventListener("keydown", (e) => {
    if (e.key !== " " || !optionOf(e.target)) return;
    e.preventDefault();
    toggle(optionOf(e.target));
  });
}

function choose(code) {
  chosen = code;
  if (!data.text[code]) {
    loadLanguage(code).then(() => {
      if (chosen === code) choose(code);
    }, () => showLoadError());
    return;
  }
  showLoadError(false);
  setLanguage(code);
  remember("language", code);
  const search = new URLSearchParams(location.search);
  search.set("lng", code);
  attempt(() => history.replaceState(history.state, "", `?${search}${location.hash}`));
}

function onMenuKey(e) {
  const list = options();
  const at = list.indexOf(document.activeElement);
  const open = !$("languageList").hidden;
  let to = null;
  if (e.key === "Escape" && open) {
    e.preventDefault();
    setMenu(false, $("languageButton"));
    return;
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const current = list.findIndex((option) => option.getAttribute("aria-current") === "true");
    to = at < 0 ? current : (at + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
  } else if (open && e.key === "Home") to = 0;
  else if (open && e.key === "End") to = list.length - 1;
  else return;
  e.preventDefault();
  if (!open) setMenu(true);
  list[to].focus();
}

const onScrollbar = (e) => e.target === e.currentTarget
  && (e.offsetX >= e.target.clientWidth || e.offsetY >= e.target.clientHeight);

function wireLanguages() {
  const picker = $("language");
  const button = $("languageButton");
  button.addEventListener("click", () => setMenu($("languageList").hidden));
  $("languageList").addEventListener("click", (e) => {
    if (onScrollbar(e)) return;
    const option = e.target.closest("[data-language]");
    if (option) showLanguage(option.dataset.language);
    setMenu(false, button);
  });
  picker.addEventListener("keydown", onMenuKey);
  picker.addEventListener("focusout", (e) => {
    if (e.relatedTarget && !picker.contains(e.relatedTarget)) setMenu(false);
  });
  document.addEventListener("pointerdown", (e) => {
    if (!picker.contains(e.target)) setMenu(false);
  });
}

export function start() {
  setIncluded(recall("include") === "true");
  tick("include", include);
  setRegionals(recall("regional") !== "false");
  tick("regional", regional);
  startTree();
  buildLanguages();
  writeFixed();
  showIcon();
  wireLanguages();
  wireOptions();
  const code = preferredLanguage();
  setLanguage(data.text[code] ? code : Object.keys(data.languages)[0]);
  $("top").hidden = false;
  $("content").hidden = false;
}
