import { data } from "../model/data/datahandler.js";
import { treeKeys } from "../model/itemtree.js";
import { allCivs, size, civsOf } from "../model/civsets.js";
import { collator, civName, nameOf, language } from "../model/texts.js";
import { items, lineOf, lineEnd, endsInLine, ancestors } from "../model/model.js";
import { $ } from "../view/toolkit.js";
import { nameIsShared } from "../view/civsview.js";
import { rowOf, setOpen } from "../view/treeview.js";
import { setMenu, languageOptions } from "../view/optionsview.js";

export const TAG = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;
export const root = document.documentElement;
export const results = [];
const OFFENDERS_SHOWN = 5;
export const check = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail: String(detail) });

export const expect = (name, offenders) => check(name, !offenders.length,
  offenders.slice(0, OFFENDERS_SHOWN).join("; "));

export const NAMES = {
  noScroll: "layout: the page does not scroll",
  footerWide: "layout: the footer is as wide as the panes",
  footerHidden: "layout: on a phone, the footer is hidden",
  remembered: "options: the choices are remembered",
  findBeside: "find: the number found sits on one line right of the search box",
  marksKept: "options: a change to what the tree shows keeps the marks",
};

export const phone = () => matchMedia("(width < 720px) and (height > 639px)").matches;

const width = (selector) => document.querySelector(selector).getBoundingClientRect().width;

export const footerAsWide = () => phone() || Math.abs(width(".foot") - width(".panes")) < 1;

export const footerHidden = () => !phone() || getComputedStyle(document.querySelector(".foot")).display === "none";

export const need = (ok, problem) => (ok ? [] : [problem]);

export const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

export const codes = () => Object.keys(data.languages);

export const nodeOf = (item) => rowOf(item).node;

export const twistyOf = (item) => rowOf(item).twisty;

export const labelOf = (item) => rowOf(item).label;

export const openTo = (item) => ancestors(item).forEach((p) => setOpen(p, true));

export const ticked = (id) => $(id).getAttribute("aria-checked") === "true";

export const ui = () => data.text[language].ui;

export const box = (el) => el.getBoundingClientRect();

export const keys = () => treeKeys(data.tree, "item");

export function describe(el) {
  const row = el.closest(".node") && !el.id ? ` (${el.closest(".node").textContent.trim().slice(0, 40)})` : "";
  return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.classList[0] ? `.${el.classList[0]}` : ""}${row}`;
}

export const rendered = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"
  && !el.closest(".sr-only");

export const everything = () => [...document.body.querySelectorAll("*")].filter(rendered);

export const styles = (el) => [null, "::before", "::after", "::marker"].map((part) => getComputedStyle(el, part));

const rgb = (colour) => (colour.match(/[\d.]+/g) ?? []).map(Number);

function tone(colour) {
  const [r, g, b] = rgb(colour);
  if (r > 200 && g > 200 && b > 200) return "white";
  if (r < 60 && g < 60 && b < 60) return "black";
  if (g > r + 40 && g > b + 40) return "green";
  return r > g + 80 && r > b + 80 ? "red" : "other";
}

export function drawn(box) {
  const [, before, after] = styles(box).map((style) => (style.content === "none" ? null : style));

  const width = (style, side) => (style ? parseFloat(style[`border${side}Width`]) : 0);

  if (width(after, "Bottom") > 0) return `${tone(after.borderBottomColor)} tick`;
  if (width(before, "Left") > 0 && width(after, "Left") > 0) return `${tone(before.borderLeftColor)} cross`;
  return width(after, "Top") > 0 ? `${tone(after.borderTopColor)} dash` : "";
}

export const marks = { has: "green tick", lacks: "red cross", mixed: "white dash" };

const textOf = (node) => [...node.childNodes].map((child) => {
  if (child.nodeType === Node.TEXT_NODE) return child.textContent;
  return child.nodeType === Node.ELEMENT_NODE && child.getAttribute("aria-hidden") !== "true" ? textOf(child) : "";
}).join(" ");

export const tidy = (text) => text.replace(/\s+/g, " ").trim();

export function nameFor(el) {
  const ids = el.getAttribute("aria-labelledby");
  if (ids) return tidy(ids.split(/\s+/).map((id) => ($(id) ? textOf($(id)) : "")).join(" "));
  if (el.getAttribute("aria-label")) return tidy(el.getAttribute("aria-label"));
  if (el.labels?.length) return tidy([...el.labels].map(textOf).join(" "));
  return tidy(textOf(el));
}

export function visibleTexts(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent.trim() && rendered(node.parentElement)) texts.push(node.textContent);
  }
  return texts;
}

export const keyDown = (target, key) => target.dispatchEvent(new KeyboardEvent("keydown", {
  key, bubbles: true, cancelable: true,
}));

export function tap(el) {
  el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", button: 0 }));
  el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "mouse", button: 0 }));
  el.click();
}

export const mustHave = (item) => tap(nodeOf(item));

export const mustLack = (item) => keyDown(nodeOf(item), "x");

export function type(text) {
  $("find").value = text;
  $("find").dispatchEvent(new Event("input", { bubbles: true }));
}

export function pick(code) {
  if (!$("options").open) $("optionsButton").click();
  if ($("languageList").hidden) $("languageButton").click();
  languageOptions().find((option) => option.dataset.language === code).click();
  $("optionsOk").click();
}

export function reset() {
  type("");
  $("clear").click();
  $("collapseAll").click();
  setMenu(false);
  if ($("options").open) $("options").close();
  document.activeElement?.blur();
}

export function beside() {
  const box = $("find").getBoundingClientRect();
  const note = $("found").getBoundingClientRect();
  return note.left >= box.right - 0.5 && note.top < box.bottom && note.bottom > box.top
    && note.height < 1.5 * parseFloat(getComputedStyle($("found")).lineHeight);
}

export const listed = () => [...$("civs").children].map((li) => li.textContent);

export const expected = (set) => civsOf(set).map(civName).sort(collator.compare);

function itemAbove(item) {
  for (let p = item.parent; p; p = p.parent) if (!p.group || p.lines) return true;
  return false;
}

export function onlyChildren(item, stopAt = () => false) {
  const chain = [item];
  while (chain.at(-1).kids.length === 1 && !stopAt(chain.at(-1).kids[0])) {
    chain.push(chain.at(-1).kids[0]);
  }
  return chain;
}

export const chainOf = (item) => onlyChildren(item).filter((each) => twistyOf(each));

export const outside = (nodes, regional) => nodes.flatMap((node) => (regional.has(node.item)
  ? []
  : [...(node.item ? [node.item] : []), ...outside(node.kids ?? [], regional)]));

export const byPath = (path) => items.find((item) => item.path === path);

const onTop = (item) => itemAbove(item) && (item.parent.group || !itemAbove(item.parent));

const lines = () => items.filter((item) => lineOf(item)[0] === item);

const inner = (item) => !item.group && itemAbove(item) && !onTop(item) && item.kids.length === 1 && !item.kids[0].group;

export function fixtures() {
  const leaves = items.filter((item) => !item.group && !item.kids.length);
  const partial = leaves.find((item) => size(item.set) > 1 && size(item.set) < data.civs.length / 2
    && item.parent?.parent);
  const other = partial && leaves.find((item) => item !== partial && size(item.set & partial.set) > 0
    && size(partial.set & ~item.set & allCivs) > 0);
  const third = other && leaves.find((item) => ![partial, other].includes(item)
    && size(partial.set & ~other.set & ~item.set & allCivs) > 0);
  const sampled = { partial, other, third };
  const missing = Object.keys(sampled).filter((name) => !sampled[name]);
  if (missing.length) throw new Error(`data.json has no ${missing.join(", ")} item for the tests`);

  const underAll = (item) => item.kids.reduce((s, kid) => s & kid.all, allCivs);

  const without = (item) => underAll(item) & ~item.set & allCivs;

  const plainLine = (item) => lineOf(item).every((each) => !nameIsShared(nameOf(each)));

  const building = (item) => !item.group && !itemAbove(item);

  return {
    leaves, partial, other, third, underAll, without,
    branch: items.find((item) => building(item) && item.kids.length > 1 && !nameIsShared(nameOf(item))),
    group: items.find((item) => item.group && !item.parent && item.kids.length),
    line: lines().find((item) => onTop(item) && lineOf(item).length > 2 && plainLine(item)
      && size(lineEnd(item).set) !== size(item.set)),
    even: items.find((item) => inner(item) && size(item.kids[0].set) === size(item.set)),
    uneven: items.find((item) => inner(item) && size(item.kids[0].set) !== size(item.set)),
    upgraded: lines().find((item) => endsInLine(item) && size(item.set) > size(item.all)
      && item.all === lineEnd(item).set),
    loose: items.find((item) => building(item) && item.kids.length && size(without(item)) > 0),
    headed: items.find((item) => building(item) && item.kids.length === 1 && endsInLine(item)),
    lone: items.find((item) => building(item) && !item.kids.length),
    rival: items.find((item) => item.excludes && item.rivals.length),
    walled: lines().find((item) => item.parent?.group && itemAbove(item) && lineOf(item).length > 1 && plainLine(item)
      && size(item.kids[0].set) !== size(item.set)),
  };
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
