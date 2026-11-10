import { data, attempt, recall, localeFile } from "../../model/data/datahandler.js";
import { size } from "../../model/civsets.js";
import { language, nameOf, words, tag } from "../../model/texts.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { languageOptions } from "../../view/optionsview.js";
import { chooseInclude } from "../../controller/optionshandler.js";
import {
  check, expect, same, keys, keyDown, tap, reset, listed, outside, byPath, nodeOf, ticked, rendered, drawn, marks,
  NAMES, codes, pick, root, describe, wait,
} from "../helpers_test.js";
import { audit } from "../audit_test.js";

export const WAITS = "options: a change in the window waits for OK";
const INCLUDED = "options: the tree shows the items Include adds only while Include is ticked";
const REGIONAL = "options: the tree shows regional items only while Include Regionals is ticked";
const CLOSES = "options: Cancel or OK closes the window";
const FOCUS_BACK = "options: closing the window returns focus to the Options button";
const THROWN = "options: closing the window without OK throws away the changes";
const REOPENS = "options: the window opens showing the settings in use";
const SPACE = "keyboard: Space ticks or unticks a box in the Options window";

export function optionTests() {
  reset();
  const path = keptPath();
  expect(INCLUDED, leftOut());
  check(REGIONAL, someRegional(), "by default");
  tap(nodeOf(byPath(path)));
  const before = listed();
  openingOptions(shownKeys());
  confirmingOptions(() => byPath(path)?.self === "has" && same(listed(), before));
  cancellingOptions();
}

export function optionKeys() {
  reset();
  const path = keptPath();
  tap(nodeOf(byPath(path)));
  const [before, shown] = [listed(), shownKeys()];
  $("optionsButton").click();
  keyDown($("include"), " ");
  keyDown($("regional"), " ");
  check(SPACE, ticked("include") && !ticked("regional"), "from Include unticked, Include Regionals ticked");
  check(WAITS, same(shownKeys(), shown), "Space");
  $("optionsOk").click();
  check(REGIONAL, withoutRegionals(), "unticked with Space");
  $("optionsButton").click();
  keyDown($("include"), " ");
  keyDown($("regional"), " ");
  check(SPACE, !ticked("include") && ticked("regional"), "from Include ticked, Include Regionals unticked");
  $("optionsOk").click();
  expect(INCLUDED, leftOut());
  check(REGIONAL, someRegional(), "ticked with Space");
  check(NAMES.marksKept, byPath(path)?.self === "has" && same(listed(), before), "Space on both boxes");
  reset();
  chooseInclude(false);
}

function openingOptions(shown) {
  const button = $("optionsButton");
  button.focus();
  button.click();
  check("options: the Options button opens the Options window", $("options").open);
  check("options: Include is unticked when the window first opens", !ticked("include"));
  check("options: Include Regionals is ticked when the window first opens", ticked("regional"));
  check("options: the window's buttons are Cancel and OK", same([...$("optionsOk").parentElement.children]
    .filter(rendered).map((el) => el.id), ["optionsCancel", "optionsOk"]));
  $("include").click();
  const look = drawn($("include").querySelector(".box"));
  check("options: a click on Include shows a green tick", ticked("include") && look === marks.has, look);
  check(WAITS, same(shownKeys(), shown), "Include");
  $("optionsOk").click();
  closedAndFocused("OK");
}

function confirmingOptions(marksKept) {
  expect(INCLUDED, missing());
  check(NAMES.marksKept, marksKept(), "Include ticked");
  confirmBox("regional");
  check(REGIONAL, withoutRegionals(), "unticked");
  check(NAMES.marksKept, marksKept(), "Include Regionals unticked");
  check(NAMES.remembered, recall("include") === "true" || noStorage(), "Include");
  check(NAMES.remembered, recall("regional") === "false" || noStorage(), "Include Regionals");
  confirmBox("regional");
  check(REGIONAL, everyRegional(), "ticked again");
}

function cancellingOptions() {
  const first = language;
  const all = keys().length;
  $("optionsButton").click();
  $("include").click();
  $("languageButton").click();
  languageOptions().find((option) => option.dataset.language !== first).click();
  $("optionsCancel").click();
  closedAndFocused("Cancel");
  check(THROWN, shownKeys().length === all && language === first, "Cancel");
  $("optionsButton").click();
  check(REOPENS, ticked("include") && $("languageName").textContent === data.languages[first].name, "after Cancel");
  $("include").click();
  $("options").close();
  check(THROWN, shownKeys().length === all, "closing");
  $("optionsButton").click();
  check(REOPENS, ticked("include"), "after closing");
  $("optionsCancel").click();
}

function closedAndFocused(by) {
  check(CLOSES, !$("options").open, by);
  check(FOCUS_BACK, document.activeElement === $("optionsButton"), by);
}

function leftOut() {
  const unique = uniqueKeys();
  const sole = (item) => size(item.set) <= 1 || size(item.set) >= data.civs.length - 1;
  return [
    ...shownKeys().filter((key) => unique.has(key)).map((key) => `${key} is unique`),
    ...items.filter((item) => !item.kids.length && (item.group || sole(item))).map(nameOf),
  ];
}

function missing() {
  const shown = new Set(shownKeys());
  return keys().filter((key) => !shown.has(key));
}

function someRegional() {
  const regional = regionalKeys();
  return shownKeys().some((key) => regional.has(key));
}

function everyRegional() {
  const shown = new Set(shownKeys());
  return [...regionalKeys()].every((key) => shown.has(key));
}

const withoutRegionals = () => same(shownKeys(), outside(data.tree, regionalKeys()));

const POPUP_WAIT_MS = 5000;
const POPUP_STEP_MS = 50;
const ABOUT = "languages: a language that cannot load opens a popup that says so";
const KEEPS = "languages: a language that cannot load leaves the page and Options in the language in use";
const UNMOVED = "layout: the popup about a language moves and resizes no pane";

export async function languagePopupTests() {
  reset();
  const [first, other] = [language, codes().find((code) => code !== language)];
  const panes = paneBoxes();
  $("optionsButton").focus();
  await failing(other, () => pick(other));
  const popup = $("languageError");
  check(ABOUT, popup.matches(":modal") && $("languageErrorText").textContent === words.ui.languageFailed,
    popup.open ? $("languageErrorText").textContent : "no popup");
  check(KEEPS, language === first && root.lang === tag && $("languageName").textContent === data.languages[first].name,
    `${language}, ${$("languageName").textContent}`);
  check(UNMOVED, same(paneBoxes(), panes), "open");
  audit("language popup open");
  $("languageErrorOk").focus();
  $("languageErrorOk").click();
  check("languages: OK closes the popup about a language", !popup.open);
  check("keyboard: OK in the popup about a language gives the focus back to the Options button",
    document.activeElement === $("optionsButton"), describe(document.activeElement));
  check(UNMOVED, same(paneBoxes(), panes), "closed");
  if (popup.open) popup.close();
}

async function failing(code, act) {
  const [text, open] = [data.text[code], XMLHttpRequest.prototype.open];
  delete data.text[code];
  XMLHttpRequest.prototype.open = function openMissing(method, url, ...rest) {
    return open.call(this, method, url === localeFile(code) ? `${url}.missing` : url, ...rest);
  };
  try {
    act();
    for (let waited = 0; !$("languageError").open && waited < POPUP_WAIT_MS; waited += POPUP_STEP_MS) {
      await wait(POPUP_STEP_MS);
    }
  } finally {
    XMLHttpRequest.prototype.open = open;
    data.text[code] = text;
  }
}

const paneBoxes = () => [...document.querySelectorAll(".pane")]
  .map((pane) => JSON.stringify(pane.getBoundingClientRect()));

const confirmBox = (id) => [$("optionsButton"), $(id), $("optionsOk")].forEach((el) => el.click());

const noStorage = () => attempt(() => localStorage) === null;

const shownKeys = () => [...new Set(items.filter((item) => !item.group).map((item) => item.key))];

function uniqueKeys() {
  const under = (nodes, inside) => nodes.flatMap((node) => [
    ...(node.item && (inside || data.pictures[node.item].reach === "unique") ? [node.item] : []),
    ...under(node.kids ?? [], inside || node.unique === true),
  ]);

  return new Set(under(data.tree, false));
}

const regionalKeys = () => new Set(keys().filter((key) => data.pictures[key].reach === "regional"));

const keptPath = () => items.find((item) => !item.group && !item.kids.length && item.parent
  && data.pictures[item.key].reach !== "regional").path;
