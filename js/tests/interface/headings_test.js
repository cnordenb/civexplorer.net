import { items } from "../../model/model.js";
import { isOpen, shown } from "../../view/treeview.js";
import { chooseInclude } from "../../controller/optionshandler.js";
import { check, keyDown, reset, nodeOf, twistyOf, labelOf, openTo } from "../helpers_test.js";

const RIGHT_BUTTON = 2;
const POINTER_ID = 9;
const MARKS_NOTHING = "tree: a heading marks nothing when clicked or right-clicked";

export function headingTests() {
  reset();
  chooseInclude(true);
  const heading = items.find((item) => item.group && item.parent);
  if (!heading) throw new Error("data.json has no group inside a building for the tests");
  openTo(heading);
  check("tree: a group inside a building has no checkbox",
    !nodeOf(heading).matches("[role], [tabindex], [aria-checked]") && !nodeOf(heading).querySelector(".box"));
  labelOf(heading).click();
  check("tree: a click on a heading's name opens it", isOpen(heading));
  check(MARKS_NOTHING, unmarked(), "a click");
  twistyOf(heading).click();
  const right = { bubbles: true, pointerId: POINTER_ID, pointerType: "mouse", button: RIGHT_BUTTON };
  ["pointerdown", "pointerup"].forEach((kind) => labelOf(heading).dispatchEvent(new PointerEvent(kind, right)));
  check(MARKS_NOTHING, unmarked(), "a right-click");
  const rows = items.filter(shown);
  const above = rows[rows.indexOf(heading) - 1];
  nodeOf(above).focus();
  keyDown(nodeOf(above), "ArrowDown");
  check("keyboard: Down from the row above a heading reaches its arrow", document.activeElement === twistyOf(heading));
  document.activeElement.blur();
}

const unmarked = () => items.every((item) => item.self === null);
