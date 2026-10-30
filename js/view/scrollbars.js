import { attempt } from "../model/datahandler.js";
import { clone, simple } from "./stringbuilder.js";

const SCROLLING = ".scroll, #ticked, #languageList, #settings, #content";

export const LINE = 40;

const FIRST = 400;

const NEXT = 50;

export const bars = new Map();

export function fit(bar, box) {
  const frame = box.offsetParent;
  const room = box.scrollHeight - box.clientHeight;
  bar.hidden = simple() || !frame || room < 1;
  if (bar.hidden) return;
  const [inner, outer] = [box, frame].map((el) => el.getBoundingClientRect());
  const right = box.offsetWidth - box.clientWidth - box.clientLeft;
  const below = box.offsetHeight - box.clientHeight - box.clientTop;
  bar.style.setProperty("--x", inner.right - right - outer.left - frame.clientLeft + frame.scrollLeft);
  bar.style.setProperty("--y", inner.top + box.clientTop - outer.top - frame.clientTop + frame.scrollTop);
  bar.style.setProperty("--h", inner.height - box.clientTop - below);
  bar.style.setProperty("--at", box.scrollTop / room);
  const knob = bar.querySelector(".bar-knob");
  knob.hidden = knob.parentElement.clientHeight < bar.clientWidth;
}

const fitAll = () => bars.forEach(fit);

const sizes = new ResizeObserver(fitAll);

const watch = (box) => [box, ...box.children].forEach((el) => sizes.observe(el));

const changes = new MutationObserver(() => {
  bars.forEach((bar, box) => watch(box));
  fitAll();
});

function hold(part, step) {
  let timer = 0;
  let y = 0;

  const go = (wait) => {
    step(y);
    timer = setTimeout(go, wait, NEXT);
  };

  part.addEventListener("pointerdown", (e) => {
    if (e.button || e.target !== part) return;
    attempt(() => part.setPointerCapture(e.pointerId));
    y = e.clientY;
    go(FIRST);
  });
  part.addEventListener("pointermove", (e) => {
    y = e.clientY;
  });
  for (const end of ["pointerup", "pointercancel", "lostpointercapture"]) {
    part.addEventListener(end, () => clearTimeout(timer));
  }
}

function page(box, knob, y) {
  const { top, bottom } = knob.getBoundingClientRect();
  if (!knob.hidden && (y < top || y > bottom)) box.scrollBy(0, Math.sign(y - top) * (box.clientHeight - LINE));
}

function drag(knob, box) {
  knob.addEventListener("pointerdown", (e) => {
    if (e.button) return;
    attempt(() => knob.setPointerCapture(e.pointerId));
    const [from, start] = [e.clientY, box.scrollTop];
    const room = knob.parentElement.clientHeight - knob.offsetHeight;

    const move = (to) => {
      box.scrollTop = start + (to.clientY - from) * (box.scrollHeight - box.clientHeight) / room;
    };

    const stop = () => knob.removeEventListener("pointermove", move);

    knob.addEventListener("pointermove", move);
    knob.addEventListener("pointerup", stop, { once: true });
    knob.addEventListener("lostpointercapture", stop, { once: true });
  });
}

function wire(bar, box) {
  const [up, track, down] = bar.children;
  const knob = track.firstElementChild;
  hold(up, () => box.scrollBy(0, -LINE));
  hold(down, () => box.scrollBy(0, LINE));
  hold(track, (y) => page(box, knob, y));
  drag(knob, box);
  bar.addEventListener("wheel", (e) => {
    e.preventDefault();
    box.scrollBy(0, e.deltaY * [1, LINE, box.clientHeight][e.deltaMode]);
  }, { passive: false });
  box.addEventListener("scroll", () => fit(bar, box));
}

export function startBars() {
  for (const box of document.querySelectorAll(SCROLLING)) {
    const bar = clone("barTemplate");
    box.after(bar);
    bars.set(box, bar);
    wire(bar, box);
    watch(box);
    changes.observe(box, { childList: true, subtree: true, characterData: true });
  }
  changes.observe(document.documentElement, { attributeFilter: ["class"] });
  addEventListener("resize", fitAll);
}
