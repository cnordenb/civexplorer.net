let civs = [];
let civBit = new Map();
export let ALL = 0n;

export function useCivs(list) {
  civs = list;
  civBit = new Map(list.map((civ, i) => [civ, 1n << BigInt(i)]));
  ALL = (1n << BigInt(list.length)) - 1n;
}

const bit = (civ) => {
  if (!civBit.has(civ)) throw new Error(`unknown civilisation ${civ}`);
  return civBit.get(civ);
};

export const size = (set) => {
  let n = 0;
  for (let s = set; s; s &= s - 1n) n++;
  return n;
};

export function setOf(rule) {
  if (rule === "all") return ALL;
  if (rule.has) return rule.has.reduce((s, civ) => s | bit(civ), 0n);
  return rule.lacks.reduce((s, civ) => s & ~bit(civ), ALL);
}

export const civsOf = (set) => civs.filter((civ) => set & civBit.get(civ));
