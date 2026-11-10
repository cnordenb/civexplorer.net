import { data } from "../../model/data/datahandler.js";
import { expect, keys, need } from "../helpers_test.js";
import { here, INJECTED, guardScanner, functionsOf, blanked, linesOfCode, named, testing } from "./scanner_test.js";
import { layerTests } from "./layers_test.js";

const BLOCK_COMMENT = /\/\*/;
const STYLING = [/\.style\b(?!\.setProperty\("--\w+", [^"]*\))\s*[.=[]/, /setAttribute\(\s*["']style/];
const MARKUP = [/\.(innerHTML|outerHTML|insertAdjacentHTML)\b/, /createElement\s*\(/, /document\.write/];
const REQUIRE = /\brequire\s*\(/;
const SHEET_IMPORT = /@import/i;
const FILE_LIMIT = 400;
const FUNCTION_LIMIT = 60;
const LINE_LIMIT = 120;
const BLOCK_ARROW = /^(export )?const \w+ = (async )?\([^)]*\) => \{\r?$/;
const TEMPLATE = /<template\b[\s\S]*?<\/template>/gi;
const SOURCED_IMAGE = /<img\b[^>]*\ssrc(set)?=/i;
const SOUNDING = /<(audio|video|object|embed)\b/gi;
const SOUND = /new\s+(Audio|AudioContext)\b/;
const MOVING = /@keyframes|\banimation|\btransition/i;
const ANIMATE = /\.animate\s*\(/;
const SPINNER = [
  /@media \(prefers-reduced-motion: no-preference\) \{ \.spinner \{ animation: spin 1s linear infinite; \} \}/,
  /@keyframes spin \{ to \{ rotate: 1turn; \} \}/,
];
const PICTURE_RULE = /^(html)?\.pictures\b/;
const FONT_FACE = "@font-face";

export function sourceTests(page, sheets, files) {
  const own = page.split(INJECTED)[0];
  guardScanner(files);
  codeTests(own, sheets, files);
  loadingTests(sheets, files);
  sizeTests(own, sheets, files);
  layerTests(files);
  assetTests(own, sheets, files);
}

function codeTests(own, sheets, files) {
  expect("rules: no comments in the code", [
    ...need(!own.includes("<!--"), "index.html"),
    ...sheets.filter(({ code }) => BLOCK_COMMENT.test(code)).map(({ path }) => path),
    ...named(files, ({ code }) => BLOCK_COMMENT.test(code) || blanked(code).includes("//")),
  ]);
  expect("rules: the scripts set no styles but numbers for CSS custom properties",
    named(files, ({ code }) => STYLING.some((pattern) => pattern.test(code))));
  expect("rules: the scripts build no markup",
    named(files, ({ code }) => MARKUP.some((pattern) => pattern.test(code))));
}

function loadingTests(sheets, files) {
  const names = [...sheets, ...files].map(({ path }) => path.split("/").pop());
  expect("rules: the tests load only when testing", named(files, (file) => testing(file) && !file.dynamic));
  expect("rules: every other script loads with the page", named(files, (file) => !testing(file) && file.dynamic));
  expect("rules: no two files share a name", names.filter((name, i) => names.indexOf(name) !== i)
    .map((name) => `two files named ${name}`));
  expect("rules: the code has no dependencies", dependencies(sheets, files));
}

function dependencies(sheets, files) {
  return [
    ...sheets.filter(({ path }) => !new URL(path, here).href.startsWith(here))
      .map(({ path }) => `index.html links ${path}`),
    ...files.flatMap(({ path, imports }) => imports.filter(outward)
      .map(({ specifier }) => `${path} imports ${specifier}`)),
    ...named(files, ({ code }) => REQUIRE.test(code)).map((path) => `${path} uses require`),
    ...sheets.filter(({ code }) => SHEET_IMPORT.test(code)).map(({ path }) => `${path} has an @import`),
    ...sheets.flatMap(urlsIn).filter(({ href }) => !href.startsWith(here))
      .map(({ path, href }) => `${path} uses ${href}`),
  ];
}

const outward = ({ specifier, target }) => !specifier.startsWith(".") || !target.startsWith(here);

function sizeTests(own, sheets, files) {
  const sources = [{ path: "index.html", code: own }, ...sheets, ...files]
    .map(({ path, code }) => ({ path, code, lines: code.split("\n").map((line) => line.replace(/\r$/, "")) }));
  const scriptSources = sources.filter(({ path }) => path.endsWith(".js"));
  expect(`rules: no file has over ${FILE_LIMIT} lines of code`, sources
    .filter(({ code }) => linesOfCode(code) > FILE_LIMIT)
    .map(({ path, code }) => `${path} has ${linesOfCode(code)} lines of code`));
  expect(`rules: no function has over ${FUNCTION_LIMIT} lines of code`, scriptSources
    .flatMap(({ path, code, lines }) => longFunctions(code, lines).map((problem) => `${path}: ${problem}`)));
  expect(`rules: no line of a script is over ${LINE_LIMIT} characters`, scriptSources
    .filter(({ lines }) => wide(lines).length).map(widths));
  expect("rules: a top-level function with statements is a function declaration", scriptSources
    .filter(({ lines }) => arrows(lines).length)
    .map(({ path, lines }) => `${path} at line ${arrows(lines).join(", ")}`));
}

function longFunctions(code, lines) {
  const starts = [0, ...[...code.matchAll(/\n/g)].map((match) => match.index + 1)];
  const lineOf = (at) => starts.findLastIndex((start) => start <= at) + 1;

  const nameOf = (line) => /(?:function\s*|const\s+|let\s+)([\w$]+)/.exec(lines[line - 1])?.[1] ?? "a function";

  const sizeOf = ({ from, to }) => linesOfCode(lines.slice(lineOf(from) - 1, lineOf(to)).join("\n"));

  return functionsOf(code).filter((each) => sizeOf(each) > FUNCTION_LIMIT)
    .map((each) => `${nameOf(lineOf(each.from))} at line ${lineOf(each.from)} has ${sizeOf(each)} lines of code`);
}

const wide = (lines) => lines.flatMap((line, i) => (line.length > LINE_LIMIT ? [i + 1] : []));

const widths = ({ path, lines }) => `${path} has ${wide(lines).length} line${wide(lines).length === 1 ? "" : "s"} `
  + `over ${LINE_LIMIT} characters, from line ${wide(lines)[0]}`;

const arrows = (lines) => lines.flatMap((line, i) => (BLOCK_ARROW.test(line) ? [i + 1] : []));

function assetTests(own, sheets, files) {
  expect("rules: no image in a template has a source", (own.match(TEMPLATE) ?? [])
    .filter((part) => SOURCED_IMAGE.test(part)).map((part) => /\bid="([^"]*)"/.exec(part)?.[1] ?? "a template"));
  expect("rules: only the picture look's style rules name pictures", sheets.flatMap(urlsIn)
    .filter(({ selector }) => selector !== FONT_FACE && !inPictureLook(selector))
    .map(({ path, selector, href }) => `${path}: ${selector} uses ${href.slice(here.length)}`));
  expect("rules: the page plays no sounds", [
    ...(own.match(SOUNDING) ?? []).map((tag) => `index.html has ${tag.toLowerCase()}>`),
    ...named(files, ({ code }) => SOUND.test(code)),
  ]);
  expect("rules: nothing moves but the loading spin", [
    ...sheets.filter(({ code }) => MOVING.test(unspun(code))).map(({ path }) => path),
    ...named(files, ({ code }) => ANIMATE.test(code)),
  ]);
  expect("rules: the scripts hold no game data", [...data.civs, ...keys()]
    .filter((name) => files.some(({ code }) => code.includes(JSON.stringify(name)))));
}

const inPictureLook = (selector) => selector.split(/,(?![^(]*\))/).every((part) => PICTURE_RULE.test(part.trim()));

const unspun = (sheet) => SPINNER.reduce((rest, turn) => rest.replace(turn, ""), sheet);

const urlsIn = ({ path, code }) => [...code.matchAll(/([^{}]*)\{([^{}]*)\}/g)].flatMap(([, selector, body]) => [
  ...body.matchAll(/url\(\s*"?([^")]*)/gi)].map(([, src]) => ({
  path, selector: selector.trim(), href: new URL(src, new URL(path, here)).href,
})));
