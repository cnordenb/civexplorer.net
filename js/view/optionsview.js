import { data } from "../model/datahandler.js";
import { language } from "../model/texts.js";
import { $, clone, simple, demand } from "./stringbuilder.js";

const NEEDS = ["reset", "apply"];

let actions = null;

export const options = () => [...$("languageList").querySelectorAll("[data-language]")];

export function setMenu(open, focus) {
  $("languageButton").setAttribute("aria-expanded", String(open));
  $("languageList").hidden = !open;
  $("settings").hidden = open && simple();
  focus?.focus();
}

export function buildLanguages() {
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

export function tick(id, on) {
  $(id).setAttribute("aria-checked", String(on));
  $(id).dataset.state = on ? "has" : "";
}

export const showView = (choice) => {
  for (const input of $("views").querySelectorAll("input")) input.checked = input.value === choice;
};

const picked = () => options().find((option) => option.getAttribute("aria-current") === "true")?.dataset.language;

const checked = (id) => $(id).getAttribute("aria-checked") === "true";

const toggle = (id) => tick(id, !checked(id));

const readers = { language: picked, civView: () => $("views").querySelector(":checked").value };

const writers = { language: showLanguage, civView: showView };

export const optionValue = (id) => (readers[id] ?? checked)(id);

export const show = (id, value) => (writers[id] ?? ((on) => tick(id, on)))(value);

export const optionsView = {
  update: (change) => {
    if (change === "language" || change === "start") showLanguage(language);
  },
};

function wireOptions() {
  const optionOf = (target) => target.closest(".option")?.id;

  $("optionsButton").addEventListener("click", () => {
    actions.reset();
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

export function startOptionsView(controller) {
  actions = demand(controller, NEEDS);
  wireLanguages();
  wireOptions();
}
