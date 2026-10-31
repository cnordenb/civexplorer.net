import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseDesc, initLinks, linkify, folderLink, chapterId, folderId, fnId, esc, sig, dirName } from "./links.mjs";
import { chaptersHtml, jsonKeys } from "./chapters.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILLS = path.resolve(HERE, "../..");
const { inventory } = await import(pathToFileURL(path.join(SKILLS, "code-docu-inventory/scripts/inventory.mjs")).href);
const UML_JS = pathToFileURL(path.join(SKILLS, "code-docu-uml/scripts/uml.js")).href;
const REPO = "https://github.com/cnordenb/civexplorer.net/blob/master/";
const INDEX_INTRO = "Every chapter, subchapter and function, in alphabetical order, one to a line, with the page it "
  + "starts on. Chapters, the folders, are in bold, subchapters, the files, in plain letters, and functions in the "
  + "letters of the code.";

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? null : args.splice(i, 2)[1];
};
const DATE = option("--date")
  ?? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const allowTodo = args.includes("--allow-todo");
const [ROOT, WORK] = args.filter((a) => !a.startsWith("--"));
if (!ROOT || !WORK) {
  console.error('usage: node gen.mjs <repo> <work dir> [--date "31 October 2026"] [--allow-todo]');
  process.exit(2);
}
fs.mkdirSync(WORK, { recursive: true });
const outFile = path.join(WORK, "doc.html");
const pagesFile = path.join(WORK, "pages.json");
const pages = fs.existsSync(pagesFile) ? JSON.parse(fs.readFileSync(pagesFile, "utf8")) : {};
const warnings = [];

const layout = JSON.parse(fs.readFileSync(path.join(HERE, "../layout.json"), "utf8"));
const listed = layout.folders.flatMap((f) => f.files);
const absent = listed.filter((f) => !fs.existsSync(path.join(ROOT, f)));
if (absent.length) {
  console.error(`layout: layout.json lists files that are not in the repo: ${absent.join(", ")}`);
  process.exit(3);
}
const repoFiles = (dir, ext) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => (
  e.isDirectory() ? repoFiles(`${dir}/${e.name}`, ext) : e.name.endsWith(ext) ? [`${dir}/${e.name}`] : []));
const unlisted = [...repoFiles("js", ".js"), ...repoFiles("css", ".css")].filter((f) => !listed.includes(f));
if (unlisted.length) warnings.push(`layout: not in layout.json: ${unlisted.join(", ")}`);

const { modules, byKey } = inventory({ root: ROOT, deps: WORK, scripts: listed.filter((f) => f.endsWith(".js")) });
const FOLDERS = layout.folders.map(({ dir, files }, i) => ({ dir, files, n: i + 1, key: `${dir}/`,
  label: dir === "." ? "Main folder" : `${dir}/` }));
let order = 0;
const CHAPTERS = FOLDERS.flatMap((f) => f.files.map((file, j) => ({
  file, n: ++order, num: `${f.n}.${j + 1}`, folder: f, first: j === 0,
  name: path.posix.basename(file), dir: path.posix.dirname(file),
})));
const descDir = path.join(HERE, "../desc");
const desc = parseDesc(fs.readdirSync(descDir).filter((f) => f.endsWith(".txt")).sort()
  .map((f) => fs.readFileSync(path.join(descDir, f), "utf8")).join("\n"));
const pageRules = [];
const header = (name, title) => {
  const content = title.replace(/"/g, '\\"');
  pageRules.push(`@page ${name} { @top-left { content: "${content}"; } }`);
};
const doc = { ROOT, REPO, warnings, modules, byKey, FOLDERS, CHAPTERS, desc, header, numOf: new Map(),
  chapterOf: new Map(CHAPTERS.map((c) => [c.file, c])), folderOf: new Map(FOLDERS.map((f) => [f.key, f])) };
initLinks(doc);

const pageOf = (id) => pages[id] ?? "0";
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function countOf(c) {
  const mod = modules.get(c.file);
  if (mod) {
    const n = mod.entries.filter((e) => e.kind === "function").length;
    const objs = mod.entries.length - n;
    return c.file === "js/script.js" ? "start-up code" : `${plural(n, "function")}${objs ? `, ${objs} object` : ""}`;
  }
  if (/\.json$/.test(c.file)) return `${jsonKeys(c.file).keys.filter((k) => !k.key.includes(".")).length} keys`;
  return `${(desc[c.file]?.items ?? []).filter((i) => i.part).length} parts`;
}

const tocRow = (id, num, label, count, cls) => `<li${cls ? ` class="${cls}"` : ""}><a href="#${id}">`
  + `<span class="tn">${num}</span><span class="tl">${label}</span><span class="tc">${count}</span>`
  + `<span class="dots" aria-hidden="true"></span><span class="tp">${pageOf(id)}</span></a></li>`;

function tocHtml() {
  const fileRows = (f) => CHAPTERS.filter((c) => c.folder === f)
    .map((c) => tocRow(chapterId(c.file), c.num, esc(c.name), countOf(c), "sub"));
  const rows = FOLDERS.map((f) => [tocRow(folderId(f.dir), f.n, esc(f.label), plural(f.files.length, "file"), "ch"),
    ...fileRows(f)].join("\n")).join("\n");
  return `<section class="front" style="page: contents"><h1 id="contents">Contents</h1><ol class="toc">
${tocRow("uml", "", "UML diagram", "", "")}
${rows}
${tocRow("index", "", "Index", "", "")}
</ol></section>`;
}

function umlHtml() {
  const maintainer = fs.readFileSync(path.join(ROOT, "documentation/MAINTAINER.md"), "utf8").replace(/\r/g, "");
  const at = maintainer.indexOf("### UML diagram");
  const source = /```mermaid\n([\s\S]*?)```/.exec(maintainer.slice(at))[1];
  const intro = maintainer.slice(at).split("\n\n")[1].replace(/\n/g, " ");
  const targets = {};
  for (const c of CHAPTERS.filter((x) => modules.has(x.file))) {
    targets[path.posix.basename(c.file, ".js")] ??= { chapter: chapterId(c.file), file: c.file };
  }
  targets.tests = { chapter: folderId("js/tests"), file: "js/tests/run_test.js" };
  const members = Object.fromEntries(Object.entries(targets).map(([cls, t]) => [cls,
    Object.fromEntries(modules.get(t.file).entries.map((e) => [e.name, `#${fnId(e.key)}`]))]));
  const files = { "data.json": `#${chapterId("data.json")}`, "locales/": `#${folderId("locales")}` };
  const data = { umlSource: source, umlTargets: targets, umlMembers: members, umlFiles: files };
  const script = Object.entries(data).map(([k, v]) => `window.${k} = ${JSON.stringify(v)};`).join(" ");
  const text = `${linkify(intro.replace(/`/g, ""), null)} Each box links to the subchapter of its script, and each `
    + "name in it to its section; the box <i>tests</i> stands for the scripts in "
    + `${folderLink(doc.folderOf.get("js/tests/"))} and links to that chapter.`;
  return `<section class="front" style="page: uml-portrait"><h1 id="uml">UML diagram</h1>
<p class="intro">${text}</p>
<div class="uml" id="umlBox"></div>
<script>${script}</script>
</section>`;
}

function indexEntries() {
  return [
    ...[...byKey.values()].map((e) => ({ sort: e.name, label: sig(e), id: fnId(e.key), rank: "fn",
      where: `${e.kind === "object" ? "object" : "function"} ${doc.numOf.get(fnId(e.key))}, in ${e.file}` })),
    ...CHAPTERS.map((c) => ({ sort: c.name, label: c.name, id: chapterId(c.file), rank: "file",
      where: `subchapter ${c.num}, in ${dirName(c.dir)}` })),
    ...FOLDERS.map((f) => ({ sort: f.label, label: f.label, id: folderId(f.dir), rank: "folder",
      where: `chapter ${f.n}` })),
  ];
}

function indexHtml() {
  const RANK = { folder: 0, file: 1, fn: 2 };
  const name = (s) => s.replace(/^\$/, "").toLowerCase();
  const entries = indexEntries().sort((a, b) => (a.sort === "$" ? -1 : b.sort === "$" ? 1 : 0)
    || name(a.sort).localeCompare(name(b.sort), "en") || RANK[a.rank] - RANK[b.rank]
    || a.where.localeCompare(b.where));
  let letter = null;
  const rows = [];
  for (const e of entries) {
    const first = e.sort === "$" ? "$" : name(e.sort)[0].toUpperCase();
    if (first !== letter) {
      letter = first;
      rows.push(`<li class="letter">${esc(letter)}</li>`);
    }
    rows.push(`<li class="${e.rank}"><a href="#${e.id}"><span class="il">${esc(e.label)}</span>`
      + `<span class="iw">${esc(e.where)}</span><span class="dots" aria-hidden="true"></span>`
      + `<span class="tp">${pageOf(e.id)}</span></a></li>`);
  }
  return `<section class="front" style="page: index"><h1 id="index">Index</h1>
<p class="intro">${INDEX_INTRO}</p>
<ol class="index">${rows.join("\n")}</ol></section>`;
}

function titleHtml() {
  const all = [...byKey.values()];
  const fns = all.filter((e) => e.kind === "function").length;
  const intro = (desc["(title)"]?.intro ?? []).map((p) => `<p>${linkify(p, null)}</p>`).join("");
  const counts = `${FOLDERS.length} chapters and ${CHAPTERS.length} subchapters · ${fns} functions and `
    + plural(all.length - fns, "object");
  return '<section class="front titlepage" style="page: title">\n'
    + '<p class="t1">AoE2 Civ Explorer</p><p class="t2">Code documentation</p>'
    + '<p class="t3">What each part of the code does, and why</p>\n'
    + `<p class="t4">${DATE} · ${counts}</p>\n<div class="about">${intro}</div></section>`;
}

const chapters = chaptersHtml(doc);
const toc = tocHtml();
const uml = umlHtml();
const index = indexHtml();
const title = titleHtml();
for (const [page, text] of [["title", "Code documentation"], ["contents", "Contents"], ["uml-portrait", "UML diagram"],
  ["uml-landscape", "UML diagram"], ["index", "Index"]]) header(page, text);

const css = fs.readFileSync(path.join(HERE, "doc.css"), "utf8");
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">'
  + `<title>AoE2 Civ Explorer · Code documentation</title>
<style>${css}
${pageRules.join("\n")}</style>
<script>window.docReady = false;</script>
<script src="${UML_JS}" type="module"></script>
</head><body>
${title}
${toc}
${uml}
${chapters}
${index}
</body></html>`;

fs.writeFileSync(outFile, html);
console.log(`wrote ${outFile}: ${byKey.size} entries, ${FOLDERS.length} chapters, ${CHAPTERS.length} subchapters`);
const unique = [...new Set(warnings)];
if (unique.length) console.log(unique.join("\n"));
const BLOCKING = /^(no description|extra description|undescribed key|extra key|layout:|part:)/;
const blocking = unique.filter((w) => BLOCKING.test(w));
if (blocking.length && !allowTodo) {
  console.error(`${blocking.length} problems to fix in desc/ or layout.json before printing`
    + " (--allow-todo makes a draft)");
  process.exit(3);
}
