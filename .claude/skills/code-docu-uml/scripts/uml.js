import { collisions } from "./collide.js";

const NS = "http://www.w3.org/2000/svg";
const PX_PER_MM = 96 / 25.4;
const PT_PER_MM = 72 / 25.4;
const FONT_PX = 16;
const PAGES = {
  "uml-portrait": { width: 176, height: 263 },
};
const SAFETY_MM = 4;
const MAX_PT = 9;
const TRIES = 12;
const MERMAID = "node_modules/mermaid/dist/mermaid.esm.min.mjs";
const ELK = "node_modules/@mermaid-js/layout-elk/dist/mermaid-layout-elk.esm.min.mjs";
const WITH_ELK = "---\nconfig:\n  layout: elk\n---\n";
let drawn = 0;

const wrap = (el, href) => {
  const a = document.createElementNS(NS, "a");
  a.setAttribute("href", href);
  el.parentNode.insertBefore(a, el);
  a.appendChild(el);
};

const boxName = (g) => /^classId-(.+)-\d+$/.exec(g.id)?.[1] ?? g.id;

function aboveBox(section, box, widthMm) {
  const old = section.style.width;
  section.style.width = `${widthMm}mm`;
  const used = (box.getBoundingClientRect().top - section.getBoundingClientRect().top) / PX_PER_MM;
  section.style.width = old;
  return used;
}

function link(root, links) {
  const missing = [];
  for (const g of root.querySelectorAll("g.node")) {
    const cls = boxName(g);
    for (const text of g.querySelectorAll("text")) {
      const s = text.textContent.trim();
      const name = /^[+-]?([\w$./]+)/.exec(s)?.[1];
      const href = s === cls ? links.classes[cls] : links.members[cls]?.[name];
      if (href) wrap(text, href);
      else if (/data\.json/.test(s)) wrap(text, links.data);
      else if (name) missing.push(`${cls}.${name}`);
    }
  }
  return missing;
}

async function render(mermaid, source, box) {
  drawn += 1;
  const { svg } = await mermaid.render(`uml${drawn}`, source);
  box.innerHTML = svg;
  const root = box.querySelector("svg");
  const { width, height } = root.viewBox.baseVal;
  return { svg, width, height, problems: collisions(root, boxName) };
}

const fit = (section, box, result, direction) => Object.entries(PAGES).map(([page, size]) => {
  const height = size.height - aboveBox(section, box, size.width) - SAFETY_MM;
  return { ...result, direction, page, mmPerUnit: Math.min(size.width / result.width, height / result.height,
    MAX_PT / (FONT_PX * PT_PER_MM)) };
});

const flip = (edge) => edge.replace(/^(\s*)(\S+) \.\.> (\S+)$/, "$1$3 <.. $2");

function orders(edges) {
  const list = [edges, [...edges].reverse()];
  let seed = 1;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  while (list.length < TRIES) {
    const order = [...edges];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    list.push(order);
  }
  edges.forEach((_, i) => list.push(edges.map((e, j) => (i === j ? flip(e) : e))));
  return [...new Map(list.map((order) => [order.join("\n"), order])).values()];
}

async function layouts(mermaid, d, section, box) {
  if (d.source) {
    const result = await render(mermaid, d.source, box);
    return { tried: 1, fits: fit(section, box, result, /direction\s+(\w+)/.exec(d.source)[1]) };
  }
  let tried = 0;
  let first = null;
  const clean = [];
  for (const edges of orders(d.edges)) {
    const fits = [];
    for (const direction of ["TB", "LR"]) {
      const source = WITH_ELK + ["classDiagram", `  direction ${direction}`, ...d.classes, ...edges].join("\n");
      fits.push(...fit(section, box, await render(mermaid, source, box), direction));
      tried += 1;
    }
    first ??= fits;
    clean.push(...fits.filter((f) => !f.problems.length));
  }
  return { tried, fits: clean.length ? clean : first };
}

async function draw(mermaid, d) {
  const box = document.getElementById(`${d.id}-box`);
  const section = box.closest("section");
  const { tried, fits } = await layouts(mermaid, d, section, box);
  const clean = fits.filter((f) => !f.problems.length);
  const best = (clean.length ? clean : fits).reduce((a, b) => (b.mmPerUnit > a.mmPerUnit ? b : a));
  box.innerHTML = best.svg;
  section.style.page = best.page;
  const root = box.querySelector("svg");
  root.removeAttribute("style");
  root.style.width = `${(best.width * best.mmPerUnit).toFixed(2)}mm`;
  root.style.height = `${(best.height * best.mmPerUnit).toFixed(2)}mm`;
  const missing = link(root, d.links).map((name) => `${name} links nowhere`);
  return {
    report: { id: d.id, layout: d.source ? "dagre" : "elk", direction: best.direction, page: best.page,
      textPt: Math.round(FONT_PX * best.mmPerUnit * PT_PER_MM * 10) / 10, tried },
    problems: [...best.problems, ...missing].map((p) => `${d.id}: ${p}`),
  };
}

(async () => {
  const { default: mermaid } = await import(new URL(MERMAID, document.baseURI).href);
  const { default: elk } = await import(new URL(ELK, document.baseURI).href);
  mermaid.registerLayoutLoaders(elk);
  mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "base", htmlLabels: false,
    fontFamily: "Segoe UI, Arial, sans-serif", look: "classic", layout: "dagre", class: { htmlLabels: false },
    themeVariables: { fontFamily: "Segoe UI, Arial, sans-serif", fontSize: `${FONT_PX}px`, primaryColor: "#f6f1e7",
      primaryBorderColor: "#8a6d3b", primaryTextColor: "#1b1b1b", lineColor: "#6b6b6b" } });
  const diagrams = [];
  const problems = [];
  for (const d of window.umlDiagrams) {
    const done = await draw(mermaid, d);
    diagrams.push(done.report);
    problems.push(...done.problems);
  }
  window.umlReport = { diagrams, problems };
  window.docReady = true;
})().catch((e) => {
  document.title = `UML failed: ${e}`;
  window.umlReport = { diagrams: [], problems: [`mermaid could not draw a diagram: ${e}`] };
  window.docReady = true;
});
