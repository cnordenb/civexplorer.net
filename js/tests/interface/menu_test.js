import { data, recall, remember, params, preferredLanguage } from "../../model/data/datahandler.js";
import { language } from "../../model/texts.js";
import { $ } from "../../view/toolkit.js";
import { languageOptions } from "../../view/optionsview.js";
import { WAITS } from "./options_test.js";
import {
  root, check, same, codes, nameFor, keyDown, tap, pick, reset, listed, expected, fixtures, nodeOf, box, NAMES,
} from "../helpers_test.js";

const FOCUS_BACK = "language menu: closing it with Escape or a choice returns focus to its button";
const LEFT_CLICK = "language menu: a left-click in its list or outside it closes it";

export function menuTests() {
  reset();
  const { partial } = fixtures();
  const first = language;
  tap(nodeOf(partial));
  const sizes = menuOpening();
  menuClosing(sizes);
  menuChoosing(first);
  check(NAMES.marksKept, partial.self === "has" && same(listed(), expected(partial.set)), "a language change");
  pick(first);
  reset();
}

export function menuKeys() {
  reset();
  const button = $("languageButton");
  $("optionsButton").click();
  button.focus();
  keyDown(button, "ArrowDown");
  check("language menu: Down on its button opens it at the language in use", !$("languageList").hidden
    && document.activeElement === languageOptions().find((option) => option.dataset.language === language));
  const at = languageOptions().indexOf(document.activeElement);
  keyDown(document.activeElement, "ArrowDown");
  check("language menu: Down goes to the next language",
    document.activeElement === languageOptions()[(at + 1) % codes().length]);
  keyDown(document.activeElement, "End");
  check("language menu: End goes to the last language", document.activeElement === languageOptions().at(-1));
  reset();
}

function menuOpening() {
  const button = $("languageButton");
  $("optionsButton").focus();
  $("optionsButton").click();
  check("language menu: it is in the Options window", $("options").contains(button));
  check("options: opening the window puts focus on the language button", document.activeElement === button);
  const sizes = [windowSize()];
  button.click();
  sizes.push(windowSize());
  check("language menu: a click on its button opens it", !$("languageList").hidden);
  check("language menu: it offers every language by its name", languageOptions().length === codes().length
    && languageOptions().every((option) => option.textContent === data.languages[option.dataset.language].name));
  check("language menu: it marks the language in use", languageOptions()
    .filter((option) => option.getAttribute("aria-current") === "true")
    .map((option) => option.dataset.language).join() === language);
  return sizes;
}

function menuClosing(sizes) {
  const button = $("languageButton");
  languageOptions()[0].focus();
  keyDown(document.activeElement, "Escape");
  check("language menu: Escape closes it", $("languageList").hidden);
  check(FOCUS_BACK, document.activeElement === button, "Escape");
  sizes.push(windowSize());
  check("options: the language menu never changes the window's size", new Set(sizes).size === 1, sizes.join(", "));
  button.click();
  $("languageList").click();
  check(LEFT_CLICK, $("languageList").hidden, "between its languages");
  button.click();
  $("options").querySelector("form button").focus();
  check("language menu: moving focus out of it closes it", $("languageList").hidden);
  button.click();
  $("optionsTitle").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", button: 0 }));
  check(LEFT_CLICK, $("languageList").hidden, "outside it");
}

function menuChoosing(first) {
  const button = $("languageButton");
  const next = codes().find((code) => code !== first);
  button.click();
  languageOptions().find((option) => option.dataset.language === next).click();
  check(LEFT_CLICK, $("languageList").hidden, "on a language");
  check(FOCUS_BACK, document.activeElement === button, "a choice");
  check("language menu: its button names the chosen language", nameFor(button).includes(data.languages[next].name));
  check(WAITS, root.lang === data.languages[first].tag, "a language");
  $("optionsOk").click();
  check("language menu: without a choice, the page starts in English", englishFirst());
  check("language menu: the chosen language is kept in the address", location.protocol === "file:"
    || new URLSearchParams(location.search).get("lng") === next);
}

const windowSize = () => `${box($("options")).width} by ${box($("options")).height}`;

function englishFirst() {
  const stored = recall("language");
  remember("language", null);
  Object.defineProperty(navigator, "languages", { value: ["de-DE", "de"], configurable: true });
  try {
    return preferredLanguage() === (codes().includes(params.get("lng")) ? params.get("lng") : codes()[0]);
  } finally {
    delete navigator.languages;
    remember("language", stored);
  }
}
