import path from "node:path";

const PARTS = [
  { part: "model", dir: "js/model" },
  { part: "view", dir: "js/view" },
  { part: "controller", dir: "js/controller" },
];
const ROLES = {
  "js/model/data/datahandler.js": "facade, reads data.json and locales/",
  "js/model/model.js": "subject",
  "js/view/page.js": "observer, composite",
  "js/controller/treehandler.js": "strategy of treeview",
  "js/controller/optionshandler.js": "strategy of optionsview",
};
const UNDRAWN = "js/tests/";

export const classOf = (file) => path.posix.basename(file, ".js");

const within = (dir) => (folder) => folder === dir || folder.startsWith(`${dir}/`);

const names = (params) => `(${params.slice(1, -1).replace(/\s*=\s*[^,]+/g, "").replace(/[{}[\]\s]/g, "")
  .split(",").filter(Boolean).join(", ")})`;

const member = (e) => `    ${e.exported ? "+" : "-"}${e.name}${e.kind === "function" ? names(e.params) : ""}`;

function classText(mod) {
  const role = ROLES[mod.file] ?? "module";
  return [`  class ${classOf(mod.file)} {`, `    <<${role}>>`, ...mod.entries.map(member), "  }"].join("\n");
}

const usedBy = (mod) => new Set([...mod.imports.values(), ...mod.dynamic].map((i) => i.from));

function edgesOf(mods) {
  const files = new Set(mods.map((m) => m.file));
  return mods.flatMap((m) => [...usedBy(m)].filter((from) => files.has(from) && from !== m.file)
    .map((from) => `  ${classOf(m.file)} ..> ${classOf(from)}`));
}

export function partDiagrams(modules, folders) {
  return PARTS.map(({ part, dir }) => {
    const files = folders.filter((f) => within(dir)(f.dir)).flatMap((f) => f.files);
    const mods = files.map((f) => modules.get(f));
    return { id: `uml-${part}`, part, dir, files, classes: mods.map(classText), edges: edgesOf(mods) };
  });
}

export const overviewBoxes = (source) => [...source.matchAll(/class (\w+) \{\s*<<([^>]+)\/>>([^}]*)\}/g)]
  .map(([, name, dir, body]) => ({ name, dir, files: body.trim().split(/\s+/).filter(Boolean) }));

const ownerOf = (boxes, dir) => boxes.filter((b) => within(b.dir)(dir))
  .sort((a, b) => b.dir.length - a.dir.length)[0];

function expected(box, boxes, folders) {
  return folders.filter((f) => ownerOf(boxes, f.dir) === box).flatMap(({ dir, files }) => {
    if (dir === box.dir) return files.map((f) => path.posix.basename(f));
    const sub = dir.slice(box.dir.length + 1);
    return box.files.includes(`${sub}/`) ? [`${sub}/`] : files.map((f) => `${sub}/${path.posix.basename(f)}`);
  });
}

export function overviewProblems(source, modules, folders) {
  const boxes = overviewBoxes(source);
  const problems = [];
  for (const box of boxes) {
    const real = expected(box, boxes, folders);
    const wrong = [...real.filter((f) => !box.files.includes(f)), ...box.files.filter((f) => !real.includes(f))];
    if (wrong.length) problems.push(`uml: the overview's box ${box.name} differs from ${box.dir}/ in ${wrong}`);
  }
  const boxOf = (file) => ownerOf(boxes, path.posix.dirname(file))?.name;
  const used = new Set([...modules.values()].filter((m) => !m.file.startsWith(UNDRAWN))
    .flatMap((m) => [...usedBy(m)].map((from) => `${boxOf(m.file)} ..> ${boxOf(from)}`))
    .filter((e) => !/undefined/.test(e) && e.split(" ..> ")[0] !== e.split(" ..> ")[1]));
  const drawn = new Set([...source.matchAll(/^\s*(\w+ \.\.> \w+)/gm)].map((m) => m[1]));
  for (const e of used) if (!drawn.has(e)) problems.push(`uml: the overview lacks ${e}`);
  for (const e of drawn) if (!used.has(e)) problems.push(`uml: the overview draws ${e}, which no script does`);
  return problems;
}
