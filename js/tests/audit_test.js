import { data } from "../model/data/datahandler.js";
import { tag, nameOf } from "../model/texts.js";
import { items } from "../model/model.js";
import { $ } from "../view/toolkit.js";
import { rowOf } from "../view/treeview.js";
import { languageOptions } from "../view/optionsview.js";
import {
  TAG, root, check, describe, rendered, everything, tidy, nameFor, visibleTexts, twistyOf, NAMES,
} from "./helpers_test.js";
import { pictured } from "./pictures/picturetools_test.js";

const MEDIA = "img, svg, canvas, picture, video, object, embed, iframe, source, map, area";
const LANDMARKS = ["header", "main", "footer"];
const REFERENCES = ["aria-labelledby", "aria-controls", "aria-describedby"];
const OFFENDERS_SHOWN = 3;
const AAA_TEXT = 7;
const AAA_LARGE_TEXT = 4.5;
const NON_TEXT = 3;
const LARGE_PX = 24;
const LARGE_BOLD_PX = 18.66;
const BOLD = 700;
const TARGET_PX = 44;
const LINE_SPACING = 1.5;

export function audit(label, { focus = true } = {}) {
  const note = (name, ok, detail = "") => check(name, ok, detail === "" ? label : `${label}, ${detail}`);

  const list = (name, offenders) => note(name, !offenders.length, offenders.slice(0, OFFENDERS_SHOWN).join("; "));

  const all = everything();
  structureChecks(note, list);
  controlChecks(list);
  colourChecks(all, list);
  layoutChecks(all, note, list);
  list("rules: with Simple UI, the page shows no image",
    [...document.querySelectorAll(MEDIA), ...[root, document.body, ...all].filter(pictured)].map(describe));
  if (focus) focusChecks(list);
}

function structureChecks(note, list) {
  note("accessibility: the page has a title", document.title.trim());
  note("accessibility: the page's language is set", root.lang === tag, root.lang);
  list("accessibility: every language tag is valid",
    [...document.querySelectorAll("[lang]")].filter((el) => !TAG.test(el.lang)).map(describe));
  list("accessibility: each language choice is marked with its language", languageOptions()
    .filter((option) => option.lang !== data.languages[option.dataset.language].tag).map(describe));
  note("accessibility: the page has one header, main and footer",
    LANDMARKS.every((name) => document.querySelectorAll(name).length === 1));
  headingChecks(note, list);
  list("accessibility: every ARIA reference points to exactly one element", unmatched());
}

function headingChecks(note, list) {
  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(rendered);

  const level = (heading) => Number(heading.tagName[1]);

  note("accessibility: the page has one main heading", headings.filter((h) => h.tagName === "H1").length === 1);
  list("accessibility: every heading has text", headings.filter((h) => !h.textContent.trim()).map(describe));
  list("accessibility: no heading skips a level", headings
    .filter((h, i) => i > 0 && level(h) > level(headings[i - 1]) + 1).map(describe));
}

function unmatched() {
  const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);

  const count = (id) => ids.filter((one) => one === id).length;

  return [...document.querySelectorAll(REFERENCES.map((name) => `[${name}]`).join(", "))].flatMap((el) => REFERENCES
    .flatMap((name) => (el.getAttribute(name) ?? "").split(/\s+/)).filter((id) => id && count(id) !== 1)
    .map((id) => `${describe(el)} ${id} (${count(id)})`));
}

function controlChecks(list) {
  const expanded = (button, panel) => button.getAttribute("aria-expanded") === String(!panel.hidden);

  list("accessibility: checkboxes, branches and the language menu say what state they are in", [
    ...[...document.querySelectorAll("[role=checkbox]")]
      .filter((el) => !["true", "false", "mixed"].includes(el.getAttribute("aria-checked"))).map(describe),
    ...items.filter((item) => twistyOf(item) && !expanded(twistyOf(item), rowOf(item).list)).map(nameOf),
    ...(expanded($("languageButton"), $("languageList")) ? [] : [describe($("languageButton"))]),
  ]);
  const controls = focusables().filter((el) => el.matches("a, button, input, [role=checkbox]"));
  list("accessibility: every control has a name", [...controls, ...document.querySelectorAll("[role=checkbox]")]
    .filter((el) => rendered(el) && !nameFor(el)).map(describe));
  list("accessibility: every control's name contains its visible text", controls.filter((el) => !el.matches("input"))
    .filter((el) => visibleTexts(el).map(squash).some((text) => text && !squash(nameFor(el)).includes(text)))
    .map(describe));
}

function colourChecks(all, list) {
  const texts = all.filter((el) => [...el.childNodes]
    .some((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim()));
  list(`accessibility: text has a contrast of at least ${AAA_TEXT}:1, or ${AAA_LARGE_TEXT}:1 when large`, texts
    .flatMap((el) => {
      const style = getComputedStyle(el);
      const ratio = contrastOn(style.color, backgroundOf(el));
      const fontSize = parseFloat(style.fontSize);
      const large = fontSize >= LARGE_PX || (fontSize >= LARGE_BOLD_PX && Number(style.fontWeight) >= BOLD);
      return ratio < (large ? AAA_LARGE_TEXT : AAA_TEXT) ? [`${describe(el)} ${ratio.toFixed(2)}`] : [];
    }));
  list(`accessibility: control borders have a contrast of at least ${NON_TEXT}:1`, all
    .filter((el) => el.matches(".tool, .chip, input, .box")).flatMap((el) => {
      const style = getComputedStyle(el);
      const ratio = contrastOn(style.borderTopColor, backgroundOf(el.parentElement));
      return parseFloat(style.borderTopWidth) > 0 && ratio < NON_TEXT ? [`${describe(el)} ${ratio.toFixed(2)}`] : [];
    }));
}

function layoutChecks(all, note, list) {
  const inline = (el) => el.matches("p a") && tidy(el.parentElement.textContent) !== tidy(el.textContent);

  const texts = all.filter((el) => el.matches("p, li"));
  list(`accessibility: targets are at least ${TARGET_PX} by ${TARGET_PX} pixels`, focusables()
    .filter((el) => !inline(el)).filter((el) => {
      const box = el.getBoundingClientRect();
      return box.width < TARGET_PX - 0.5 || box.height < TARGET_PX - 0.5;
    }).map(describe));
  note(NAMES.noScroll, root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth,
    `${root.scrollWidth} by ${root.scrollHeight}`);
  list("layout: nothing sticks out sideways", all.filter((el) => {
    const box = el.getBoundingClientRect();
    return box.right > innerWidth + 0.5 || box.left < -0.5;
  }).map(describe));
  list("layout: no text is justified", texts.filter((el) => getComputedStyle(el).textAlign === "justify")
    .map(describe));
  list(`layout: text has a line spacing of at least ${LINE_SPACING}`, texts.filter((el) => {
    const style = getComputedStyle(el);
    return !(parseFloat(style.lineHeight) >= LINE_SPACING * parseFloat(style.fontSize) - 0.01);
  }).map(describe));
}

function focusChecks(list) {
  const hidden = [];
  const modal = document.querySelector("dialog[open]");
  for (const el of focusables().filter((each) => !modal || modal.contains(each))) {
    el.focus();
    if (document.activeElement !== el) continue;
    const [x, y] = visibleCentre(el);
    const hit = document.elementFromPoint(x, y);
    const through = hit?.contains(el) && getComputedStyle(el).pointerEvents === "none";
    if (!hit || !(el.contains(hit) || through)) {
      hidden.push(`${describe(el)} under ${hit ? describe(hit) : "nothing"} at ${Math.round(x)},${Math.round(y)}`);
    }
  }
  document.activeElement?.blur();
  list("accessibility: nothing covers what has focus", hidden);
}

function visibleCentre(el) {
  const view = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  for (let clip = el.parentElement; clip; clip = clip.parentElement) {
    if (getComputedStyle(clip).overflowY === "visible") continue;
    const edge = clip.getBoundingClientRect();
    Object.assign(view, {
      left: Math.max(view.left, edge.left), top: Math.max(view.top, edge.top),
      right: Math.min(view.right, edge.right), bottom: Math.min(view.bottom, edge.bottom),
    });
  }
  const box = el.getClientRects()[0] ?? el.getBoundingClientRect();
  return [(Math.max(box.left, view.left) + Math.min(box.right, view.right)) / 2,
    (Math.max(box.top, view.top) + Math.min(box.bottom, view.bottom)) / 2];
}

const focusables = () => [...document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")]
  .filter((el) => el.tabIndex >= 0 && !el.disabled && rendered(el));

const squash = (text) => text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const contrastOn = (colour, behind) => contrast(blend(rgba(colour), behind), behind);

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function backgroundOf(el) {
  const layers = [];
  for (let node = el; node; node = node.parentElement) {
    const color = rgba(getComputedStyle(node).backgroundColor);
    if (color[3] > 0) layers.push(color);
    if (color[3] === 1) break;
  }
  return layers.reverse().reduce((under, layer) => blend(layer, under), [255, 255, 255]);
}

const blend = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];

function rgba(value) {
  const parts = (value.match(/[\d.]+/g) ?? []).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts.length > 3 ? parts[3] : 1];
}
