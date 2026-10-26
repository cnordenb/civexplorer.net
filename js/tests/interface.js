import {
  data, ALL, size, fill, attempt, recall, remember, params, language, nameOf, preferredLanguage, words, plain,
} from "../datahandler.js";
import { items, roots, lineOf, lineEnd } from "../model.js";
import { $ } from "../stringbuilder.js";
import { isOpen, setOpen, shown } from "../nodetree.js";
import { options, setInclude, setSimple } from "../optionshandler.js";
import { openReport, report } from "../report.js";
import { audit } from "./audit.js";
import {
  root, check, expect, same, tidy, codes, keys, describe, everything, nameFor, visibleTexts, keyDown, tap, pick,
  reset, listed, expected, fixtures, shownKeys, uniqueKeys, regionalKeys, outside, keptPath, byPath, spans, ui, box,
  chainOf, type, rendered,
} from "./helpers.js";

function englishFirst() {
  const stored = recall("language");
  remember("language", null);
  Object.defineProperty(navigator, "languages", { value: ["de-DE", "de"], configurable: true });
  const first = preferredLanguage();
  delete navigator.languages;
  remember("language", stored);
  return first === (codes().includes(params.get("lng")) ? params.get("lng") : codes()[0]);
}

export function menuTests({ partial }) {
  reset();
  tap(partial.node);
  const button = $("languageButton");
  $("optionsButton").focus();
  $("optionsButton").click();
  const inWindow = $("options").open && $("options").contains(button) && document.activeElement === button;

  const measure = () => `${box($("options")).width} by ${box($("options")).height}`;

  const sizes = [measure()];
  button.click();
  sizes.push(measure());
  check("language menu: it is in the options window, and its button opens it, offering every language in its own "
    + "language, with the current one marked", inWindow && button.getAttribute("aria-expanded") === "true"
    && !$("languageList").hidden && options().length === codes().length
    && options().every((option) => option.textContent === data.languages[option.dataset.language].name)
    && options().filter((option) => option.getAttribute("aria-current") === "true")
      .map((option) => option.dataset.language).join() === language);
  keyDown(options()[0], "Escape");
  const escaped = $("languageList").hidden && document.activeElement === button;
  sizes.push(measure());
  button.click();
  $("languageList").click();
  const clicked = $("languageList").hidden;
  button.click();
  $("options").querySelector("form button").focus();
  check("language menu: Escape closes it and returns focus, a click in it or leaving it closes it, and opening or "
    + "closing it never changes the window's size", escaped && clicked && $("languageList").hidden
    && button.getAttribute("aria-expanded") === "false" && new Set(sizes).size === 1, sizes.join(", "));
  const first = language;
  const next = codes().find((code) => code !== first);
  button.click();
  options().find((option) => option.dataset.language === next).click();
  const named = root.lang === data.languages[first].tag && $("languageList").hidden && document.activeElement === button
    && nameFor(button).includes(data.languages[next].name);
  $("optionsOk").click();
  check("language menu: choosing a language names it on the button, closes the menu and returns focus, and OK changes "
    + "the page language", named && root.lang === data.languages[next].tag
    && document.querySelector("h1 .title-long").textContent === ui().title);
  check("language menu: the choice is kept in the address, and without a choice the page is in English", englishFirst()
    && (location.protocol === "file:" || new URLSearchParams(location.search).get("lng") === next));
  check("language menu: marks are kept when the language changes", partial.self === "has"
    && same(listed(), expected(partial.set)));
  pick(first);
  reset();
}

export function languageTests(code, { partial, other }) {
  reset();
  pick(code);
  reset();
  const text = data.text[code];

  const note = (name, offenders) => check(name, !offenders.length, `${code}: ${offenders.slice(0, 3).join("; ")}`);

  note("languages: the page's text is in the chosen language", [...document.querySelectorAll("[data-text]")]
    .filter((el) => el.textContent !== text.ui[el.dataset.text]).map((el) => el.dataset.text));
  note("languages: the tree is in the chosen language", items.filter((item) => item.label.textContent !== nameOf(item)
    || nameOf(item) !== (item.group ? text.groups[item.key] : text.items[item.key])).map((item) => item.key));
  note("languages: no placeholders are left in the text",
    visibleTexts(document.body).filter((value) => /[{}]/.test(value)));
  const notice = fill(data.source.notice, { rules: data.source.rules.name, project: data.source.project.name });
  check("languages: the footer names and links the source, and gives Microsoft's notice in English with its links to "
    + "the rules and the project, as wide as the page, or hidden on a phone", $("source").contains($("sourceLink"))
    && $("sourceLink").textContent === data.source.name && $("sourceLink").getAttribute("href") === data.source.url
    && tidy($("notice").textContent) === tidy(notice) && ["rules", "project"].every((key) =>
      $("notice").contains($(`${key}Link`)) && $(`${key}Link`).getAttribute("href") === data.source[key].url)
    && $("notice").lang === "en" && spans(), code);
  tap(partial.node);
  keyDown(other.node, "x");
  check("languages: the civilisations are listed in the language and in order",
    same(listed(), expected(partial.set & ~other.set & ALL)), code);
  reset();
}

export function optionTests() {
  reset();
  const all = keys();
  const unique = uniqueKeys();
  const regional = regionalKeys();
  check("options: by default, unique items, and items all civilisations, all but one or only one has, are left out, "
    + "and regional items are in", shownKeys().length < all.length && shownKeys().every((key) => !unique.has(key))
    && shownKeys().some((key) => regional.has(key)) && items.every((item) => item.kids.length > 0
      || (!item.group && size(item.set) > 1 && size(item.set) < data.civs.length - 1)));
  const defaults = shownKeys();
  const path = keptPath();
  tap(byPath(path).node);
  const listedBefore = listed();
  const button = $("optionsButton");
  const ticked = (id) => $(id).getAttribute("aria-checked") === "true";
  const shut = () => !$("options").open && document.activeElement === button;
  const confirm = (id) => [button, $(id), $("optionsOk")].forEach((el) => el.click());
  button.focus();
  button.click();
  const opened = $("options").open && !ticked("include") && ticked("regional")
    && same([...$("optionsOk").parentElement.children].filter(rendered).map((el) => el.id),
      ["optionsCancel", "optionsOk"]);
  $("include").click();
  const waited = ticked("include") && $("include").dataset.state === "has" && same(shownKeys(), defaults);
  $("optionsOk").click();
  const okayed = shut();
  const widened = shownKeys().length === all.length && byPath(path)?.self === "has" && same(listed(), listedBefore);
  confirm("regional");
  const narrowed = !ticked("regional") && $("regional").dataset.state === ""
    && same(shownKeys(), outside(data.tree, regional)) && byPath(path)?.self === "has" && same(listed(), listedBefore);
  const remembered = recall("include") === "true" && recall("regional") === "false";
  confirm("regional");
  check("options: ticking Include shows every item on OK, unique and universal ones included, and unticking Include "
    + "Regionals leaves out regional items and what is under them, keeping marks", widened && narrowed
    && ticked("regional") && shownKeys().length === all.length, `include ${widened}, regional ${narrowed}`);
  check("options: the choices are remembered", remembered || attempt(() => localStorage) === null);
  const first = language;
  button.click();
  $("include").click();
  $("languageButton").click();
  options().find((option) => option.dataset.language !== first).click();
  $("optionsCancel").click();
  const cancelled = shut() && shownKeys().length === all.length && language === first;
  button.click();
  const fresh = ticked("include") && $("languageName").textContent === data.languages[first].name;
  $("include").click();
  $("options").close();
  const closed = shownKeys().length === all.length;
  button.click();
  const again = ticked("include");
  $("optionsCancel").click();
  check("options: the Options button opens the window with Include unticked, Include Regionals ticked, and Cancel and "
    + "OK at the foot; changes wait for OK, which applies them, Cancel or closing the window throws them away, and "
    + "both buttons return focus", opened && waited && okayed && cancelled && fresh && closed && again,
    `${waited}, ${okayed}, ${cancelled}, ${fresh}, ${closed}, ${again}`);
  reset();
  setInclude(false);
}

function menuAudit({ partial }) {
  reset();
  tap(partial.node);
  $("optionsButton").click();
  $("languageButton").click();
  audit("language menu open");
  reset();
}

function menuKeys() {
  reset();
  const button = $("languageButton");
  $("optionsButton").click();
  button.focus();
  keyDown(button, "ArrowDown");
  const atCurrent = !$("languageList").hidden
    && document.activeElement === options().find((option) => option.dataset.language === language);
  const at = options().indexOf(document.activeElement);
  keyDown(document.activeElement, "ArrowDown");
  const stepped = document.activeElement === options()[(at + 1) % codes().length];
  keyDown(document.activeElement, "End");
  check("language menu: Down opens it at the current language, and Down and End move through it", atCurrent && stepped
    && document.activeElement === options()[codes().length - 1]);
  reset();
}

function languageAudits(code, { partial, other }) {
  reset();
  pick(code);
  reset();
  const focus = code === codes()[0];
  audit(code, { focus });
  tap(partial.node);
  keyDown(other.node, "x");
  audit(`${code}, filters`, { focus });
  $("expandAll").click();
  audit(`${code}, all open`, { focus });
  reset();
}

function spacingTests({ partial }) {
  reset();
  tap(partial.node);
  root.classList.add("text-spacing-test");
  expect("layout: with wider text spacing, nothing sticks out sideways", [
    ...(root.scrollWidth > innerWidth ? [`the page is ${root.scrollWidth} pixels wide`] : []),
    ...everything().filter((el) => box(el).right > innerWidth + 0.5).map(describe),
  ]);
  root.classList.remove("text-spacing-test");
  reset();
}

function optionKeys() {
  reset();
  const unique = uniqueKeys();
  const regional = regionalKeys();
  const path = keptPath();
  tap(byPath(path).node);
  const listedBefore = listed();
  const ticked = (id) => $(id).getAttribute("aria-checked") === "true";
  $("optionsButton").click();
  keyDown($("include"), " ");
  keyDown($("regional"), " ");
  const flipped = ticked("include") && !ticked("regional") && !shownKeys().some((key) => unique.has(key));
  $("optionsOk").click();
  const applied = shownKeys().some((key) => unique.has(key)) && shownKeys().every((key) => !regional.has(key));
  $("optionsButton").click();
  keyDown($("include"), " ");
  keyDown($("regional"), " ");
  $("optionsOk").click();
  check("options: Space ticks or unticks Include and Include Regionals, and OK then shows or leaves out those items, "
    + "keeping marks", flipped && applied && !ticked("include") && shownKeys().every((key) => !unique.has(key))
    && ticked("regional") && shownKeys().some((key) => regional.has(key)) && byPath(path)?.self === "has"
    && same(listed(), listedBefore), `${flipped}, ${applied}`);
  reset();
  setInclude(false);
}

function optionAudits() {
  reset();
  $("optionsButton").click();
  audit("accessibility (options window open)");
  reset();
  setInclude(true);
  $("expandAll").click();
  audit("accessibility (everything included, all open)", { focus: false });
  reset();
  setInclude(false);
}

function filterFocus({ other, third }) {
  reset();
  keyDown(other.node, "x");
  keyDown(third.node, "x");
  const firstChip = $("chips").querySelector(".chip");
  const cleared = items[firstChip.dataset.i];
  const left = cleared === other ? third : other;
  firstChip.click();
  check("filters: a filter button clears its item and moves focus to the next", cleared.self === null
    && document.activeElement === $("chips").querySelector(".chip")
    && Number(document.activeElement.dataset.i) === left.i);
  document.activeElement.click();
  check("filters: clearing the last filter moves focus to the civilisations heading and shows the hint",
    left.self === null && document.activeElement === $("civTitle") && !listed().length && !$("none").hidden
    && $("none").textContent === words.ui.start && $("ticked").hidden);
  reset();
}

function keyboard({ line }) {
  reset();
  keyDown(line.node, "ArrowRight");
  check("keyboard: Right opens a line all the way down", chainOf(line).length > 1
    && items.every((each) => isOpen(each) === chainOf(line).includes(each)));
  $("collapseAll").click();
  roots[0].node.focus();
  keyDown(roots[0].node, "ArrowUp");
  const top = document.activeElement === roots[0].node;
  keyDown(roots[0].node, "ArrowDown");
  const down = top && document.activeElement === roots[1].node;
  keyDown(roots[1].node, "ArrowRight");
  const opens = isOpen(roots[1]);
  keyDown(roots[1].node, "ArrowRight");
  const into = document.activeElement === roots[1].kids[0].node;
  keyDown(roots[1].kids[0].node, "ArrowLeft");
  const back = document.activeElement === roots[1].node;
  keyDown(roots[1].node, "ArrowLeft");
  check("keyboard: Right opens a branch and goes into it, and Left goes back out and closes it",
    opens && into && back && !isOpen(roots[1]));
  keyDown(roots[1].node, "End");
  const end = document.activeElement === roots[roots.length - 1].node;
  keyDown(document.activeElement, "Home");
  check("keyboard: Down and Up step between items, stopping at the top, and End and Home go to the last and first",
    down && end && document.activeElement === roots[0].node);
  roots[0].twisty.focus();
  keyDown(roots[0].twisty, "ArrowDown");
  check("keyboard: on an arrow, Down goes to the next arrow", document.activeElement === roots[1].twisty);
  document.activeElement.blur();
}

function findKey({ partial }) {
  reset();
  type(nameOf(partial));
  keyDown($("find"), "Enter");
  check("find: Enter goes to the first match", document.activeElement
    === items.find((item) => plain(nameOf(item)).includes(plain(nameOf(partial)))).node);
  reset();
}

export function keyboardTests(sample) {
  filterFocus(sample);
  keyboard(sample);
  findKey(sample);
}

export function accessibilityTests(sample) {
  const [first, ...rest] = codes();
  menuAudit(sample);
  menuKeys();
  languageAudits(first, sample);
  spacingTests(sample);
  optionKeys();
  const fresh = fixtures();
  rest.forEach((code) => languageAudits(code, fresh));
  optionAudits();
}

export function reportTests() {
  openReport("scrolling", "status");
  for (let i = 0; i < 200; i++) report(String(i));
  const list = $("reportList").parentElement;
  const close = $("report").querySelector("form button");
  const pinned = [$("reportTitle"), $("reportStatus"), close];

  const tops = () => pinned.map((el) => Math.round(box(el).top)).join();

  const look = () => [null, "::before", "::after"].map((part) => getComputedStyle(close, part))
    .map((style) => [style.backgroundImage, style.backgroundColor, style.borderTopWidth, style.borderTopColor,
      style.borderRadius, style.color, style.fontFamily, style.content].join()).join(" | ");

  const [before, focused, plain] = [tops(), document.activeElement === close, look()];
  list.scrollTop = list.scrollHeight;
  const kept = list.contains($("reportDownloads")) && list.scrollTop > 0
    && $("report").scrollHeight <= $("report").clientHeight && tops() === before
    && pinned.every((el) => box(el).top >= 0 && box(el).bottom <= innerHeight);
  const right = Math.abs(box(close).right - box(list).right) < 1;
  setSimple(false);
  const unchanged = look() === plain;
  setSimple(true);
  check("update: the report window keeps its title, its count and Close in view, and scrolls only its list; Close "
    + "has focus, sits on the right and is the plain button, with or without Simple UI",
    kept && focused && right && unchanged,
    `title, count and Close at ${before}, then ${tops()}; focus ${focused}, right ${right}, plain ${unchanged}`);
  $("report").close();
}

export function uniqueFilterTests() {
  reset();
  setInclude(true);
  const name = "filters: a unique item marked must have has its own filter button, even in a full group, which clears "
    + "only it, while its line's or group's button leaves it marked; a wholly unique line has one button (Req. 36)";
  const unique = (item) => data.pictures[item.key]?.reach === "unique";
  const item = items.find((each) => unique(each) && lineOf(each).some((other) => !unique(other)));
  const whole = items.find((each) => unique(each) && lineOf(each).length > 1 && lineOf(each).every(unique));
  const names = () => [...$("chips").querySelectorAll(".chip-name")].map((chip) => chip.textContent).sort();
  const unmark = (text) => [...$("chips").querySelectorAll(".chip")]
    .find((chip) => chip.querySelector(".chip-name").textContent === text)?.click();
  if (!item || !whole) {
    check(name, false, "no unique item in a line with others, or no wholly unique line");
    setInclude(false);
    return;
  }

  for (const each of [item, whole]) for (let p = each.parent; p; p = p.parent) setOpen(p, true);
  const end = lineOf(item).at(-1);
  tap(item.node);
  const both = same(names(), [nameOf(item), nameOf(end)].sort());
  unmark(nameOf(item));
  const first = item.self === null && end.self === "has" && same(names(), [nameOf(end)]);
  $("clear").click();
  tap(item.node);
  unmark(nameOf(end));
  const second = item.self === "has" && end.self === null && same(names(), [nameOf(item)]);
  $("clear").click();
  tap(roots.find((top) => item.path.startsWith(`${top.path}|`)).node);
  const full = names().filter((text) => text !== nameOf(item));
  full.forEach(unmark);
  const grouped = full.length === 1 && item.self === "has" && same(names(), [nameOf(item)]);
  $("clear").click();
  tap(lineEnd(whole).node);
  const exempt = same(names(), [nameOf(lineEnd(whole))]);
  check(name, both && first && second && grouped && exempt, `${both}, ${first}, ${second}, ${grouped}, ${exempt}`);
  reset();
  setInclude(false);
}

export function headingTests() {
  reset();
  setInclude(true);
  const name = "tree: a group inside a building, such as the Castle's Unique Units, has no checkbox: a click on its "
    + "name or arrow opens and closes it, a right-click marks nothing, and Down from the row above reaches its arrow";
  const heading = items.find((item) => item.group && item.parent);
  if (!heading) {
    check(name, false, "no group inside a building");
    setInclude(false);
    return;
  }
  for (let p = heading.parent; p; p = p.parent) setOpen(p, true);
  const bare = !heading.node.matches("[role], [tabindex], [aria-checked]") && !heading.node.querySelector(".box");
  heading.label.click();
  const opened = isOpen(heading);
  heading.twisty.click();
  const closed = !isOpen(heading);
  const right = { bubbles: true, pointerId: 9, pointerType: "mouse", button: 2 };
  ["pointerdown", "pointerup"].forEach((type) => heading.label.dispatchEvent(new PointerEvent(type, right)));
  const rows = items.filter(shown);
  const above = rows[rows.indexOf(heading) - 1];
  above.node.focus();
  keyDown(above.node, "ArrowDown");
  const reached = document.activeElement === heading.twisty;
  check(name, bare && opened && closed && reached && items.every((item) => item.self === null),
    `${bare}, ${opened}, ${closed}, ${reached}`);
  document.activeElement.blur();
  reset();
  setInclude(false);
}
