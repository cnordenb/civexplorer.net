const STEP = 1;
const GAP = 4;
const HEAD = 14;

const toRoot = (root, el) => root.getScreenCTM().inverse().multiply(el.getScreenCTM());

const apply = (m, x, y) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });

function boxOf(root, el, name) {
  const b = el.getBBox();
  const m = toRoot(root, el);
  const a = apply(m, b.x, b.y);
  const z = apply(m, b.x + b.width, b.y + b.height);
  return { name, x1: Math.min(a.x, z.x), y1: Math.min(a.y, z.y), x2: Math.max(a.x, z.x), y2: Math.max(a.y, z.y) };
}

function lineOf(root, path) {
  const m = toRoot(root, path);
  const length = path.getTotalLength();
  const points = [];
  for (let s = 0; s < length; s += STEP) {
    const p = path.getPointAtLength(s);
    points.push(apply(m, p.x, p.y));
  }
  const end = path.getPointAtLength(length);
  points.push(apply(m, end.x, end.y));
  return points;
}

const near = (p, b, pad) => p.x > b.x1 - pad && p.x < b.x2 + pad && p.y > b.y1 - pad && p.y < b.y2 + pad;

const distance = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

function closest(a, b) {
  let best = Infinity;
  for (const p of a) {
    for (const q of b) {
      const d = Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
      if (d < best * 1.5) best = Math.min(best, distance(p, q));
    }
  }
  return best;
}

const away = (p, b) => Math.hypot(Math.max(b.x1 - p.x, 0, p.x - b.x2), Math.max(b.y1 - p.y, 0, p.y - b.y2));

const nearest = (p, boxes) => boxes.reduce((best, b) => (away(p, b) < away(p, best) ? b : best));

const ends = (points, boxes) => [points[0], points.at(-1)].map((p) => nearest(p, boxes).name);

function edgesOf(root, boxes) {
  return [...root.querySelectorAll(".edgePaths path")].map((path) => {
    const points = lineOf(root, path);
    const [from, to] = ends(points, boxes);
    return { name: `${from} → ${to}`, from, to, points };
  });
}

function underBoxes(edge, boxes) {
  const found = [];
  for (const b of boxes) {
    const own = b.name === edge.from || b.name === edge.to;
    const hit = edge.points.some((p, i) => (own
      ? near(p, b, -1) && i > 2 && i < edge.points.length - 3
      : near(p, b, GAP)));
    if (hit) found.push(`${edge.name} runs ${own ? "into" : "under or along"} ${b.name}`);
  }
  return found;
}

function betweenEdges(a, b) {
  const found = [];
  const gap = closest(a.points, b.points);
  if (gap < GAP) found.push(`${a.name} and ${b.name} ${gap < 1 ? "cross" : "touch"} (${gap.toFixed(1)})`);
  if (a.to === b.to && distance(a.points.at(-1), b.points.at(-1)) < HEAD) {
    found.push(`${a.name} and ${b.name} end in one place`);
  }
  return found;
}

function underLabels(root, edges) {
  const found = [];
  for (const g of root.querySelectorAll(".edgeLabels g.edgeLabel")) {
    const text = g.textContent.trim();
    if (!text) continue;
    const box = boxOf(root, g, `the label "${text}"`);
    const middle = { x: (box.x1 + box.x2) / 2, y: (box.y1 + box.y2) / 2 };
    const owner = edges.reduce((best, e) => (closest([middle], e.points) < closest([middle], best.points) ? e : best));
    for (const e of edges) {
      if (e !== owner && e.points.some((p) => near(p, box, GAP))) found.push(`${e.name} runs under ${box.name}`);
    }
  }
  return found;
}

export function collisions(root, boxName) {
  const boxes = [...root.querySelectorAll("g.node")].map((g) => boxOf(root, g, boxName(g)));
  const edges = edgesOf(root, boxes);
  const found = [...edges.flatMap((e) => underBoxes(e, boxes)), ...underLabels(root, edges)];
  edges.forEach((a, i) => edges.slice(i + 1).forEach((b) => found.push(...betweenEdges(a, b))));
  return found;
}
