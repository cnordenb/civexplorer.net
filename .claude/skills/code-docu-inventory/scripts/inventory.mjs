import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export function findScripts(root) {
  const found = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".js")) found.push(p);
    }
  };
  walk("js");
  return found.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
}

const isFn = (node) => node && /^(ArrowFunctionExpression|FunctionExpression)$/.test(node.type);

const isObj = (node) => node?.type === "ObjectExpression"
  && node.properties.some((p) => isFn(p.value) || p.method || isObj(p.value));

const paramsText = (code, fn) => {
  if (!fn.params.length) return "()";
  const a = fn.params[0].start;
  const b = fn.params[fn.params.length - 1].end;
  return `(${code.slice(a, b).replace(/\s+/g, " ")})`;
};

function declared(node, into) {
  if (!node) return;
  if (node.type === "Identifier") into.add(node.name);
  else if (node.type === "ObjectPattern") node.properties.forEach((p) => declared(p.value ?? p.argument, into));
  else if (node.type === "ArrayPattern") node.elements.forEach((e) => declared(e, into));
  else if (node.type === "RestElement") declared(node.argument, into);
  else if (node.type === "AssignmentPattern") declared(node.left, into);
}

function hoisted(body, into) {
  for (const st of body) {
    if (st.type === "VariableDeclaration") st.declarations.forEach((d) => declared(d.id, into));
    if (st.type === "FunctionDeclaration" || st.type === "ClassDeclaration") into.add(st.id.name);
  }
}

function references(root) {
  const found = [];
  const walk = (node, scope, parent, key) => {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "Identifier") {
      const property = parent && ((parent.type === "MemberExpression" && key === "property" && !parent.computed)
        || (parent.type === "Property" && key === "key" && !parent.computed && !parent.shorthand)
        || (parent.type === "MethodDefinition" && key === "key")
        || (parent.type === "PropertyDefinition" && key === "key"));
      const label = parent && /Labeled|Break|Continue/.test(parent.type);
      if (!property && !label && !scope.has(node.name)) found.push(node.name);
      return;
    }
    let inner = scope;
    if (/Function/.test(node.type)) {
      inner = new Set(scope);
      node.params.forEach((p) => declared(p, inner));
      if (node.id && node.type !== "FunctionDeclaration") inner.add(node.id.name);
      if (node.body.type === "BlockStatement") hoisted(node.body.body, inner);
      node.params.forEach((p) => walkPattern(p, inner));
      walk(node.body, inner, node, "body");
      return;
    }
    if (node.type === "BlockStatement" || node.type === "Program") {
      inner = new Set(scope);
      hoisted(node.body, inner);
    }
    if (node.type === "CatchClause") {
      inner = new Set(scope);
      declared(node.param, inner);
    }
    if (/^For(In|Of)?Statement$/.test(node.type)) {
      inner = new Set(scope);
      const init = node.init ?? node.left;
      if (init?.type === "VariableDeclaration") init.declarations.forEach((d) => declared(d.id, inner));
    }
    if (node.type === "VariableDeclarator") {
      walkPattern(node.id, scope);
      walk(node.init, scope, node, "init");
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === "loc" || k === "start" || k === "end") continue;
      if (Array.isArray(v)) v.forEach((c) => walk(c, inner, node, k));
      else if (v && typeof v.type === "string") walk(v, inner, node, k);
    }
  };
  const walkPattern = (p, scope) => {
    if (!p) return;
    if (p.type === "AssignmentPattern") { walkPattern(p.left, scope); walk(p.right, scope, p, "right"); }
    else if (p.type === "ObjectPattern") p.properties.forEach((q) => {
      if (q.computed) walk(q.key, scope, q, "key");
      walkPattern(q.value ?? q.argument, scope);
    });
    else if (p.type === "ArrayPattern") p.elements.forEach((e) => walkPattern(e, scope));
    else if (p.type === "RestElement") walkPattern(p.argument, scope);
  };
  walk(root, new Set(), null, null);
  return found;
}

function addStatement(st, code, entries, top) {
  const exported = /^Export/.test(st.type);
  const decl = exported ? st.declaration : st;
  const lines = [st.loc.start.line, st.loc.end.line];
  const variables = decl?.type === "VariableDeclaration";
  if (decl?.type === "FunctionDeclaration") {
    entries.push({ name: decl.id.name, kind: "function", params: paramsText(code, decl), lines, exported,
      node: decl, async: decl.async });
  } else if (variables && decl.declarations.some((d) => isFn(d.init) || isObj(d.init))) {
    for (const d of decl.declarations) {
      if (isFn(d.init)) entries.push({ name: d.id.name, kind: "function", params: paramsText(code, d.init),
        lines, exported, node: d.init, async: d.init.async });
      else if (isObj(d.init)) entries.push({ name: d.id.name, kind: "object", params: "", lines, exported,
        node: d.init });
    }
  } else {
    top.push({ st, lines, names: variables ? decl.declarations.map((d) => d.id.name) : [], exported,
      value: variables });
  }
}

function parseModule(root, file, acorn) {
  const code = fs.readFileSync(path.join(root, file), "utf8");
  const ast = acorn.parse(code, { ecmaVersion: "latest", sourceType: "module", locations: true });
  const imports = new Map();
  const entries = [];
  const top = [];
  const dynamic = [];
  for (const st of ast.body) {
    if (st.type !== "ImportDeclaration") addStatement(st, code, entries, top);
    else {
      const from = path.posix.join(path.posix.dirname(file), st.source.value);
      for (const s of st.specifiers) imports.set(s.local.name, { from, name: s.imported?.name ?? "default" });
    }
  }
  for (const m of code.matchAll(/import\(\s*"([^"]+)"\s*\)\.then\(\(\{\s*([^}]+?)\s*\}\)/g)) {
    const from = path.posix.join(path.posix.dirname(file), m[1]);
    for (const n of m[2].split(",").map((s) => s.trim())) dynamic.push({ from, name: n });
  }
  return { file, code, imports, entries, top, dynamic, lineCount: code.split("\n").length };
}

function link(modules) {
  const byKey = new Map();
  for (const mod of modules.values()) for (const e of mod.entries) byKey.set(`${mod.file}#${e.name}`, e);
  const known = (from, name) => (byKey.has(`${from}#${name}`) ? `${from}#${name}` : null);
  const resolve = (mod, name) => {
    if (mod.entries.some((e) => e.name === name)) return `${mod.file}#${name}`;
    const imp = mod.imports.get(name);
    const dyn = mod.dynamic.find((d) => d.name === name);
    return (imp && known(imp.from, imp.name)) || (dyn && known(dyn.from, dyn.name)) || null;
  };
  for (const mod of modules.values()) {
    for (const e of mod.entries) {
      e.key = `${mod.file}#${e.name}`;
      e.file = mod.file;
      e.calls = [...new Set(references(e.node).map((n) => resolve(mod, n)).filter((k) => k && k !== e.key))];
    }
    const topCalls = mod.top.flatMap(({ st }) => references(st).map((n) => resolve(mod, n))).filter(Boolean);
    const dynamicCalls = mod.dynamic.map((d) => `${d.from}#${d.name}`).filter((k) => byKey.has(k));
    mod.topCalls = [...new Set([...topCalls, ...dynamicCalls])];
  }
  for (const e of byKey.values()) e.calledBy = [];
  for (const mod of modules.values()) {
    for (const e of mod.entries) for (const k of e.calls) byKey.get(k).calledBy.push(e.key);
    for (const k of mod.topCalls) byKey.get(k).calledBy.push(`${mod.file}#`);
  }
  return byKey;
}

export function inventory({ root, deps, scripts = findScripts(root) }) {
  const acorn = createRequire(path.join(deps, "package.json"))("acorn");
  const modules = new Map(scripts.map((file) => [file, parseModule(root, file, acorn)]));
  return { modules, byKey: link(modules) };
}

const short = (keys) => keys.map((k) => k.replace(/^.*\//, "")).join(" ");

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [, , root, deps, only] = process.argv;
  if (!root || !deps) {
    console.error("usage: node inventory.mjs <repo> <work dir with node_modules> [part of a file name]");
    process.exit(2);
  }
  const { modules } = inventory({ root, deps });
  let total = 0;
  for (const mod of modules.values()) {
    if (only && !mod.file.includes(only)) continue;
    total += mod.entries.length;
    console.log(`\n## ${mod.file} (${mod.entries.length}) top:${mod.top.map((t) => t.lines.join("-")).join(",")}`
      + ` topCalls:${short(mod.topCalls)}`);
    for (const e of mod.entries) {
      const name = `${e.exported ? "+" : "-"}${e.name}${e.params}${e.kind === "object" ? " {obj}" : ""}`;
      console.log(`${e.lines.join("-")} ${name} -> ${short(e.calls)} <- ${short(e.calledBy)}`);
    }
  }
  console.log("\ntotal", total);
}
