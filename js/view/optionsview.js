import { data } from "../model/data/datahandler.js";
import { language } from "../model/texts.js";
import { $, clone, simple, demand } from "./toolkit.js";

const NEEDS = ["showChoices", "apply"];

let actions = null;

export function startOptionsView(controller) {
  actions = demand(controller, NEEDS);
  wireLanguages();
  wireOptions();
}

function wireLanguages() {
  const picker = $("language");
  const button = $("languageButton");
  button.addEventListener("click", () => setMenu(!menuOpen()));
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

export function setMenu(open, returnTo) {
  $("languageButton").setAttribute("aria-expanded", String(open));
  $("languageList").hidden = !open;
  coverSettings(open);
  returnTo?.focus();
}

function coverSettings(open) {
  $("settings").hidden = open && simple();
}

const menuOpen = () => !$("languageList").hidden;

const onScrollbar = (e) => e.target === e.currentTarget
  && (e.offsetX >= e.target.clientWidth || e.offsetY >= e.target.clientHeight);

function showLanguage(code) {
  $("languageName").textContent = data.languages[code].name;
  for (const option of languageOptions()) {
    option.setAttribute("aria-current", String(option.dataset.language === code));
  }
}

export const languageOptions = () => [...$("languageList").querySelectorAll("[data-language]")];

function onMenuKey(e) {
  const open = menuOpen();
  if (e.key === "Escape" && open) {
    e.preventDefault();
    setMenu(false, $("languageButton"));
    return;
  }
  const list = languageOptions();
  const to = MENU_MOVES[e.key]?.({ list, at: list.indexOf(document.activeElement), open });
  if (to === undefined) return;
  e.preventDefault();
  if (!open) setMenu(true);
  list[to].focus();
}

const MENU_MOVES = {
  ArrowDown: (menu) => stepFrom(menu, 1),
  ArrowUp: (menu) => stepFrom(menu, -1),
  Home: ({ open }) => (open ? 0 : undefined),
  End: ({ list, open }) => (open ? list.length - 1 : undefined),
};

const stepFrom = ({ list, at }, by) => (at < 0 ? list.findIndex(isPicked) : (at + by + list.length) % list.length);

const isPicked = (option) => option.getAttribute("aria-current") === "true";

function wireOptions() {
  const optionOf = (target) => target.closest(".option")?.id;

  $("optionsButton").addEventListener("click", () => {
    actions.showChoices();
    $("options").showModal();
  });
  $("optionsOk").addEventListener("click", () => actions.apply());
  $("options").addEventListener("close", () => setMenu(false));
  $("settings").addEventListener("click", (e) => optionOf(e.target) && toggle(optionOf(e.target)));
  $("settings").addEventListener("keydown", (e) => {
    if (e.key !== " " || !optionOf(e.target)) return;
    e.preventDefault();
    toggle(optionOf(e.target));
  });
}

const toggle = (id) => setTicked(id, !checked(id));

function setTicked(id, on) {
  $(id).setAttribute("aria-checked", String(on));
}

const checked = (id) => $(id).getAttribute("aria-checked") === "true";

export function buildLanguages() {
  $("languageList").replaceChildren(...Object.entries(data.languages).map(([code, { name, tag }]) => {
    const li = clone("languageTemplate");
    const option = li.querySelector("button");
    option.dataset.language = code;
    option.lang = tag;
    option.querySelector(".caption").textContent = name;
    return li;
  }));
}

export const optionsView = {
  update: (change) => {
    if (change === "language" || change === "start") showLanguage(language);
  },
};

export const readChoice = (id) => (readers[id] ?? checked)(id);

const picked = () => languageOptions().find(isPicked)?.dataset.language;

const readers = { language: picked, civView: () => $("views").querySelector(":checked").value };

export const showChoice = (id, value) => (writers[id] ?? ((on) => setTicked(id, on)))(value);

function showView(choice) {
  for (const input of $("views").querySelectorAll("input")) {
    input.checked = input.value === choice;
  }
}

const writers = { language: showLanguage, civView: showView };
