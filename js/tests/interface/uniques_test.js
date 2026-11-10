import { data } from "../../model/data/datahandler.js";
import { nameOf } from "../../model/texts.js";
import { items, roots, lineOf, lineEnd } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { chooseInclude } from "../../controller/optionshandler.js";
import { check, same, tap, reset, nodeOf, openTo } from "../helpers_test.js";

const OWN = "filters: a marked unique item has its own filter button";
const LEAVES = "filters: a line's or group's filter button leaves its unique item marked";

export function uniqueFilterTests() {
  reset();
  chooseInclude(true);
  const { item, whole } = uniqueCases();
  [item, whole].forEach(openTo);
  inLine(item);
  $("clear").click();
  inGroup(item);
  $("clear").click();
  tap(nodeOf(lineEnd(whole)));
  check("filters: a wholly unique line has one filter button", same(names(), [nameOf(lineEnd(whole))]));
}

function uniqueCases() {
  const item = items.find((each) => unique(each) && lineOf(each).some((other) => !unique(other)));
  const whole = items.find((each) => unique(each) && lineOf(each).length > 1 && lineOf(each).every(unique));
  if (!item || !whole) throw new Error("data.json has no unique item in a line with others, or no wholly unique line");
  return { item, whole };
}

function inLine(item) {
  const end = lineOf(item).at(-1);
  tap(nodeOf(item));
  check(OWN, same(names(), [nameOf(item), nameOf(end)].sort()), "in a line");
  unmark(nameOf(item));
  check("filters: a unique item's own filter button clears only that item",
    item.self === null && end.self === "has" && same(names(), [nameOf(end)]));
  $("clear").click();
  tap(nodeOf(item));
  unmark(nameOf(end));
  check(LEAVES, item.self === "has" && end.self === null && same(names(), [nameOf(item)]), "the line's");
}

function inGroup(item) {
  tap(nodeOf(roots.find((top) => item.path.startsWith(`${top.path}|`))));
  const full = names().filter((text) => text !== nameOf(item));
  check(OWN, full.length === 1 && names().includes(nameOf(item)), "in a full group");
  full.forEach(unmark);
  check(LEAVES, item.self === "has" && same(names(), [nameOf(item)]), "the group's");
}

const unique = (item) => data.pictures[item.key]?.reach === "unique";

const names = () => [...$("chips").querySelectorAll(".chip-name")].map((chip) => chip.textContent).sort();

const unmark = (text) => [...$("chips").querySelectorAll(".chip")]
  .find((chip) => chip.querySelector(".chip-name").textContent === text)?.click();
