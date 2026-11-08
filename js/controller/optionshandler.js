import { data, recall, remember, loadLanguage } from "../model/datahandler.js";
import { language } from "../model/texts.js";
import { include, regional, setInclude, setRegional, setLanguage } from "../model/model.js";
import { simple, setLoadError } from "../view/stringbuilder.js";
import { buildLanguages, tick, optionValue, show, startOptionsView } from "../view/optionsview.js";
import { view, setView, tips, setTips, applySimple } from "../view/pictures.js";

let pending = null;

export function startOptions() {
  tick("include", include);
  tick("regional", regional);
  startOptionsView({ reset, apply });
  buildLanguages();
  chooseView(recall("civView") === "tile" ? "tile" : "list");
  chooseTips(recall("tooltips") !== "false");
}

function reset() {
  for (const [id, choice] of Object.entries(choices)) {
    show(id, choice.now());
  }
}

function apply() {
  for (const [id, choice] of Object.entries(choices)) {
    if (optionValue(id) !== choice.now()) choice.set(optionValue(id));
  }
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
  language: { now: () => language, set: chooseLanguage },
  include: { now: () => include, set: chooseInclude },
  regional: { now: () => regional, set: chooseRegional },
  simple: { now: simple, set: chooseSimple },
  civView: { now: () => view, set: chooseView },
  tooltips: { now: () => tips, set: chooseTips },
};

function chooseLanguage(code) {
  pending = code;
  if (!data.text[code]) {
    loadLanguage(code).then(() => {
      if (pending === code) chooseLanguage(code);
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

export function chooseInclude(on) {
  setInclude(on);
  tick("include", on);
}

export function chooseRegional(on) {
  setRegional(on);
  tick("regional", on);
}

export function chooseSimple(on) {
  remember("simple", String(on));
  tick("simple", on);
  applySimple(on);
}

export const savedSimple = () => recall("simple") === "true";
