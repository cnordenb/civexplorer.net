import { data, attempt, recall } from "../model/datahandler.js";
import { ALL, size } from "../model/civsets.js";
import { fill, language, nameOf, words, plain } from "../model/texts.js";
import { items, roots, lineOf, lineEnd } from "../model/model.js";
import { $ } from "../view/stringbuilder.js";
import { isOpen, shown } from "../view/treeview.js";
import { options } from "../view/optionsview.js";
import { chooseInclude, chooseSimple } from "../controller/optionshandler.js";
import { openReport, report } from "../view/report.js";
import { audit } from "./audit_test.js";
import {
  root, check, expect, same, tidy, codes, keys, describe, everything, nameFor, visibleTexts, keyDown, tap, pick,
  reset, listed, expected, fixtures, shownKeys, uniqueKeys, regionalKeys, outside, keptPath, byPath, spans, ui, box,
  chainOf, type, rendered, nodeOf, twistyOf, labelOf, englishFirst, openTo, ticked, flags, checkAll,
} from "./helpers_test.js";

export function menuTests() {
  reset();
  const { partial } = fixtures();
  tap(nodeOf(partial));
  const button = $("languageButton");
  $("optionsButton").focus();
  $("optionsButton").click();
  const inWindow = $("options").open && $("options").contains(button) && document.activeElement === button;

  const measure = () => `${box($("options")).width} by ${box($("options")).height}`;

  const sizes = [measure()];
  button.click();
  sizes.push(measure());
  checkAll("language menu: it is in the options window, and its button opens it, offering every language in its "
    + "own language, with the current one marked", { inWindow, opens: button.getAttribute("aria-expanded") === "true"
      && !$("languageList").hidden, offered: options().length === codes().length
      && options().every((option) => option.textContent === data.languages[option.dataset.language].name),
      current: options().filter((option) => option.getAttribute("aria-current") === "true")
        .map((option) => option.dataset.language).join() === language });
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
  checkAll("language menu: choosing a language names it on the button, closes the menu and returns focus, and OK "
    + "changes the page language", { named, language: root.lang === data.languages[next].tag,
      title: document.querySelector("h1 .title-long").textContent === ui().title });
  check("language menu: the choice is kept in the address, and without a choice the page is in English", englishFirst()
    && (location.protocol === "file:" || new URLSearchParams(location.search).get("lng") === next));
  check("language menu: marks are kept when the language changes", partial.self === "has"
    && same(listed(), expected(partial.set)));
  pick(first);
  reset();
}

export function languageTests(code) {
  reset();
  const { partial, other } = fixtures();
  pick(code);
  reset();
  const text = data.text[code];

  const note = (name, offenders) => check(name, !offenders.length, `${code}: ${offenders.slice(0, 3).join("; ")}`);

  note("languages: the page's text is in the chosen language", [...document.querySelectorAll("[data-text]")]
    .filter((el) => el.textContent !== text.ui[el.dataset.text]).map((el) => el.dataset.text));
  note("languages: the tree is in the chosen language", items.filter((item) => labelOf(item).textContent
    !== nameOf(item) || nameOf(item) !== (item.group ? text.groups[item.key] : text.items[item.key]))
    .map((item) => item.key));
  note("languages: no placeholders are left in the text",
    visibleTexts(document.body).filter((value) => /[{}]/.test(value)));
  const notice = fill(data.source.notice, { rules: data.source.rules.name, project: data.source.project.name });
  check("languages: the footer names and links the source and the game update's notes, and gives Microsoft's notice "
    + "in English with its links to the rules and the project, as wide as the page, or hidden on a phone",
    $("source").contains($("sourceLink")) && $("source").contains($("updateLink"))
    && $("sourceLink").textContent === data.source.name && $("sourceLink").getAttribute("href") === data.source.url
    && $("updateLink").textContent === fill(text.ui.update, { number: data.source.update.number })
    && $("updateLink").getAttribute("href") === data.source.update.url
    && tidy($("notice").textContent) === tidy(notice) && ["rules", "project"].every((key) =>
      $("notice").contains($(`${key}Link`)) && $(`${key}Link`).getAttribute("href") === data.source[key].url)
    && $("notice").lang === "en" && spans(), code);
  tap(nodeOf(partial));
  keyDown(nodeOf(other), "x");
  check("languages: the civilisations are listed in the language and in order",
    same(listed(), expected(partial.set & ~other.set & ALL)), code);
  reset();
}

export function optionTests() {
  reset();
  const all = keys();
  const unique = uniqueKeys();
  const regional = regionalKeys();
  checkAll("options: by default, unique items, and items all civilisations, all but one or only one has, are left "
    + "out, and regional items are in",
    { unique: shownKeys().length < all.length && shownKeys().every((key) => !unique.has(key)),
      regional: shownKeys().some((key) => regional.has(key)), shared: items.every((item) => item.kids.length > 0
        || (!item.group && size(item.set) > 1 && size(item.set) < data.civs.length - 1)) });
  const defaults = shownKeys();
  const path = keptPath();
  tap(nodeOf(byPath(path)));
  const listedBefore = listed();
  const button = $("optionsButton");
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
    flags({ opened, waited, okayed, cancelled, fresh, closed, again }));
  reset();
  chooseInclude(false);
}

function menuAudit() {
  reset();
  tap(nodeOf(fixtures().partial));
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
  checkAll("language menu: Down opens it at the current language, and Down and End move through it",
    { atCurrent, stepped, end: document.activeElement === options()[codes().length - 1] });
  reset();
}

function languageAudits(code) {
  reset();
  const { partial, other } = fixtures();
  pick(code);
  reset();
  const focus = code === codes()[0];
  audit(code, { focus });
  tap(nodeOf(partial));
  keyDown(nodeOf(other), "x");
  audit(`${code}, filters`, { focus });
  $("expandAll").click();
  audit(`${code}, all open`, { focus });
  reset();
}

function spacingTests() {
  reset();
  tap(nodeOf(fixtures().partial));
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
  tap(nodeOf(byPath(path)));
  const listedBefore = listed();
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
    && same(listed(), listedBefore), flags({ flipped, applied }));
  reset();
  chooseInclude(false);
}

function optionAudits() {
  reset();
  $("optionsButton").click();
  audit("accessibility (options window open)");
  reset();
  chooseInclude(true);
  $("expandAll").click();
  audit("accessibility (everything included, all open)", { focus: false });
  reset();
  chooseInclude(false);
}

function filterFocus() {
  reset();
  const { other, third } = fixtures();
  keyDown(nodeOf(other), "x");
  keyDown(nodeOf(third), "x");
  const firstChip = $("chips").querySelector(".chip");
  const cleared = items[firstChip.dataset.i];
  const left = cleared === other ? third : other;
  firstChip.click();
  checkAll("filters: a filter button clears its item and moves focus to the next",
    { cleared: cleared.self === null, next: document.activeElement === $("chips").querySelector(".chip")
      && Number(document.activeElement.dataset.i) === left.i });
  document.activeElement.click();
  checkAll("filters: clearing the last filter moves focus to the civilisations heading and lists every civilisation",
    { cleared: left.self === null, focused: document.activeElement === $("civTitle"),
      listed: same(listed(), expected(ALL)) && $("none").hidden && $("ticked").hidden });
  reset();
}

function keyboard() {
  reset();
  const { line } = fixtures();
  keyDown(nodeOf(line), "ArrowRight");
  check("keyboard: Right opens a line all the way down", chainOf(line).length > 1
    && items.every((each) => isOpen(each) === chainOf(line).includes(each)));
  $("collapseAll").click();
  nodeOf(roots[0]).focus();
  keyDown(nodeOf(roots[0]), "ArrowUp");
  const top = document.activeElement === nodeOf(roots[0]);
  keyDown(nodeOf(roots[0]), "ArrowDown");
  const down = top && document.activeElement === nodeOf(roots[1]);
  keyDown(nodeOf(roots[1]), "ArrowRight");
  const opens = isOpen(roots[1]);
  keyDown(nodeOf(roots[1]), "ArrowRight");
  const into = document.activeElement === nodeOf(roots[1].kids[0]);
  keyDown(nodeOf(roots[1].kids[0]), "ArrowLeft");
  const back = document.activeElement === nodeOf(roots[1]);
  keyDown(nodeOf(roots[1]), "ArrowLeft");
  checkAll("keyboard: Right opens a branch and goes into it, and Left goes back out and closes it",
    { opens, into, back, closed: !isOpen(roots[1]) });
  keyDown(nodeOf(roots[1]), "End");
  const end = document.activeElement === nodeOf(roots[roots.length - 1]);
  keyDown(document.activeElement, "Home");
  checkAll("keyboard: Down and Up step between items, stopping at the top, and End and Home go to the last and "
    + "first", { down, end, home: document.activeElement === nodeOf(roots[0]) });
  twistyOf(roots[0]).focus();
  keyDown(twistyOf(roots[0]), "ArrowDown");
  check("keyboard: on an arrow, Down goes to the next arrow", document.activeElement === twistyOf(roots[1]));
  document.activeElement.blur();
}

function findKey() {
  reset();
  const { partial } = fixtures();
  type(nameOf(partial));
  keyDown($("find"), "Enter");
  check("find: Enter goes to the first match", document.activeElement
    === nodeOf(items.find((item) => plain(nameOf(item)).includes(plain(nameOf(partial))))));
  reset();
}

export function keyboardTests() {
  filterFocus();
  keyboard();
  findKey();
}

export function accessibilityTests() {
  const [first, ...rest] = codes();
  menuAudit();
  menuKeys();
  languageAudits(first);
  spacingTests();
  optionKeys();
  rest.forEach((code) => languageAudits(code));
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
  chooseSimple(false);
  const unchanged = look() === plain;
  chooseSimple(true);
  check("update: the report window keeps its title, its count and Close in view, and scrolls only its list; Close "
    + "has focus, sits on the right and is the plain button, with or without Simple UI",
    kept && focused && right && unchanged,
    `title, count and Close at ${before}, then ${tops()}; focus ${focused}, right ${right}, plain ${unchanged}`);
  $("report").close();
}

export function uniqueFilterTests() {
  reset();
  chooseInclude(true);
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
    chooseInclude(false);
    return;
  }

  [item, whole].forEach(openTo);
  const end = lineOf(item).at(-1);
  tap(nodeOf(item));
  const both = same(names(), [nameOf(item), nameOf(end)].sort());
  unmark(nameOf(item));
  const first = item.self === null && end.self === "has" && same(names(), [nameOf(end)]);
  $("clear").click();
  tap(nodeOf(item));
  unmark(nameOf(end));
  const second = item.self === "has" && end.self === null && same(names(), [nameOf(item)]);
  $("clear").click();
  tap(nodeOf(roots.find((top) => item.path.startsWith(`${top.path}|`))));
  const full = names().filter((text) => text !== nameOf(item));
  full.forEach(unmark);
  const grouped = full.length === 1 && item.self === "has" && same(names(), [nameOf(item)]);
  $("clear").click();
  tap(nodeOf(lineEnd(whole)));
  const exempt = same(names(), [nameOf(lineEnd(whole))]);
  check(name, both && first && second && grouped && exempt, flags({ both, first, second, grouped, exempt }));
  reset();
  chooseInclude(false);
}

export function headingTests() {
  reset();
  chooseInclude(true);
  const name = "tree: a group inside a building, such as the Castle's Unique Units, has no checkbox: a click on its "
    + "name or arrow opens and closes it, a right-click marks nothing, and Down from the row above reaches its arrow";
  const heading = items.find((item) => item.group && item.parent);
  if (!heading) {
    check(name, false, "no group inside a building");
    chooseInclude(false);
    return;
  }
  openTo(heading);
  const bare = !nodeOf(heading).matches("[role], [tabindex], [aria-checked]") && !nodeOf(heading).querySelector(".box");
  labelOf(heading).click();
  const opened = isOpen(heading);
  twistyOf(heading).click();
  const closed = !isOpen(heading);
  const right = { bubbles: true, pointerId: 9, pointerType: "mouse", button: 2 };
  ["pointerdown", "pointerup"].forEach((type) => labelOf(heading).dispatchEvent(new PointerEvent(type, right)));
  const rows = items.filter(shown);
  const above = rows[rows.indexOf(heading) - 1];
  nodeOf(above).focus();
  keyDown(nodeOf(above), "ArrowDown");
  const reached = document.activeElement === twistyOf(heading);
  check(name, bare && opened && closed && reached && items.every((item) => item.self === null),
    flags({ bare, opened, closed, reached }));
  document.activeElement.blur();
  reset();
  chooseInclude(false);
}
