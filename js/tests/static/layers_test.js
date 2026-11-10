import { items } from "../../model/model.js";
import { expect, need } from "../helpers_test.js";
import { here, named, testing } from "./scanner_test.js";

const PAGE = /\b(document|window)\b|getElementById|querySelector|addEventListener/;
const ELEMENTS = /\.classList|\.dataset|setAttribute|textContent/;
const ADDRESS = /\b(history|location)\b/;
const LOADING = /XMLHttpRequest|localStorage|\bfetch\s*\(/;
const SETS = /\bmatching\b|\.(set|all)\b(?!\s*\()/;
const OBSERVING = /(?<!function )\bsubscribe\(/;
const TEXTS = /\b(words|fill)\b/;
const STORING = /\bremember(Setting)?\(/;
const STATE = /keepInAddress\(|\b(remember|recall)(Setting)?\("(include|regional|language)"/;
const MARKING = /actions\.\w+\([^)]*["'](has|lacks)["']/;
const MODEL = "js/model/";
const DATA = "js/model/data/";
const VIEWS = "js/view/";
const CONTROLLERS = "js/controller/";
const MODEL_FILE = "js/model/model.js";
const CIVSETS = "js/model/civsets.js";
const OBSERVER = "js/view/page.js";
const STATE_FILES = ["js/model/model.js", "js/model/itemtree.js"];

export function layerTests(files) {
  pageTests(files.filter((file) => !testing(file)));
  importTests(files);
  modelTests(files);
  viewTests(files);
}

function pageTests(scripts) {
  expect("rules: only the views touch the page",
    named(scripts, ({ path, code }) => !path.startsWith(VIEWS) && (PAGE.test(code) || ELEMENTS.test(code))));
  expect("rules: only js/model/data/ touches the address",
    named(scripts, ({ path, code }) => !path.startsWith(DATA) && ADDRESS.test(code)));
  expect("rules: only js/model/data/ loads or stores data",
    named(scripts, ({ path, code }) => !path.startsWith(DATA) && LOADING.test(code)));
}

function importTests(files) {
  expect("rules: the model imports only the model", files.filter(within(MODEL))
    .flatMap((file) => reaching(file, (path) => !path.startsWith(MODEL))));
  expect("rules: no view imports a controller", files.filter(within(VIEWS))
    .flatMap((file) => reaching(file, (path) => path.startsWith(CONTROLLERS))));
}

function modelTests(files) {
  const outside = files.filter((file) => !testing(file) && !file.path.startsWith(MODEL));
  const model = files.find(({ path }) => path === MODEL_FILE)?.code ?? "";
  expect("rules: only the model works on its sets", [
    ...outside.filter(({ imports }) => imports.some(({ target }) => target === `${here}${CIVSETS}`))
      .map(({ path }) => `${path} imports civsets.js`),
    ...outside.filter(({ code }) => SETS.test(code)).map(({ path }) => `${path} works on the model's sets`),
  ]);
  expect("rules: only page.js observes the model", [
    ...files.filter((file) => file.path !== OBSERVER && importing(file, "subscribe"))
      .map(({ path }) => `${path} imports subscribe`),
    ...files.filter(({ path, code }) => path !== OBSERVER && OBSERVING.test(code))
      .map(({ path }) => `${path} subscribes`),
  ]);
  expect("rules: only the model notifies its observers", [
    ...need(exporting(model, "subscribe"), "model.js does not export subscribe"),
    ...need(!exporting(model, "notify"), "model.js exports notify"),
  ]);
  expect("rules: the model's state holds no texts",
    named(files, ({ path, code }) => STATE_FILES.includes(path) && TEXTS.test(code)));
  expect("rules: no item holds a page element",
    items.filter((item) => Object.values(item).some((value) => value instanceof Element)).map(({ key }) => key));
}

function viewTests(files) {
  const views = files.filter(within(VIEWS));
  expect("rules: no view stores data", named(views, ({ code }) => STORING.test(code)));
  expect("rules: only the model saves or restores its own state",
    named(files, (file) => !testing(file) && !file.path.startsWith(MODEL) && STATE.test(file.code)));
  expect("rules: no view decides a mark", named(views, ({ code }) => MARKING.test(code)));
}

const within = (folder) => ({ path }) => path.startsWith(folder);

const reaching = (file, wrong) => file.imports.map(({ target }) => target.slice(here.length)).filter(wrong)
  .map((path) => `${file.path} imports ${path}`);

const importing = (file, name) => file.imports.some(({ names }) => names.includes(name));

const exporting = (code, name) => new RegExp(`export\\s+(const|let|function)\\s+${name}\\b`).test(code);
