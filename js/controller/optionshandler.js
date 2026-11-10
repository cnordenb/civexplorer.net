import { recallSetting, rememberSetting, loadLanguage, hasLanguage } from "../model/data/datahandler.js";
import { language } from "../model/texts.js";
import { include, regional, setInclude, setRegional, setLanguage } from "../model/model.js";
import { simple } from "../view/toolkit.js";
import { redraw, showLanguageError } from "../view/page.js";
import { buildLanguages, readChoice, showChoice, startOptionsView } from "../view/optionsview.js";
import { view, setView } from "../view/civsview.js";
import { applySimple, hideLoadingWhenReady } from "../view/pictures/pictures.js";
import { tips, setTips } from "../view/pictures/tooltips.js";

const choices = {
  language: { now: () => language, choose: chooseLanguage },
  include: { now: () => include, choose: chooseInclude },
  regional: { now: () => regional, choose: chooseRegional },
  simple: { now: simple, choose: chooseSimple },
  civView: { now: () => view, choose: chooseView },
  tooltips: { now: () => tips, choose: chooseTips },
};

let wanted = null;

export function startOptions() {
  startOptionsView({ showChoices, apply });
  buildLanguages();
  setView(recallSetting("civView"));
  setTips(recallSetting("tooltips"));
  showChoices();
}

function showChoices() {
  for (const [id, choice] of Object.entries(choices)) {
    showChoice(id, choice.now());
  }
}

function apply() {
  const chosen = Object.keys(choices).map((id) => [id, readChoice(id)]);
  for (const [id, value] of chosen) {
    if (value !== choices[id].now()) choices[id].choose(value);
  }
  showChoices();
}

function chooseLanguage(code) {
  wanted = code;
  if (hasLanguage(code)) {
    setLanguage(code);
    return;
  }
  loadLanguage(code).then(() => {
    if (wanted === code) setLanguage(code);
  }, () => {
    if (wanted === code) languageFailed();
  });
}

function languageFailed() {
  showChoice("language", language);
  showLanguageError();
}

export function chooseInclude(on) {
  setInclude(on);
}

export function chooseRegional(on) {
  setRegional(on);
}

export function chooseSimple(on) {
  rememberSetting("simple", on);
  applySimple(on);
  redraw("look");
  hideLoadingWhenReady();
}

function chooseView(choice) {
  rememberSetting("civView", choice);
  setView(choice);
}

function chooseTips(on) {
  rememberSetting("tooltips", on);
  setTips(on);
}
