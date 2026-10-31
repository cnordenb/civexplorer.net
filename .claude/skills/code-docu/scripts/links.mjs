import fs from "node:fs";
import path from "node:path";

const UNLINKED = new Set(["fetch", "decode", "matches", "setProperty", "URL", "clone", "image-set", "url", "calc",
  "max", "min", "local", "cellOf", "getBoundingClientRect"]);
const OTHER_FILE = /(?<![\w/.-])((?:[\w-]+\/)*[\w-]+\.(?:md|yml|webp|png|ttf|ico|csv))(?![\w-])/;
let doc;
let byName;
let tokens;

export const slug = (s) => s.replace(/\$/g, "dollar").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const chapterId = (file) => `c-${slug(file)}`;
export const folderId = (dir) => `d-${dir === "." ? "main" : slug(dir)}`;
export const partId = (file, i) => `p-${slug(file)}--${i}`;
export const dirName = (dir) => (dir === "." ? "the main folder" : `${dir}/`);
export const sig = (e) => (e.kind === "object" ? e.name : `${e.name}${e.params}`);
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

export const fnId = (key) => {
  const [file, name] = key.split("#");
  return `f-${slug(file)}--${slug(name)}`;
};

function entry(line) {
  const part = /^- \[(.+?) (\d+)(?:-(\d+))?\]: (.*)$/.exec(line);
  if (part) return { part: true, title: part[1], lines: [+part[2], +(part[3] ?? part[2])], text: part[4] };
  const item = /^- ([\w$.]+): (.*)$/.exec(line);
  if (item) return { name: item[1], text: item[2] };
  return { intro: true, text: line.trim() };
}

export function parseDesc(text) {
  const chapters = {};
  let current = null;
  let last = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (line.startsWith("@ ")) {
      current = { intro: [], items: [] };
      chapters[line.slice(2).trim()] = current;
      last = null;
    } else if (current && line.trim() && !line.startsWith("#")) {
      if (/^\s/.test(line) && last) last.text += ` ${line.trim()}`;
      else {
        last = entry(line);
        (last.intro ? current.intro : current.items).push(last);
      }
    }
  }
  for (const c of Object.values(chapters)) c.intro = c.intro.map((p) => p.text);
  return chapters;
}

const escaped = (names, chars) => names.sort((a, b) => b.length - a.length).map((n) => n.replace(chars, "\\$&"));

export function initLinks(d) {
  doc = d;
  byName = new Map();
  for (const c of d.CHAPTERS) {
    byName.set(c.file, [c]);
    byName.set(c.name, [...(byName.get(c.name) ?? []).filter((x) => x.file !== c.name), c]);
  }
  const files = escaped([...new Set(d.CHAPTERS.flatMap((c) => [c.file, c.name]))], /[.$/]/g);
  const folders = escaped(d.FOLDERS.filter((f) => f.dir !== ".").map((f) => f.key), /[./]/g);
  tokens = new RegExp([
    "\\[\\[([^\\]#]+)#([\\w$]+)\\]\\]",
    "`([^`]+)`",
    "(?<![\\w$.])([A-Za-z_$][\\w$]*)\\(\\)",
    `(?<![\\w/.-])(${files.join("|")})(?![\\w-])`,
    `(?<![\\w/.-])(${folders.join("|")})(?![\\w-])`,
    OTHER_FILE.source,
  ].join("|"), "g");
}

function resolveFile(token, ctx) {
  const all = byName.get(token) ?? [];
  if (all.length === 1) return all[0];
  const near = all.find((c) => ctx && c.dir === path.posix.dirname(ctx));
  if (near) return near;
  doc.warnings.push(`ambiguous file ${token} in ${ctx}`);
  return all[0];
}

function resolveFn(name, ctx) {
  const mod = doc.modules.get(ctx);
  if (mod?.entries.some((e) => e.name === name)) return `${ctx}#${name}`;
  const imp = mod?.imports.get(name);
  if (imp && doc.byKey.has(`${imp.from}#${imp.name}`)) return `${imp.from}#${imp.name}`;
  const all = [...doc.byKey.keys()].filter((k) => k.endsWith(`#${name}`));
  if (all.length === 1) return all[0];
  if (all.length > 1) doc.warnings.push(`ambiguous function ${name}() in ${ctx}: ${all.join(", ")}`);
  return null;
}

function repoPath(token) {
  if (fs.existsSync(path.join(doc.ROOT, token))) return token;
  const found = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(doc.ROOT, dir), { withFileTypes: true })) {
      if (e.name.startsWith(".git") && e.name !== ".github") continue;
      const p = dir ? `${dir}/${e.name}` : e.name;
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(`/${token}`) || p === token) found.push(p);
    }
  };
  walk("");
  if (found.length !== 1 && !/^\d+\.png$/.test(token)) doc.warnings.push(`repo file ${token}: ${found.length} matches`);
  return found.length === 1 ? found[0] : null;
}

export const fnLink = (key, label) => `<a class="fn" href="#${fnId(key)}">`
  + `${esc(label ?? `${key.split("#")[1]}()`)}</a>`;
export const fileLink = (c, label) => `<a class="file" href="#${chapterId(c.file)}">${esc(label ?? c.file)}</a>`;
export const folderLink = (f, label) => `<a class="file" href="#${folderId(f.dir)}">${esc(label ?? f.label)}</a>`;

function token([all, xFile, xName, tick, call, file, folder, other], ctx) {
  if (xFile) return fnLink(`${xFile}#${xName}`, `${xName}()`);
  if (tick !== undefined) return `<code>${linkify(tick, ctx)}</code>`;
  if (call) {
    const key = resolveFn(call, ctx);
    if (key) return fnLink(key, `${call}()`);
    if (!UNLINKED.has(call)) doc.warnings.push(`unlinked ${call}() in ${ctx}`);
    return esc(all);
  }
  if (file) return fileLink(resolveFile(file, ctx), file);
  if (folder) return folderLink(doc.folderOf.get(folder), folder);
  const p = repoPath(other);
  return p ? `<a class="file ext" href="${doc.REPO}${p}">${esc(other)}</a>` : esc(other);
}

export function linkify(text, ctx) {
  let out = "";
  let last = 0;
  for (const m of text.matchAll(tokens)) {
    out += esc(text.slice(last, m.index));
    last = m.index + m[0].length;
    out += token(m, ctx);
  }
  return out + esc(text.slice(last));
}

export function refList(keys, ctx, top) {
  if (!keys.length) return null;
  const groups = new Map();
  for (const k of keys) {
    const file = k.split("#")[0];
    if (!groups.has(file)) groups.set(file, []);
    groups.get(file).push(k);
  }
  const order = (file) => (file === ctx ? -1 : doc.chapterOf.get(file).n);
  return [...groups.keys()].sort((a, b) => order(a) - order(b)).map((file) => {
    const items = groups.get(file).map((k) => (k.endsWith("#") ? top(file) : fnLink(k))).join(", ");
    return file === ctx ? items : `<span class="in">in ${fileLink(doc.chapterOf.get(file))}:</span> ${items}`;
  }).join("; ");
}

export const sortKeys = (keys) => [...keys].sort((a, b) => {
  const [fa] = a.split("#");
  const [fb] = b.split("#");
  if (fa !== fb) return doc.chapterOf.get(fa).n - doc.chapterOf.get(fb).n;
  return (doc.byKey.get(a)?.lines[0] ?? 0) - (doc.byKey.get(b)?.lines[0] ?? 0);
});
