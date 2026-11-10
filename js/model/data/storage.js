import { attempt } from "./guard.js";

export const SETTINGS = {
  include: [false, true],
  regional: [true, false],
  simple: [false, true],
  tooltips: [true, false],
  civView: ["list", "tile"],
};

export const recall = (key) => attempt(() => localStorage.getItem(key));

export const remember = (key, value) => attempt(() => (value === null
  ? localStorage.removeItem(key)
  : localStorage.setItem(key, value)));

export function recallSetting(key) {
  const saved = recall(key);
  return SETTINGS[key].find((value) => String(value) === saved) ?? SETTINGS[key][0];
}

export const rememberSetting = (key, value) => remember(key, String(value));
