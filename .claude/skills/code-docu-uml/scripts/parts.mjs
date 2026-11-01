import path from "node:path";

const PARTS = [
  { part: "model", dir: "js/model" },
  { part: "view", dir: "js/view" },
  { part: "controller", dir: "js/controller" },
];
const ROLES = {
  "js/model/datahandler.js": "reads data.json and locales/",
  "js/model/model.js": "subject",
  "js/view/page.js": "observer, composite",
  "js/controller/nodetree.js": "strategy of treeview",
  "js/controller/optionshandler.js": "strategy of optionsview",
};
const UNDRAWN = "js/tests";

export const classOf = (file) => path.posix.basename(file, ".js");

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
    const files = folders.find((f) => f.dir === dir).files;
    const mods = files.map((f) => modules.get(f));
    return { id: `uml-${part}`, part, dir, files, classes: mods.map(classText), edges: edgesOf(mods) };
  });
}

export const overviewBoxes = (source) => [...source.matchAll(/class (\w+) \{\s*<<([^>]+)\/>>([^}]*)\}/g)]
  .map(([, name, dir, body]) => ({ name, dir, files: body.trim().split(/\s+/).filter(Boolean) }));

export function overviewProblems(source, modules, folders) {
  const boxes = overviewBoxes(source);
  const problems = [];
  for (const box of boxes) {
    const real = (folders.find((f) => f.dir === box.dir)?.files ?? []).map((f) => path.posix.basename(f));
    const wrong = [...real.filter((f) => !box.files.includes(f)), ...box.files.filter((f) => !real.includes(f))];
    if (wrong.length) problems.push(`uml: the overview's box ${box.name} differs from ${box.dir}/ in ${wrong}`);
  }
  const boxOf = (file) => boxes.find((b) => b.dir === path.posix.dirname(file))?.name;
  const used = new Set([...modules.values()].filter((m) => path.posix.dirname(m.file) !== UNDRAWN)
    .flatMap((m) => [...usedBy(m)].map((from) => `${boxOf(m.file)} ..> ${boxOf(from)}`))
    .filter((e) => !/undefined/.test(e) && e.split(" ..> ")[0] !== e.split(" ..> ")[1]));
  const drawn = new Set([...source.matchAll(/^\s*(\w+ \.\.> \w+)/gm)].map((m) => m[1]));
  for (const e of used) if (!drawn.has(e)) problems.push(`uml: the overview lacks ${e}`);
  for (const e of drawn) if (!used.has(e)) problems.push(`uml: the overview draws ${e}, which no script does`);
  return problems;
}
