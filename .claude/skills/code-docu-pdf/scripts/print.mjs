import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [, , src, out, port = "9351"] = process.argv;
if (!src || !out) {
  console.error("usage: node --experimental-websocket print.mjs <page.html> <out.pdf> [port]");
  process.exit(2);
}
if (typeof WebSocket === "undefined") {
  console.error("this Node has no global WebSocket: run it with --experimental-websocket (Node 21) or use Node 22+");
  process.exit(2);
}
const CHROME = process.env.CHROME ?? "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const profile = path.join(path.dirname(path.resolve(out)), `chrome-profile-${port}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.rmSync(profile, { recursive: true, force: true });
const proc = spawn(CHROME, ["--headless=new", "--no-sandbox", "--disable-gpu", "--allow-file-access-from-files",
  "--disable-web-security", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, "--window-size=1280,800",
  "about:blank"], { stdio: "ignore" });
const quit = () => spawn("taskkill", ["/T", "/F", "/PID", String(proc.pid)], { stdio: "ignore" });

try {
  let page;
  for (let i = 0; i < 150 && !page; i++) {
    try {
      page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
    } catch {}
    if (!page) await sleep(100);
  }
  if (!page) throw new Error(`Chrome did not open its debugging port ${port}`);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const waiting = new Map();
  ws.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data);
    if (!msg.id || !waiting.has(msg.id)) return;
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

  await send("Page.enable");
  await send("Page.navigate", { url: pathToFileURL(path.resolve(src)).href });
  let ready = false;
  for (let i = 0; i < 600 && !ready; i++) {
    ready = await evaluate("document.readyState === 'complete' && (window.docReady ?? true)").catch(() => false);
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error("the page never set window.docReady");
  const report = await evaluate("JSON.stringify(window.umlReport ?? null)");
  if (report !== "null") console.log("uml:", report);
  const { data } = await send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true,
    generateDocumentOutline: true, generateTaggedPDF: true, displayHeaderFooter: false,
    transferMode: "ReturnAsBase64" });
  fs.writeFileSync(out, Buffer.from(data, "base64"));
  console.log("wrote", out, `${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
  ws.close();
} finally {
  quit();
  await sleep(500);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
