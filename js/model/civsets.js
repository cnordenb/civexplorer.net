let civs = [];
let civBit = new Map();
export let allCivs = 0n;

export function useCivs(list) {
  civs = list;
  civBit = new Map(list.map((civ, i) => [civ, 1n << BigInt(i)]));
  allCivs = (1n << BigInt(list.length)) - 1n;
}

export function size(set) {
  let n = 0;
  for (let s = set; s; s &= s - 1n) {
    n++;
  }
  return n;
}

export function setOf(rule) {
  if (rule === "all") return allCivs;
  if (rule.has) return rule.has.reduce((s, civ) => s | bit(civ), 0n);
  return rule.lacks.reduce((s, civ) => s & ~bit(civ), allCivs);
}

function bit(civ) {
  if (!civBit.has(civ)) throw new Error(`unknown civilisation ${civ}`);
  return civBit.get(civ);
}

export const civsOf = (set) => civs.filter((civ) => set & civBit.get(civ));
