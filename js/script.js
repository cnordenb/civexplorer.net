import {
  params, data, load, useData, loadLanguage, loadLanguages, preferredLanguage,
} from "./model/datahandler.js";
import { startModel } from "./model/model.js";
import { setLoadError, setLoading, writeFixed, showPage } from "./view/stringbuilder.js";
import { startPictures, finishLoading } from "./view/pictures.js";
import { startPage, redraw } from "./view/page.js";
import { startOptions, setSimple, savedSimple } from "./controller/optionshandler.js";
import { startTree } from "./controller/nodetree.js";
import { runUpdate } from "./controller/updatehandler.js";

function start() {
  const code = preferredLanguage();
  const first = Object.keys(data.languages)[0];
  startModel(data.text[code] ? code : first);
  startTree();
  startOptions();
  writeFixed();
  startPage();
  redraw("start");
  showPage();
}

setSimple(savedSimple());
load("data.json").then((raw) => {
  useData(raw);
  if (params.has("test") || params.has("update")) return loadLanguages();
  return loadLanguage(preferredLanguage()).catch(() => null);
}).then(() => {
  start();
  startPictures();
  finishLoading();
  if (params.has("test")) return import("./tests/run_test.js").then(({ runTests }) => runTests());
  if (params.has("update")) return runUpdate();
  return null;
}).catch((error) => {
  setLoading(false);
  setLoadError(true);
  if (params.has("test")) import("./tests/run_test.js").then(({ loadFailed }) => loadFailed());
  throw error;
});
