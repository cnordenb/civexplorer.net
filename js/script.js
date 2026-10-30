import { params, load, useData, loadLanguage, loadLanguages, preferredLanguage } from "./model/datahandler.js";
import { showLoadError, showLoading } from "./view/stringbuilder.js";
import { start, setSimple, savedSimple, finishLoading } from "./controller/optionshandler.js";
import { runUpdate } from "./view/report.js";
import { startPictures } from "./view/pictures.js";

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
  showLoading(false);
  showLoadError();
  if (params.has("test")) import("./tests/run_test.js").then(({ loadFailed }) => loadFailed());
  throw error;
});
