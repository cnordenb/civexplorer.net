import { load } from "../../model/data/datahandler.js";

export const here = new URL(".", location.href).href;
export const INJECTED = "<!-- Code injected by live-server -->";
const STATIC_IMPORT = /^(?:import\b([^;"']*?)\bfrom|import|export\b([^;"']*?)\bfrom)\s*(["'])([^"']+)\3;?/gm;
const DYNAMIC_IMPORT = /\bimport\(\s*(["'])([^"']+)\1\s*\)/g;
const IMPORT_LINE = /^(import\b(?!\()|export\b.*\bfrom\s*["'])/;
const TICK = "`";
const ARROW_LOOKBACK = 200;
const NAME_LOOKBACK = 60;
const SAMPLE = [
  "const twice = (n) => { return n * 2; };",
  "const shape = { area() { return /{[a-z]}/.test(`${twice(1)}{}`) ? 1 : 0; } };",
  "if (shape.area()) { twice(2); }",
].join("\n");
const SAMPLE_FUNCTIONS = 2;

export async function scripts() {
  const files = new Map();

  const visit = async (url, dynamic) => {
    if (files.has(url)) {
      files.get(url).dynamic &&= dynamic;
      return;
    }
    const file = { path: url.slice(here.length), dynamic, code: "", imports: [] };
    files.set(url, file);
    file.code = await load(url);
    for (const { specifier, names, lazy } of importsIn(file.code)) {
      const target = new URL(specifier, url).href;
      file.imports.push({ specifier, target, names });
      await visit(target, dynamic || lazy);
    }
  };

  await visit(new URL("js/script.js", here).href, false);
  return [...files.values()];
}

const importsIn = (code) => [
  ...[...code.matchAll(STATIC_IMPORT)]
    .map(([, clause, exported, , specifier]) => ({ specifier, names: namesIn(clause ?? exported), lazy: false })),
  ...[...code.matchAll(DYNAMIC_IMPORT)].map(([, , specifier]) => ({ specifier, names: [], lazy: true })),
];

const namesIn = (clause = "") => (/\{([^}]*)\}/.exec(clause)?.[1] ?? "").split(",")
  .map((part) => part.trim().split(/\s+as\s+/)[0]).filter(Boolean);

export const styles = () => Promise.all([...document.querySelectorAll("link[rel=stylesheet]")]
  .map((link) => link.getAttribute("href")).map(async (path) => ({ path, code: await load(path) })));

export function guardScanner(files) {
  if (functionsOf(SAMPLE).length !== SAMPLE_FUNCTIONS) throw new Error("the function finder misreads its sample");
  const lost = files.filter(({ code, imports }) => importLines(code) !== imports.length).map(({ path }) => path);
  if (lost.length) throw new Error(`the tests cannot follow an import in ${lost.join(", ")}`);
}

const importLines = (code) => code.split("\n").filter((line) => IMPORT_LINE.test(line)).length
  + (code.match(/\bimport\(/g) ?? []).length;

export function functionsOf(code) {
  const text = blanked(code);
  const parens = [];
  const braces = [];
  const found = [];
  let paren = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") parens.push(i);
    else if (text[i] === ")") paren = parens.pop();
    else if (text[i] === "{") braces.push({ at: i, body: opensBody(text, i, paren) });
    else if (text[i] === "}") {
      const brace = braces.pop();
      if (brace?.body) found.push({ from: brace.at, to: i });
    }
  }
  return found;
}

function opensBody(text, at, paren) {
  const before = text.slice(Math.max(0, at - ARROW_LOOKBACK), at).trimEnd();
  if (before.endsWith("=>")) return true;
  if (!before.endsWith(")")) return false;
  const word = /([\w$]+)\s*$/.exec(text.slice(Math.max(0, paren - NAME_LOOKBACK), paren))?.[1];
  return !!word && !/^(if|for|while|switch|catch|with)$/.test(word);
}

export function blanked(code) {
  const out = code.split("");
  const stack = [{ template: false, depth: 0 }];
  let last = "";
  let word = "";

  const blank = (from, to) => {
    for (let k = from; k < to; k++) {
      if (out[k] !== "\n") out[k] = " ";
    }
  };

  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const top = stack.at(-1);
    if (top.template) {
      if (c === TICK) {
        stack.pop();
        last = c;
      } else if (c === "$" && code[i + 1] === "{") {
        blank(i, i + 2);
        stack.push({ template: false, depth: 0 });
        i++;
      } else {
        blank(i, c === "\\" ? i + 2 : i + 1);
        if (c === "\\") i++;
      }
      continue;
    }
    if (/\s/.test(c)) continue;
    if (c === "\"" || c === "'" || (c === "/" && regexMayStart(last, word))) {
      const end = closing(code, i);
      blank(i + 1, end);
      i = end;
    } else if (c === TICK) stack.push({ template: true, depth: 0 });
    else if (c === "{") top.depth++;
    else if (c === "}" && top.depth === 0 && stack.length > 1) {
      blank(i, i + 1);
      stack.pop();
    } else if (c === "}") top.depth--;
    word = /[\w$]/.test(c) ? (/[\w$]/.test(code[i - 1] ?? "") ? word : "") + c : "";
    last = c;
  }
  return out.join("");
}

function closing(code, at) {
  let end = at + 1;
  if (code[at] !== "/") {
    while (end < code.length && code[end] !== code[at]) {
      end += code[end] === "\\" ? 2 : 1;
    }
    return end;
  }
  for (let set = false; end < code.length && (set || code[end] !== "/"); end++) {
    if (code[end] === "\\") end++;
    else if (code[end] === "[" || code[end] === "]") set = code[end] === "[";
  }
  return end;
}

const regexMayStart = (last, word) => !last || /[(,=:[!&|?{};+\-*%<>~^]/.test(last)
  || ["return", "typeof", "case"].includes(word);

export const linesOfCode = (code) => code.split("\n").filter((line) => line.trim()).length;

export const named = (files, test) => files.filter(test).map(({ path }) => path);

export const testing = ({ path }) => path.startsWith("js/tests/");
