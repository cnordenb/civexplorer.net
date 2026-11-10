import { allCivs } from "../../model/civsets.js";
import { nameOf, plain } from "../../model/texts.js";
import { items, roots } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { isOpen } from "../../view/treeview.js";
import { chooseInclude } from "../../controller/optionshandler.js";
import { audit } from "../audit_test.js";
import { menuKeys } from "./menu_test.js";
import { optionKeys } from "./options_test.js";
import {
  root, check, expect, same, codes, describe, everything, keyDown, tap, type, pick, reset, listed, expected,
  fixtures, chainOf, nodeOf, twistyOf, box, mustHave, mustLack,
} from "../helpers_test.js";

const SUBPIXEL = 0.5;

export function keyboardTests() {
  filterFocus();
  treeMoves();
  findKey();
}

export function accessibilityTests() {
  const [first, ...rest] = codes();
  menuAudit();
  menuKeys();
  languageAudits(first);
  textSpacing();
  optionKeys();
  rest.forEach((code) => languageAudits(code));
  optionAudits();
}

function filterFocus() {
  reset();
  const { other, third } = fixtures();
  mustLack(other);
  mustLack(third);
  const firstChip = $("chips").querySelector(".chip");
  const left = items[firstChip.dataset.i] === other ? third : other;
  firstChip.click();
  check("filters: clearing a filter moves focus to the next filter button", document.activeElement
    === $("chips").querySelector(".chip") && Number(document.activeElement.dataset.i) === left.i);
  $("chips").querySelector(".chip").click();
  check("filters: clearing the last filter moves focus to the civilisations heading",
    document.activeElement === $("civTitle"));
  check("filters: with no filter, every civilisation is listed", same(listed(), expected(allCivs)) && $("none").hidden);
  check("filters: with no filter, the Filters list is hidden", $("ticked").hidden);
  reset();
}

function treeMoves() {
  reset();
  const { line } = fixtures();
  keyDown(nodeOf(line), "ArrowRight");
  check("keyboard: Right opens a line all the way down", chainOf(line).length > 1
    && items.every((each) => isOpen(each) === chainOf(line).includes(each)));
  $("collapseAll").click();
  stepKeys();
  branchKeys();
  keyDown(nodeOf(roots[1]), "End");
  check("keyboard: End goes to the last item", document.activeElement === nodeOf(roots.at(-1)));
  keyDown(document.activeElement, "Home");
  check("keyboard: Home goes to the first item", document.activeElement === nodeOf(roots[0]));
  twistyOf(roots[0]).focus();
  keyDown(twistyOf(roots[0]), "ArrowDown");
  check("keyboard: on an arrow, Down goes to the next arrow", document.activeElement === twistyOf(roots[1]));
  document.activeElement.blur();
}

function stepKeys() {
  nodeOf(roots[0]).focus();
  keyDown(nodeOf(roots[0]), "ArrowUp");
  check("keyboard: Up on the first item keeps focus there", document.activeElement === nodeOf(roots[0]));
  keyDown(nodeOf(roots[0]), "ArrowDown");
  check("keyboard: Down goes to the next item", document.activeElement === nodeOf(roots[1]));
  keyDown(nodeOf(roots[1]), "ArrowUp");
  check("keyboard: Up goes to the item above", document.activeElement === nodeOf(roots[0]));
  keyDown(nodeOf(roots[0]), "ArrowDown");
}

function branchKeys() {
  keyDown(nodeOf(roots[1]), "ArrowRight");
  keyDown(nodeOf(roots[1]), "ArrowRight");
  check("keyboard: Right on an open branch goes to its first item",
    document.activeElement === nodeOf(roots[1].kids[0]));
  keyDown(nodeOf(roots[1].kids[0]), "ArrowLeft");
  check("keyboard: Left on an item goes to the branch above it", document.activeElement === nodeOf(roots[1]));
  keyDown(nodeOf(roots[1]), "ArrowLeft");
  check("keyboard: Left on an open branch closes it", !isOpen(roots[1]));
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

function menuAudit() {
  reset();
  tap(nodeOf(fixtures().partial));
  $("optionsButton").click();
  $("languageButton").click();
  audit("language menu open");
  reset();
}

function languageAudits(code) {
  reset();
  const { partial, other } = fixtures();
  pick(code);
  reset();
  const focus = code === codes()[0];
  audit(code, { focus });
  mustHave(partial);
  mustLack(other);
  audit(`${code}, filters`, { focus });
  $("expandAll").click();
  audit(`${code}, all open`, { focus });
  reset();
}

function textSpacing() {
  reset();
  tap(nodeOf(fixtures().partial));
  root.classList.add("text-spacing-test");
  expect("layout: with wider text spacing, nothing sticks out sideways", [
    ...(root.scrollWidth > innerWidth ? [`the page is ${root.scrollWidth} pixels wide`] : []),
    ...everything().filter((el) => box(el).right > innerWidth + SUBPIXEL).map(describe),
  ]);
  root.classList.remove("text-spacing-test");
  reset();
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
