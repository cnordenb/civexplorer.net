import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PDF = path.resolve(HERE, "../../code-docu-pdf/scripts");
const [ROOT, WORK, ...genOptions] = process.argv.slice(2);
if (!ROOT || !WORK) {
  console.error('usage: node build.mjs <repo> <work dir> [--date "31 October 2026"] [--allow-todo]');
  process.exit(2);
}
const python = process.env.PYTHON ?? "python";
const nodeFlags = Number(process.versions.node.split(".")[0]) < 22 ? ["--experimental-websocket"] : [];
const file = (name) => path.join(WORK, name);

const run = (label, command, args) => {
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`${label} failed (exit ${result.status})`);
    process.exit(result.status || 1);
  }
};

run("preflight", process.execPath, [path.join(HERE, "preflight.mjs"), WORK]);
fs.rmSync(file("pages.json"), { force: true });
run("generate", process.execPath, [path.join(HERE, "gen.mjs"), ROOT, WORK, ...genOptions]);

let stable = false;
for (let round = 1; round <= 4 && !stable; round++) {
  run(`print ${round}`, process.execPath, [...nodeFlags, path.join(PDF, "print.mjs"), file("doc.html"),
    file("printed.pdf")]);
  run(`page numbers ${round}`, python, [path.join(PDF, "pages.py"), file("printed.pdf"),
    file("pages.new.json")]);
  const before = fs.existsSync(file("pages.json")) ? fs.readFileSync(file("pages.json"), "utf8") : null;
  const after = fs.readFileSync(file("pages.new.json"), "utf8");
  fs.renameSync(file("pages.new.json"), file("pages.json"));
  stable = before === after;
  if (!stable) run(`generate with page numbers ${round}`, process.execPath, [path.join(HERE, "gen.mjs"), ROOT, WORK,
    ...genOptions]);
}
if (!stable) {
  console.error("the page numbers did not settle after 4 printings");
  process.exit(1);
}

run("pack", python, [path.join(PDF, "pack.py"), file("printed.pdf"), file("doc.html"), file("code_docu.pdf")]);
run("verify", python, [path.join(PDF, "verify.py"), file("code_docu.pdf"), file("doc.html"), file("pages.json")]);
console.log(`\nbuilt ${file("code_docu.pdf")} (${(fs.statSync(file("code_docu.pdf")).size / 1e6).toFixed(1)} MB)`);
console.log(`install it with: cp "${file("code_docu.pdf")}" "${path.join(ROOT, "documentation", "code_docu.pdf")}"`);
