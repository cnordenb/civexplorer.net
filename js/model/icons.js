import { data } from "./data/datahandler.js";

const orders = new WeakMap();

const fileName = (picture) => `${picture}.png`;

export const iconFile = ({ kind, picture }) => `${data.icons.nodes}${kind}/${fileName(picture)}`;

export const civFile = (civ) => data.icons.names[civ] ?? civ.toLowerCase();

export const byFile = (a, b) => (fileName(a) < fileName(b) ? -1 : Number(fileName(a) > fileName(b)));

export const spriteOf = (item) => (item.group ? data.icons.groups[item.key] : data.pictures[item.key]);

export const atlasOf = (kind) => data.icons.atlas[kind];

export function cellOf(names, name, file = String) {
  if (!orders.has(names)) orders.set(names, names.map(file).sort(byFile));
  const order = orders.get(names);
  const at = order.indexOf(file(name));
  if (at < 0) throw new Error(`${file(name)} is not in its atlas`);
  const columns = Math.ceil(Math.sqrt(order.length));
  return { column: at % columns, row: Math.floor(at / columns), columns, rows: Math.ceil(order.length / columns) };
}
