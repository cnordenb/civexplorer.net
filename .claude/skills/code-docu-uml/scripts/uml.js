const NS = "http://www.w3.org/2000/svg";
const PX_PER_MM = 96 / 25.4;
const PT_PER_MM = 72 / 25.4;
const FONT_PX = 16;
const PAGES = {
  "uml-portrait": { width: 176, height: 263 },
  "uml-landscape": { width: 263, height: 176 },
};
const SAFETY_MM = 4;
const MERMAID = "node_modules/mermaid/dist/mermaid.esm.min.mjs";

const wrap = (el, href) => {
  const a = document.createElementNS(NS, "a");
  a.setAttribute("href", href);
  el.parentNode.insertBefore(a, el);
  a.appendChild(el);
};

const withDirection = (source, direction) => (/^\s*direction\s+\w+/m.test(source)
  ? source.replace(/^(\s*)direction\s+\w+/m, `$1direction ${direction}`)
  : source.replace(/^(\s*classDiagram[^\n]*\n)/, `$1  direction ${direction}\n`));

function aboveBox(section, box, widthMm) {
  const old = section.style.width;
  section.style.width = `${widthMm}mm`;
  const used = (box.getBoundingClientRect().top - section.getBoundingClientRect().top) / PX_PER_MM;
  section.style.width = old;
  return used;
}

function link(root) {
  const missing = [];
  for (const g of root.querySelectorAll("g.node")) {
    const cls = /^classId-(.+)-\d+$/.exec(g.id)?.[1];
    const target = window.umlTargets[cls];
    if (!target) continue;
    for (const text of g.querySelectorAll("text")) {
      const s = text.textContent.trim();
      if (s === cls) { wrap(text, `#${target.chapter}`); continue; }
      const m = /^[+-]([\w$]+)/.exec(s);
      if (!m) continue;
      const href = window.umlMembers[cls][m[1]];
      wrap(text, href ?? `#${target.chapter}`);
      if (!href) missing.push(`${cls}.${m[1]}`);
    }
  }
  for (const text of root.querySelectorAll("text")) {
    if (!/data\.json/.test(text.textContent)) continue;
    const label = text.closest("g.label");
    label.setAttribute("transform", `translate(${-text.getBBox().width / 2}, -10.5)`);
    wrap(text, window.umlFiles["data.json"]);
  }
  return missing;
}

(async () => {
  const { default: mermaid } = await import(new URL(MERMAID, document.baseURI).href);
  mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "base", htmlLabels: false,
    fontFamily: "Segoe UI, Arial, sans-serif", look: "classic", layout: "dagre",
    themeVariables: { fontFamily: "Segoe UI, Arial, sans-serif", fontSize: `${FONT_PX}px`, primaryColor: "#f6f1e7",
      primaryBorderColor: "#8a6d3b", primaryTextColor: "#1b1b1b", lineColor: "#6b6b6b", noteBkgColor: "#fff6d6",
      noteBorderColor: "#b59b52", noteTextColor: "#1b1b1b" },
    class: { htmlLabels: false, nodeSpacing: 24, rankSpacing: 26 } });
  const box = document.getElementById("umlBox");
  const section = box.closest("section");
  let best = null;
  for (const direction of ["TB", "LR"]) {
    const { svg } = await mermaid.render(`uml${direction}`, withDirection(window.umlSource, direction));
    box.innerHTML = svg;
    const view = box.querySelector("svg").viewBox.baseVal;
    for (const [page, size] of Object.entries(PAGES)) {
      const height = size.height - aboveBox(section, box, size.width) - SAFETY_MM;
      const mmPerUnit = Math.min(size.width / view.width, height / view.height);
      if (!best || mmPerUnit > best.mmPerUnit) best = { direction, page, svg, mmPerUnit, view };
    }
  }
  box.innerHTML = best.svg;
  section.style.page = best.page;
  const root = box.querySelector("svg");
  root.removeAttribute("style");
  root.style.width = `${(best.view.width * best.mmPerUnit).toFixed(2)}mm`;
  root.style.height = `${(best.view.height * best.mmPerUnit).toFixed(2)}mm`;
  const missing = link(root);
  window.umlMissing = missing;
  window.umlReport = { page: best.page, direction: best.direction,
    textPt: Math.round(FONT_PX * best.mmPerUnit * PT_PER_MM * 10) / 10, missing };
  window.docReady = true;
})().catch((e) => {
  document.title = `UML failed: ${e}`;
  window.umlReport = { error: String(e) };
  window.docReady = true;
});
