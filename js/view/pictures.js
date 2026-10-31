import { recall, remember, words } from "../model/datahandler.js";
import { $, simple } from "./stringbuilder.js";
import { itemAt } from "../controller/nodetree.js";
import { tick, choices } from "../controller/optionshandler.js";
import { startBars } from "./scrollbars.js";

export let view = "list";

const showView = (choice) => {
  for (const input of $("views").querySelectorAll("input")) input.checked = input.value === choice;
};

export function setView(choice) {
  view = choice;
  remember("civView", choice);
  $("civs").classList.toggle("tiles", choice === "tile");
  showView(choice);
}

export let tips = true;

export function setTips(on) {
  tips = on;
  remember("tooltips", String(on));
  tick("tooltips", on);
}

const branchTip = (target) => {
  const twisty = target.closest?.(".twisty, .node:not([role])")?.closest(".row").querySelector(".twisty");
  if (!twisty || twisty.ariaDisabled === "true") return "";
  return words.ui[twisty.getAttribute("aria-expanded") === "true" ? "collapseTip" : "expandTip"];
};

const tipFor = (target) => {
  if (itemAt(target)) return words.ui.nodeTip;
  const tipped = target.closest?.("[data-tip]");
  if (tipped) return words.ui[tipped.dataset.tip];
  return branchTip(target) || (target.closest?.(".civs a, .foot a")?.href ?? "");
};

function wireTip() {
  const tip = $("tip");
  let mouse = null;

  const show = (target, { clientX: x, clientY: y, pointerType }) => {
    tip.textContent = simple() || !tips || pointerType !== "mouse" ? "" : tipFor(target);
    tip.hidden = !tip.textContent;
    if (tip.hidden) return;
    const host = target.closest?.("dialog[open]") ?? document.body;
    if (tip.parentElement !== host) host.append(tip);
    const reach = Number(getComputedStyle(tip).getPropertyValue("--reach"));
    const below = y + reach + tip.offsetHeight <= innerHeight - 4;
    tip.style.setProperty("--x", Math.max(4, Math.min(x + reach, innerWidth - tip.offsetWidth - 4)));
    tip.style.setProperty("--y", below ? y + reach : y - tip.offsetHeight - 8);
  };

  document.addEventListener("pointermove", (e) => {
    mouse = e;
    show(e.target, e);
  });
  document.addEventListener("click", () => {
    if (mouse) show(document.elementFromPoint(mouse.clientX, mouse.clientY) ?? document.body, mouse);
  });
  document.documentElement.addEventListener("pointerleave", () => {
    mouse = null;
    tip.hidden = true;
  });
}

export function startPictures() {
  setView(recall("civView") === "tile" ? "tile" : "list");
  setTips(recall("tooltips") !== "false");
  choices.civView = {
    now: () => view, set: setView, shown: () => $("views").querySelector(":checked").value, show: showView,
  };
  choices.tooltips = { now: () => tips, set: setTips };
  wireTip();
  startBars();
}
