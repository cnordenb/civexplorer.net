import {
  params, load, useData, loadLanguage, loadLanguages, preferredLanguage, startLanguage, recallSetting,
} from "./model/data/datahandler.js";
import { startModel } from "./model/model.js";
import { startScreen, applySimple, startPictures, hideLoadingWhenReady, setLoading } from "./view/pictures/pictures.js";
import { startPage, redraw, writeFixed, showPage, setLoadError, showLanguageError } from "./view/page.js";
import { startOptions } from "./controller/optionshandler.js";
import { startTree } from "./controller/treehandler.js";
import { runUpdate } from "./controller/updatehandler.js";

const MODE = ["test", "update"].find((name) => params.has(name)) ?? "page";

const RUNS = {
  test: {
    languages: loadLanguages,
    run: () => testRunner().then(({ runTests }) => runTests()),
    failed: () => testRunner().then(({ loadFailed }) => loadFailed()),
  },
  update: { languages: loadPreferred, run: runUpdate, failed: () => null },
  page: { languages: loadPreferred, run: () => null, failed: () => null },
};

startScreen();
applySimple(recallSetting("simple"));
load("data.json").then(useAndLoadLanguages).then(run, failLoad);

function useAndLoadLanguages(raw) {
  useData(raw);
  return RUNS[MODE].languages();
}

function loadPreferred() {
  return loadLanguage(preferredLanguage()).catch(() => null);
}

function run() {
  start();
  startPictures();
  hideLoadingWhenReady();
  return RUNS[MODE].run();
}

function failLoad(error) {
  setLoading(false);
  setLoadError(true);
  RUNS[MODE].failed();
  throw error;
}

function start() {
  const code = startLanguage();
  startModel(code);
  startTree();
  startOptions();
  writeFixed();
  startPage();
  redraw("start");
  showPage();
  if (code !== preferredLanguage()) showLanguageError();
}

const testRunner = () => import("./tests/run_test.js");
