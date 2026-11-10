import { attempt } from "../../model/data/datahandler.js";
import { clone, simple } from "../toolkit.js";

const SCROLLING = ".scroll, #ticked, #languageList, #settings, #content";

const STEPPED = "#languageList";

export const LINE_PX = 40;

const REPEAT_AFTER_MS = 400;

const REPEAT_EVERY_MS = 50;

const bars = new Map();

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

function wire(bar, box) {
  const up = bar.querySelector(".bar-up");
  const track = bar.querySelector(".bar-track");
  const down = bar.querySelector(".bar-down");
  const knob = bar.querySelector(".bar-knob");
  const stepped = () => box.matches(STEPPED) && !simple();
  const line = () => (stepped() && box.firstElementChild?.offsetHeight) || LINE_PX;

  const pageToward = (y) => {
    const { top, bottom } = knob.getBoundingClientRect();
    if (!knob.hidden && (y < top || y > bottom)) box.scrollBy(0, Math.sign(y - top) * (box.clientHeight - line()));
  };

  const wheel = (e) => {
    e.preventDefault();
    box.scrollBy(0, stepped() ? Math.sign(e.deltaY) * line() : e.deltaY * wheelUnit(e, box));
  };

  hold(up, () => box.scrollBy(0, -line()));
  hold(down, () => box.scrollBy(0, line()));
  hold(track, pageToward);
  drag(knob, track, box);
  bar.addEventListener("wheel", wheel, { passive: false });
  if (box.matches(STEPPED)) box.addEventListener("wheel", (e) => simple() || wheel(e), { passive: false });
  box.addEventListener("scroll", () => fit(bar, box));
}

function wheelUnit(e, box) {
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) return LINE_PX;
  if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) return box.clientHeight;
  return 1;
}

function hold(part, step) {
  let timer = 0;
  let y = 0;

  const go = (wait) => {
    step(y);
    timer = setTimeout(go, wait, REPEAT_EVERY_MS);
  };

  part.addEventListener("pointerdown", (e) => {
    if (e.button || e.target !== part) return;
    attempt(() => part.setPointerCapture(e.pointerId));
    y = e.clientY;
    go(REPEAT_AFTER_MS);
  });
  part.addEventListener("pointermove", (e) => {
    y = e.clientY;
  });
  for (const end of ["pointerup", "pointercancel", "lostpointercapture"]) {
    part.addEventListener(end, () => clearTimeout(timer));
  }
}

function drag(knob, track, box) {
  knob.addEventListener("pointerdown", (e) => {
    if (e.button) return;
    attempt(() => knob.setPointerCapture(e.pointerId));
    const [from, start] = [e.clientY, box.scrollTop];
    const room = track.clientHeight - knob.offsetHeight;

    const move = (to) => {
      box.scrollTop = start + (to.clientY - from) * (box.scrollHeight - box.clientHeight) / room;
    };

    const stop = () => knob.removeEventListener("pointermove", move);

    knob.addEventListener("pointermove", move);
    knob.addEventListener("pointerup", stop, { once: true });
    knob.addEventListener("lostpointercapture", stop, { once: true });
  });
}

function fit(bar, box) {
  const frame = box.offsetParent;
  const room = box.scrollHeight - box.clientHeight;
  bar.hidden = simple() || !frame || room < 1;
  if (bar.hidden) return;
  placeBar(bar, box, frame);
  bar.style.setProperty("--at", box.scrollTop / room);
  bar.querySelector(".bar-knob").hidden = trackTooShort(bar.querySelector(".bar-track"), bar);
}

function placeBar(bar, box, frame) {
  const [inner, outer] = [box, frame].map((el) => el.getBoundingClientRect());
  const rightEdge = box.offsetWidth - box.clientWidth - box.clientLeft;
  const bottomEdge = box.offsetHeight - box.clientHeight - box.clientTop;
  bar.style.setProperty("--x", inner.right - rightEdge - outer.left - frame.clientLeft + frame.scrollLeft);
  bar.style.setProperty("--y", inner.top + box.clientTop - outer.top - frame.clientTop + frame.scrollTop);
  bar.style.setProperty("--h", inner.height - box.clientTop - bottomEdge);
}

const trackTooShort = (track, bar) => track.clientHeight < bar.clientWidth;

const fitAll = () => bars.forEach(fit);

const sizes = new ResizeObserver(fitAll);

const watch = (box) => [box, ...box.children].forEach((el) => sizes.observe(el));

const changes = new MutationObserver(() => {
  bars.forEach((bar, box) => watch(box));
  fitAll();
});

export const barsByBox = () => new Map(bars);
