import { data, attempt, recall, remember, preferredLanguage, loadLanguage } from "../model/datahandler.js";
import { include, regional, setIncluded, setRegionals, chooseLanguage, startModel } from "../model/model.js";
import { simple, writeFixed, showLoadError, showPage } from "../view/stringbuilder.js";
import { buildLanguages, tick, shown, show, startOptionsView } from "../view/optionsview.js";
import { page, startPage } from "../view/page.js";
import { view, setView, tips, setTips, applySimple } from "../view/pictures.js";
import { refind, startTree } from "./nodetree.js";

let chosen = null;

export function setLanguage(code) {
  chosen = code;
  chooseLanguage(code);
  refind();
}

export function setInclude(on) {
  setIncluded(on);
  remember("include", String(on));
  tick("include", on);
  refind();
}

export function setRegional(on) {
  setRegionals(on);
  remember("regional", String(on));
  tick("regional", on);
  refind();
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
  language: { now: () => chosen, set: choose },
  include: { now: () => include, set: setInclude },
  regional: { now: () => regional, set: setRegional },
  simple: { now: simple, set: setSimple },
  civView: { now: () => view, set: chooseView },
  tooltips: { now: () => tips, set: chooseTips },
};

function apply() {
  for (const [id, choice] of Object.entries(choices)) if (shown(id) !== choice.now()) choice.set(shown(id));
}

function reset() {
  for (const [id, choice] of Object.entries(choices)) show(id, choice.now());
}

function choose(code) {
  chosen = code;
  if (!data.text[code]) {
    loadLanguage(code).then(() => {
      if (chosen === code) choose(code);
    }, () => showLoadError());
    return;
  }
  showLoadError(false);
  setLanguage(code);
  remember("language", code);
  const search = new URLSearchParams(location.search);
  search.set("lng", code);
  attempt(() => history.replaceState(history.state, "", `?${search}${location.hash}`));
}

export function start() {
  const code = preferredLanguage();
  chosen = data.text[code] ? code : Object.keys(data.languages)[0];
  startModel(recall("include") === "true", recall("regional") !== "false", chosen);
  tick("include", include);
  tick("regional", regional);
  startTree();
  startOptionsView({ reset, apply });
  buildLanguages();
  writeFixed();
  startPage();
  page.update("start");
  refind();
  chooseView(recall("civView") === "tile" ? "tile" : "list");
  chooseTips(recall("tooltips") !== "false");
  showPage();
}
