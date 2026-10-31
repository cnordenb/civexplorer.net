import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [WORK] = process.argv.slice(2);
if (!WORK) {
  console.error("usage: node preflight.mjs <work dir>");
  process.exit(2);
}
const problems = [];

const [major] = process.versions.node.split(".").map(Number);
if (major < 21) problems.push(`Node ${process.versions.node} is too old: Node 21+ is needed for WebSocket`);

fs.mkdirSync(WORK, { recursive: true });
const wanted = fs.readFileSync(path.join(SKILLS, "package.json"), "utf8");
const manifest = path.join(WORK, "package.json");
const current = fs.existsSync(manifest) ? fs.readFileSync(manifest, "utf8") : null;
const installed = ["acorn", "mermaid"].every((name) => fs.existsSync(path.join(WORK, "node_modules", name)));
if (current !== wanted || !installed) {
  fs.writeFileSync(manifest, wanted);
  console.log(`installing acorn and mermaid in ${WORK}`);
  const npm = spawnSync("npm", ["install", "--no-audit", "--no-fund", "--no-package-lock", "--loglevel=error"],
    { cwd: WORK, shell: true, stdio: "inherit" });
  if (npm.status !== 0) problems.push(`npm install failed in ${WORK}`);
}

const python = process.env.PYTHON ?? "python";
try {
  execFileSync(python, ["-c", "import pikepdf, pypdf, pypdfium2"], { stdio: "pipe" });
} catch {
  problems.push(`${python} lacks pikepdf, pypdf or pypdfium2: ${python} -m pip install --user pikepdf pypdf pypdfium2`);
}

const chrome = process.env.CHROME ?? "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
if (!fs.existsSync(chrome)) problems.push(`no Chrome at ${chrome}: set CHROME to its path`);

if (problems.length) {
  console.error(problems.map((p) => `- ${p}`).join("\n"));
  process.exit(1);
}
console.log(`ready: Node ${process.versions.node}, ${python}, ${chrome}, packages in ${WORK}`);
