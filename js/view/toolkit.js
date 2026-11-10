import { PLACEHOLDER } from "../model/texts.js";

export const $ = (id) => document.getElementById(id);

export const clone = (id) => $(id).content.firstElementChild.cloneNode(true);

export const simple = () => !document.documentElement.classList.contains("pictures");

export const changesNames = (change) => ["start", "tree", "language"].includes(change);

export const rebuilds = (change) => change === "start" || change === "tree";

export function compose(node, template, values) {
  node.replaceChildren(...template.split(PLACEHOLDER).flatMap((part, i) => {
    if (i % 2 === 0) return part ? [part] : [];
    return [Object.hasOwn(values, part) ? values[part] : `{${part}}`];
  }));
}

export function place(icon, { column, row, columns, rows }) {
  icon.style.setProperty("--column", column);
  icon.style.setProperty("--row", row);
  icon.style.setProperty("--columns", columns);
  icon.style.setProperty("--rows", rows);
  return icon;
}

export function demand(actions, names) {
  const missing = names.filter((name) => typeof actions?.[name] !== "function");
  if (missing.length) throw new Error(`the controller has no ${missing.join(", ")}`);
  return actions;
}
