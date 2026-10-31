import fs from "node:fs";
import path from "node:path";
import { inventory } from "./inventory.mjs";

const [, , root, deps, only] = process.argv;
if (!root || !deps) {
  console.error("usage: node testmap.mjs <repo> <work dir with node_modules> [part of a file name]");
  process.exit(2);
}
const CALL = /(?:check|expect)\(\s*(`[^`]*`|"(?:[^"\\]|\\.)*"(?:\s*\+\s*"(?:[^"\\]|\\.)*")*|[a-z]+)/g;
const md = fs.readFileSync(path.join(root, "documentation/TESTS.md"), "utf8").replace(/\r/g, "");
const tests = [];
for (const sec of md.split(/\n## Test /).slice(1)) {
  const n = parseInt(sec, 10);
  const res = /### File residence:\n([\s\S]*?)\n\n/.exec(sec)?.[1] ?? "";
  for (const part of res.split(/;\s*|\n/)) {
    const file = /`([^`]+)`/.exec(part)?.[1];
    if (!file) continue;
    const ranges = [...part.replace(/`[^`]+`/, "").matchAll(/(\d+)(?:-(\d+))?/g)]
      .map((m) => [+m[1], +(m[2] ?? m[1])]);
    tests.push({ n, file, ranges });
  }
}
const { modules } = inventory({ root, deps });
for (const mod of modules.values()) {
  if (!mod.file.startsWith("js/tests/") || (only && !mod.file.includes(only))) continue;
  console.log(`\n## ${mod.file}`);
  for (const e of mod.entries) {
    const [a, b] = e.lines;
    const hits = [...new Set(tests.filter((t) => t.file === mod.file && t.ranges.some(([x, y]) => x <= b && y >= a))
      .map((t) => t.n))];
    const body = mod.code.split("\n").slice(a - 1, b).join("\n");
    const names = [...body.matchAll(CALL)].map((m) => m[1].replace(/"\s*\+\s*"/g, "").slice(0, 200));
    const listed = names.map((name) => `\n    ${name}`).join("");
    console.log(`- ${e.name} [${a}-${b}] tests ${hits.join(",") || "-"}${listed}`);
  }
}
const lengths = new Map([...modules.values()].map((m) => [m.file,
  m.code.replace(/\r?\n$/, "").split(/\r?\n/).length]));
const stale = tests.filter((t) => lengths.has(t.file) && t.ranges.some(([, y]) => y > lengths.get(t.file)));
if (stale.length) {
  console.log(`\nranges past the end of their file: ${stale.map((t) => `Test ${t.n} ${t.file}`).join(", ")}`);
}
