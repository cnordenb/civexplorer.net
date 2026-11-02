import { data } from "./datahandler.js";

export let language;
export let words;
export let tag;
export let collator;
let plurals;
export let numbers;

export const fill = (template, values) => template.replace(/\{(\w+)\}/g,
  (whole, key) => (key in values ? String(values[key]) : whole));

export function useLanguage(code) {
  language = code;
  tag = data.languages[code].tag;
  words = data.text[code];
  collator = new Intl.Collator(tag);
  plurals = new Intl.PluralRules(tag);
  numbers = new Intl.NumberFormat(tag);
}

export const nameOf = (item) => (item.group ? words.groups[item.key] : words.items[item.key]) ?? item.key;

export const civName = (civ) => words.civs[civ] ?? civ;

export const plural = (key, n) => {
  const forms = words.ui[key];
  return fill(forms[plurals.select(n)] ?? forms.other, { n: numbers.format(n) });
};

export const plain = (text) => text.toLocaleLowerCase(tag).normalize("NFD")
  .replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N}]/gu, "");
