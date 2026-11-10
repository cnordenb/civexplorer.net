import { data } from "../model/data/datahandler.js";
import { words, tag, fill } from "../model/texts.js";
import { subscribe } from "../model/model.js";
import { $, compose } from "./toolkit.js";
import { civsView, filtersView } from "./civsview.js";
import { treeView } from "./treeview.js";
import { optionsView } from "./optionsview.js";

const textsView = {
  update: (change) => {
    if (change === "language" || change === "start") writeTexts();
  },
};

const parts = [textsView, optionsView, treeView, civsView, filtersView];

export const startPage = () => subscribe({ update: redraw });

export const redraw = (change) => parts.forEach((part) => part.update(change));

function writeTexts() {
  document.documentElement.lang = tag;
  for (const node of document.querySelectorAll("[data-text]")) {
    node.textContent = words.ui[node.dataset.text];
  }
  $("updateLink").textContent = fill(words.ui.update, { number: data.source.update.number });
  compose($("source"), words.ui.source, { source: $("sourceLink"), update: $("updateLink") });
}

export function writeFixed() {
  for (const node of document.querySelectorAll("[data-tool]")) {
    node.textContent = data.tools[node.dataset.tool];
  }
  setLink("sourceLink", data.source);
  $("updateLink").href = data.source.update.url;
  setLink("rulesLink", data.source.rules);
  setLink("projectLink", data.source.project);
  compose($("notice"), data.source.notice, { rules: $("rulesLink"), project: $("projectLink") });
}

function setLink(id, { url, name }) {
  $(id).href = url;
  $(id).textContent = name;
}

export function showPage() {
  $("top").hidden = false;
  $("content").hidden = false;
}

export function setLoadError(on) {
  $("loadError").hidden = !on;
}

export function showLanguageError() {
  if (!$("languageError").open) $("languageError").showModal();
}
