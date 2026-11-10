import { words } from "../../model/texts.js";
import { locked } from "../../model/model.js";
import { $, simple } from "../toolkit.js";
import { itemAt, branchAt, isOpen } from "../treeview.js";

export const TIP_MARGIN = 4;

export const TIP_GAP = 8;

export let tips;

export function setTips(on) {
  tips = on;
}

export function startTips() {
  const tip = $("tip");
  let mouse = null;
  document.addEventListener("pointermove", (e) => {
    mouse = e;
    showTip(tip, e.target, e);
  });
  document.addEventListener("click", () => {
    if (mouse) showTip(tip, document.elementFromPoint(mouse.clientX, mouse.clientY) ?? document.body, mouse);
  });
  document.documentElement.addEventListener("pointerleave", () => {
    mouse = null;
    tip.hidden = true;
  });
}

function showTip(tip, target, { clientX: x, clientY: y, pointerType }) {
  tip.textContent = tipsWanted(pointerType) ? tipFor(target) : "";
  tip.hidden = !tip.textContent;
  if (tip.hidden) return;
  const host = hostFor(target);
  if (tip.parentElement !== host) host.append(tip);
  placeTip(tip, x, y);
}

const tipsWanted = (pointerType) => !simple() && tips && pointerType === "mouse";

const hostFor = (target) => target.closest?.("dialog[open]") ?? document.body;

function placeTip(tip, x, y) {
  const offset = Number(getComputedStyle(tip).getPropertyValue("--offset"));
  const below = y + offset + tip.offsetHeight <= innerHeight - TIP_MARGIN;
  tip.style.setProperty("--x", clamp(TIP_MARGIN, x + offset, innerWidth - tip.offsetWidth - TIP_MARGIN));
  tip.style.setProperty("--y", below ? y + offset : y - tip.offsetHeight - TIP_GAP);
}

const clamp = (low, value, high) => Math.max(low, Math.min(value, high));

function tipFor(target) {
  if (itemAt(target)) return words.ui.nodeTip;
  const tipped = target.closest?.("[data-tip]");
  if (tipped) return words.ui[tipped.dataset.tip];
  return branchTip(target) || (target.closest?.(".civs a, .foot a")?.href ?? "");
}

function branchTip(target) {
  const item = branchAt(target);
  if (!item || locked(item)) return "";
  return words.ui[isOpen(item) ? "collapseTip" : "expandTip"];
}
