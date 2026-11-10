import { data, load, attempt, recall, remember, SETTINGS } from "../model/data/datahandler.js";
import { fill, language } from "../model/texts.js";
import { include, regional, setLanguage } from "../model/model.js";
import { $, simple } from "../view/toolkit.js";
import { chooseInclude, chooseRegional, chooseSimple } from "../controller/optionshandler.js";
import { view, setView } from "../view/civsview.js";
import { tips, setTips } from "../view/pictures/tooltips.js";
import { openReport, report } from "../view/report.js";
import { root, results, check, codes, pick, reset } from "./helpers_test.js";
import { scripts, styles } from "./static/scanner_test.js";
import { sourceTests } from "./static/rules_test.js";
import { textTests, dataTests } from "./static/data_test.js";
import { updaterTests } from "./static/updates_test.js";
import { behaviourTests } from "./behaviour/marking_test.js";
import { menuTests } from "./interface/menu_test.js";
import { languageTests } from "./interface/languages_test.js";
import { optionTests, languagePopupTests } from "./interface/options_test.js";
import { keyboardTests, accessibilityTests } from "./interface/keys_test.js";
import { uniqueFilterTests } from "./interface/uniques_test.js";
import { headingTests } from "./interface/headings_test.js";
import { reportTests } from "./interface/reporting_test.js";
import { pictureTests } from "./pictures/pictures_test.js";

const FAILURES_SHOWN = 3;
const STORED = ["language", ...Object.keys(SETTINGS)];
const RAN = "the tests ran to the end";

function merge(where) {
  const merged = new Map();
  for (const { name, ok, detail } of results) {
    if (!merged.has(name)) merged.set(name, { name, ok: true, failures: [] });
    if (ok) continue;
    merged.get(name).ok = false;
    merged.get(name).failures.push(detail ? `${where}: ${detail}` : where);
  }
  return [...merged.values()].map(({ name, ok, failures }) => ({
    name, ok, detail: failures.slice(0, FAILURES_SHOWN).join("; "),
  }));
}

const reportLine = (result, tools) => fill(outcome(result, tools), result);

function outcome(result, tools) {
  if (!result.number) return tools.aborted;
  return result.ok ? tools.pass : tools.fail;
}

const announce = (lines) => lines.forEach((line) => console.log(`tests: ${line.replace(/\s+/g, " ")}`));

export function loadFailed() {
  root.dataset.tests = "failed";
  announce(["the page could not load its data", "failed"]);
}

const snapshot = () => ({
  language, include, regional, simple: simple(), view, tips, url: location.href,
  stored: Object.fromEntries(STORED.map((key) => [key, recall(key)])),
});

function toStart() {
  reset();
  if (include) chooseInclude(false);
  if (!regional) chooseRegional(true);
  if (!simple()) chooseSimple(true);
  if (!tips) setTips(true);
  if (view !== "list") setView("list");
  if (language !== codes()[0]) pick(codes()[0]);
}

function restore(before) {
  reset();
  if (include !== before.include) chooseInclude(before.include);
  if (regional !== before.regional) chooseRegional(before.regional);
  chooseSimple(before.simple);
  setView(before.view);
  setTips(before.tips);
  setLanguage(before.language);
  attempt(() => history.replaceState(history.state, "", before.url));
  for (const [key, value] of Object.entries(before.stored)) remember(key, value);
}

async function runAll() {
  const sources = await Promise.all([load("index.html"), styles(), scripts()]);
  const everyLanguageTests = () => codes().forEach((code) => languageTests(code));
  const loadedSourceTests = () => sourceTests(...sources);
  const groups = [
    textTests, behaviourTests, menuTests, everyLanguageTests, optionTests, pictureTests, uniqueFilterTests,
    headingTests, keyboardTests, accessibilityTests, languagePopupTests, loadedSourceTests, dataTests, updaterTests,
    reportTests,
  ];
  for (const group of groups) {
    await runGroup(group);
  }
}

async function runGroup(group) {
  try {
    toStart();
    await group();
  } catch (error) {
    check(RAN, false, `${group.name} stopped: ${error.stack || error.message}`);
  }
}

export async function runTests() {
  try {
    await runAndPublish();
  } catch (error) {
    stopped(error);
  }
}

async function runAndPublish() {
  const before = snapshot();
  await runAll();
  restore(before);
  publish(numbered(merge(windowSize())));
}

const windowSize = () => `${innerWidth} by ${innerHeight}`;

function numbered(results) {
  const tests = results.filter(({ name }) => name !== RAN);
  return results.map((result) => (result.name === RAN ? result : { ...result, number: tests.indexOf(result) + 1 }));
}

function publish(results) {
  const failed = results.filter((result) => !result.ok);
  root.dataset.tests = failed.length ? "failed" : "passed";
  const tools = data.tools;
  const status = fill(failed.length ? tools.testFailed : tools.testPassed, {
    failed: failed.length, n: results.length, window: windowSize(),
    colours: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  });
  openReport(tools.testTitle, status);
  for (const result of [...failed, ...results.filter((r) => r.ok)]) report(reportLine(result, tools));
  announce([...failed.map((result) => reportLine(result, tools)), status, root.dataset.tests]);
  $("report").querySelector("form button").addEventListener("click", () => location.assign(location.pathname));
}

function stopped(error) {
  root.dataset.tests = "failed";
  announce([`the test runner stopped: ${error.message}`, "failed"]);
}
