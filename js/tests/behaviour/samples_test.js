import { collator } from "../../model/texts.js";
import { $ } from "../../view/toolkit.js";
import { same, listed, expected } from "../helpers_test.js";

export const LISTED = "filters: the civilisations listed are exactly those that fit the marks";
export const ANNOUNCED = "accessibility: each row tells screen readers its mark";
export const DASH = "marking: a partly marked branch shows a white dash";
export const DEEPEST = "filters: a line's filter button is named after its deepest must-have item";
export const PASSES = "marking: a mark passes down a line to each item with the same civilisations";
export const STOPS = "marking: a mark passes down a line to no item with other civilisations";
export const marks = { has: "green tick", lacks: "red cross", mixed: "white dash" };

export const listedAre = (set) => same([...listed()].sort(collator.compare), expected(set));

export const chipNames = () => [...$("chips").querySelectorAll(".chip-name")].map((chip) => chip.textContent);

export const boxOf = (el) => el.querySelector(".box");

export function below(item, top) {
  for (let p = item.parent; p; p = p.parent) {
    if (p === top) return true;
  }
  return false;
}
