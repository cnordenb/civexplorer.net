import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const [, , repoArg, outArg, port = "9361"] = process.argv;
if (!repoArg || !outArg) {
  console.error("usage: node --experimental-websocket download.mjs <repo> <out> [port]");
  process.exit(2);
}
if (typeof WebSocket === "undefined") {
  console.error("this Node has no global WebSocket: run it with --experimental-websocket (Node 21) or use Node 22+");
  process.exit(2);
}
const repo = path.resolve(repoArg);
const out = path.resolve(outArg);
const CHROME = process.env.CHROME ?? "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webp": "image/webp", ".png": "image/png", ".ico": "image/x-icon", ".ttf": "font/ttf" };
const { tools, source } = JSON.parse(fs.readFileSync(path.join(repo, "data.json"), "utf8"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (whole, key) => values[key] ?? whole);

const server = http.createServer((request, response) => {
  const file = path.join(repo, decodeURIComponent(new URL(request.url, "http://x").pathname));
  if (!file.startsWith(repo) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const site = `http://127.0.0.1:${server.address().port}`;

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "data-update-"));
const proc = spawn(CHROME, ["--headless=new", "--no-sandbox", "--disable-gpu", `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`, "--window-size=1280,800", "about:blank"], { stdio: "ignore" });

const quit = () => (process.platform === "win32"
  ? spawn("taskkill", ["/T", "/F", "/PID", String(proc.pid)], { stdio: "ignore" })
  : proc.kill());

async function connect() {
  for (let i = 0; i < 150; i++) {
    const page = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json())
      .then((targets) => targets.find((t) => t.type === "page"), () => null);
    if (page) return page;
    await sleep(100);
  }
  throw new Error(`Chrome did not open its debugging port ${port}`);
}

async function session(page) {
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve));
  let id = 0;
  const waiting = new Map();
  ws.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data);
    if (!waiting.has(msg.id)) return;
    const { resolve, reject } = waiting.get(msg.id);
    waiting.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    waiting.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true,
    returnByValue: true })).result.value;
  return { ws, send, evaluate };
}

const READ = `(async () => {
  const status = document.getElementById("reportStatus")?.textContent ?? "";
  const lines = [...document.querySelectorAll("#reportList li")].map((li) => li.textContent);
  const links = [...document.querySelectorAll("#reportDownloads a")];
  const files = await Promise.all(links.map(async (a) => ({ label: a.textContent,
    text: await fetch(a.href).then((r) => r.text()) })));
  return { status, lines, files, shown: !document.getElementById("reportDownloads").hidden };
})()`;

function changes(before, after, at = "", found = []) {
  if (JSON.stringify(before) === JSON.stringify(after)) return found;
  const objects = [before, after].every((value) => value && typeof value === "object" && !Array.isArray(value));
  if (!objects) {
    found.push(`${at}: ${JSON.stringify(before)?.slice(0, 80)} -> ${JSON.stringify(after)?.slice(0, 80)}`);
    return found;
  }
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    changes(before[key], after[key], `${at}.${key}`, found);
  }
  return found;
}

function save({ label, text }) {
  const [head, tail] = tools.download.split("{file}");
  const name = label.startsWith(head) && label.endsWith(tail) ? label.slice(head.length, label.length - tail.length)
    : null;
  if (!name || !/^(data\.json|locales\/[a-z]+\.json)$/.test(name)) throw new Error(`unexpected download ${label}`);
  const target = path.join(out, name);
  const before = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
  const body = before?.includes("\r\n") ? text.replace(/\r?\n/g, "\r\n") : text;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body);
  const same = before !== null && before.replace(/\r\n/g, "\n") === text.replace(/\r\n/g, "\n");
  const values = before === null ? [] : changes(JSON.parse(before), JSON.parse(text));
  const how = before === null ? "new" : same ? "unchanged" : values.length ? `${values.length} values changed`
    : "same values, new order or wrapping";
  console.log(`file: ${name}: ${how}`);
  values.forEach((line) => console.log(`  ${line}`));
}

try {
  const { ws, send, evaluate } = await session(await connect());
  await send("Page.navigate", { url: `${site}/index.html?update` });
  const loading = fill(tools.updateLoading, { source: source.name });
  let result = null;
  for (let i = 0; i < 1200 && !result; i++) {
    await sleep(100);
    const read = await evaluate(READ).catch(() => null);
    if (read?.status && read.status !== loading) result = read;
  }
  if (!result) throw new Error("the updater did not finish in 120 seconds");
  console.log(`status: ${result.status}`);
  result.lines.forEach((line) => console.log(`report: ${line}`));
  if (!result.shown) process.exitCode = 1;
  result.files.forEach(save);
  ws.close();
} finally {
  quit();
  server.close();
  await sleep(500);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
