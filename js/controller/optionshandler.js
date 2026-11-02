import { data, recall, remember, loadLanguage } from "../model/datahandler.js";
import { language } from "../model/texts.js";
import { include, regional, setIncluded, setRegionals, chooseLanguage } from "../model/model.js";
import { simple, setLoadError } from "../view/stringbuilder.js";
import { buildLanguages, tick, optionValue, show, startOptionsView } from "../view/optionsview.js";
import { view, setView, tips, setTips, applySimple } from "../view/pictures.js";

let pending = null;

export function setLanguage(code) {
  chooseLanguage(code);
}

export function setInclude(on) {
  setIncluded(on);
  tick("include", on);
}

export function setRegional(on) {
  setRegionals(on);
  tick("regional", on);
}

export const savedSimple = () => recall("simple") === "true";

export function setSimple(on) {
  remember("simple", String(on));
  tick("simple", on);
  applySimple(on);
}

const chooseView = (choice) => {
  remember("civView", choice);
  setView(choice);
};

const chooseTips = (on) => {
  remember("tooltips", String(on));
  setTips(on);
};

const choices = {
  language: { now: () => language, set: choose },
  include: { now: () => include, set: setInclude },
  regional: { now: () => regional, set: setRegional },
  simple: { now: simple, set: setSimple },
  civView: { now: () => view, set: chooseView },
  tooltips: { now: () => tips, set: chooseTips },
};

function apply() {
  for (const [id, choice] of Object.entries(choices)) if (optionValue(id) !== choice.now()) choice.set(optionValue(id));
}

function reset() {
  for (const [id, choice] of Object.entries(choices)) show(id, choice.now());
}

function choose(code) {
  pending = code;
  if (!data.text[code]) {
    loadLanguage(code).then(() => {
      if (pending === code) choose(code);
    }, () => {
      if (pending !== code) return;
      pending = null;
      show("language", language);
      setLoadError(true);
    });
    return;
  }
  pending = null;
  setLoadError(false);
  setLanguage(code);
}

export function startOptions() {
  tick("include", include);
  tick("regional", regional);
  startOptionsView({ reset, apply });
  buildLanguages();
  chooseView(recall("civView") === "tile" ? "tile" : "list");
  chooseTips(recall("tooltips") !== "false");
}
