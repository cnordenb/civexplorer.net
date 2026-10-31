import fs from "node:fs";
import path from "node:path";
import {
  esc, sig, linkify, fnLink, fileLink, folderLink, refList, sortKeys, chapterId, folderId, fnId, partId, dirName,
} from "./links.mjs";

const ONLY_TEST = " (only with <code>?test</code>)";
const NONE = '<span class="none">no function of the code</span>';
let doc;

const range = ([a, b]) => (a === b ? `line ${a}` : `lines ${a}–${b}`);
const fileLines = (file) => fs.readFileSync(path.join(doc.ROOT, file), "utf8").replace(/\r?\n$/, "").split(/\r?\n/);
const intros = (d, ctx) => d.intro.map((p) => `<p class="intro">${linkify(p, ctx)}</p>`).join("");

function folderHead(f) {
  const files = doc.CHAPTERS.filter((c) => c.folder === f);
  const lines = files.reduce((sum, c) => sum + fileLines(c.file).length, 0);
  const d = doc.desc[f.key];
  if (!d) doc.warnings.push(`no description of folder ${f.key}`);
  const intro = intros(d ?? { intro: [] }, files[0].file);
  const list = files.map((c) => `<span class="sn">${c.num}</span> ${fileLink(c, c.name)}`).join(", ");
  const count = `${files.length} file${files.length === 1 ? "" : "s"}`;
  return `<div class="folder"><h1 id="${folderId(f.dir)}"><span class="num">${f.n}</span>${esc(f.label)}</h1>
<p class="meta"><span>${count}</span><span>${lines} lines</span></p>${intro}
<p class="uses"><b>Subchapters:</b> ${list}</p></div>`;
}

function usesOf(c) {
  const { modules, chapterOf } = doc;
  const mod = modules.get(c.file);
  const link = (file) => fileLink(chapterOf.get(file));
  if (!mod) {
    if (c.file === "index.html") {
      const sheets = ["css/base.css", "css/pictures.css"].map(link).join(", ");
      return `<p class="uses"><b>Loads:</b> ${sheets} and ${link("js/script.js")}</p>`;
    }
    return /\.css$/.test(c.file) ? `<p class="uses"><b>Loaded by:</b> ${link("index.html")}</p>` : "";
  }
  const list = (files) => [...new Set(files)].map((f) => chapterOf.get(f)).sort((a, b) => a.n - b.n)
    .map((x) => fileLink(x)).join(", ");
  const joined = (plain, dynamic, none) => (!plain.length && !dynamic.length ? none
    : list(plain) + (dynamic.length ? `${plain.length ? ", and " : ""}${list(dynamic)}${ONLY_TEST}` : ""));
  const others = [...modules.values()];
  const by = others.filter((m) => [...m.imports.values()].some((i) => i.from === c.file)).map((m) => m.file);
  const byDynamic = others.filter((m) => m.dynamic.some((d) => d.from === c.file)).map((m) => m.file);
  const imports = joined([...mod.imports.values()].map((i) => i.from), mod.dynamic.map((d) => d.from), "nothing");
  const importedBy = joined(by, byDynamic, c.file === "js/script.js" ? link("index.html") : "nothing");
  return `<p class="uses"><b>Imports:</b> ${imports}<br><b>Imported by:</b> ${importedBy}</p>`;
}

function fileHead(c, counts) {
  const meta = [`<span><b>Folder:</b> ${folderLink(c.folder, dirName(c.dir))}</span>`,
    `<span>${fileLines(c.file).length} lines</span>`];
  if (counts) meta.push(`<span>${counts}</span>`);
  return `<h2 class="file" id="${chapterId(c.file)}"><span class="num">${c.num}</span>${esc(c.name)}</h2>
<p class="meta">${meta.join("")}</p>${usesOf(c)}`;
}

function checkParts(c, parts, covered) {
  const lines = fileLines(c.file);
  const warn = (text) => doc.warnings.push(`part: ${c.file} ${text}`);
  parts.forEach((p, i) => {
    const [a, b] = p.lines;
    if (a > b || b > lines.length) warn(`[${p.title} ${a}-${b}] is outside its ${lines.length} lines`);
    const before = parts[i - 1];
    if (before && a <= before.lines[1]) warn(`[${p.title}] overlaps [${before.title}]`);
  });
  if (!covered) return;
  const gaps = [];
  lines.forEach((text, i) => {
    const n = i + 1;
    if (!text.trim() || /^\s*<\/?(body|html)\b[^>]*>\s*$/.test(text)) return;
    if (parts.some(({ lines: [a, b] }) => a <= n && n <= b)) return;
    const last = gaps.at(-1);
    if (last && last[1] === n - 1) last[1] = n;
    else gaps.push([n, n]);
  });
  if (gaps.length) warn(`lines ${gaps.map(([a, b]) => (a === b ? a : `${a}-${b}`)).join(", ")} are in no part`);
}

function sectionHead(num, id, title, tag, lines, plain = false) {
  doc.numOf.set(id, num);
  const tagged = tag ? `<span class="tag">${tag}</span>` : "";
  return `<h3><span class="num">${num}</span><span class="sig${plain ? " plain" : ""}">${esc(title)}</span>${tagged}`
    + `<span class="lines">${range(lines)}</span></h3>`;
}

function topPart(file) {
  const items = doc.desc[file]?.items ?? [];
  const p = items.findIndex((i) => i.part);
  if (p >= 0) return `<a class="fn" href="#${partId(file, p)}">${esc(items[p].title)}</a>`;
  return `<a class="fn" href="#${chapterId(file)}">the top-level code</a>`;
}

function refs(calls, callers, ctx) {
  const called = refList(calls, ctx, topPart) ?? NONE;
  const callerList = refList(callers, ctx, topPart) ?? NONE;
  return `<dl class="refs"><dt>Called by</dt><dd>${callerList}</dd><dt>Calls</dt><dd>${called}</dd></dl>`;
}

function scriptCounts(c, mod) {
  if (c.file === "js/script.js") return "no functions";
  const fns = mod.entries.filter((e) => e.kind === "function").length;
  const objs = mod.entries.length - fns;
  const exported = mod.entries.filter((e) => e.exported).length;
  return `${fns} function${fns === 1 ? "" : "s"}${objs ? `, ${objs} object` : ""}, ${exported} exported`;
}

function scriptChapter(c) {
  const mod = doc.modules.get(c.file);
  const d = doc.desc[c.file] ?? { intro: [], items: [] };
  const texts = new Map(d.items.filter((i) => !i.part).map((i) => [i.name, i.text]));
  for (const name of texts.keys()) {
    if (!mod.entries.some((e) => e.name === name)) doc.warnings.push(`extra description ${c.file}#${name}`);
  }
  const parts = d.items.filter((i) => i.part);
  checkParts(c, parts, false);
  let html = fileHead(c, scriptCounts(c, mod)) + intros(d, c.file);
  let i = 0;
  for (const p of parts) {
    const id = partId(c.file, d.items.indexOf(p));
    const head = sectionHead(`${c.num}.${++i}`, id, p.title, "top-level code", p.lines);
    html += `<section class="sub" id="${id}">${head}
<p>${linkify(p.text, c.file)}</p>${refs(sortKeys(mod.topCalls), [], c.file)}</section>`;
  }
  for (const e of mod.entries) {
    const text = texts.get(e.name);
    if (!text) doc.warnings.push(`no description ${e.key}`);
    const id = fnId(e.key);
    const tag = `${e.kind === "object" ? "object, " : ""}${e.exported ? "exported" : "internal"}`;
    html += `<section class="sub" id="${id}">${sectionHead(`${c.num}.${++i}`, id, sig(e), tag, e.lines)}
<p>${linkify(text ?? "TODO", c.file)}</p>${refs(e.calls, sortKeys(e.calledBy), c.file)}</section>`;
  }
  return html;
}

function partsChapter(c) {
  const d = doc.desc[c.file] ?? { intro: [], items: [] };
  const parts = d.items.filter((i) => i.part);
  checkParts(c, parts, true);
  let html = fileHead(c, `${parts.length} parts`) + intros(d, c.file);
  parts.forEach((p, i) => {
    const id = partId(c.file, d.items.indexOf(p));
    html += `<section class="sub" id="${id}">${sectionHead(`${c.num}.${i + 1}`, id, p.title, "", p.lines, true)}
<p>${linkify(p.text, c.file)}</p></section>`;
  });
  return html;
}

export function jsonKeys(file) {
  const lines = fileLines(file);
  const keys = [];
  const scan = (indent, from, to, prefix) => {
    const found = [];
    for (let i = from; i <= to; i++) {
      const m = new RegExp(`^ {${indent}}"([\\w]+)":`).exec(lines[i - 1]);
      if (m) found.push({ key: prefix + m[1], start: i });
    }
    found.forEach((k, j) => { k.end = j + 1 < found.length ? found[j + 1].start - 1 : to; });
    return found;
  };
  for (const k of scan(2, 2, lines.length - 1, "")) {
    keys.push(k);
    if (k.end <= k.start) continue;
    keys.push(...scan(4, k.start + 1, k.end - 1, `${k.key}.`).filter((s) => /[{[]$/.test(lines[s.start - 1])));
  }
  return { keys, count: lines.length };
}

function jsonChapter(c) {
  const d = doc.desc[c.file] ?? { intro: [], items: [] };
  const { keys } = jsonKeys(c.file);
  const texts = new Map(d.items.filter((i) => !i.part).map((i) => [i.name, i.text]));
  for (const name of texts.keys()) {
    if (!keys.some((k) => k.key === name)) doc.warnings.push(`extra key ${c.file} ${name}`);
  }
  const rows = keys.filter((k) => texts.has(k.key)).map((k) => {
    const lines = k.start === k.end ? k.start : `${k.start}–${k.end}`;
    const key = `<code>${esc(k.key.split(".").pop())}</code>`;
    return `<tr class="d${k.key.split(".").length - 1}"><td class="ln">${lines}</td><td class="key">${key}</td>`
      + `<td>${linkify(texts.get(k.key), c.file)}</td></tr>`;
  });
  for (const k of keys) {
    if (!texts.has(k.key) && !k.key.includes(".")) doc.warnings.push(`undescribed key ${c.file} ${k.key}`);
  }
  const head = "<thead><tr><th>Lines</th><th>Key</th><th>What is there</th></tr></thead>";
  return fileHead(c, `${keys.filter((k) => !k.key.includes(".")).length} keys`) + intros(d, c.file)
    + `<table class="keys">${head}<tbody>${rows.join("")}</tbody></table>`;
}

function chapter(c) {
  doc.header(`ch${c.n}`, `${c.folder.n}  ${c.folder.label}   ›   ${c.num}  ${c.name}`);
  const body = doc.modules.has(c.file) ? scriptChapter(c) : /\.json$/.test(c.file) ? jsonChapter(c) : partsChapter(c);
  return `<section class="chapter" style="page: ch${c.n}">${c.first ? folderHead(c.folder) : ""}${body}</section>`;
}

export function chaptersHtml(d) {
  doc = d;
  return d.CHAPTERS.map(chapter).join("\n");
}
