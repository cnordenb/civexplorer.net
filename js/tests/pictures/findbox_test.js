import { nameOf } from "../../model/texts.js";
import { items } from "../../model/model.js";
import { $ } from "../../view/toolkit.js";
import { check, describe, rendered, type, beside, box, NAMES } from "../helpers_test.js";
import { picture, at } from "./picturetools_test.js";

const FIND_MAX_PX = 325;
const FIND_ROOM_PX = 96;
const NO_MATCH = "qqqqzzzzqqqq";
const MARKS = "pictures: Find shows the search icon while empty, the clearing cross otherwise";
const STEADY = "pictures: typing in Find never changes the box's width";

export function findBoxTests() {
  const breadth = box($("find")).width;
  const wanted = Math.min(FIND_MAX_PX, $("find").closest(".find").clientWidth - FIND_ROOM_PX);
  const field = getComputedStyle($("find"));
  check("pictures: the Find box has the text field's frame, repeated, not stretched", framed(field),
    `${field.borderImageSource.split("/").pop()} ${field.borderImageSlice} ${field.borderImageRepeat}`);
  check(MARKS, !rendered($("clearFind")) && lens().content !== "none" && picture(lens(), "ui/buttons/search"),
    "while empty");
  check(`pictures: the Find box is ${FIND_MAX_PX} pixels wide, or what its pane can spare`,
    Math.abs(breadth - wanted) < 1, `${breadth}, not ${wanted}`);
  check("pictures: the number found is aligned right", getComputedStyle($("found")).textAlign === "right",
    getComputedStyle($("found")).textAlign);
  type(nameOf(items.find((item) => !item.group)));
  check(MARKS, rendered($("clearFind")) && lens().content === "none"
    && picture(getComputedStyle($("clearFind")), "ui/buttons/clear_search"), "with text");
  check(STEADY, box($("find")).width === breadth, `${box($("find")).width}, not ${breadth}, with a match`);
  check(NAMES.findBeside, beside(), "without Simple UI, with a match");
  type(NO_MATCH);
  check(STEADY, box($("find")).width === breadth, `${box($("find")).width}, not ${breadth}, with none found`);
  check(NAMES.findBeside, beside(), "without Simple UI, with none found");
  crossTests();
}

const lens = () => getComputedStyle($("find").parentElement, "::after");

const framed = (field) => at(field.borderImageSource, "ui/buttons/textfield_9slice")
  && field.borderImageSlice === "15 fill" && field.borderImageWidth === "15px"
  && /^repeat( repeat)?$/.test(field.borderImageRepeat);

function crossTests() {
  $("clearFind").click();
  check("pictures: the cross clears the search", $("find").value === "" && !document.querySelector(".node.found")
    && !rendered($("clearFind")), `"${$("find").value}"`);
  check("pictures: the cross hands focus to the Find box", document.activeElement === $("find"),
    document.activeElement ? describe(document.activeElement) : "nothing");
  $("find").focus();
  check("pictures: the focused Find box shows no focus outline", getComputedStyle($("find")).outlineStyle === "none",
    getComputedStyle($("find")).outlineStyle);
}
