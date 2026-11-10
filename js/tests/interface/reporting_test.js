import { $ } from "../../view/toolkit.js";
import { chooseSimple } from "../../controller/optionshandler.js";
import { openReport, report } from "../../view/report.js";
import { check, box } from "../helpers_test.js";

const REPORT_LINES = 200;
const EDGE_PX = 1;
const PARTS = [null, "::before", "::after"];

export function reportTests() {
  openReport("scrolling", "status");
  for (const i of Array(REPORT_LINES).keys()) {
    report(String(i));
  }
  const list = $("reportList").parentElement;
  const close = $("report").querySelector("form button");
  const pinned = [$("reportTitle"), $("reportStatus"), close];
  const [before, plainLook] = [tops(pinned), look(close)];
  check("update: the report opens with focus on Close", document.activeElement === close);
  list.scrollTop = list.scrollHeight;
  check("update: only the report's list scrolls",
    list.scrollTop > 0 && $("report").scrollHeight <= $("report").clientHeight);
  check("update: scrolling the report's list keeps its title, count and Close in place", tops(pinned) === before,
    `at ${before}, then ${tops(pinned)}`);
  check("update: the report keeps its title, count and Close on screen",
    pinned.every((el) => box(el).top >= 0 && box(el).bottom <= innerHeight));
  check("update: the report's download links scroll with its list", list.contains($("reportDownloads")));
  check("update: the report's Close sits on the right", Math.abs(box(close).right - box(list).right) < EDGE_PX);
  chooseSimple(false);
  const unchanged = look(close) === plainLook;
  chooseSimple(true);
  check("update: the report's Close is the plain button, with or without Simple UI", unchanged);
  $("report").close();
}

const tops = (pinned) => pinned.map((el) => Math.round(box(el).top)).join();

const look = (close) => PARTS.map((part) => getComputedStyle(close, part))
  .map((style) => [style.backgroundImage, style.backgroundColor, style.borderTopWidth, style.borderTopColor,
    style.borderRadius, style.color, style.fontFamily, style.content].join()).join(" | ");
